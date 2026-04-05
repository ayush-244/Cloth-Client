import React from 'react';
import { AlertCircle, Check, AlertTriangle, Loader2 } from 'lucide-react';

interface AvailabilityStatusProps {
  available: boolean | null;
  message: string;
  availableStock: number | null;
  loading?: boolean;
  error?: string | null;
}

const AvailabilityStatus: React.FC<AvailabilityStatusProps> = ({
  available,
  message,
  availableStock,
  loading = false,
  error
}) => {
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="font-semibold text-blue-900">Checking availability...</p>
            <p className="text-sm text-blue-700 mt-1">Verifying product stock for selected dates</p>
          </div>
        </div>
      </div>
    );
  }

  if (available === null) {
    return null;
  }

  if (available) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">✓ Available</p>
            <p className="text-sm text-green-700 mt-1">{message}</p>
            {availableStock !== null && (
              <p className="text-xs text-green-600 mt-1">
                {availableStock} unit(s) available for these dates
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">⚠ Not Available</p>
          <p className="text-sm text-amber-700 mt-1">{message}</p>
          {availableStock === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Please select different dates or contact us for alternatives
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityStatus;
