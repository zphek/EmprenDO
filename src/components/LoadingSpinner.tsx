import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-700"></div>
    </div>
  );
}