import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROLE_DASHBOARD } from '@/lib/workflow';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session if expired
    await supabase.auth.getUser();

    const protectedPaths = ['/dashboard', '/admin', '/moderator', '/super-admin'];
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (isProtectedPath) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const rolePathMap: Record<string, string[]> = {
        '/moderator': ['moderator', 'admin', 'super_admin'],
        '/admin': ['admin', 'super_admin'],
        '/super-admin': ['super_admin'],
      };

      const matchedRolePath = Object.keys(rolePathMap).find((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (matchedRolePath) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const currentRole = dbUser?.role as keyof typeof ROLE_DASHBOARD | undefined;
        if (!currentRole || !rolePathMap[matchedRolePath].includes(currentRole)) {
          const fallbackPath = currentRole ? ROLE_DASHBOARD[currentRole] ?? '/dashboard' : '/dashboard';
          return NextResponse.redirect(new URL(fallbackPath, request.url));
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
