import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { AuthLayout } from '../../components/auth/AuthLayout';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      toast.success('If that email exists, a reset link has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Forgot password?</h2>
          <p className="text-sm text-muted-fg mt-1">
            {sent
              ? 'Check your email for a password reset link.'
              : 'Enter your email and we will send you a reset link.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-public">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input-public"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-[var(--color-destructive)] mt-1">{errors.email.message}</p>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary-public w-full py-3">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <Link to="/login" className="btn-primary-public w-full py-3 text-center block">
            Back to Sign In
          </Link>
        )}

        <p className="mt-6 text-center text-sm text-muted-fg">
          Remember your password?{' '}
          <Link to="/login" className="text-[#2563eb] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
