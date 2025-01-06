'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, BarChart2, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  // Sample data for the line chart
  const lineData = [
    { month: 'Jan', thisYear: 100, lastYear: 120 },
    { month: 'Feb', thisYear: 150, lastYear: 140 },
    { month: 'Mar', thisYear: 180, lastYear: 160 },
    { month: 'Apr', thisYear: 220, lastYear: 180 },
    { month: 'May', thisYear: 250, lastYear: 200 },
    { month: 'Jun', thisYear: 280, lastYear: 220 },
    { month: 'Jul', thisYear: 310, lastYear: 240 },
  ];

  // Sample data for the pie charts
  const projectCategories = [
    { name: 'Activos', value: 52.1, color: '#1e40af' },
    { name: 'Espera de aprobación', value: 22.8, color: '#dc2626' },
    { name: 'Rechazados', value: 13.7, color: '#6b7280' },
    { name: 'Otros', value: 11.3, color: '#e5e7eb' },
  ];

  const managementCategories = [
    { name: 'Emprendedores', value: 40, color: '#dc2626' },
    { name: 'Mentores', value: 35, color: '#1e40af' },
    { name: 'Otros', value: 25, color: '#e5e7eb' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white mb-4">
            <img
              src="/api/placeholder/96/96"
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-300">Bienvenida</p>
            <h2 className="font-semibold">Priscilla Castro</h2>
            <p className="text-xs text-gray-300">Administrador Emprendur</p>
          </div>
        </div>

        <nav className="space-y-4">
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <BarChart2 className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <Users className="w-5 h-5" />
            <span>Gestionar usuarios</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <Users className="w-5 h-5" />
            <span>Gestionar mentores</span>
          </a>
          <div className="pt-8">
            <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white">
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Panel de Administración</h1>
          <p className="text-gray-500 text-sm">16 de diciembre del 2024, 6:00 p.m.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-900 text-white p-6 rounded-lg">
            <h3 className="text-lg mb-2">Usuarios activos</h3>
            <p className="text-3xl font-bold">2,000</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg mb-2">Visualizaciones</h3>
            <p className="text-3xl font-bold text-green-600">+35.05%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Estadísticas de usuarios</h3>
          <div className="bg-white p-6 rounded-lg">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Line type="monotone" dataKey="thisYear" stroke="#1e40af" strokeWidth={2} />
                <Line type="monotone" dataKey="lastYear" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Categories */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Categorías de proyectos</h3>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex justify-between mb-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={projectCategories}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {projectCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {projectCategories.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                      <span className="text-sm">{category.name}</span>
                      <span className="ml-2 text-sm font-semibold">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex justify-between mb-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={managementCategories}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {managementCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {managementCategories.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;