'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const response = await fetch('/api/auth/force-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Password Updated</h2>
                <p className="mt-3 text-sm text-slate-600 leading-7">
                  Your password has been changed successfully. You can now log in with your new password.
                </p>
                <p className="mt-4 text-xs text-slate-500">Redirecting to login...</p>
                <Link href="/auth/login">
                  <Button className="mt-6 w-full rounded-full">
                    Go to login now
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 mb-4">
                    <Lock className="h-6 w-6 text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight">Change Password</h2>
                  <p className="mt-2 text-sm text-slate-600 leading-7">
                    Enter your email address and choose a new password. There is no email verification required.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Account Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      minLength={8}
                      placeholder="Must match password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full py-6 text-base"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
