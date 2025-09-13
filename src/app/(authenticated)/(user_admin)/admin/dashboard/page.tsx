'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Target, MapPin, Search, ChevronDown } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData:any = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter((project:any) => 
    project.projectObj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.founder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas generales
  const totalProjects = projects.length;
  const totalActiveProjects = projects.filter(p => p.status === 'active').length;
  const totalMoneyRaised = projects.reduce((sum, p) => sum + (p.moneyReached || 0), 0);
  const totalGoals = projects.reduce((sum, p) => sum + (p.moneyGoal || 0), 0);

  // Datos para el gráfico de estado de proyectos
  const projectStatusData = [
    { name: 'Activos', value: projects.filter(p => p.status === 'active').length, color: '#22c55e' },
    { name: 'Pendientes', value: projects.filter(p => p.status === 'pending').length, color: '#eab308' },
    { name: 'Rechazados', value: projects.filter(p => p.status === 'rejected').length, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-h-screen overflow-y-auto bg-gray-100">
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Panel de Administración</h1>
            <p className="text-gray-500">Gestión de todos los proyectos</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Proyectos</h3>
            <p className="text-2xl font-semibold">{totalProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Proyectos Activos</h3>
            <p className="text-2xl font-semibold text-green-600">{totalActiveProjects}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Recaudado</h3>
            <p className="text-2xl font-semibold">${totalMoneyRaised.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Meta Total</h3>
            <p className="text-2xl font-semibold">${totalGoals.toLocaleString()}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Estado de Proyectos</h3>
            <div className="flex justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {projectStatusData.map((status, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                    <span className="text-sm">{status.name}</span>
                    <span className="ml-2 text-sm font-semibold">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Distribución por Ubicación</h3>
            {/* Aquí podrías agregar un mapa o gráfico de distribución geográfica */}
          </div>
        </div>

        {/* Tabla de Proyectos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Todos los Proyectos</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, fundador o ubicación..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Fundador</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Recaudado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const progress = ((project.moneyReached || 0) / (project.moneyGoal || 1)) * 100;
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.projectObj}</TableCell>
                      <TableCell>{project.founder}</TableCell>
                      <TableCell>{project.ubicacion}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell>${project.moneyGoal?.toLocaleString()}</TableCell>
                      <TableCell>${project.moneyReached?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;