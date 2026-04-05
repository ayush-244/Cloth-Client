import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';

interface Product {
  _id: string;
  name: string;
  category: string;
  rentPrice: number;
  totalStock: number;
  availableStock: number;
  images: string[];
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  activeRentals: number;
  lowStock: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    activeRentals: 0,
    lowStock: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'nameAZ' | 'price'>('newest');

  // Check admin access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'admin') {
        navigate('/products');
      } else {
        fetchProducts();
      }
    }
  }, [isAuthenticated, user?.role, authLoading, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productList = Array.isArray(data.data) ? data.data : [];
      
      setProducts(productList);
      calculateStats(productList);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productList: Product[]) => {
    const totalProducts = productList.length;
    const totalValue = productList.reduce((sum, p) => sum + (p.rentPrice * p.totalStock), 0);
    const activeRentals = productList.reduce((sum, p) => sum + (p.totalStock - p.availableStock), 0);
    const lowStock = productList.filter(p => p.availableStock < 3).length;

    setStats({
      totalProducts,
      totalValue,
      activeRentals,
      lowStock,
    });
  };

  // Handle search and filter
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Apply sorting
    if (sortBy === 'nameAZ') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => b.rentPrice - a.rentPrice);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products, sortBy]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setDeleteConfirm(null);
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error deleting product');
    }
  };

  const getStockStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return { color: 'red', label: 'Out of Stock', icon: AlertCircle };
    if (percentage < 30) return { color: 'orange', label: 'Low Stock', icon: AlertTriangle };
    return { color: 'green', label: 'In Stock', icon: CheckCircle };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-light">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900 font-serif">
              Product Management
            </h1>
            <p className="text-gray-600 font-light mt-1">
              Manage your rental inventory
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/add-product')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-light">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-500 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600 font-light uppercase tracking-wide">
                Total Products
              </h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-semibold text-gray-900">
              {stats.totalProducts}
            </p>
            <p className="text-xs text-gray-600 font-light mt-3">
              Items in catalog
            </p>
          </div>

          {/* Total Value */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600 font-light uppercase tracking-wide">
                Total Value
              </h3>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-semibold text-gray-900">
              {formatPrice(stats.totalValue).split('.')[0]}
            </p>
            <p className="text-xs text-gray-600 font-light mt-3">
              Inventory worth
            </p>
          </div>

          {/* Active Rentals */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600 font-light uppercase tracking-wide">
                Active Rentals
              </h3>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-4xl font-semibold text-gray-900">
              {stats.activeRentals}
            </p>
            <p className="text-xs text-gray-600 font-light mt-3">
              Items currently rented
            </p>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600 font-light uppercase tracking-wide">
                Low Stock
              </h3>
              <div className={`p-2 rounded-lg ${stats.lowStock > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.lowStock > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <p className="text-4xl font-semibold text-gray-900">
              {stats.lowStock}
            </p>
            <p className="text-xs text-gray-600 font-light mt-3">
              Products need restocking
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Search & Filter Bar */}
          <div className="border-b border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-80 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-light"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-light bg-white"
              >
                <option value="all">All Categories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="footwear">Footwear</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-light bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="nameAZ">Name A-Z</option>
                <option value="price">Price (High to Low)</option>
              </select>
            </div>

            <p className="text-sm text-gray-600 font-light">
              Showing <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products
            </p>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mb-4" />
                <p className="text-gray-600 font-light">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-light text-lg mb-2">No products found</p>
                <p className="text-gray-500 font-light text-sm mb-6">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search filters' 
                    : 'Get started by adding your first product'}
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <button
                    onClick={() => navigate('/admin/add-product')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Product
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Rent Price
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Stock
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.availableStock, product.totalStock);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              <img
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=100&h=100&fit=crop'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 font-light">
                                ID: {product._id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 font-light capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.rentPrice)}/day
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {product.availableStock}/{product.totalStock}
                            </p>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  product.availableStock === 0 ? 'bg-red-500' :
                                  product.availableStock < 3 ? 'bg-orange-500' :
                                  'bg-green-500'
                                }`}
                                style={{
                                  width: `${(product.availableStock / product.totalStock) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" style={{color: stockStatus.color === 'red' ? '#dc2626' : stockStatus.color === 'orange' ? '#f97316' : '#16a34a'}} />
                            <span className="text-xs font-medium" style={{color: stockStatus.color === 'red' ? '#991b1b' : stockStatus.color === 'orange' ? '#9a3412' : '#166534'}}>
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/product/${product._id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View product"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Product
                </h3>
                <p className="text-sm text-gray-600 font-light mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteProduct(deleteConfirm);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-light rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
