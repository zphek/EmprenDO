'use client'

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cedula: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Email inválido');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!formData.cedula.trim()) {
      toast.error('La cédula es requerida');
      return false;
    }
    return true;
  };

  const saveUserData = async (userId: string, userData: {
    name: string;
    email: string;
    cedula: string;
    createdAt: Date;
  }) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: new Date()
      });

      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      console.error('Error guardando datos del usuario:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Verificar si el email ya existe
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (methods.length > 0) {
        toast.error('Este correo ya está registrado');
        setIsLoading(false);
        return;
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Guardar datos adicionales en Firestore
      await saveUserData(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        cedula: formData.cedula,
        createdAt: new Date()
      });

      toast.success('¡Registro exitoso!');
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      toast.error('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);


      const user = result.user;

      if (!user.email) {
        await auth.signOut();
        toast.error('No se pudo obtener el correo electrónico');
        return;
      }

      // Verificar si el email ya existe
      const methods = await fetchSignInMethodsForEmail(auth, user.email);
      if (methods.length > 0) {
        await auth.signOut();
        toast.error('Este correo ya está registrado');
        return;
      }

      // Guardar datos adicionales del usuario de Google
      await saveUserData(user.uid, {
        name: user.displayName || 'Usuario de Google',
        email: user.email,
        cedula: '', // Podrías solicitar la cédula después del registro con Google
        createdAt: new Date()
      });

      toast.success('¡Registro con Google exitoso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo completar el registro con Google');
      await auth.signOut();
    }
  };

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
          
          <form onSubmit={handleSubmit} className="space-y-4 w-[25rem]">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Cédula"
                className="w-full p-3 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-600">Recuérdame</span>
              </label>
              <a href="#" className="text-[#152080] underline">Contraseña olvidada</a>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white p-3 rounded-lg flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="text-center my-4 text-gray-500">O Inicia sesión con</div>
            
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full border border-gray-300 p-3 rounded-lg flex items-center justify-center"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            
            <div className="text-center mt-6">
              <span className="text-gray-600">¿Ya eres miembro? </span>
              <a href="/login" className="text-[#152080] font-bold">Inicia sesi&oacute;n</a>
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
      <Toaster position="top-center" />
    </div>
  );
}