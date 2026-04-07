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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const email = formData.email.trim().toLowerCase();

      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'client',
          },
        },
      });

      if (error) throw error;

      // 2. Insert into users table
      if (data.user) {
        const { error: userError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          full_name: formData.full_name,
          role: 'client',
        });
        // Ignore duplicate key errors (trigger may have already created the row)
        if (userError && !userError.message.includes('duplicate')) {
          console.warn('User insert warning:', userError.message);
        }

        // 3. Insert into seller_profiles table
        const { error: profileError } = await supabase.from('seller_profiles').insert({
          user_id: data.user.id,
          business_name: formData.full_name,
        });
        if (profileError && !profileError.message.includes('duplicate')) {
          console.warn('Seller profile insert warning:', profileError.message);
        }
      }

      toast.success('Account created successfully!');
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="surface-card order-2 rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:order-1">
          <CardContent className="p-8">
            <div className="mb-6">
              <Link href="/" className="brand-mark text-lg font-semibold text-slate-950">AdFlow Pro</Link>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create your client account</h2>
              <p className="mt-2 text-sm text-slate-600">Start submitting campaigns into the workflow engine.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <p className="text-xs text-slate-500">At least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" minLength={8} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full py-6 text-base">
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-5 text-sm text-slate-600">
              Already registered?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:text-orange-500">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="surface-dark hero-outline order-1 rounded-[2.25rem] p-8 text-white lg:order-2">
          <p className="section-kicker">Workflow Marketplace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Publish only when content, payment, and timing all line up.
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <p>Clients submit ads and payment proofs.</p>
            <p>Moderators approve content quality and compliance.</p>
            <p>Admins verify revenue events and schedule launch windows.</p>
            <p>Only approved, non-expired campaigns reach the public marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
