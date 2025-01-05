import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-500">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
    </div>
  );
}