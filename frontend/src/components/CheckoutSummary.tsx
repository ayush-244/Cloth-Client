import React from 'react';
import { CartItem } from '../types';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  deposit: number;
  deliveryFee?: number;
  taxes?: number;
  total: number;
  compact?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  items,
  subtotal,
  deposit,
  deliveryFee = 0,
  taxes = 0,
  total,
  compact = false,
}) => {
  if (compact) {
    // Card view for mobile/sidebar
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

        {/* Items */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div className="text-gray-700 font-light">
                {item.product?.name || 'Product'} × {item.rentalDays}d
              </div>
              <div className="font-medium text-gray-900">
                ₹{item.totalPrice.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="flex justify-between font-light text-gray-700">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-light text-gray-700">
            <span>Security Deposit</span>
            <span className="text-orange-600 font-medium">₹{deposit.toLocaleString('en-IN')}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between font-light text-gray-700">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          {taxes > 0 && (
            <div className="flex justify-between font-light text-gray-700">
              <span>Taxes</span>
              <span>₹{taxes.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-light">Total Payable</span>
            <span className="text-2xl font-medium text-gray-900">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-light mt-2">
            Deposit will be refunded after item return and condition check
          </p>
        </div>
      </div>
    );
  }

  // Full page view
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-8 py-8">
        <h2 className="text-2xl font-light text-gray-900 mb-8 font-serif">Order Summary</h2>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-light text-gray-700">Item</th>
                <th className="text-center py-3 font-light text-gray-700">Days</th>
                <th className="text-right py-3 font-light text-gray-700">Price/Day</th>
                <th className="text-right py-3 font-light text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 font-light text-gray-900">
                    {item.product?.name || 'Product'}
                  </td>
                  <td className="text-center py-4 font-light text-gray-700">
                    {item.rentalDays}
                  </td>
                  <td className="text-right py-4 font-light text-gray-700">
                    ₹{(item.totalPrice / item.rentalDays).toLocaleString('en-IN')}
                  </td>
                  <td className="text-right py-4 font-medium text-gray-900">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Breakdown Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-widest">
            Payment Breakdown
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 font-light">Rental Amount</span>
              <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-200">
              <span className="text-gray-700 font-light">Security Deposit (Refundable)</span>
              <span className="text-orange-600 font-medium">₹{deposit.toLocaleString('en-IN')}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700 font-light">Delivery Fee</span>
                <span className="text-gray-900 font-medium">₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            {taxes > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700 font-light">GST (18%)</span>
                <span className="text-gray-900 font-medium">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-gray-900 text-white rounded-lg p-6 text-center">
          <p className="text-sm font-light uppercase tracking-widest mb-2 opacity-90">
            Total Amount Due
          </p>
          <p className="text-4xl font-light mb-2">₹{total.toLocaleString('en-IN')}</p>
          <p className="text-xs font-light opacity-75">
            This includes {deposit.toLocaleString('en-IN')} as security deposit (refundable)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
