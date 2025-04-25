import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

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

      setSuccess('Registration successful! Redirecting to login...');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.email) errorMessage = `Email: ${errors.email.join(', ')}`;
        else if (errors.username) errorMessage = `Username: ${errors.username.join(', ')}`;
        else if (errors.password) errorMessage = `Password: ${errors.password.join(', ')}`;
        else {
          const errorDetails = Object.values(errors).flat().join(' ');
          if (errorDetails) errorMessage = errorDetails;
        }
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <img className="mx-auto h-12 w-auto" src="/logo.png" alt="VitaNips Logo" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Create your VitaNips account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 text-center">{error}</div>}
          {success && <div className="text-sm text-green-600 text-center">{success}</div>}

          <input
            name="first_name"
            type="text"
            required
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />
          <input
            name="last_name"
            type="text"
            required
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />
          <input
            name="username"
            type="text"
            required
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />
          <input
            name="password2"
            type="password"
            required
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-primary focus:outline-none"
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
