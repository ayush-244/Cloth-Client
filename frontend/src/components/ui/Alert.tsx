import React from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  dismissible = true,
}) => {
  const containerClasses: { [key: string]: string } = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons: { [key: string]: string } = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className={`glass rounded-lg p-4 border flex items-start gap-3 animate-slide-down ${containerClasses[type]}`}
      role="alert"
    >
      <span className="text-lg flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">
        {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors text-xl"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
