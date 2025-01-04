"use client"

import React, { useState } from 'react';
import { Bell, Circle, Clock, FileText, LogOut, MessageSquare, Settings, User } from 'lucide-react';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { userLogOut } from '../../actions/userActions';

const UnAuthenticatedNavbar = () => (
  <ul className="flex items-center gap-8">
    <li><a href="#" className="text-gray-700 hover:text-gray-900">Inicio</a></li>
    <li><a href="#" className="text-gray-700 hover:text-gray-900">Sobre nosotros</a></li>
    <li>
      <a href="/login" className="text-blue-600 hover:bg-blue-700 hover:text-white transition-[400ms] px-4 py-2 rounded-full border border-blue-600">
        Iniciar Sesión
      </a>
    </li>
    <li>
      <a href="/register" className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 flex items-center gap-2">
        Empieza ahora
        <span className="text-lg">→</span>
      </a>
    </li>
  </ul>
);

const NotificationIcon = ({ type }:any) => {
  const iconProps = {
    size: 16,
    className: "text-red-500"
  };

  switch (type) {
    case 'comment':
      return <MessageSquare {...iconProps} />;
    case 'update':
      return <FileText {...iconProps} />;
    case 'reminder':
      return <Clock {...iconProps} />;
    default:
      return <Circle {...iconProps} />;
  }
};

const AuthenticatedNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  const notifications = [
    {
      id: 1,
      title: "Nuevo comentario",
      message: "Juan comentó en tu proyecto",
      time: "hace 5 minutos",
      read: false,
      type: 'comment'
    },
    {
      id: 2,
      title: "Proyecto actualizado",
      message: "Se realizaron cambios en el proyecto X",
      time: "hace 1 hora",
      read: false,
      type: 'update'
    },
    {
      id: 3,
      title: "Recordatorio",
      message: "Tienes una tarea pendiente",
      time: "hace 2 horas",
      read: true,
      type: 'reminder'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ul className="flex items-center gap-8">
      <li><a href="/projects" className="text-[#152080] hover:text-gray-900">Proyectos</a></li>
      <li><a href="/favorites" className="text-[#152080] hover:text-gray-900">Favoritos</a></li>
      <li>
        <a href="/projects/create" className="text-red-600 hover:text-red-700 px-6 py-2 rounded-full border-2 border-red-600">
          Empezar proyecto
        </a>
      </li>
      <li className="relative">
        <button 
          className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        >
          <Bell size={20} className='text-[#152080]'/>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div 
          className={`
            absolute right-0 mt-2 w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[999]
            transition-all duration-200 origin-top
            ${isNotificationsOpen 
              ? 'opacity-100 transform scale-100' 
              : 'opacity-0 transform scale-95 pointer-events-none'
            }
          `}
        >
          <div className="divide-y divide-gray-100">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button className="text-xs font-medium text-red-600 hover:text-red-700 bg-white px-2 py-1 rounded-md transition-colors duration-200">
                    Marcar como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8">
                  <p className="text-center text-gray-500">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer
                        ${!notification.read ? 'bg-red-50/30' : ''}
                      `}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-b-lg">
                <button className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </div>
      </li>

      {/* Rest of the navbar remains the same */}
      <li className="relative">
        <button 
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img 
            src="/user.png" 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div 
          className={`
            absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[999]
            transition-all duration-200 origin-top
            ${isDropdownOpen 
              ? 'opacity-100 transform scale-100' 
              : 'opacity-0 transform scale-95 pointer-events-none'
            }
          `}
        >
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
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={async () => {
                await auth.signOut();
                setTimeout(async () => {
                  await userLogOut();
                  router.push("/login")
                }, 100)
              }}
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
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