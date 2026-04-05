import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import { RefreshCw, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import OrderTimeline from '../components/ui/OrderTimeline';
import ReturnChecklist from '../components/ui/ReturnChecklist';
import { formatPrice } from '../utils/helpers';

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  productId: {
    _id: string;
    name: string;
    rentPrice: number;
    images: string[];
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  deposit: number;
  status: 'booked' | 'confirmed' | 'outForDelivery' | 'inUse' | 'returned';
  returnCondition?: string;
  damageFee: number;
  cleaningFee: number;
  createdAt: string;
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/login');
      }
    }
  }, [isAuthenticated, user?.role, authLoading, navigate]);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/booking/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'admin') {
      fetchBookings();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, isAuthenticated, user?.role]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/booking/${bookingId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleReturnSubmit = async (data: any) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/booking/${selectedBooking._id}/return`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setShowReturnForm(false);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err) {
      throw err;
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      booked: 'bg-blue-50 text-blue-700 border-blue-200',
      confirmed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      outForDelivery: 'bg-purple-50 text-purple-700 border-purple-200',
      inUse: 'bg-green-50 text-green-700 border-green-200',
      returned: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading orders...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-light text-gray-900">Orders</h1>
              <p className="text-gray-600 font-light mt-1">{filteredBookings.length} rental orders</p>
            </div>
            <button
              onClick={() => fetchBookings()}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-2">
          {['all', 'booked', 'confirmed', 'outForDelivery', 'inUse', 'returned'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-light transition-all ${
                filterStatus === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-light">No orders found</p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-4 gap-6 mb-4">
                  {/* Product Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                      Product
                    </p>
                    <p className="text-gray-900 font-medium">{booking.productId.name}</p>
                    <p className="text-sm text-gray-600 font-light">
                      {formatPrice(booking.productId.rentPrice)}/day
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                      Customer
                    </p>
                    <p className="text-gray-900 font-medium">{booking.userId.name}</p>
                    <p className="text-sm text-gray-600 font-light">{booking.userId.email}</p>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                      Rental Period
                    </p>
                    <p className="text-gray-900 font-medium text-sm">
                      {new Date(booking.startDate).toLocaleDateString()} to{' '}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 font-light">
                      Total: {formatPrice(booking.totalAmount)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                      Status
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-light border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-light text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {booking.status !== 'returned' && (
                    <>
                      {booking.status !== 'inUse' && (
                        <button
                          onClick={() => {
                            const nextStatus: { [key: string]: string } = {
                              booked: 'confirmed',
                              confirmed: 'outForDelivery',
                              outForDelivery: 'inUse'
                            };
                            handleStatusUpdate(booking._id, nextStatus[booking.status] || booking.status);
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-light rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Next Step
                        </button>
                      )}

                      {booking.status === 'inUse' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReturnForm(true);
                          }}
                          className="px-4 py-2 bg-green-100 text-green-700 text-sm font-light rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Mark as Returned
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && !showReturnForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-light text-gray-900">
                {selectedBooking.productId.name}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Progress</h3>
              <OrderTimeline status={selectedBooking.status} layout="vertical" />
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                  Customer
                </p>
                <p className="text-gray-900 font-medium mb-1">{selectedBooking.userId.name}</p>
                <p className="text-sm text-gray-600 font-light">{selectedBooking.userId.email}</p>
                {selectedBooking.userId.phone && (
                  <p className="text-sm text-gray-600 font-light">{selectedBooking.userId.phone}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                  Amount
                </p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {formatPrice(selectedBooking.totalAmount)}
                </p>
                <p className="text-sm text-gray-600 font-light">
                  Deposit: {formatPrice(selectedBooking.deposit)}
                </p>
              </div>
            </div>

            {/* Fees if returned */}
            {selectedBooking.status === 'returned' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Return Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Condition:</span>
                    <span className="text-gray-900 font-medium capitalize">
                      {selectedBooking.returnCondition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Damage Fee:</span>
                    <span className="text-gray-900">₹{selectedBooking.damageFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Cleaning Fee:</span>
                    <span className="text-gray-900">₹{selectedBooking.cleaningFee}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Return Form Modal */}
      {selectedBooking && showReturnForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
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
    </AdminLayout>
  );
};

export default AdminOrders;
