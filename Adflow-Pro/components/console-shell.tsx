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
    <div className="page-shell">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="brand-mark text-xl font-semibold tracking-tight text-slate-950">
              AdFlow Pro
            </Link>
            <Badge className="rounded-full border-white/10 bg-slate-950/85 px-3 py-1 text-[11px] tracking-[0.2em] text-white hover:bg-slate-950/85">
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
        <section className="surface-dark hero-outline overflow-hidden rounded-[2.2rem] text-white">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="space-y-4">
              <p className="section-kicker">Workflow Control</p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{props.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{props.subtitle}</p>
            </div>
            {props.navItems && props.navItems.length > 0 ? (
              <div className="surface-dark-tile rounded-[1.6rem] p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-400">Quick Access</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {props.navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="surface-dark-tile rounded-[1.25rem] px-4 py-3 text-sm text-slate-100 transition hover:border-white/25 hover:bg-white/10"
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
      <Button variant="outline" size="sm" type="submit" className="rounded-full bg-white/80">
        Logout
      </Button>
    </form>
  );
}
