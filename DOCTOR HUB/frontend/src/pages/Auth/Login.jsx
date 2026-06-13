import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';
import { AuthLayout } from '../../components/auth/AuthLayout';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      toast.success('Account created! You can now sign in.');
    }
    if (location.state?.banned) {
      toast.error('Your account has been suspended. Contact support.');
    }
  }, [location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      const firstName = user.name?.split(' ')[0] || 'there';
      toast.success(`Welcome back, ${firstName}!`);
      const redirect = location.state?.from?.pathname || ROLE_DASHBOARD[user.role];
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card-premium">
        <div className="text-center mb-6">
          <div className="auth-icon mx-auto mb-4">
            <LogIn className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-sm text-muted-fg mt-1">Sign in to your Doctor Hub account</p>
        </div>

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

          <div>
            <label htmlFor="password" className="label-public">Password</label>
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

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#2563eb] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary-public w-full py-3">
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#2563eb] hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
