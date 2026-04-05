import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Address } from '../types';
import { formatPrice } from '../utils/helpers';
import { ArrowLeft, MapPin, Calendar, Check } from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, clearCart, loading: cartLoading } = useCart();
  const [step, setStep] = useState<'address' | 'summary' | 'payment'>(
    'address'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalStartDate, setRentalStartDate] = useState('');

  // Form state
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Redirect if cart is empty (AFTER cart has loaded from localStorage)
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0) {
      console.warn('Cart is empty, redirecting to products');
      navigate('/products');
    }
  }, [cart.items.length, cartLoading, navigate]);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRentalStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = (): boolean => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode'];
    const missing = required.filter(field => !address[field as keyof Address]);

    if (missing.length > 0) {
      setError(`Please fill: ${missing.join(', ')}`);
      return false;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }

    if (!/^\d{6}$/.test(address.postalCode)) {
      setError('Postal code must be 6 digits');
      return false;
    }

    setError(null);
    return true;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep('summary');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    console.log('🚀 Starting payment process...');
    console.log('💰 Cart:', cart);
    console.log('📍 Shipping Address:', address);
    console.log('📅 Rental Start Date:', rentalStartDate);

    try {
      // Get Razorpay key from backend
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
        throw new Error(`Failed to fetch Razorpay key: ${keyResponse.status} ${keyResponse.statusText}`);
      }

      const keyData = await keyResponse.json();
      console.log('✅ Razorpay key received:', keyData);
      const { key } = keyData;

      if (!key) {
        throw new Error('Razorpay key not received from server');
      }

      // Create order on backend
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
            shippingAddress: address,
            rentalStartDate,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Order creation failed:', orderResponse.status, errorText);
        throw new Error(`Failed to create order: ${orderResponse.status} ${orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();
      console.log('✅ Order created:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Check Razorpay SDK
      const Razorpay = (window as any).Razorpay;
      console.log('🔍 Razorpay SDK check:', Razorpay ? 'Available' : 'NOT AVAILABLE');
      
      if (!Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please reload the page and try again.');
      }

      // Open Razorpay
      console.log('💳 Opening Razorpay checkout...');
      const options = {
        key,
        amount: cart.totalPrice * 100, // Convert to paise
        currency: 'INR',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log('✅ Payment handler called:', response);
          // Verify payment on backend
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
            clearCart();
            navigate('/order-confirmation', {
              state: { orderId: orderData.orderId },
            });
          } else {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
      console.error('❌ Payment error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading checkout...</p>
      </div>
    );
  }

  // Calculate rental end date based on longest rental period
  const maxRentalDays = cart.items.length > 0
    ? Math.max(...cart.items.map(item => item.rentalDays))
    : 0;
  const endDate = new Date(rentalStartDate);
  endDate.setDate(endDate.getDate() + maxRentalDays);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>
        <h1 className="text-4xl font-light text-gray-900 font-serif">Checkout</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-light">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12">
          {/* Checkout Steps */}
          <div className="md:col-span-2">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-12">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  step === 'address' || step === 'summary' || step === 'payment'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step === 'address' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <div className="flex-1 h-px bg-gray-200" />

              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  step === 'summary' || step === 'payment'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step === 'summary' || step === 'payment' ? (
                  step === 'payment' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    '2'
                  )
                ) : (
                  '2'
                )}
              </div>
              <div className="flex-1 h-px bg-gray-200" />

              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  step === 'payment'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
            </div>

            {/* Address Step */}
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (10 digits)"
                    value={address.phone}
                    onChange={handleAddressChange}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={address.email}
                    onChange={handleAddressChange}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="col-span-2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code (6 digits)"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                  />
                </div>

                {/* Rental Date Selection */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Rental Dates
                  </h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 font-light mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={rentalStartDate}
                        onChange={e => setRentalStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 font-light"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 font-light mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        disabled
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-light text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300"
                >
                  Continue to Summary
                </button>
              </form>
            )}

            {/* Summary Step */}
            {step === 'summary' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Order Summary
                </h2>

                {/* Address Summary */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <p className="text-gray-600 font-light">
                    {address.fullName} <br />
                    {address.street} <br />
                    {address.city}, {address.state} {address.postalCode} <br />
                    {address.country}
                  </p>
                  <button
                    onClick={() => setStep('address')}
                    className="mt-4 text-gray-900 hover:text-gray-600 font-light text-sm underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Rental Dates */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Rental Period
                  </h3>
                  <p className="text-gray-600 font-light">
                    From: {new Date(rentalStartDate).toLocaleDateString()} <br />
                    To: {endDate.toLocaleDateString()}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep('address')}
                    className="px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Payment
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Total Amount Due
                  </h3>
                  <p className="text-4xl font-medium text-gray-900 mb-8">
                    {formatPrice(cart.totalPrice)}
                  </p>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Pay with Razorpay'}
                  </button>

                  <p className="text-sm text-gray-600 font-light mt-4">
                    Secure payment powered by Razorpay
                  </p>
                </div>

                <button
                  onClick={() => setStep('summary')}
                  className="w-full px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Back to Summary
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-20 border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Items ({cart.items.length})
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cart.items.map(item => (
                  <div key={item.productId}>
                    <p className="text-sm text-gray-900 font-light line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.rentalDays} days × {formatPrice(item.pricePerDay)}
                    </p>
                    <p className="text-sm text-gray-900 font-medium mt-2">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Insurance</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="text-xl font-medium text-gray-900">
                  {formatPrice(cart.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default Checkout;
