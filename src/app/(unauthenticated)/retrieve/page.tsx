'use client'

import React from 'react';

export default function Page() {
  return (
    <main className="min-h-screen bg-white flex">
      {/* Left Column - Form */}
      <div className="w-1/2 p-12 flex flex-col">
        <div className="mb-8">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className="max-w-md w-full mx-auto mt-12">
          <h1 className="text-4xl font-semibold text-gray-800 mb-12">
            Recuperar Cuenta
          </h1>

          <form className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors"
            >
              Enviar Formulario
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="w-1/2 relative flex items-end">
        <div className="absolute top-4 right-4">
          <div className="text-blue-600">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8"
              fill="currentColor"
            >
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z" />
            </svg>
          </div>
        </div>
        
        <img
          src="/images/genteBlanca.png"
          alt="Happy friends"
          className="w-full h-full object-contain"
        />

        <div className="absolute bottom-4 left-4">
          <div className="text-blue-600">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8"
              fill="currentColor"
            >
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}