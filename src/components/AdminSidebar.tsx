'use client';

import React, { useEffect, useState } from 'react';
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
import { userLogOut, getDbUser } from '../../actions/userActions';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';

const AdminSidebar = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getDbUser();
        if (response.success && response.data) {
          setUserData({
            name: response.data.name || 'Usuario',
            role: response.data.role || 'Usuario'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
    await auth.signOut();
    setTimeout(async () => {
      await userLogOut();
      router.push("/login")
    }, 100)       
  };

  return (
    <aside className="h-screen w-full max-w-64 flex flex-col">
      <div className="bg-blue-900 text-white p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden">
            <Image
              src="/api/placeholder/96/96"
              alt={`Foto de perfil de ${userData.name}`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="text-center">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-24 bg-blue-800 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-blue-800 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-300">Bienvenid@</p>
                <h2 className="font-semibold">{userData.name}</h2>
                <p className="text-xs text-gray-300">{userData.role}</p>
              </>
            )}
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