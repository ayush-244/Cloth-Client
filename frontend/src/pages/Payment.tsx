import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Address } from '../types';
import { formatPrice } from '../utils/helpers';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';

interface ShippingInfo {
  address: Address;
  rentalStartDate: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, clearCart, loading: cartLoading } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load shipping info from localStorage
  useEffect(() => {
    const savedInfo = localStorage.getItem('shippingInfo');
    if (!savedInfo) {
      navigate('/shipping-address');
      return;
    }
    try {
      setShippingInfo(JSON.parse(savedInfo));
    } catch {
      navigate('/shipping-address');
    }
  }, [navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0) {
      navigate('/products');
    }
  }, [cart.items.length, cartLoading, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    if (!shippingInfo) {
      setError('Shipping information not found');
      setLoading(false);
      return;
    }

    console.log('🚀 Starting payment process...');
    console.log('💰 Cart:', cart);
    console.log('📍 Shipping Address:', shippingInfo.address);
    console.log('📅 Rental Start Date:', shippingInfo.rentalStartDate);

    try {
      // Fetch Razorpay key
      console.log('📡 Fetching Razorpay key...');
      const keyResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/razorpay-key`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!keyResponse.ok) {
        console.error(
          '❌ Razorpay key fetch failed:',
          keyResponse.status,
          keyResponse.statusText
        );
        throw new Error(
          `Failed to fetch Razorpay key: ${keyResponse.status} ${keyResponse.statusText}`
        );
      }

      const keyData = await keyResponse.json();
      console.log('✅ Razorpay key received:', keyData);

      if (!keyData.key) {
        throw new Error('Razorpay key not received from server');
      }

      // Create order
      console.log('📡 Creating order on backend...');
      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            amount: cart.totalPrice,
            currency: 'INR',
            items: cart.items,
            shippingAddress: shippingInfo.address,
            rentalStartDate: shippingInfo.rentalStartDate,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error(
          '❌ Order creation failed:',
          orderResponse.status,
          errorText
        );
        throw new Error(
          `Failed to create order: ${orderResponse.status} ${orderResponse.statusText}`
        );
      }

      const orderData = await orderResponse.json();
      console.log('✅ Order created:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Check Razorpay SDK
      const Razorpay = (window as any).Razorpay;
      console.log(
        '🔍 Razorpay SDK check:',
        Razorpay ? 'Available' : 'NOT AVAILABLE'
      );

      if (!Razorpay) {
        throw new Error(
          'Razorpay SDK not loaded. Please reload the page and try again.'
        );
      }

      // Open Razorpay
      console.log('💳 Opening Razorpay checkout...');
      const options = {
        key: keyData.key,
        amount: cart.totalPrice * 100, // Convert to paise
        currency: 'INR',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log('✅ Payment handler called:', response);

          try {
            // Verify payment
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();
            console.log('✅ Payment verified:', verifyData);

            if (verifyData.success) {
              // Clear cart and shipping info
              clearCart();
              localStorage.removeItem('shippingInfo');

              // Navigate to confirmation
              navigate('/order-confirmation', {
                state: { orderId: orderData.orderId },
              });
            } else {
              setError('Payment verification failed');
              setLoading(false);
            }
          } catch (err) {
            const errorMsg =
              err instanceof Error ? err.message : 'Payment verification failed';
            console.error('❌ Verification error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
          }
        },
        prefill: {
          name: shippingInfo.address.fullName,
          email: shippingInfo.address.email,
          contact: shippingInfo.address.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment dialog closed by user');
            setLoading(false);
            setError('Payment cancelled. Please try again if you wish to continue.');
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Payment processing failed';
      console.error('❌ Payment error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (authLoading || cartLoading || !shippingInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading payment...</p>
      </div>
    );
  }

  // Calculate rental end date based on longest rental period
  const maxRentalDays = cart.items.length > 0
    ? Math.max(...cart.items.map(item => item.rentalDays))
    : 0;
  const endDate = new Date(shippingInfo.rentalStartDate);
  endDate.setDate(endDate.getDate() + maxRentalDays);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200">
        <button
          onClick={() => navigate('/shipping-address')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shipping
        </button>
        <h1 className="text-4xl font-light text-gray-900 font-serif">Payment</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-light">{error}</p>
              <p className="text-sm text-red-500 font-light mt-1">
                Please check the console (F12) for more details
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12">
          {/* Payment Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Shipping Address Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 font-serif">
                Shipping Address
              </h2>
              <div className="space-y-2 text-sm text-gray-600 font-light">
                <p className="font-medium text-gray-900">
                  {shippingInfo.address.fullName}
                </p>
                <p>{shippingInfo.address.street}</p>
                <p>
                  {shippingInfo.address.city}, {shippingInfo.address.state}{' '}
                  {shippingInfo.address.postalCode}
                </p>
                <p>{shippingInfo.address.country}</p>
                <p className="border-t border-gray-200 pt-2 mt-2">
                  {shippingInfo.address.phone}
                </p>
                <p>{shippingInfo.address.email}</p>
              </div>
            </div>

            {/* Rental Details Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 font-serif">
                Rental Details
              </h2>
              <div className="space-y-3 text-sm text-gray-600 font-light">
                <div className="flex justify-between">
                  <span>Rental Start:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(
                      shippingInfo.rentalStartDate
                    ).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Return By:</span>
                  <span className="font-medium text-gray-900">
                    {endDate.toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span>Total Rental Days:</span>
                  <span className="font-medium text-gray-900">
                    {maxRentalDays}{' '}
                    days
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-gray-900" />
                <h2 className="text-lg font-medium text-gray-900 font-serif">
                  Secure Payment
                </h2>
              </div>
              <p className="text-sm text-gray-600 font-light mb-6">
                All transactions are secure and encrypted. Your payment will be
                processed through Razorpay.
              </p>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-900 text-white font-light hover:bg-black transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(cart.totalPrice)} with Razorpay`
                )}
              </button>

              <p className="text-xs text-gray-500 font-light text-center mt-4">
                You will be redirected to Razorpay to complete the payment
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 font-serif">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map(item => (
                  <div
                    key={item.productId}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.product.images?.[0] ||
                          'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=100&h=100&fit=crop'
                        }
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-light">
                        {item.rentalDays} days @ {formatPrice(item.pricePerDay)}/day
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
