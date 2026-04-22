import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { OrderTimeline, ReturnChecklist } from '../components/index';
import { LogOut, Settings, Package, History, User as UserIcon, AlertCircle } from 'lucide-react';
import { Booking } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { bookings, loading: bookingsLoading, error, getMyBookings } = useBooking();
  const [tab, setTab] = useState<'active' | 'history' | 'profile'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch bookings
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      getMyBookings();
    }
  }, [authLoading, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReturnSubmit = async (data: any) => {
    if (!selectedBooking) return;
    try {
      // Submit return here - the hook will handle the API call
      setShowReturnForm(false);
      setSelectedBooking(null);
      await getMyBookings();
    } catch (err) {
      console.error('Failed to submit return:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      booked: 'bg-blue-50 text-blue-700 border-blue-200',
      confirmed: 'bg-green-50 text-green-700 border-green-200',
      packed: 'bg-purple-50 text-purple-700 border-purple-200',
      outForDelivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      inUse: 'bg-orange-50 text-orange-700 border-orange-200',
      returnPending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      returned: 'bg-gray-50 text-gray-700 border-gray-200',
      completed: 'bg-teal-50 text-teal-700 border-teal-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const activeBookings = bookings.filter(b =>
    ['booked', 'confirmed', 'packed', 'outForDelivery', 'inUse', 'returnPending'].includes(b.status)
  );
  const pastBookings = bookings.filter(b =>
    ['returned', 'completed'].includes(b.status)
  );

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
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-sm font-light text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {bookingsLoading ? (
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
                  <div className="space-y-8">
                    {activeBookings.map(booking => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                      >
                        {/* Booking Header */}
                        <div className="bg-gray-50 border-b border-gray-200 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {booking.productId?.name || 'Product'}
                              </h3>
                              <p className="text-sm font-light text-gray-600">
                                Order #{booking._id?.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-light border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="p-6 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Rental Progress</h4>
                          <OrderTimeline
                            currentStatus={booking.status}
                            startDate={booking.startDate}
                            endDate={booking.endDate}
                          />
                        </div>

                        {/* Booking Details */}
                        <div className="p-6 grid md:grid-cols-3 gap-6 border-b border-gray-200">
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Rental Period
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(booking.startDate).toLocaleDateString()} to{' '}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Size
                            </p>
                            <p className="text-sm font-medium text-gray-900">{booking.size || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Total Amount
                            </p>
                            <p className="text-lg font-medium text-gray-900">
                              ₹{booking.totalAmount?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 flex gap-3">
                          {booking.status === 'returnPending' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowReturnForm(true);
                              }}
                              className="flex-1 px-6 py-3 bg-blue-100 text-blue-700 font-light rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Submit Return
                            </button>
                          )}
                          {booking.status === 'inUse' && (
                            <p className="text-sm text-gray-600 font-light italic">
                              Enjoy your rental! You'll receive instructions for return once the rental period ends.
                            </p>
                          )}
                          {!['returnPending', 'inUse'].includes(booking.status) && (
                            <p className="text-sm text-gray-600 font-light italic">
                              Status: {booking.status}
                            </p>
                          )}
                        </div>
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

                {bookingsLoading ? (
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
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="grid md:grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Product
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.productId?.name || 'Product'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Rental Period
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(booking.startDate).toLocaleDateString()} -{' '}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-light uppercase tracking-widest mb-1">
                              Total Paid
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              ₹{booking.totalAmount?.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-light border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <button
                              onClick={() => navigate('/products')}
                              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-light transition-colors"
                            >
                              Rent Again
                            </button>
                          </div>
                        </div>
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

      {/* Return Form Modal */}
      {selectedBooking && showReturnForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-serif font-light text-gray-900 mb-6">Submit Return</h2>
            <ReturnChecklist
              bookingId={selectedBooking._id}
              onSubmit={handleReturnSubmit}
            />
            <button
              onClick={() => {
                setShowReturnForm(false);
                setSelectedBooking(null);
              }}
              className="w-full mt-4 px-6 py-2 border border-gray-300 text-gray-700 font-light rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
