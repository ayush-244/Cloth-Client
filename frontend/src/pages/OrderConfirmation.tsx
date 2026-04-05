import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, ArrowRight, Download, MessageCircle } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  totalAmount: number;
  rentalStartDate: string;
  rentalEndDate: string;
  status: string;
  shippingAddress?: any;
}

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const state = location.state as any;
    if (!state?.orderId) {
      navigate('/products');
    } else {
      // Mock order data - in real app, fetch from API
      setOrder({
        orderId: state.orderId,
        totalAmount: 5000,
        rentalStartDate: new Date().toISOString().split('T')[0],
        rentalEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        status: 'confirmed',
      });
    }
  }, [location, navigate]);

  if (authLoading || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading confirmation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Section */}
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mb-8 flex justify-center">
          <CheckCircle className="w-24 h-24 text-gray-900 animate-bounce" />
        </div>

        <h1 className="text-4xl font-light text-gray-900 font-serif mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 font-light mb-12">
          Your rental booking has been confirmed. We'll send all details to your email.
        </p>

        {/* Order Details Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 mb-12 space-y-6">
          {/* Order ID */}
          <div>
            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
              Order ID
            </p>
            <p className="text-2xl font-medium text-gray-900 font-mono break-all">
              {order.orderId}
            </p>
          </div>

          {/* Rental Dates */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Period</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
                  Start Date
                </p>
                <p className="text-lg text-gray-900 font-light">
                  {new Date(order.rentalStartDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
                  Return Date
                </p>
                <p className="text-lg text-gray-900 font-light">
                  {new Date(order.rentalEndDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
              Total Paid
            </p>
            <p className="text-3xl font-medium text-gray-900">₹{order.totalAmount}</p>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mb-12 text-left max-w-xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-6">What happens next?</h3>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex-shrink-0">
                1
              </span>
              <div>
                <p className="text-gray-900 font-light">
                  We'll prepare your items and confirm pickup
                </p>
                <p className="text-sm text-gray-500 font-light mt-1">Within 24 hours</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex-shrink-0">
                2
              </span>
              <div>
                <p className="text-gray-900 font-light">
                  Items will be shipped to your address
                </p>
                <p className="text-sm text-gray-500 font-light mt-1">
                  Tracking provided via email
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex-shrink-0">
                3
              </span>
              <div>
                <p className="text-gray-900 font-light">
                  Enjoy your rented fashion items
                </p>
                <p className="text-sm text-gray-500 font-light mt-1">
                  Return before {new Date(order.rentalEndDate).toLocaleDateString()}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex-shrink-0">
                4
              </span>
              <div>
                <p className="text-gray-900 font-light">
                  Schedule a pickup at no cost
                </p>
                <p className="text-sm text-gray-500 font-light mt-1">
                  Free returns within 7 days
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
              Insurance
            </p>
            <p className="text-gray-900 font-light">Included</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
              Shipping
            </p>
            <p className="text-gray-900 font-light">Free</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-2">
              Support
            </p>
            <p className="text-gray-900 font-light">24/7</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-xs mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300 flex items-center justify-center gap-2"
          >
            View All Orders
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            className="w-full px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>

          <a
            href={`https://wa.me/919162573098?text=Hi, I have a query about my order ${order.orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </a>
        </div>

        {/* Back to Shopping */}
        <button
          onClick={() => navigate('/products')}
          className="mt-8 text-gray-900 hover:text-gray-600 font-light text-sm underline"
        >
          Continue Shopping
        </button>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">
            Why Cloth Rental?
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm text-gray-600 font-light">
                Premium designer pieces at affordable prices
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm text-gray-600 font-light">
                Clean & sanitized items before delivery
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm text-gray-600 font-light">
                Easy returns with no hidden charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
