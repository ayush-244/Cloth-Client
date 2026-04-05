import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onWhatsAppClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=400&h=400&fit=crop';

  // Auto-reset added state after 2 seconds
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  const handleClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding || isAdded) return;
    
    setIsAdding(true);
    addToCart(product, 1);
    
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
    }, 600);
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer flex flex-col items-center text-center"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden mb-4 w-full">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="space-y-1 flex-1 flex flex-col justify-between w-full">
        {/* Product Name */}
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2 group-hover:underline transition-all">
          {product.name}
        </h3>

        {/* Brand/Subtitle */}
        <p className="text-sm text-gray-500 font-light">
          {product.category || 'Premium Fashion'}
        </p>

        {/* Price */}
        <p className="text-sm text-gray-600 font-light mb-4">
          {formatPrice(product.rentPrice)}/day
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isAdded || product.availableStock === 0}
          className={`w-full mt-auto px-4 py-2 font-light text-sm rounded transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded
              ? 'bg-green-50 border border-green-600 text-green-600'
              : 'border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
          } ${
            (isAdding || product.availableStock === 0) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              {isAdding ? 'Adding...' : product.availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
