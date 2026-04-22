import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, Download, Calendar, MapPin, ArrowRight } from 'lucide-react';

interface OrderData {
  orderId: string;
  transactionId: string;
  bookingIds: string[];
  totalAmount: number;
  items: Array<{
    productId: string;
    product: any;
    rentalDays: number;
    totalPrice: number;
    size: string;
  }>;
  rentalStartDate: string;
  shippingAddress?: any;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const state = location.state as any;
    if (!state?.order) {
      navigate('/products', { replace: true });
    } else {
      setOrder(state.order);
    }
  }, [location, navigate]);

  if (authLoading || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-light">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  // Calculate rental dates
  const startDate = new Date(order.rentalStartDate);
  const endDate = new Date(startDate);
  if (order.items.length > 0) {
    endDate.setDate(endDate.getDate() + order.items[0].rentalDays);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 font-light text-lg">
            Your booking has been confirmed. Check your email for details.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8 overflow-hidden animate-slideInRight">
          {/* Order Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-1">
                  Order ID
                </p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {order.orderId.slice(0, 12)}...
                </p>
              </div>
              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-1">
                  Transaction ID
                </p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {order.transactionId.slice(0, 8)}...
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-1">
                  Amount Paid
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-light text-gray-900 mb-4">Booking Details</h3>

            {/* Rental Dates */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-2">
                    Rental Start
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-900">{formatDate(startDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-2">
                    Return Date
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-900">{formatDate(endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-light text-gray-700">Items Rented:</h4>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-light text-gray-900">
                      {item.product?.name || 'Product'}
                    </p>
                    <p className="text-xs text-gray-600 font-light mt-1">
                      {item.rentalDays} days • Size: {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-light text-blue-900 uppercase tracking-widest mb-2">
                      Delivery Address
                    </p>
                    <p className="text-sm text-blue-900 font-light">
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-light text-gray-900">Total Amount</span>
              <span className="text-xl font-medium text-gray-900">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-light text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <p className="text-sm font-light text-gray-900">
                  <strong>Confirmation Email</strong>
                </p>
                <p className="text-xs text-gray-600 font-light">
                  Check your email for booking confirmation and delivery details.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <p className="text-sm font-light text-gray-900">
                  <strong>Delivery Confirmation</strong>
                </p>
                <p className="text-xs text-gray-600 font-light">
                  We'll send updates via SMS on pickup date and time.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <p className="text-sm font-light text-gray-900">
                  <strong>Enjoy Your Rental</strong>
                </p>
                <p className="text-xs text-gray-600 font-light">
                  Receive product and enjoy! Return by due date for full deposit refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 font-light"
          >
            <ArrowRight className="w-4 h-4" />
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 active:scale-95 transition-all duration-200 font-light"
          >
            Continue Shopping
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 font-light mb-2">
            Questions or need help?
          </p>
          <button className="text-gray-900 hover:text-gray-600 transition-colors font-light">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
