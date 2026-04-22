import React, { useEffect, useState } from 'react';
import { useBooking } from '../hooks/useBooking';
import AdminLayout from '../components/layout/AdminLayout';
import { OrderTimeline } from '../components/index';
import ReturnChecklist from '../components/ReturnChecklist';
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface BookingWithDetails {
  _id: string;
  userId: any;
  productId: any;
  startDate: string;
  endDate: string;
  totalAmount?: number;
  deposit?: number;
  status: string;
  size?: string;
  quantity?: number;
  returnCondition?: string;
  damageFee?: number;
  cleaningFee?: number;
  createdAt?: string;
  [key: string]: any;
}

const AdminOrders: React.FC = () => {
  const { allBookings, loading, error, getAllBookings, updateBookingStatus } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'booked', label: 'Booked' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'packed', label: 'Packed' },
    { value: 'outForDelivery', label: 'Out for Delivery' },
    { value: 'inUse', label: 'In Use' },
    { value: 'returnPending', label: 'Return Pending' },
    { value: 'returned', label: 'Returned' },
    { value: 'completed', label: 'Completed' },
  ];

  useEffect(() => {
    getAllBookings();
  }, []);

  useEffect(() => {
    let filtered: BookingWithDetails[] = (allBookings as any[]).map(b => ({
      _id: b._id || '',
      userId: b.userId || {},
      productId: b.productId || {},
      startDate: b.startDate || '',
      endDate: b.endDate || '',
      totalAmount: b.totalAmount || 0,
      deposit: b.deposit || 0,
      status: b.status || 'booked',
      size: b.size || '',
      quantity: b.quantity || 1,
      returnCondition: b.returnCondition,
      damageFee: b.damageFee || 0,
      cleaningFee: b.cleaningFee || 0,
      createdAt: b.createdAt,
      ...b,
    }));

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => {
        const bookingId = (booking._id || '').toLowerCase();
        const productName = (booking.productId?.name || '').toLowerCase();
        const userEmail = (booking.userId?.email || '').toLowerCase();
        return (
          bookingId.includes(query) ||
          productName.includes(query) ||
          userEmail.includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      } else {
        return ((b.totalAmount || 0) - (a.totalAmount || 0));
      }
    });

    setFilteredBookings(filtered);
  }, [allBookings, searchQuery, statusFilter, sortBy]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'outForDelivery':
      case 'packed':
        return <Truck className="w-4 h-4" />;
      case 'booked':
      case 'inUse':
      case 'returnPending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (bookingId: string | undefined, newStatus: string) => {
    if (!bookingId) return;
    setUpdatingStatus(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      await getAllBookings(); // Refresh data
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReturnSubmit = async (data: any) => {
    if (!selectedBooking?._id) return;
    try {
      await updateBookingStatus(selectedBooking._id, 'returnPending');
      setShowReturnForm(false);
      setSelectedBooking(null);
      await getAllBookings();
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllBookings();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 font-light">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-gray-900">Orders</h1>
            <p className="text-gray-600 font-light mt-1">{filteredBookings.length} rental orders</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 border border-gray-900 text-gray-900 font-light rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error Loading Orders</p>
              <p className="text-sm font-light text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, product, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all duration-200 font-light"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all duration-200 font-light"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all duration-200 font-light"
              >
                <option value="date">Newest First</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-light mb-2">No orders found</p>
            <p className="text-sm text-gray-500 font-light">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Row Content */}
                <div className="p-6 grid md:grid-cols-5 gap-4 items-center">
                  {/* Order ID */}
                  <div>
                    <p className="text-xs text-gray-600 font-light uppercase tracking-widest">ID</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  {/* Product */}
                  <div>
                    <p className="text-xs text-gray-600 font-light uppercase tracking-widest">Product</p>
                    <p className="text-sm font-light text-gray-900 truncate">
                      {booking.productId?.name || 'Unknown Product'}
                    </p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-xs text-gray-600 font-light uppercase tracking-widest">Customer</p>
                    <p className="text-sm font-light text-gray-900 truncate">
                      {booking.userId?.email || 'Unknown'}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs text-gray-600 font-light uppercase tracking-widest">Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{booking.totalAmount?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-light ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-3xl font-light text-gray-900 mb-1">{(allBookings as any[]).length}</p>
            <p className="text-sm font-light text-gray-600">Total Orders</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-3xl font-light text-green-600 mb-1">
              {(allBookings as any[]).filter((b: any) => b.status === 'confirmed').length}
            </p>
            <p className="text-sm font-light text-gray-600">Confirmed</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-3xl font-light text-orange-600 mb-1">
              {(allBookings as any[]).filter((b: any) => b.status === 'inUse').length}
            </p>
            <p className="text-sm font-light text-gray-600">In Use</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-3xl font-light text-gray-900 mb-1">
              ₹{(allBookings as any[])
                .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
                .toLocaleString('en-IN')}
            </p>
            <p className="text-sm font-light text-gray-600">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && !showReturnForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-light text-gray-900">
                {selectedBooking.productId?.name}
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
              <OrderTimeline
                currentStatus={selectedBooking.status as any}
                startDate={selectedBooking.startDate}
                endDate={selectedBooking.endDate}
              />
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                  Customer
                </p>
                <p className="text-gray-900 font-medium mb-1">{selectedBooking.userId?.name}</p>
                <p className="text-sm text-gray-600 font-light">{selectedBooking.userId?.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                  Amount
                </p>
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  ₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600 font-light">
                  Deposit: ₹{selectedBooking.deposit?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-light">Start Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedBooking.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">End Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedBooking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Size</p>
                  <p className="text-gray-900 font-medium">{selectedBooking.size}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Quantity</p>
                  <p className="text-gray-900 font-medium">{selectedBooking.quantity}</p>
                </div>
              </div>
            </div>

            {/* Fees if returned */}
            {['returnPending', 'returned', 'completed'].includes(selectedBooking.status) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Return Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Condition:</span>
                    <span className="text-gray-900 font-medium capitalize">
                      {selectedBooking.returnCondition || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Damage Fee:</span>
                    <span className="text-red-600 font-medium">
                      ₹{(selectedBooking.damageFee || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Cleaning Fee:</span>
                    <span className="text-red-600 font-medium">
                      ₹{(selectedBooking.cleaningFee || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Update Buttons */}
            <div className="flex gap-2 flex-wrap mb-4">
              {statuses
                .filter(s => s.value !== 'all')
                .map(status => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(selectedBooking._id, status.value)}
                    disabled={updatingStatus === selectedBooking._id}
                    className={`px-4 py-2 rounded-lg text-sm font-light border transition-all ${
                      selectedBooking.status === status.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status.label}
                  </button>
                ))}
            </div>

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
    </AdminLayout>
  );
};

export default AdminOrders;
