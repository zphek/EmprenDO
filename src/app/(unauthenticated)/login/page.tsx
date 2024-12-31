'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '@/firebase';
import { authAdmin } from "@/firebaseAdmin"
import { Toaster, toast } from 'react-hot-toast';
import { createCookie } from '../../../../actions/createCookie';

const LoginInterface = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async (e:any) => {
    e.preventDefault();
    
    toast.promise(
      (async () => {
        try {
          // Intentar login
          const result = await signInWithEmailAndPassword(auth, email, password);
          await createCookie(await result?.user.getIdToken());

          return result;
        } catch (error) {
          console.error('Error de autenticación:', error);
          throw new Error('invalid-credentials');
        }
      })(),
      {
        loading: 'Iniciando sesión...',
        success: <b>¡Bienvenido!</b>,
        error: <b>Usuario o contraseña inválidos</b>
      }
    );
  };

  const handleGoogleLogin = async () => {
    try {
      // Primero intentamos obtener el email del usuario que intenta registrarse
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      console.log(result);

      if (!userEmail) {
        await auth.signOut();
        toast.error('No se pudo obtener el correo electrónico');
        return;
      }

      // Verificamos si el email ya existe
      const methods = await fetchSignInMethodsForEmail(auth, userEmail);
      
      // Si ya existe el correo, no permitimos el registro
      if (methods.length == 0) {
        await auth.signOut();
        toast.error('Esta cuenta no existe.');
        return;
      }

      // Si llegamos aquí, es un nuevo registro válido
      toast.success('Haz iniciado sesión!');
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo completar el registro con Google');
      // Asegurarnos de cerrar la sesión si algo falla
      await auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="absolute left-4 top-4 mb-8 p5 rounded-full border-2 border-[#152080] text-[#152080] hover:bg-[#152080] hover:text-white transition-[400ms] hover:scale-110" 
          size="icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="absolute top-4 right-4">
          <span className="text-gray-500">Empren</span>
          <span className="text-red-600">8</span>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold text-center mb-8">Inicia Sesión</h1>

            <form className="space-y-6" onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  className="bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-50 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Recuérdame
                  </label>
                </div>
                <Button variant="link" className="text-blue-600 p-0">
                  Contraseña olvidada
                </Button>
              </div>

              <Button type="submit" className="w-full py-6 bg-[#CD1029] hover:bg-red-700">
                Acceder
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    o inicia sesión con
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
              >
                <img src='/google.svg' className='h-5' alt="Google logo"/>
                Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿Aún no eres miembro?{' '}
                <Button variant="link" className="text-blue-600 p-0" type='button' onClick={()=> window.location.href='/register'}>
                  Crea tu cuenta
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default LoginInterface;