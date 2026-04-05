import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings, Package, History, User as UserIcon } from 'lucide-react';

interface UserBooking {
  _id: string;
  productName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalPrice: number;
  status: 'confirmed' | 'shipped' | 'returned' | 'cancelled';
  productImage: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState<'active' | 'history' | 'profile'>('active');
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch bookings
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [authLoading, isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/booking/my-bookings`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Mock data for demo
      setBookings([
        {
          _id: '1',
          productName: 'Black Sherwani',
          rentalStartDate: new Date().toISOString().split('T')[0],
          rentalEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          totalPrice: 2500,
          status: 'confirmed',
          productImage:
            'https://images.unsplash.com/photo-1595777707802-78f82b10b6ca?w=200&h=200&fit=crop',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      confirmed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
      returned: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'shipped');
  const pastBookings = bookings.filter(b => b.status === 'returned' || b.status === 'cancelled');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 font-serif mb-2">
              My Account
            </h1>
            <p className="text-gray-600 font-light">
              Welcome back, {user?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              <button
                onClick={() => setTab('active')}
                className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-light ${
                  tab === 'active'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                Active Rentals
              </button>
              <button
                onClick={() => setTab('history')}
                className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-light ${
                  tab === 'history'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <History className="w-5 h-5" />
                Rental History
              </button>
              <button
                onClick={() => setTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-light ${
                  tab === 'profile'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                Profile Settings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {/* Active Rentals Tab */}
            {tab === 'active' && (
              <div>
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Active Rentals
                </h2>

                {error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-light">{error}</p>
                  </div>
                )}

                {loading ? (
                  <p className="text-gray-600 font-light">Loading rentals...</p>
                ) : activeBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-light mb-6">
                      No active rentals at the moment
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300"
                    >
                      Browse Items
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBookings.map(booking => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-lg p-6 flex gap-6"
                      >
                        <img
                          src={booking.productImage}
                          alt={booking.productName}
                          className="w-32 h-32 object-contain bg-gray-50 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {booking.productName}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 font-light mb-4">
                            <p>
                              📅 From {new Date(booking.rentalStartDate).toLocaleDateString()}
                            </p>
                            <p>
                              📅 To {new Date(booking.rentalEndDate).toLocaleDateString()}
                            </p>
                            <p>💰 ₹{booking.totalPrice}</p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-light border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300 self-center">
                          Track Order
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rental History Tab */}
            {tab === 'history' && (
              <div>
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Rental History
                </h2>

                {loading ? (
                  <p className="text-gray-600 font-light">Loading history...</p>
                ) : pastBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-light">
                      No rental history yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map(booking => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-lg p-6 flex gap-6"
                      >
                        <img
                          src={booking.productImage}
                          alt={booking.productName}
                          className="w-32 h-32 object-contain bg-gray-50 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {booking.productName}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 font-light mb-4">
                            <p>
                              Rented from {new Date(booking.rentalStartDate).toLocaleDateString()} to{' '}
                              {new Date(booking.rentalEndDate).toLocaleDateString()}
                            </p>
                            <p>Total paid: ₹{booking.totalPrice}</p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-light border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-50 transition-all duration-300 self-center">
                          Rent Again
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Settings Tab */}
            {tab === 'profile' && (
              <div>
                <h2 className="text-2xl font-light text-gray-900 font-serif mb-8">
                  Profile Settings
                </h2>

                <div className="space-y-6 max-w-lg">
                  {/* Profile Info */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 font-light mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-light text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 font-light mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-light text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 font-light mb-2">
                          Account Role
                        </label>
                        <input
                          type="text"
                          value={user?.role || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-light text-gray-600 capitalize"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Security
                    </h3>
                    <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-medium text-red-900 mb-4">
                      Danger Zone
                    </h3>
                    <button className="px-6 py-3 border border-red-900 text-red-900 font-light rounded-lg hover:bg-red-900 hover:text-white transition-all duration-300">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
