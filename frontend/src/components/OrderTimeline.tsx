import React from 'react';
import { Check, Clock } from 'lucide-react';

export type OrderStatus = 'booked' | 'confirmed' | 'packed' | 'outForDelivery' | 'inUse' | 'returnPending' | 'returned' | 'completed';

interface TimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  startDate: string;
  endDate: string;
  compact?: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'booked', label: 'Booked', description: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed', description: 'Payment verified' },
  { key: 'packed', label: 'Packed', description: 'Getting ready' },
  { key: 'outForDelivery', label: 'Out for Delivery', description: 'On the way' },
  { key: 'inUse', label: 'In Use', description: 'Rental period' },
  { key: 'returnPending', label: 'Return Pending', description: 'Awaiting return' },
  { key: 'returned', label: 'Returned', description: 'Item received' },
  { key: 'completed', label: 'Completed', description: 'Order complete' },
];

const STATUS_ORDER: OrderStatus[] = ['booked', 'confirmed', 'packed', 'outForDelivery', 'inUse', 'returnPending', 'returned', 'completed'];

const getStatusIndex = (status: OrderStatus): number => {
  return STATUS_ORDER.indexOf(status);
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, startDate, endDate, compact = false }) => {
  const currentIndex = getStatusIndex(currentStatus);
  const steps = compact ? TIMELINE_STEPS.slice(0, 5) : TIMELINE_STEPS;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (compact) {
    // Vertical timeline for mobile/cards
    return (
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gray-900 text-white'
                      : isActive
                      ? 'bg-gray-900 text-white ring-4 ring-gray-900/10'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-1 h-8 mt-2 transition-all duration-300 ${
                      isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Timeline content */}
              <div className="pb-4">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-600 font-light mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal timeline for desktop
  return (
    <div className="relative">
      {/* Background line */}
      <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-gray-900 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Dot */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-md ${
                  isCompleted
                    ? 'bg-gray-900 text-white'
                    : isActive
                    ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-600 font-light mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date info below */}
      <div className="mt-8 grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div>
          <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-1">
            Rental Start
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(startDate)}
          </p>
        </div>
        <div>
          <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-1">
            Return Date
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
