import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import { Upload, ArrowLeft, Check, X, AlertCircle, Package } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

interface ProductForm {
  name: string;
  category: 'men' | 'women' | 'footwear';
  rentPrice: string;
  totalStock: string;
  availableStock: string;
  description: string;
  images: File[];
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category: 'men',
    rentPrice: '',
    totalStock: '',
    availableStock: '',
    description: '',
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Check admin access
  React.useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/products');
      }
    }
  }, [isAuthenticated, user?.role, authLoading, navigate]);

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
      images: [...prev.images, ...validFiles],
    }));

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    if (form.images.length === 0) {
      setError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('rentPrice', form.rentPrice);
      formData.append('totalStock', form.totalStock);
      formData.append('availableStock', form.availableStock);
      formData.append('description', form.description);

      form.images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create product');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating product');
      setLoading(false);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-light">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-light">Product created successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-light text-gray-900">Add New Product</h1>
            <p className="text-gray-600 font-light mt-2">Create a new rental item for your catalog</p>
          </div>

          {/* Basic Information Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Black Sherwani"
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light bg-white"
                >
                  <option value="men">Men's Clothing</option>
                  <option value="women">Women's Clothing</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>

              {/* Rent Price */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Rent Price Per Day (₹) *
                </label>
                <input
                  type="number"
                  name="rentPrice"
                  value={form.rentPrice}
                  onChange={handleInputChange}
                  placeholder="800"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light"
                  required
                />
              </div>

              {/* Total Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Total Stock *
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={form.totalStock}
                  onChange={handleInputChange}
                  placeholder="10"
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light"
                  required
                />
              </div>

              {/* Available Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Available Stock *
                </label>
                <input
                  type="number"
                  name="availableStock"
                  value={form.availableStock}
                  onChange={handleInputChange}
                  placeholder="5"
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Add product details, material, care instructions..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-200 transition-all font-light resize-none"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-700/30">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-light text-white">Product Images</h2>
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

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-light rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;
