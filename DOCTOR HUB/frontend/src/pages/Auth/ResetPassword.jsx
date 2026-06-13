import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { AuthLayout } from '../../components/auth/AuthLayout';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Reset password</h2>
          <p className="text-sm text-muted-fg mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="label-public">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input-public"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-[var(--color-destructive)] mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm_password" className="label-public">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              className="input-public"
              {...register('confirm_password')}
            />
            {errors.confirm_password && (
              <p className="text-sm text-[var(--color-destructive)] mt-1">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary-public w-full py-3">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          <Link to="/login" className="text-[#2563eb] hover:underline font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
