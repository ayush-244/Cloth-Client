import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: 'user',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white pointer-events-none" />
      
      {/* Minimal accent lights */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gray-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-gray-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Premium Logo Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
                <span className="text-white font-serif text-2xl font-semibold">C</span>
              </div>
            </div>

            <h1 className="text-5xl font-serif font-light text-gray-900 mb-2">Cloth Rental</h1>
            <p className="text-gray-600 text-sm font-light tracking-widest uppercase">Create Your Account</p>
          </div>

          {/* Premium Auth Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 mb-8 shadow-sm">
            
            {/* Form Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
                Join Us
              </h2>
              <p className="text-gray-600 text-sm font-light">
                Create your account to get started
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-light leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm font-light leading-relaxed">{success}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-light text-gray-600 mb-3 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all duration-200 font-light"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-light text-gray-600 mb-3 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all duration-200 font-light"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-light text-gray-600 mb-3 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all duration-200 font-light"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-light text-gray-600 mb-3 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 focus:bg-white transition-all duration-200 font-light"
                    required
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-4 px-6 rounded-lg border border-gray-900 text-gray-900 font-light tracking-wide uppercase text-sm hover:bg-gray-900 hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Account</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200" />

            {/* Password Requirements */}
            <div>
              <p className="text-xs font-light text-gray-600 mb-4 uppercase tracking-widest">
                Password Requirements
              </p>
              <ul className="space-y-2 text-xs text-gray-600 font-light">
                <li>✓ At least 6 characters long</li>
                <li>✓ Unique to your account</li>
                <li>✓ Can contain letters, numbers, and symbols</li>
              </ul>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="text-center space-y-3">
            <p className="text-xs text-gray-600 font-light tracking-widest uppercase">
              Premium Clothing Rental
            </p>
            <p className="text-xs text-gray-500 font-light">
              © 2026 Cloth Rental. All rights reserved.
            </p>
            
            {/* Back to Login Link */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-sm font-light text-gray-900 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
