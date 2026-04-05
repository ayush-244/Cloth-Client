import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { products, createProduct, deleteProduct, loading } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    category: 'men' as 'men' | 'women' | 'footwear',
    rentPrice: '',
    totalStock: '',
    availableStock: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/products');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Generate preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.rentPrice || parseFloat(formData.rentPrice) <= 0) {
      setError('Valid rent price is required');
      return;
    }

    if (!formData.totalStock || parseInt(formData.totalStock) <= 0) {
      setError('Valid total stock is required');
      return;
    }

    if (!formData.availableStock || parseInt(formData.availableStock) < 0) {
      setError('Valid available stock is required');
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    // Create FormData
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('category', formData.category);
    fd.append('rentPrice', formData.rentPrice);
    fd.append('totalStock', formData.totalStock);
    fd.append('availableStock', formData.availableStock);

    images.forEach((image) => {
      fd.append('images', image);
    });

    setIsSubmitting(true);
    const result = await createProduct(fd);

    if (result.success) {
      setSuccess('Product created successfully!');
      setFormData({
        name: '',
        category: 'men',
        rentPrice: '',
        totalStock: '',
        availableStock: '',
      });
      setImages([]);
      setPreviewUrls([]);
    } else {
      setError(result.error || 'Failed to create product');
    }

    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        setSuccess('Product deleted successfully!');
      } else {
        setError(result.error || 'Failed to delete product');
      }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Panel</h1>
          <p className="text-dark-600">Manage your product catalog</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                ➕ Add Product
              </h2>

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError(null)}
                  dismissible
                />
              )}

              {success && (
                <Alert
                  type="success"
                  message={success}
                  dismissible={false}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Dress"
                    className="input-field"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>

                {/* Rent Price */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Rent Price/Day (₹)
                  </label>
                  <input
                    type="number"
                    name="rentPrice"
                    value={formData.rentPrice}
                    onChange={handleInputChange}
                    placeholder="499"
                    step="0.01"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>

                {/* Total Stock */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    value={formData.totalStock}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="1"
                    className="input-field"
                    required
                  />
                </div>

                {/* Available Stock */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    name="availableStock"
                    value={formData.availableStock}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-2">
                    Images (Max 5)
                  </label>
                  <div className="glass rounded-lg p-4 border-2 border-dashed border-white/30 cursor-pointer hover:border-primary-400 transition-colors">
                    <label className="flex flex-col items-center cursor-pointer">
                      <span className="text-3xl mb-2">📸</span>
                      <span className="text-sm font-medium text-dark-900">
                        Click to upload images
                      </span>
                      <span className="text-xs text-dark-600 mt-1">
                        {images.length}/5 selected
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Previews */}
                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-2xl"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  Create Product
                </Button>
              </form>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-dark-900 mb-6">Products ({products.length})</h2>

              {loading ? (
                <LoadingSpinner text="Loading products..." />
              ) : products.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product._id || product.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between group hover:border-primary-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-dark-900 mb-1">{product.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-dark-600">
                          <div>
                            <span className="text-xs opacity-75">Category:</span> {product.category}
                          </div>
                          <div>
                            <span className="text-xs opacity-75">Price:</span> ₹{product.rentPricePerDay}
                            /day
                          </div>
                          <div>
                            <span className="text-xs opacity-75">Total:</span> {product.totalStock}
                          </div>
                          <div>
                            <span className="text-xs opacity-75">Available:</span>{' '}
                            {product.availableStock}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(product._id || product.id || '')}
                        className="p-2 rounded-lg bg-red-100/20 text-red-500 hover:bg-red-100/40 transition-colors opacity-0 group-hover:opacity-100 text-lg"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4 opacity-50">📦</div>
                  <p className="text-dark-600">No products yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProduct;
