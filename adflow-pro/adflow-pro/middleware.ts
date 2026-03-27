import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Protected route prefixes
  const protectedPrefixes = ['/dashboard'];
  const adminPrefixes = ['/dashboard/admin', '/dashboard/super-admin'];
  const moderatorPrefixes = ['/dashboard/moderator'];

  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
  }

  if (session) {
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    const role = user?.role;

    if (adminPrefixes.some(p => pathname.startsWith(p)) && !['admin', 'super_admin'].includes(role ?? '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (moderatorPrefixes.some(p => pathname.startsWith(p)) && !['moderator', 'admin', 'super_admin'].includes(role ?? '')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/ads/:path*/edit'],
};
