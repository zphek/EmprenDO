"use client"

import React, { useState } from 'react';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';

const UnAuthenticatedNavbar = () => (
  <ul className="flex items-center gap-8">
    <li><a href="#" className="text-gray-700 hover:text-gray-900">Inicio</a></li>
    <li><a href="#" className="text-gray-700 hover:text-gray-900">Sobre nosotros</a></li>
    <li>
      <a href="#" className="text-blue-600 hover:bg-blue-700 hover:text-white transition-[400ms] px-4 py-2 rounded-full border border-blue-600">
        Iniciar Sesión
      </a>
    </li>
    <li>
      <a href="#" className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 flex items-center gap-2">
        Empieza ahora
        <span className="text-lg">→</span>
      </a>
    </li>
  </ul>
);

const AuthenticatedNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
 
  return (
    <ul className="flex items-center gap-8">
      <li><a href="#" className="text-gray-700 hover:text-gray-900">Proyectos</a></li>
      <li><a href="#" className="text-gray-700 hover:text-gray-900">Favoritos</a></li>
      <li>
        <a href="#" className="text-red-600 hover:text-red-700 px-6 py-2 rounded-full border border-red-600">
          Empezar proyecto
        </a>
      </li>
      <li>
        <button className="text-gray-700 hover:text-gray-900">
          <Bell size={20} />
        </button>
      </li>
      <li className="relative">
        <button 
          className="flex items-center gap-2"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img 
            src="/api/placeholder/40/40" 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-gray-700">▼</span>
        </button>
 
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <User size={16} />
                Perfil
              </a>
              <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings size={16} />
                Configuración
              </a>
              <hr className="my-1" />
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={async ()=>{
                await auth.signOut();
                setTimeout(()=>{
                  router.push("/login")
                }, 2000)
              }}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </li>
    </ul>
  );
 };

const Navbar = ({ isAuthenticated = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Empren<span className="text-red-600">DO</span>
            </h2>
          </div>

          <div className="hidden md:block">
            {isAuthenticated ? <AuthenticatedNavbar /> : <UnAuthenticatedNavbar />}
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? <AuthenticatedNavbar /> : <UnAuthenticatedNavbar />}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;