import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type NavItem = {
  href: string;
  label: string;
};

export function ConsoleShell(props: {
  brandTag: string;
  title: string;
  subtitle: string;
  userLabel: string;
  homeHref?: string;
  navItems?: NavItem[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const homeHref = props.homeHref ?? '/';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.22),_transparent_30%),radial-gradient(circle_at_right,_rgba(15,23,42,0.18),_transparent_38%),linear-gradient(180deg,_#fffaf5_0%,_#fff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="text-xl font-semibold tracking-tight text-slate-950">
              AdFlow Pro
            </Link>
            <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white hover:bg-slate-900">
              {props.brandTag}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{props.userLabel}</span>
            {props.actions}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Workflow Control</p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{props.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{props.subtitle}</p>
            </div>
            {props.navItems && props.navItems.length > 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-400">Quick Access</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {props.navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-orange-300/50 hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {props.children}
      </main>
    </div>
  );
}

export function LogoutAction() {
  return (
    <form action="/api/auth/logout" method="POST">
      <Button variant="outline" size="sm" type="submit" className="rounded-full border-slate-300 bg-white/80">
        Logout
      </Button>
    </form>
  );
}
