import { useState, useCallback } from 'react';
import api from '../services/api';
import { Booking } from '../types';

interface UseBookingResult {
  bookings: Booking[];
  allBookings: Booking[];
  loading: boolean;
  error: string | null;
  getMyBookings: () => Promise<void>;
  getAllBookings: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<Booking | null>;
  submitReturn: (bookingId: string, condition: string, cleaning: boolean, repair: boolean) => Promise<any>;
}

export const useBooking = (): UseBookingResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/bookings/my');
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch bookings';
      setError(message);
      console.error('Booking fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/bookings/admin/all');
      if (response.data.success) {
        setAllBookings(response.data.data || []);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch all bookings';
      setError(message);
      console.error('All bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    try {
      setError(null);
      const response = await api.put(`/api/bookings/${bookingId}/status`, { status });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update booking status';
      setError(message);
      console.error('Status update error:', err);
    }
    return null;
  }, []);

  const submitReturn = useCallback(async (bookingId: string, condition: string, cleaning: boolean, repair: boolean) => {
    try {
      setError(null);
      const response = await api.put(`/api/bookings/${bookingId}/return`, {
        returnCondition: condition,
        cleaningRequired: cleaning,
        repairRequired: repair,
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to submit return';
      setError(message);
      console.error('Return submission error:', err);
    }
    return null;
  }, []);

  return {
    bookings,
    allBookings,
    loading,
    error,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    submitReturn,
  };
};
