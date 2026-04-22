import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReturnChecklistProps {
  bookingId: string;
  onSubmit: (data: {
    returnCondition: string;
    cleaningRequired: boolean;
    repairRequired: boolean;
    notes: string;
  }) => Promise<void>;
  loading?: boolean;
}

type Condition = 'good' | 'minorDamage' | 'heavyDamage';

const ReturnChecklist: React.FC<ReturnChecklistProps> = ({ bookingId, onSubmit, loading = false }) => {
  const [condition, setCondition] = useState<Condition>('good');
  const [cleaningRequired, setCleaningRequired] = useState(false);
  const [repairRequired, setRepairRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const calculateFees = () => {
    let damageFee = 0;
    let cleaningFee = 0;

    if (condition === 'minorDamage') damageFee = 500;
    if (condition === 'heavyDamage') damageFee = 1500;
    if (cleaningRequired) cleaningFee = 300;

    return { damageFee, cleaningFee, total: damageFee + cleaningFee };
  };

  const fees = calculateFees();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({
        returnCondition: condition,
        cleaningRequired,
        repairRequired,
        notes,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit return');
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-green-900 mb-2">Return Submitted</h3>
        <p className="text-sm font-light text-green-800">
          Thank you for returning the item. Your refund will be processed within 3-5 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm font-light text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Condition */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Condition</h3>
          <div className="space-y-3">
            {[
              {
                value: 'good' as Condition,
                label: 'Good Condition',
                description: 'No visible damage or wear',
                icon: '✓',
              },
              {
                value: 'minorDamage' as Condition,
                label: 'Minor Damage',
                description: 'Small tears, stains, or wear marks',
                icon: '⚠',
              },
              {
                value: 'heavyDamage' as Condition,
                label: 'Heavy Damage',
                description: 'Significant damage, not wearable',
                icon: '✕',
              },
            ].map(option => (
              <label key={option.value} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="condition"
                  value={option.value}
                  checked={condition === option.value}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="mt-1 w-4 h-4 text-gray-900"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-600 font-light mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Services Required */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Services Required</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={cleaningRequired}
                onChange={(e) => setCleaningRequired(e.target.checked)}
                className="w-4 h-4 text-gray-900 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Cleaning Required</p>
                <p className="text-xs text-gray-600 font-light">₹300 charge applies</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={repairRequired}
                onChange={(e) => setRepairRequired(e.target.checked)}
                className="w-4 h-4 text-gray-900 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Repair Required</p>
                <p className="text-xs text-gray-600 font-light">Will be assessed separately</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block">
            <p className="text-sm font-medium text-gray-900 mb-2">Additional Notes (Optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any damage, stains, or other issues..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all duration-200 font-light"
            />
          </label>
        </div>

        {/* Fee Breakdown */}
        {fees.total > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-3">Applicable Charges</h4>
            <div className="space-y-2 text-sm font-light text-yellow-800">
              {fees.damageFee > 0 && (
                <div className="flex justify-between">
                  <span>Damage Fee</span>
                  <span>₹{fees.damageFee}</span>
                </div>
              )}
              {fees.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span>Cleaning Fee</span>
                  <span>₹{fees.cleaningFee}</span>
                </div>
              )}
              <div className="border-t border-yellow-200 pt-2 flex justify-between font-medium">
                <span>Total Deduction</span>
                <span>₹{fees.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-light"
        >
          {loading ? 'Submitting...' : 'Submit Return'}
        </button>
      </form>
    </div>
  );
};

export default ReturnChecklist;
