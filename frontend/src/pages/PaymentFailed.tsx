import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const error = (location.state as any)?.error || 'Payment could not be processed';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleRetry = () => {
    navigate('/checkout', { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 font-light text-lg">
            Your payment could not be processed. Please try again.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8 overflow-hidden animate-slideInRight">
          {/* Error Message */}
          <div className="bg-red-50 border-b border-red-200 px-6 py-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">Error Details</p>
                <p className="text-sm font-light text-red-700">{error}</p>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-light text-gray-900 mb-4">Common Reasons</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  •
                </div>
                <div>
                  <p className="text-sm font-light text-gray-900">Insufficient funds in your account</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  •
                </div>
                <div>
                  <p className="text-sm font-light text-gray-900">Card was declined or expired</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  •
                </div>
                <div>
                  <p className="text-sm font-light text-gray-900">Network connection interrupted</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  •
                </div>
                <div>
                  <p className="text-sm font-light text-gray-900">3D Secure verification failed</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Do */}
          <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
            <h3 className="text-lg font-light text-gray-900 mb-4">What to Do Next</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <p className="text-sm font-light text-gray-900">
                  Check your card and payment method details
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <p className="text-sm font-light text-gray-900">
                  Ensure you have sufficient funds available
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <p className="text-sm font-light text-gray-900">
                  Try a different payment method if available
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <p className="text-sm font-light text-gray-900">
                  Contact your bank if payment was deducted but confirmation not received
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 font-light"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 active:scale-95 transition-all duration-200 font-light"
          >
            Back to Cart
          </button>
        </div>

        {/* Support */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <HelpCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Need Help?</h3>
          <p className="text-sm font-light text-yellow-800 mb-4">
            If you've been charged but didn't receive confirmation, our support team can help.
          </p>
          <button className="text-yellow-900 hover:text-yellow-700 transition-colors font-light text-sm underline">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
