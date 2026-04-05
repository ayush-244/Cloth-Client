import { useState, useCallback, useEffect } from 'react';
import { CartItem, Product, Cart } from '../types';

const CART_STORAGE_KEY = 'cloth_rental_cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = useCallback((updatedCart: Cart) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    setCart(updatedCart);
  }, []);

  // Add item to cart
  const addToCart = useCallback((product: Product, rentalDays: number = 1, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(
        item => item.productId === (product._id || product.id)
      );

      let updatedItems: CartItem[];

      if (existingItem) {
        // Update existing item
        updatedItems = prevCart.items.map(item =>
          item.productId === (product._id || product.id)
            ? {
                ...item,
                rentalDays,
                quantity,
                totalPrice: product.rentPrice * rentalDays * quantity,
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product._id || product.id || '',
          product,
          rentalDays,
          quantity,
          pricePerDay: product.rentPrice,
          totalPrice: product.rentPrice * rentalDays * quantity,
          addedAt: new Date().toISOString(),
        };
        updatedItems = [...prevCart.items, newItem];
      }

      const updatedCart = calculateCartTotals(updatedItems);
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  // Remove item from cart
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(
        item => item.productId !== productId
      );
      const updatedCart = calculateCartTotals(updatedItems);
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  // Update rental days
  const updateRentalDays = useCallback((productId: string, rentalDays: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.productId === productId
          ? {
              ...item,
              rentalDays,
              totalPrice: item.pricePerDay * rentalDays,
            }
          : item
      );
      const updatedCart = calculateCartTotals(updatedItems);
      saveCart(updatedCart);
      return updatedCart;
    });
  }, [saveCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    const emptyCart: Cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
    saveCart(emptyCart);
  }, [saveCart]);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateRentalDays,
    clearCart,
  };
};

// Helper function to calculate totals
function calculateCartTotals(items: CartItem[]): Cart {
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return {
    items,
    totalItems: items.length,
    totalPrice,
  };
}
