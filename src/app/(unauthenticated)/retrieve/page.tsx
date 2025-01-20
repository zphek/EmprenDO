'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail(''); // Clear form
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo electrónico.');
          break;
        case 'auth/invalid-email':
          setError('El correo electrónico no es válido.');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Por favor, intente más tarde.');
          break;
        default:
          setError('Ha ocurrido un error. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white flex"
    >
      {/* Left Column - Form */}
      <div className="w-1/2 p-12 flex flex-col">
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
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
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </motion.div>

        <div className="max-w-md w-full mx-auto mt-12">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            <h1 className="text-4xl font-semibold text-gray-800 mb-4">
              Recuperar Cuenta
            </h1>
            <p className="text-gray-600 mb-8">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert className="border-green-500 text-green-700 bg-green-50">
                <AlertDescription>
                  Hemos enviado las instrucciones a tu correo electrónico.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.form 
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : 'Enviar Formulario'}
            </button>
          </motion.form>
        </div>
      </div>

      {/* Right Column - Image */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 relative flex items-end"
      >
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
      </motion.div>
    </motion.main>
  );
}