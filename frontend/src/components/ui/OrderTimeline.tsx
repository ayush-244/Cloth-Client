import React from 'react';
import { Check } from 'lucide-react';

interface OrderTimelineProps {
  status: 'booked' | 'confirmed' | 'outForDelivery' | 'inUse' | 'returned';
  layout?: 'horizontal' | 'vertical';
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, layout = 'horizontal' }) => {
  const steps = [
    { key: 'booked', label: 'Booked', icon: '📦' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'outForDelivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'inUse', label: 'In Use', icon: '👔' },
    { key: 'returned', label: 'Returned', icon: '↩️' }
  ];

  const statusIndex = steps.findIndex(s => s.key === status);

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto py-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${index <= statusIndex
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {index < statusIndex ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <p className="text-xs text-gray-700 font-light mt-2 whitespace-nowrap text-center">
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-1 flex-1 min-w-[20px] transition-all duration-300
                  ${index < statusIndex ? 'bg-gray-900' : 'bg-gray-300'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Vertical layout
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex gap-4 items-start">
          {/* Timeline Dot */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300
                ${index <= statusIndex
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {index < statusIndex ? <Check className="w-4 h-4" /> : step.icon}
            </div>
            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-1 h-12 transition-all duration-300
                  ${index < statusIndex ? 'bg-gray-900' : 'bg-gray-300'}
                `}
              />
            )}
          </div>

          {/* Content */}
          <div className="pt-1">
            <p className={`font-medium text-sm ${index <= statusIndex ? 'text-gray-900' : 'text-gray-600'}`}>
              {step.label}
            </p>
            {index === statusIndex && (
              <p className="text-xs text-gray-500 font-light">Currently at this step</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
