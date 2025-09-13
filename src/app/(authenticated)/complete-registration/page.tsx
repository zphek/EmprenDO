"use client"

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import getSession from '../../../../actions/verifySession';

const UserForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await getSession();
      if (!user?.uid) {
        throw new Error('No se encontró la sesión del usuario');
      }

      const userData = {
        name: `${formData.nombre} ${formData.apellido}`,
        cedula: formData.cedula,
        email: user.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'normal'
      };

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });

      // Redirect to home or dashboard
      router.push('/landing');
      router.refresh();

    } catch (err) {
      console.error('Error al guardar los datos:', err);
      setError('Ocurrió un error al guardar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Completar Registro
            </h2>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;