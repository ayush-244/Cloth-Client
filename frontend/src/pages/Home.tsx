import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const switchMode = (mode: 'user' | 'admin') => {
    setLoginMode(mode);
    setError(null);
    setSuccess(null);
    
    // Update demo credentials based on mode
    if (mode === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        // Navigate to admin dashboard if admin login, else products
        const redirectPath = loginMode === 'admin' ? '/admin/dashboard' : '/products';
        navigate(redirectPath);
      }, 1500);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setIsLoading(false);
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
            <p className="text-gray-600 text-sm font-light tracking-widest uppercase">Premium Fashion Experience</p>
          </div>

          {/* Premium Auth Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 mb-8 shadow-sm">
            
            {/* Login Mode Toggle */}
            <div className="mb-10 flex gap-3 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => switchMode('user')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-light transition-all uppercase tracking-widest ${
                  loginMode === 'user'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('admin')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-light transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                  loginMode === 'admin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>

            {/* Form Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-serif font-light text-gray-900 mb-1">
                {loginMode === 'admin' ? 'Admin Panel' : 'Welcome'}
              </h2>
              <p className="text-gray-600 text-sm font-light">
                {loginMode === 'admin' ? 'Sign in to admin dashboard' : 'Sign in to your account'}
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
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

              {/* Sign In Button */}
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
                    <span>Signing In</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 border-t border-gray-200" />

            {/* Demo Credentials */}
            <div>
              <p className="text-xs font-light text-gray-600 mb-5 uppercase tracking-widest">
                {loginMode === 'admin' ? 'Admin Demo Credentials' : 'Demo Credentials'}
              </p>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest font-light">Email</p>
                  <code className="text-sm text-gray-900 font-light bg-white px-4 py-3 rounded border border-gray-200 block hover:border-gray-400 transition-colors cursor-text select-all">
                    {loginMode === 'admin' ? 'admin@example.com' : 'user@example.com'}
                  </code>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest font-light">Password</p>
                  <code className="text-sm text-gray-900 font-light bg-white px-4 py-3 rounded border border-gray-200 block hover:border-gray-400 transition-colors cursor-text">
                    {loginMode === 'admin' ? 'admin123' : 'password123'}
                  </code>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
