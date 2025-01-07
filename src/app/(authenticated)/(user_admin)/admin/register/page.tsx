'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';

interface FormData {
  fullName: string;
  email: string;
  cedula: string;
  specialization: string;
  documents: File | null;
  password: string;
  confirmPassword: string;
  privacyPolicy: boolean;
}

const specializationAreas = [
  'Tecnología',
  'Negocios',
  'Marketing',
  'Diseño',
  'Educación',
  'Finanzas',
  'Recursos Humanos'
] as const;

const MentorRegistration = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    cedula: '',
    specialization: '',
    documents: null,
    password: '',
    confirmPassword: '',
    privacyPolicy: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;
      
      setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : null
      }));
    } else if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkboxInput.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Aquí iría la lógica para enviar los datos al servidor
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen" cz-shortcut-listen="false">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8 py-4">
          {/* Formulario */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg p-6">
            {/* Header */}
            <div className="mb-4">
              <button className="flex items-center text-gray-600 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrar mentor</h1>
              <p className="text-sm text-gray-600">
                Complete los campos requeridos con información precisa para registrar al mentor y facilitar su verificación.
              </p>
            </div>
  
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
  
              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Correo electrónico"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
  
              {/* Cedula */}
              <div>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="Cédula"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
  
              {/* Specialization Area */}
              <div>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Área de Especialización</option>
                  {specializationAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
  
              {/* Document Upload */}
              <div className="relative">
                <div className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    name="documents"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Documentos de Verificación</span>
                  </div>
                </div>
              </div>
  
              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
  
              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmar contraseña"
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
  
              {/* Privacy Policy */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  name="privacyPolicy"
                  checked={formData.privacyPolicy}
                  onChange={handleInputChange}
                  className="mt-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label className="text-xs text-gray-600">
                  Estoy de acuerdo con el procesamiento y tratamiento de mis datos conforme a lo dispuesto en la{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Política de Privacidad
                  </a>
                  .
                </label>
              </div>
  
              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-white bg-blue-900 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
  
          {/* Imagen - Solo visible en pantallas grandes */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <div className="relative w-full h-[500px]">
              <Image
                src="/api/placeholder/500/700"
                alt="Mentor registration"
                fill
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MentorRegistration;