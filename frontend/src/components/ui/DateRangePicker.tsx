import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  disabled?: boolean;
}

const today = new Date().toISOString().split('T')[0];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = today,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-xs font-semibold text-gray-900 uppercase mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rental Start Date
            </div>
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDate}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Select pickup date</p>
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-xs font-semibold text-gray-900 uppercase mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rental End Date
            </div>
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minDate}
            disabled={disabled || !startDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Select return date</p>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
