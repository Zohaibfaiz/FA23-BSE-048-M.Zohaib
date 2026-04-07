'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserRound,
  Shield,
} from 'lucide-react';
import type { AuthScope } from '@/lib/auth-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

type PortalConfig = {
  title: string;
  subtitle: string;
  kicker: string;
  heroTitle: string;
  heroCopy: string;
  submitLabel: string;
  forgotHref: string;
  secondaryCta?: {
    href: string;
    label: string;
  };
};

const PORTALS: Record<AuthScope, PortalConfig> = {
  client: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage campaigns, payments, and listing activity.',
    kicker: 'Client Workspace',
    heroTitle: 'Track campaigns from draft to publication.',
    heroCopy:
      'Clients can launch ads, watch moderation progress, submit payments, and monitor live marketplace performance from one dashboard.',
    submitLabel: 'Continue to dashboard',
    forgotHref: '/auth/forgot-password',
    secondaryCta: {
      href: '/auth/register',
      label: 'Create client account',
    },
  },
  moderator: {
    title: 'Moderator sign in',
    subtitle: 'Only moderators, admins, and super admins can enter this workspace.',
    kicker: 'Review Operations',
    heroTitle: 'Review pending ads with protected staff access.',
    heroCopy:
      'Use the moderation queue to inspect submissions, approve quality listings, reject non-compliant ads, and keep review decisions auditable.',
    submitLabel: 'Open moderator desk',
    forgotHref: '/auth/forgot-password',
  },
  admin: {
    title: 'Admin sign in',
    subtitle: 'Admins and super admins can manage publishing, payments, and staff operations.',
    kicker: 'Control Center',
    heroTitle: 'Operate the marketplace with role-gated admin access.',
    heroCopy:
      'Admins verify payments, oversee moderation outcomes, schedule campaigns, and manage higher-trust staff workflows.',
    submitLabel: 'Open admin control',
    forgotHref: '/auth/forgot-password',
  },
};

const PORTAL_LINKS: Array<{
  scope: AuthScope;
  href: string;
  label: string;
  icon: JSX.Element;
}> = [
  {
    scope: 'client',
    href: '/auth/login',
    label: 'Client',
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    scope: 'moderator',
    href: '/auth/login',
    label: 'Moderator',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    scope: 'admin',
    href: '/auth/login',
    label: 'Admin',
    icon: <Shield className="h-4 w-4" />,
  },
];

export function PortalLoginForm({
  scope,
  redirectTo,
}: {
  scope: AuthScope;
  redirectTo?: string;
}) {
  const router = useRouter();
  const portal = PORTALS[scope];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          scope,
          redirectTo,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to sign in right now');
      }

      toast.success(`${portal.title} successful`);
      router.push(payload.data.redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="surface-dark hero-outline rounded-[2.25rem] p-8 text-white">
          <p className="section-kicker">{portal.kicker}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {portal.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            {portal.heroCopy}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PORTAL_LINKS.map((item) => (
              <Link
                key={item.scope}
                href={item.href}
                className={`rounded-[1.4rem] border px-4 py-4 transition ${
                  item.scope === scope
                    ? 'border-orange-300/40 bg-white/12 text-white shadow-[0_20px_45px_rgba(249,115,22,0.18)]'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <p className="mt-3 text-xs text-slate-300">
                  {item.scope === 'client'
                    ? 'Campaign pipeline and listing management'
                    : item.scope === 'moderator'
                      ? 'Pending reviews, approvals, and rejections'
                      : 'Payments, publishing, and staff controls'}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <LayoutDashboard className="h-5 w-5 text-orange-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Role-based dashboard routing</p>
                <p className="text-sm text-slate-300">
                  After sign-in, users are redirected to the correct client, moderator, admin, or super admin workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8">
            <div className="mb-6">
              <Link href="/" className="brand-mark text-lg font-semibold text-slate-950">
                AdFlow Pro
              </Link>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{portal.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{portal.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={portal.forgotHref}
                    className="text-xs font-medium text-primary transition-colors hover:text-orange-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-full py-6 text-base">
                {loading ? 'Signing in...' : portal.submitLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span>Access rules</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {scope === 'client'
                  ? 'Any authenticated account will be redirected to its own dashboard.'
                  : scope === 'moderator'
                    ? 'Client accounts are blocked here. Only moderator, admin, and super admin roles are allowed.'
                    : 'Only admin and super admin roles can enter this control center.'}
              </p>
            </div>

            {portal.secondaryCta ? (
              <p className="mt-5 text-sm text-slate-600">
                Need an account?{' '}
                <Link href={portal.secondaryCta.href} className="font-medium text-primary hover:text-orange-500">
                  {portal.secondaryCta.label}
                </Link>
              </p>
            ) : (
              <p className="mt-5 text-sm text-slate-600">
                Need client access instead?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:text-orange-500">
                  Use the client login
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
