"use client"

import React, { useState } from 'react';

const UserForm = ({ onClose }:any) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: ''
  });

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl animate-slideIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Registro de Usuario
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ingrese su nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-700 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="apellido"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Ingrese su apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-700 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="cedula"
                className="block text-sm font-medium text-gray-700"
              >
                Cédula
              </label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                placeholder="Ingrese número de cédula"
                value={formData.cedula}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-700 text-sm"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;