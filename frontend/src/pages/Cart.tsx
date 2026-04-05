import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cart, removeFromCart, updateRentalDays } = useCart();
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 font-light">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </button>
        <h1 className="text-4xl font-light text-gray-900 font-serif">Your Rental Bag</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-light">{error}</p>
          </div>
        )}

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-light text-lg mb-8">Your rental bag is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 border border-gray-900 text-gray-900 font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {cart.items.map(item => (
                <div
                  key={item.productId}
                  className="border border-gray-200 rounded-lg p-6 flex gap-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${item.product._id || item.productId}`)}
                >
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden hover:opacity-75 transition-opacity">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=200&h=200&fit=crop'}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1 hover:underline">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {item.product.category}
                      </p>

                      {/* Rental Duration */}
                      <div className="flex items-center gap-4">
                        <label className="text-sm text-gray-600 font-light">Rental Days:</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateRentalDays(item.productId, Math.max(1, item.rentalDays - 1));
                            }}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-gray-900 font-light">
                            {item.rentalDays}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateRentalDays(item.productId, item.rentalDays + 1);
                            }}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-light mb-1">
                          {formatPrice(item.pricePerDay)}/day × {item.rentalDays} days
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.productId);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-20 border border-gray-200 rounded-lg p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h3>

                {/* Summary Details */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items ({cart.items.length})</span>
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

                {/* Total */}
                <div className="flex justify-between mb-8">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-2xl font-medium text-gray-900">
                    {formatPrice(cart.totalPrice)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/shipping-address')}
                  className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300 mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Continue Shopping
                </button>

                {/* Trust Badges */}
                <div className="mt-8 space-y-3 text-xs text-gray-600 font-light">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Easy returns within 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
