import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Check, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAvailability } from '../hooks/useAvailability';
import { Product, Booking } from '../types';
import { formatPrice } from '../utils/helpers';
import DateRangePicker from '../components/ui/DateRangePicker';
import AvailabilityStatus from '../components/ui/AvailabilityStatus';
import RatingStars from '../components/ui/RatingStars';
import ReviewsSection from '../components/ui/ReviewsSection';
import api from '../services/api';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { addToCart } = useCart();
  const { checkAvailability, checking, availability, error } = useAvailability();

  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Date states
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Load product
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productsLoading && products.length > 0) {
      const found = products.find(p => (p._id || p.id) === id);
      setProduct(found || null);
      setLoading(false);
    } else if (!productsLoading && products.length === 0) {
      setProduct(null);
      setLoading(false);
    }
  }, [id, products, productsLoading, authLoading, isAuthenticated, navigate]);

  // Fetch user bookings for review eligibility
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserBookings = async () => {
      try {
        setBookingsLoading(true);
        const response = await api.get('/api/bookings/my');
        if (response.data.success) {
          setUserBookings(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch user bookings:', err);
        setUserBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchUserBookings();
  }, [isAuthenticated]);

  // Check availability when dates or quantity changes
  useEffect(() => {
    if (!product || !startDate || !endDate) return;

    const timer = setTimeout(() => {
      checkAvailability(product._id, startDate, endDate, rentalQuantity);
    }, 500);

    return () => clearTimeout(timer);
  }, [startDate, endDate, rentalQuantity, product?.id]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
  };

  // Calculate total days and price
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const rentalDays = calculateDays();
  const totalPrice = product ? product.rentPrice * rentalDays * rentalQuantity : 0;

  // Check if add to cart should be disabled
  const isAddToCartDisabled =
    isAddingToCart ||
    !startDate ||
    !endDate ||
    !availability?.available ||
    product?.availableStock === 0;

  const handleWhatsApp = () => {
    if (!product) return;
    const message = `I'm interested in renting "${product.name}" for ₹${product.rentPrice}/day. Please confirm availability.`;
    const whatsappLink = `https://wa.me/919162573098?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  // Loading state
  if (loading || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6 animate-pulse">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-light">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors font-light mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>

          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-light text-lg mb-6">
              {productsLoading ? 'Loading product...' : 'Product not found.'}
            </p>
            <div className="flex gap-4 justify-center">
              {productsLoading && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-all duration-300 font-light"
                >
                  Reload Page
                </button>
              )}
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-all duration-300 font-light"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=600&h=600&fit=crop'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-200">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="overflow-hidden rounded-lg bg-gray-50 aspect-square flex items-center justify-center">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded overflow-hidden border transition-all ${
                      selectedImage === index
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-8">
            {/* Title */}
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="text-4xl font-semibold text-gray-900 mt-2">
                {product.name}
              </h1>

              {/* Rating display */}
              {product.totalReviews && product.totalReviews > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <RatingStars rating={product.averageRating || 0} size="sm" readOnly />
                  <span className="text-sm text-gray-600">
                    {product.averageRating?.toFixed(1)} ({product.totalReviews} {product.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {product.description && (
                <p className="text-gray-600 font-light mt-3">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="border-t border-b border-gray-200 py-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">
                    {formatPrice(product.rentPrice)}
                  </span>
                  <span className="text-gray-600 font-light">/day</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Total Stock</p>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-900" />
                  <span className="text-gray-600 font-light">
                    {product.totalStock} units available
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Configuration */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              {/* Date Range Picker */}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                minDate={today}
              />

              {/* Quantity Selector */}
              <div>
                <p className="text-xs font-semibold text-gray-900 uppercase mb-3">Quantity</p>
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={() => setRentalQuantity(Math.max(1, rentalQuantity - 1))}
                    className="px-3 py-2 text-gray-900 hover:bg-gray-200 rounded transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={rentalQuantity}
                    onChange={(e) => setRentalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={availability?.availableStock || product.totalStock}
                    className="w-16 text-center text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded py-2 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  <button
                    onClick={() => {
                      const maxQty = availability?.availableStock || product.totalStock;
                      setRentalQuantity(Math.min(maxQty, rentalQuantity + 1));
                    }}
                    className="px-3 py-2 text-gray-900 hover:bg-gray-200 rounded transition-colors"
                  >
                    +
                  </button>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-600 font-light">Total Price</p>
                    <p className="text-xl font-medium text-gray-900">
                      {rentalDays > 0 ? formatPrice(totalPrice) : formatPrice(0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              {startDate && endDate && (
                <AvailabilityStatus
                  available={availability?.available ?? null}
                  message={availability?.message || ''}
                  availableStock={availability?.availableStock ?? null}
                  loading={checking}
                  error={error}
                />
              )}

              {/* Details */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-900 uppercase mb-4">Details</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-600 font-light">
                    <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    Premium quality designer piece
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 font-light">
                    <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    Clean & sanitized before delivery
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 font-light">
                    <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    Fast delivery & easy returns
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 font-light">
                    <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    24/7 customer support
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => {
                  setIsAddingToCart(true);
                  addToCart(product, rentalDays, rentalQuantity);
                  setTimeout(() => {
                    setIsAddingToCart(false);
                    navigate('/cart');
                  }, 500);
                }}
                disabled={isAddToCartDisabled}
                className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={
                  !startDate || !endDate
                    ? 'Please select rental dates'
                    : !availability?.available
                    ? 'Selected dates are not available'
                    : ''
                }
              >
                <ShoppingBag className="w-5 h-5" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={product.availableStock === 0}
                className="w-full px-6 py-3 border border-gray-900 text-gray-900 font-light rounded hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rent via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <ReviewsSection
            productId={product._id || product.id || ''}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;