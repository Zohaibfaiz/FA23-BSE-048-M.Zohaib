'use client';
// app/auth/register/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name, role: 'client' },
        },
      });

      if (error) throw error;

      if (authData.user) {
        // Insert into public.users table
        await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          role: 'client',
        });

        toast.success('Account created! Welcome to AdFlow Pro.');
        router.push('/client');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">AdFlow<span className="gradient-text">Pro</span></span>
        </Link>

        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Create an account</h1>
          <p className="text-white/40 text-sm mb-6">Start posting ads in minutes</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Full Name</label>
              <input {...register('full_name')} className="input-field" placeholder="Ahmed Ali" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Email</label>
              <input type="email" {...register('email')} className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password')}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Confirm Password</label>
              <input type="password" {...register('confirm_password')} className="input-field" placeholder="Repeat password" />
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50"
            >
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Sign in →</Link>
          </p>
          <p className="text-center text-xs text-white/25 mt-3">
            By registering you agree to our{' '}
            <Link href="/terms" className="text-white/40 hover:text-white/60">Terms of Service</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
