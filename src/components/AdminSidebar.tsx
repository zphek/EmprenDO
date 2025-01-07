'use client';

import React from 'react';
import { 
  BarChart2, 
  Users, 
  LogOut, 
  BookOpen, 
  Tag, 
  Briefcase,
  UserCheck
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const AdminSidebar = ({ userName = "Priscilla Castro", userRole = "Administrador Emprendur" }) => {
  const menuItems = [
    { 
      icon: <BarChart2 className="w-5 h-5" />, 
      text: "Dashboard", 
      href: "/dashboard" 
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      text: "Gestionar usuarios", 
      href: "/users" 
    },
    { 
      icon: <UserCheck className="w-5 h-5" />, 
      text: "Gestionar mentores", 
      href: "/mentors" 
    },
    { 
      icon: <Briefcase className="w-5 h-5" />, 
      text: "Gestionar proyectos", 
      href: "/projects" 
    },
    { 
      icon: <BookOpen className="w-5 h-5" />, 
      text: "Gestionar recursos", 
      href: "/education" 
    },
    { 
      icon: <Tag className="w-5 h-5" />, 
      text: "Gestionar categorías", 
      href: "/categories" 
    }
  ];

  const path = usePathname();

  const handleLogout = async () => {
    try {
      // Aquí iría tu lógica de cierre de sesión
      console.log('Iniciando cierre de sesión...');
      // await signOut(); // Función de autenticación
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <aside className="h-screen w-full max-w-64 flex flex-col">
      <div className="bg-blue-900 text-white p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden">
            <Image
              src="/api/placeholder/96/96"
              alt={`Foto de perfil de ${userName}`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-300">Bienvenid@</p>
            <h2 className="font-semibold">{userName}</h2>
            <p className="text-xs text-gray-300">{userRole}</p>
          </div>
        </div>

        <nav className="space-y-4">
          {menuItems.map((item) => {
            const isActive = `/admin${item.href}` === path;
            
            return (
              <Link 
                key={item.href}
                href={`/admin${item.href}`}
                className={`flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1.5 rounded hover:bg-blue-800 group ${
                  isActive ? 'bg-blue-800 text-white' : ''
                }`}
              >
                <span className="group-hover:scale-105 transition-transform duration-200">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </Link>
            );
          })}
          
          <div className="pt-8 border-t border-blue-800 mt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1.5 rounded hover:bg-blue-800 w-full group"
              aria-label="Cerrar sesión"
            >
              <span className="group-hover:scale-105 transition-transform duration-200">
                <LogOut className="w-5 h-5" />
              </span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;