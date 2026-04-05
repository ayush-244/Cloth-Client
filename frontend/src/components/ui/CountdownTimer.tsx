import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string | Date;
  rentalStartDate?: string | Date;
  size?: 'sm' | 'md';
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endDate, 
  rentalStartDate,
  size = 'md' 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const isUrgent = timeLeft.days < 1 && !timeLeft.isExpired;
  const sizeClasses = size === 'sm' 
    ? 'text-xs gap-1 px-3 py-2'
    : 'text-sm gap-2 px-4 py-3';

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 ${sizeClasses} font-light`}>
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-red-600">Rental Expired</span>
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center ${sizeClasses} rounded-lg border font-light
        ${isUrgent
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
        }
      `}
    >
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span className="flex gap-1">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{timeLeft.hours}h</span>
        <span>{timeLeft.minutes}m</span>
      </span>
      {isUrgent && <span className="font-semibold">(Urgent!)</span>}
    </div>
  );
};

export default CountdownTimer;
