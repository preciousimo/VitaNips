// src/features/auth/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import { AuthTokens } from '../../../types/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiErrorToMessage } from '../../../utils/errors';

const LoginPage: React.FC = () => {
  const schema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password is too long.')
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const response = await axiosInstance.post<AuthTokens>('/token/', values);
      const { access, refresh } = response.data;
      await login(access, refresh);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(apiErrorToMessage(err, 'Login failed. Please check your connection and try again.'));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left hero panel */}
      <div className="hidden lg:flex items-center justify-center p-12">
        <div className="hero-gradient w-full h-[80vh] rounded-3xl relative overflow-hidden flex items-center justify-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-10 text-center text-white px-10">
            <img src="/logo.png" alt="VitaNips" className="mx-auto h-20 drop-shadow-md" />
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Welcome to <span className="whitespace-nowrap">VitaNips</span></h1>
            <p className="mt-3 text-white/90 max-w-md mx-auto text-balance">
              Your personal health hub — appointments, medications, documents, and telehealth in one secure place.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white/80">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Secure</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Fast</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            <div className="text-center">
              <img className="mx-auto h-14" src="/logo.png" alt="VitaNips Logo" />
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
                Sign in to <span className="gradient-text">VitaNips</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                  disabled={isSubmitting}
                  className="input-field mt-1"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    required
                    disabled={isSubmitting}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500" />
                <a href="#" className="text-primary hover:text-primary-dark font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                Register here
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in you agree to our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
