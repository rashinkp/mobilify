import { AlertTriangle } from 'lucide-react';
import React, { useState } from 'react'

const ReturnConfirmation = ({
  handleReturn,
  setConfirmReturn,
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const returnReasons = [
    'Defective product',
    'Wrong product received',
    'Product not as described',
    'Damaged during shipping',
    'Size/Model not fitting',
    'Changed my mind',
    'Found better alternative',
    'Product quality issues',
    'Other'
  ];

  const handleSubmit = () => {
    const finalReason = selectedReason === 'Other' ? reason : selectedReason;
    if (!finalReason.trim()) {
      return; // Prevent submission without reason
    }
    handleReturn(finalReason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center mb-4 text-yellow-500">
          <AlertTriangle className="mr-3 w-6 h-6" />
          <h3 className="text-xl font-bold dark:text-white">Return Order?</h3>
        </div>
        <p className="mb-4 dark:text-gray-300">
          Are you sure you want to return this order? Please provide a reason for return.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Reason for return <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select a reason</option>
            {returnReasons.map((reasonOption) => (
              <option key={reasonOption} value={reasonOption}>
                {reasonOption}
              </option>
            ))}
          </select>
        </div>

        {selectedReason === 'Other' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Please specify <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter your reason..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setConfirmReturn(false);
              setSelectedReason('');
              setReason('');
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded-md hover:bg-gray-300"
          >
            No, Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || (selectedReason === 'Other' && !reason.trim())}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Yes, Return Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnConfirmation

