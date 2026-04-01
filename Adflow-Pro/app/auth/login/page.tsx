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
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success('Logged in successfully');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_45%,_#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
          <p className="text-xs uppercase tracking-[0.35em] text-orange-300">AdFlow Pro</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to move listings through the revenue workflow.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Access client, moderation, admin, and super admin operations with the same production-ready marketplace stack.
          </p>
        </div>

        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8">
            <div className="mb-6">
              <Link href="/" className="text-lg font-semibold text-slate-950">AdFlow Pro</Link>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-slate-950 py-6 text-base hover:bg-slate-800">
                {loading ? 'Logging in...' : 'Continue to dashboard'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-5 text-sm text-slate-600">
              Need an account?{' '}
              <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-500">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
