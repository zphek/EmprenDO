import React from 'react';
import { Eye } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1">
        {/* Left Column - Form */}
        <div className="w-1/2 p-12 flex flex-col items-center">
          <h1 className="text-3xl font-semibold mb-2 text-center">Regístrate</h1>
          <p className="text-[#637887] mb-8 text-center">
            Tu presencia y participación son muy importantes para nosotros.
            Esperamos que encuentres todo lo que necesitas y que tu experiencia
            sea excelente.
          </p>
          
          <form className="space-y-4 w-[25rem]">
            <div>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
              <Eye className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Cédula"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Método de pago"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">Recuérdame</span>
              </label>
              <a href="#" className="text-[#152080] underline">Contraseña olvidada</a>
            </div>
            
            <button className="w-full bg-red-600 text-white p-3 rounded-lg flex items-center justify-center">
              Acceder
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="text-center my-4 text-gray-500">O Inicia sesión con</div>
            
            <button className="w-full border border-gray-300 p-3 rounded-lg flex items-center justify-center">
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            
            <div className="text-center mt-6">
              <span className="text-gray-600">¿Aún no eres miembro? </span>
              <a href="#" className="text-[#152080] font-bold">Crea tu cuenta</a>
            </div>
          </form>
        </div>
        
        {/* Right Column - Image */}
        <div className="w-1/2 relative h-screen flex items-end">
          <div className="absolute top-4 left-4">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z" />
            </svg>
          </div>
          <img
            src="/images/imaelysujeva.png"
            alt="Happy people"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 right-4">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}