import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Upload, ArrowLeft, Check, X, AlertCircle, Trash2, Package } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  category: 'men' | 'women' | 'footwear';
  rentPrice: number;
  totalStock: number;
  availableStock: number;
  description: string;
  images: string[];
}

interface ProductForm {
  name: string;
  category: 'men' | 'women' | 'footwear';
  rentPrice: string;
  totalStock: string;
  availableStock: string;
  description: string;
  newImages: File[];
}

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category: 'men',
    rentPrice: '',
    totalStock: '',
    availableStock: '',
    description: '',
    newImages: [],
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/products');
      }
    }
  }, [isAuthenticated, user?.role, authLoading, navigate]);

  // Fetch product data
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch product');
        }

        const data = await response.json();
        console.log('📦 Product fetched:', data);
        
        // Handle both response formats
        const productData = data.product || data.data || data;
        
        if (!productData) {
          throw new Error('Product data not found in response');
        }

        setProduct(productData);
        setExistingImages(productData.images || []);
        setForm({
          name: productData.name,
          category: productData.category,
          rentPrice: productData.rentPrice.toString(),
          totalStock: productData.totalStock.toString(),
          availableStock: productData.availableStock.toString(),
          description: productData.description || '',
          newImages: [],
        });
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Error loading product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return false;
      }
      return true;
    });

    setForm(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...validFiles],
    }));

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  const removeNewImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!form.rentPrice || parseFloat(form.rentPrice) <= 0) {
      setError('Rent price must be greater than 0');
      return false;
    }
    if (!form.totalStock || parseInt(form.totalStock) <= 0) {
      setError('Total stock must be greater than 0');
      return false;
    }
    if (!form.availableStock || parseInt(form.availableStock) < 0) {
      setError('Available stock cannot be negative');
      return false;
    }
    if (parseInt(form.availableStock) > parseInt(form.totalStock)) {
      setError('Available stock cannot exceed total stock');
      return false;
    }
    if (existingImages.length === 0 && form.newImages.length === 0) {
      setError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('rentPrice', form.rentPrice);
      formData.append('totalStock', form.totalStock);
      formData.append('availableStock', form.availableStock);
      formData.append('description', form.description);
      formData.append('existingImages', JSON.stringify(existingImages));

      form.newImages.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating product');
      setSaving(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-light">Product not found</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors font-light"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-light mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-light text-white font-serif">Edit Product</h1>
            <p className="text-slate-400 font-light mt-2">{product?.name}</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-light">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 font-light">Product updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-700/30">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-light text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light"
                >
                  <option value="men">Men's Clothing</option>
                  <option value="women">Women's Clothing</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>

              {/* Rent Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Rent Price Per Day (₹) *
                </label>
                <input
                  type="number"
                  name="rentPrice"
                  value={form.rentPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light"
                  required
                />
              </div>

              {/* Total Stock */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Total Stock *
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={form.totalStock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light"
                  required
                />
              </div>

              {/* Available Stock */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Available Stock *
                </label>
                <input
                  type="number"
                  name="availableStock"
                  value={form.availableStock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-light resize-none"
                />
              </div>
            </div>
          </div>

          {/* Existing Images Section */}
          {existingImages.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-700/30">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <Package className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-light text-white">Current Images</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50"
                  >
                    <img
                      src={imageUrl}
                      alt={`Current ${index + 1}`}
                      className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </button>
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add More Images Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-700/30">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-light text-white">Add More Images</h2>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600/50 bg-slate-700/20 hover:border-slate-600'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <p className="text-white font-light text-lg mb-1">
                  Drag images here or click to browse
                </p>
                <p className="text-slate-400 font-light text-sm">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </label>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50 ring-2 ring-cyan-500/50"
                  >
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 font-light rounded-lg hover:bg-slate-700/50 hover:text-cyan-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-light rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
