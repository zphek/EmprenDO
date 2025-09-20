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
  fetchSignInMethodsForEmail,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth } from '@/firebase';
import { authAdmin } from "@/firebaseAdmin"
import { Toaster, toast } from 'react-hot-toast';
import { createCookie } from '../../../../actions/createCookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginInterface = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e:any) => {
    e.preventDefault();

    await setPersistence(auth, browserLocalPersistence);

    
    toast.promise(
      (async () => {
        try {
          // Intentar login
          const result = await signInWithEmailAndPassword(auth, email, password);
          await createCookie(await result?.user.getIdToken());

          setTimeout(()=>{
            router.push("/landing");
          }, 2000);

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
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configurar parámetros adicionales
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      toast.promise(
        (async () => {
          const result = await signInWithPopup(auth, provider);
          const userEmail = result.user.email;

          if (!userEmail) {
            await auth.signOut();
            throw new Error('No se pudo obtener el correo electrónico');
          }
          
          await createCookie(await result.user.getIdToken());
          
          setTimeout(() => {
            router.push("/landing");
          }, 2000);

          return result;
        })(),
        {
          loading: 'Iniciando sesión con Google...',
          success: <b>¡Bienvenido!</b>,
          error: (err) => {
            console.error('Error de Google Auth:', err);
            
            // Manejo específico de errores
            if (err.code === 'auth/popup-closed-by-user') {
              return <b>Inicio de sesión cancelado</b>;
            } else if (err.code === 'auth/popup-blocked') {
              return <b>Popup bloqueado. Permite popups e intenta de nuevo</b>;
            } else if (err.code === 'auth/cancelled-popup-request') {
              return <b>Solicitud cancelada</b>;
            } else if (err.code === 'auth/network-request-failed') {
              return <b>Error de conexión. Verifica tu internet</b>;
            } else {
              return <b>Error al iniciar sesión con Google</b>;
            }
          }
        }
      );
      
    } catch (error) {
      console.error('Error inicial:', error);
      // Este catch maneja errores antes del toast.promise
      await auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          onClick={()=> router.push("/")}
          variant="ghost" 
          className="absolute left-4 top-4 mb-8 p5 rounded-full border-2 border-[#152080] text-[#152080] hover:bg-[#152080] hover:text-white transition-[400ms] hover:scale-110" 
          size="icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="absolute top-4 right-4">
          <img src="/logo.svg" className='h-5' alt="" />
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
                <Link href="/retrieve" className="text-blue-600 p-0">
                  ¿Has olvidado tu contrase&ntilde;a?
                </Link>
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