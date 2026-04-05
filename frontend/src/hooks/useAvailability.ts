import { useState } from 'react';
import axios from 'axios';

interface AvailabilityResponse {
  available: boolean;
  availableStock: number;
  totalStock: number;
  bookedQuantity: number;
  message: string;
}

export const useAvailability = () => {
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async (
    productId: string,
    startDate: string,
    endDate: string,
    quantity: number = 1
  ): Promise<AvailabilityResponse | null> => {
    try {
      setChecking(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/bookings/check-availability/${productId}`,
        {
          startDate,
          endDate,
          quantity
        }
      );

      const data = response.data.data;
      setAvailability(data);
      return data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to check availability. Please try again.';
      setError(errorMessage);
      setAvailability(null);
      return null;
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setAvailability(null);
    setError(null);
  };

  return {
    checkAvailability,
    checking,
    availability,
    error,
    reset
  };
};
