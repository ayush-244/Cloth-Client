import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ReturnChecklistProps {
  bookingId: string;
  onSubmit: (data: ReturnData) => Promise<void>;
  loading?: boolean;
}

interface ReturnData {
  returnCondition: 'good' | 'minorDamage' | 'heavyDamage';
  cleaningRequired: boolean;
  repairRequired: boolean;
}

const ReturnChecklist: React.FC<ReturnChecklistProps> = ({ 
  bookingId, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<ReturnData>({
    returnCondition: 'good',
    cleaningRequired: false,
    repairRequired: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing return');
    }
  };

  const damageFeeMap = {
    good: 0,
    minorDamage: 200,
    heavyDamage: 500
  };

  const cleaningFee = formData.cleaningRequired ? 150 : 0;
  const totalFees = damageFeeMap[formData.returnCondition] + cleaningFee;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">Return Checklist</h2>
        <p className="text-sm text-gray-600 font-light">Booking ID: {bookingId}</p>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-light">{error}</p>
          </div>
        </div>
      )}

      {/* Condition Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Item Condition</h3>
        <div className="space-y-3">
          {[
            { value: 'good', label: '✓ Good Condition', description: 'No damage, clean' },
            { value: 'minorDamage', label: '⚠ Minor Damage', description: 'Small marks, needs cleaning (₹200)' },
            { value: 'heavyDamage', label: '✗ Heavy Damage', description: 'Significant damage, needs repair (₹500)' }
          ].map(option => (
            <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={option.value}
                checked={formData.returnCondition === option.value}
                onChange={(e) => setFormData({ ...formData, returnCondition: e.target.value as any })}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-600 font-light">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Fees Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Services</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cleaningRequired}
              onChange={(e) => setFormData({ ...formData, cleaningRequired: e.target.checked })}
            />
            <div>
              <p className="font-medium text-gray-900">Professional Cleaning Required</p>
              <p className="text-xs text-gray-600 font-light">₹150 fee</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.repairRequired}
              onChange={(e) => setFormData({ ...formData, repairRequired: e.target.checked })}
            />
            <div>
              <p className="font-medium text-gray-900">Repair Required</p>
              <p className="text-xs text-gray-600 font-light">To be assessed by team</p>
            </div>
          </label>
        </div>
      </div>

      {/* Fee Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
          <div className="flex justify-between text-sm font-light">
            <span className="text-gray-600">Damage Fee:</span>
            <span className="text-gray-900">₹{damageFeeMap[formData.returnCondition]}</span>
          </div>
          <div className="flex justify-between text-sm font-light">
            <span className="text-gray-600">Cleaning Fee:</span>
            <span className="text-gray-900">₹{cleaningFee}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Total Fees:</span>
          <span className="text-lg font-semibold text-gray-900">₹{totalFees}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gray-900 text-white font-light rounded-lg hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Submit Return'}
      </button>

      {submitted && (
        <div className="flex gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-light">Return processed successfully!</p>
        </div>
      )}
    </form>
  );
};

export default ReturnChecklist;
