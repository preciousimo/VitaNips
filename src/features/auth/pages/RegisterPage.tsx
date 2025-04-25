import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance'; // Use configured instance
// Import useAuth if you want to auto-login after registration
// import { useAuth } from '../../../contexts/AuthContext';
// import { AuthTokens } from '../../../types/auth';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '', // Add if required by your backend registration
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  // const { login } = useAuth(); // Uncomment if auto-logging in

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      // Use your Django registration endpoint (defined in users/urls.py)
      await axiosInstance.post('/users/register/', {
          email: formData.email,
          username: formData.username || formData.email, // Use email as username if username field not present
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password2: formData.password2, // Send password confirmation
      });

      setSuccess('Registration successful! Please login.');
      setIsLoading(false);

       // Option 1: Redirect to login page after a short delay
       setTimeout(() => {
         navigate('/login');
       }, 2000); // 2-second delay


       // Option 2: Automatically log the user in (if backend returns tokens on register or you call login endpoint)
       // const loginResponse = await axiosInstance.post<AuthTokens>('/token/', { email: formData.email, password: formData.password });
       // login(loginResponse.data.access, loginResponse.data.refresh);
       // navigate('/'); // Redirect to dashboard


    } catch (err: any) {
      console.error('Registration failed:', err.response?.data || err.message);
       let errorMessage = 'Registration failed. Please try again.';
       if (err.response?.data) {
           // Extract specific field errors if backend provides them
           const errors = err.response.data;
           if (errors.email) errorMessage = `Email: ${errors.email.join(', ')}`;
           else if (errors.username) errorMessage = `Username: ${errors.username.join(', ')}`;
           else if (errors.password) errorMessage = `Password: ${errors.password.join(', ')}`;
           // Add more specific error handling based on your backend validation
           else {
               // General error message from response data
               const errorDetails = Object.values(errors).flat().join(' ');
               if (errorDetails) {
                   errorMessage = errorDetails;
               }
           }
       }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
         <div>
           <img
             className="mx-auto h-16 w-auto"
             src="/logo.png"
             alt="VitaNips Logo"
           />
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
             Create your VitaNips account
           </h2>
         </div>
         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {error && <div className="text-red-600 text-sm text-center">{error}</div>}
           {success && <div className="text-green-600 text-sm text-center">{success}</div>}
           <div className="rounded-md shadow-sm grid grid-cols-1 gap-y-4">
            <input /* First Name */
                name="first_name" type="text" required placeholder="First Name"
                value={formData.first_name} onChange={handleChange} disabled={isLoading}
                className="input-field"
            />
            <input /* Last Name */
                name="last_name" type="text" required placeholder="Last Name"
                 value={formData.last_name} onChange={handleChange} disabled={isLoading}
                 className="input-field"
            />
             <input /* Email */
               name="email" type="email" autoComplete="email" required placeholder="Email address"
               value={formData.email} onChange={handleChange} disabled={isLoading}
               className="input-field"
             />
             <input /* Username (optional based on your backend) */
                name="username" type="text" required placeholder="Username"
                value={formData.username} onChange={handleChange} disabled={isLoading}
                className="input-field"
             />
             <input /* Password */
               name="password" type="password" autoComplete="new-password" required placeholder="Password"
               value={formData.password} onChange={handleChange} disabled={isLoading}
               className="input-field"
             />
             <input /* Confirm Password */
               name="password2" type="password" autoComplete="new-password" required placeholder="Confirm Password"
               value={formData.password2} onChange={handleChange} disabled={isLoading}
               className="input-field"
             />
           </div>

           <div>
             <button type="submit" className="group relative w-full flex justify-center btn-primary" disabled={isLoading}>
               {isLoading ? 'Registering...' : 'Register'}
             </button>
           </div>
         </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in here
            </Link>
          </p>
       </div>
     </div>
   );
};

export default RegisterPage;