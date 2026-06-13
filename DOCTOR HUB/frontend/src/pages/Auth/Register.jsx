import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserPlus, Stethoscope, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';
import { AuthLayout } from '../../components/auth/AuthLayout';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
    role: z.enum(['patient', 'doctor']),
    specialization: z.string().optional(),
    treatmentType: z.enum(['allopathic', 'homeopathic', 'herbal']).optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine(
    (d) => d.role !== 'doctor' || (d.specialization && d.treatmentType),
    { message: 'Specialization and treatment type required for doctors', path: ['specialization'] }
  );

export default function Register() {
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const role = useWatch({ control, name: 'role' });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await createAccount({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        specialization: data.specialization,
        treatmentType: data.treatmentType,
      });
      toast.success('Account created successfully');
      navigate(ROLE_DASHBOARD[user.role] || '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card-premium">
        <div className="text-center mb-6">
          <div className="auth-icon mx-auto mb-4">
            {role === 'doctor' ? <Stethoscope className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
          </div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-fg mt-1">Join Doctor Hub as a patient or verified doctor</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="label-public">Full Name</label>
            <input
              id="name"
              placeholder="John Doe"
              className="input-public"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-[var(--color-destructive)] mt-1">{errors.name.message}</p>
            )}
          </div>

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
            <label htmlFor="role" className="label-public">Register as</label>
            <select
              id="role"
              className="input-public"
              {...register('role')}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {role === 'doctor' && (
            <>
              <div>
                <label htmlFor="specialization" className="label-public">Specialization</label>
                <input
                  id="specialization"
                  placeholder="e.g. Cardiology"
                  className="input-public"
                  {...register('specialization')}
                />
                {errors.specialization && (
                  <p className="text-sm text-[var(--color-destructive)] mt-1">
                    {errors.specialization.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="treatmentType" className="label-public">Treatment Type</label>
                <select id="treatmentType" className="input-public" {...register('treatmentType')}>
                  <option value="">Select type</option>
                  <option value="allopathic">Allopathic</option>
                  <option value="homeopathic">Homeopathic</option>
                  <option value="herbal">Herbal</option>
                </select>
              </div>
            </>
          )}

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
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563eb] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
