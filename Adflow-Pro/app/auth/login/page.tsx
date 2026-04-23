'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const ROLE_DASHBOARD: Record<string, string> = {
  client: '/dashboard',
  moderator: '/moderator',
  admin: '/admin',
  super_admin: '/super-admin',
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const email = formData.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) throw error;

      // Fetch user role to redirect to correct dashboard
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = userData?.role || 'client';
      const redirectPath = ROLE_DASHBOARD[role] || '/dashboard';

      toast.success('Logged in successfully');
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      const friendlyMessage = message.toLowerCase().includes('invalid login credentials')
        ? 'Email or password is incorrect. Check for extra spaces, then try again or reset your password.'
        : message;
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-dark hero-outline rounded-[2.25rem] p-8 text-white">
          <p className="section-kicker">AdFlow Pro</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to move listings through the revenue workflow.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Access client, moderation, admin, and super admin operations with the same production-ready marketplace stack.
          </p>
        </div>

        <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8">
            <div className="mb-6">
              <Link href="/" className="brand-mark text-lg font-semibold text-slate-950">AdFlow Pro</Link>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-primary transition-colors hover:text-orange-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full py-6 text-base">
                {loading ? 'Logging in...' : 'Continue to dashboard'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Access / Test Accounts</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-xl text-xs"
                  onClick={() => setFormData({ email: 'client@test.com', password: 'Client@123' })}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Client Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-xl text-xs"
                  onClick={() => setFormData({ email: 'moderator@adflow.com', password: 'Moderator@123' })}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-sky-500"></span>
                  Moderator
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-xl text-xs"
                  onClick={() => setFormData({ email: 'admin@adflow.com', password: 'Admin@123' })}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-orange-500"></span>
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start rounded-xl text-xs"
                  onClick={() => setFormData({ email: 'super@adflow.com', password: 'SuperAdmin@123' })}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-indigo-500"></span>
                  Super Admin
                </Button>
              </div>
              <p className="mt-3 text-[10px] text-slate-400">
                Note: These accounts must exist in your Supabase project.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
