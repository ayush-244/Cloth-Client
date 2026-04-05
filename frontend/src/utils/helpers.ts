export const generateWhatsAppLink = (productName: string, phoneNumber: string = '919876543210'): string => {
  const message = `I want to rent ${encodeURIComponent(productName)}. Please let me know the details and availability.`;
  return `https://wa.me/${phoneNumber}?text=${message}`;
};

export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(price));
};

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    men: 'from-blue-500 to-blue-600',
    women: 'from-pink-500 to-pink-600',
    footwear: 'from-amber-500 to-amber-600',
  };
  return colors[category?.toLowerCase()] || 'from-primary-500 to-primary-600';
};

export const getCategoryBadgeColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    men: 'bg-blue-100 text-blue-700',
    women: 'bg-pink-100 text-pink-700',
    footwear: 'bg-amber-100 text-amber-700',
  };
  return colors[category?.toLowerCase()] || 'bg-primary-100 text-primary-700';
};
