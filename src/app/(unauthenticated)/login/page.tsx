'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const LoginInterface = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button variant="ghost" className=" absolute left-4 top-4 mb-8 p5 rounded-full border-2 border-[#152080] text-[#152080] hover:bg-[#152080] hover:text-white transition-[400ms] hover:scale-110" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Logo */}
        <div className="absolute top-4 right-4">
          <span className="text-gray-500">Empren</span>
          <span className="text-red-600">8</span>
        </div>

        {/* Main content */}
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold text-center mb-8">Inicia Sesión</h1>

            <form className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  className="bg-gray-50"
                />
                
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-50 pr-10"
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

              <Button className="w-full py-6 bg-[#CD1029] hover:bg-red-700">
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
              >
                <img src='/google.svg' className='h-5'/>
                Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                ¿Aún no eres miembro?{' '}
                <Button variant="link" className="text-blue-600 p-0">
                  Crea tu cuenta
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginInterface;