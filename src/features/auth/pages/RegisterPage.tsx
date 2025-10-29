// src/features/auth/pages/RegisterPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post('/users/register/', {
        email: formData.email,
        username: formData.username || formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
      });

      const msg = 'Registration successful! Redirecting to login...';
      setSuccess(msg);
      toast.success('Welcome! Your account was created.');

      setTimeout(() => {
        navigate('/login');
      }, 1200);

    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      const axiosErr = err as { response?: { data?: unknown } } | undefined;
      const data = axiosErr?.response?.data;
      if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.email)) errorMessage = `Email: ${(obj.email as unknown[]).join(', ')}`;
        else if (Array.isArray(obj.username)) errorMessage = `Username: ${(obj.username as unknown[]).join(', ')}`;
        else if (Array.isArray(obj.password)) errorMessage = `Password: ${(obj.password as unknown[]).join(', ')}`;
        else {
          const values = Object.values(obj);
          const flat = values
            .map((v) => (Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : ''))
            .filter(Boolean)
            .join(' ');
          if (flat) errorMessage = flat;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Join <span className="whitespace-nowrap">VitaNips</span></h1>
            <p className="mt-3 text-white/90 max-w-md mx-auto text-balance">
              Create your account to manage health records, appointments, and more.
            </p>
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
                Create your <span className="gradient-text">VitaNips</span> account
              </h2>
              <p className="text-sm text-gray-500 mt-1">It only takes a minute.</p>
            </div>

            {error && <div role="alert" aria-live="assertive" className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            {success && <div className="mt-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    placeholder="Jane"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="input-field mt-1"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="input-field mt-1"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input-field mt-1"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="yourname"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="input-field mt-1"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="input-field pr-10"
                    autoComplete="new-password"
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
                <p className="mt-1 text-xs text-gray-500">Use at least 8 characters with a mix of letters and numbers.</p>
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700">Confirm password</label>
                <div className="relative mt-1">
                  <input
                    id="password2"
                    name="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="input-field pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2((s) => !s)}
                    className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                    aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                  >
                    {showPassword2 ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Registering…' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By creating an account you agree to our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
