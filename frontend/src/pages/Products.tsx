import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { Package } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, error, fetchProducts } = useProducts();
  const [showLoading, setShowLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'men' | 'women' | 'footwear'>('all');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    // Wait for auth to load
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!authLoading) {
      setShowLoading(false);
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Read category from URL query params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && ['men', 'women', 'footwear'].includes(categoryParam)) {
      setSelectedCategory(categoryParam as 'men' | 'women' | 'footwear');
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  // Filter products when category changes or products load
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  // Show loading while auth is being checked
  if (authLoading || showLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6 animate-pulse">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-light">Loading collection...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[50vh] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden flex items-center justify-center">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Overlay Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-7xl font-light text-white mb-6 font-serif leading-tight">
            Premium Fashion Rentals
          </h1>
          <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto">
            Discover luxury designer pieces curated for every occasion. Rent premium fashion at affordable prices.
          </p>
        </div>
      </div>

      {/* Welcome Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-600 font-light">
            Welcome back, <span className="text-gray-900 font-semibold">{user?.name}</span> • Browse our curated collections below
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Category Filter Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-serif font-light text-gray-900">
                {selectedCategory === 'all'
                  ? 'Curated Collections'
                  : selectedCategory === 'men'
                  ? "Men's Fashion"
                  : selectedCategory === 'women'
                  ? "Women's Fashion"
                  : 'Footwear Collection'}
              </h2>
              <p className="text-sm text-gray-600 font-light mt-2">
                {filteredProducts.length} items available
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all' as const, label: 'All Collections', icon: '✨' },
              { value: 'women' as const, label: "Women's Fashion", icon: '👗' },
              { value: 'men' as const, label: "Men's Fashion", icon: '🎩' },
              { value: 'footwear' as const, label: 'Footwear', icon: '👠' },
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  if (category.value === 'all') {
                    navigate('/products');
                  } else {
                    navigate(`/products?category=${category.value}`);
                  }
                }}
                className={`group px-6 py-3 rounded-full font-light text-sm uppercase tracking-widest transition-all duration-300 ${
                  selectedCategory === category.value
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-900 hover:shadow-md'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 font-light mb-4">
              {error}
            </p>
            <button
              onClick={fetchProducts}
              className="px-6 py-3 border border-gray-900 text-gray-900 hover:bg-black hover:text-white transition duration-300 font-light text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-light text-lg">
              No products available in this category.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
            {productsLoading
              ? // Loading skeleton cards
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : // Actual products
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                  />
                ))}
          </div>
        )}

        {/* Results Summary */}
        {!productsLoading && filteredProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
            <p className="text-gray-600 font-light text-sm">
              Showing <span className="text-gray-900 font-semibold">{filteredProducts.length}</span> of <span className="text-gray-900 font-semibold">{products.length}</span> items
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors"
            >
              View all items →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
