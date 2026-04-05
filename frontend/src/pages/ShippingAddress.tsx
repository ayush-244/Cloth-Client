import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Address } from '../types';
import { formatPrice } from '../utils/helpers';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

const ShippingAddress: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  
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

  // Redirect if cart is empty (after cart has loaded)
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0) {
      navigate('/products');
    }
  }, [cart.items.length, cartLoading, navigate]);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRentalStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!rentalStartDate) {
      setError('Please select a rental start date');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress()) {
      return;
    }

    // Save address and rental info to localStorage
    localStorage.setItem(
      'shippingInfo',
      JSON.stringify({
        address,
        rentalStartDate,
      })
    );

    // Navigate to payment page
    navigate('/payment');
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading address form...</p>
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
        <h1 className="text-4xl font-light text-gray-900 font-serif">Shipping Address</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-light">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12">
          {/* Address Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleNext} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-700 font-light mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 font-light mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={address.email}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-700 font-light mb-2">
                  Phone Number (10 digits) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  placeholder="10-digit phone number"
                  maxLength={10}
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm text-gray-700 font-light mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  placeholder="Street address"
                />
              </div>

              {/* City */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 font-light mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                    placeholder="City"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm text-gray-700 font-light mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                    placeholder="State"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm text-gray-700 font-light mb-2">
                  Postal Code (6 digits) *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  placeholder="6-digit postal code"
                  maxLength={6}
                />
              </div>

              {/* Rental Start Date */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 font-light mb-2">
                  <Calendar className="w-4 h-4" />
                  Rental Start Date *
                </label>
                <input
                  type="date"
                  value={rentalStartDate}
                  onChange={(e) => setRentalStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors font-light"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Rental Details */}
              {cart.items.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-light mb-2">
                    Rental Duration: {maxRentalDays} days
                  </p>
                  <p className="text-sm text-gray-600 font-light">
                    Return by: {endDate.toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 border border-gray-900 text-gray-900 font-light hover:bg-gray-50 transition-colors rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white font-light hover:bg-black transition-colors rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
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
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=100&h=100&fit=crop'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-light">
                        {item.rentalDays} days
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

export default ShippingAddress;
