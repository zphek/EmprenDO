'use client'

import React, { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Bell, ChevronRight, Target, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

function ProjectOwnerDashboard({ projectId }) {
  const [project, setProject] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    loadProjectData();
    loadInvestments();
  }, [projectId]);

async function loadProjectData() {
    try {
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        setProject({ id: projectSnap.id, ...projectSnap.data() });
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("No se pudo cargar el proyecto");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadInvestments() {
    try {
      const investmentsRef = collection(db, "investments");
      const q = query(investmentsRef, where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const investmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvestments(investmentsData);
    } catch (error) {
      console.error("Error loading investments:", error);
      toast.error("Error al cargar las inversiones");
    }
  }

  async function handleUpdateProject(e) {
    e.preventDefault();
    setIsUpdating(true);

    // Validación de campos requeridos
    const requiredFields = {
      projectObj: 'Nombre del Proyecto',
      projectDescription: 'Descripción',
      mission: 'Misión',
      vision: 'Visión',
      moneyGoal: 'Meta de Financiamiento',
      minInvestmentAmount: 'Inversión Mínima'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!project[field] && project[field] !== 0) {
        toast.error(`El campo ${label} es requerido`);
        setIsUpdating(false);
        return;
      }
    }

    // Validación de montos
    if (Number(project.moneyGoal) <= 0) {
      toast.error("La meta de financiamiento debe ser mayor a 0");
      setIsUpdating(false);
      return;
    }

    if (Number(project.minInvestmentAmount) <= 0) {
      toast.error("La inversión mínima debe ser mayor a 0");
      setIsUpdating(false);
      return;
    }

    if (Number(project.minInvestmentAmount) > Number(project.moneyGoal)) {
      toast.error("La inversión mínima no puede ser mayor a la meta");
      setIsUpdating(false);
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      
      // Crear objeto con campos actualizados y valores por defecto
      const updateData = {
        projectObj: project.projectObj.trim() || '',
        projectDescription: project.projectDescription.trim() || '',
        mission: project.mission.trim() || '',
        vision: project.vision.trim() || '',
        moneyGoal: Number(project.moneyGoal) || 0,
        minInvestmentAmount: Number(project.minInvestmentAmount) || 0,
        socialLinks: project.socialLinks || [],
        categoryId: project.categoryId || '1',
        status: project.status || 'active',
        values: project.values || []
      };

      // Solo agregar ubicacion si existe
      if (project.ubicacion !== undefined) {
        updateData.ubicacion = project.ubicacion.trim();
      }

      // Filtrar campos undefined o null
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
      );

      await updateDoc(projectRef, cleanedData);
      
      toast.success("¡Proyecto actualizado correctamente!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("No se pudo actualizar el proyecto");
    } finally {
      setIsUpdating(false);
    }
  }
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!project) {
    return <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>No se encontró el proyecto</AlertDescription>
    </Alert>;
  }

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const progressPercentage = Math.min((totalInvested / project.moneyGoal) * 100, 100);
  const remainingAmount = Math.max(project.moneyGoal - totalInvested, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header Section with curved bottom */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white pb-32 pt-6">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <Link href="/projects" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{project.projectObj}</h1>
                <p className="text-blue-100 mt-1">{project.ubicacion}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-full relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {investments.length}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/50 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100">Meta</p>
                  <p className="text-2xl font-bold">${project.moneyGoal.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/50 rounded-lg">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100">Recaudado</p>
                  <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/50 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100">Inversores</p>
                  <p className="text-2xl font-bold">{investments.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-50 rounded-t-[3rem]"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card with enhanced design */}
            <Card className="overflow-hidden border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-blue-900">Progreso de la Campaña</CardTitle>
                <CardDescription>
                  Faltan ${remainingAmount.toLocaleString()} para alcanzar la meta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progressPercentage} className="h-3 bg-blue-100" />
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">${totalInvested.toLocaleString()}</span>
                    <span className="text-blue-900 font-bold">{progressPercentage.toFixed(1)}%</span>
                    <span className="text-gray-600">${project.moneyGoal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-blue-50">
                <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  Detalles del Proyecto
                </TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                  Transacciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Editar Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProject} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="projectObj" className="text-blue-900">Nombre del Proyecto</Label>
                          <Input
                            id="projectObj"
                            value={project.projectObj}
                            onChange={(e) => setProject({...project, projectObj: e.target.value})}
                            className="bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ubicacion" className="text-blue-900">Ubicación</Label>
                          <Input
                            id="ubicacion"
                            value={project.ubicacion}
                            onChange={(e) => setProject({...project, ubicacion: e.target.value})}
                            className="bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectDescription" className="text-blue-900">Descripción</Label>
                        <Textarea
                          id="projectDescription"
                          value={project.projectDescription}
                          onChange={(e) => setProject({...project, projectDescription: e.target.value})}
                          className="min-h-[100px] bg-white border-blue-100 focus:border-blue-300"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="mission" className="text-blue-900">Misión</Label>
                          <Textarea
                            id="mission"
                            value={project.mission}
                            onChange={(e) => setProject({...project, mission: e.target.value})}
                            className="min-h-[100px] bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vision" className="text-blue-900">Visión</Label>
                          <Textarea
                            id="vision"
                            value={project.vision}
                            onChange={(e) => setProject({...project, vision: e.target.value})}
                            className="min-h-[100px] bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="moneyGoal" className="text-blue-900">Meta de Financiamiento</Label>
                          <Input
                            id="moneyGoal"
                            type="number"
                            value={project.moneyGoal}
                            onChange={(e) => setProject({...project, moneyGoal: e.target.value})}
                            className="bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minInvestmentAmount" className="text-blue-900">Inversión Mínima</Label>
                          <Input
                            id="minInvestmentAmount"
                            type="number"
                            value={project.minInvestmentAmount}
                            onChange={(e) => setProject({...project, minInvestmentAmount: e.target.value})}
                            className="bg-white border-blue-100 focus:border-blue-300"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isUpdating ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Historial de Transacciones</CardTitle>
                    <CardDescription>
                      Total recaudado: ${totalInvested.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-blue-100 bg-white overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-blue-50">
                            <TableHead className="text-blue-900">Fecha</TableHead>
                            <TableHead className="text-blue-900">Monto</TableHead>
                            <TableHead className="text-blue-900">Estado</TableHead>
                            <TableHead className="text-blue-900">Método de Pago</TableHead>
                            <TableHead className="text-blue-900">ID Usuario</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {investments.map((investment) => (
                            <TableRow key={investment.id} className="hover:bg-blue-50/50">
                              <TableCell className="font-medium">
                                {new Date(investment.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>${investment.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  investment.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {investment.status}
                                </span>
                              </TableCell>
                              <TableCell>{investment.paymentMethodId}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {investment.userId}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.slice(0, 3).map((investment) => (
                    <div key={investment.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Nueva inversión recibida</p>
                        <p className="text-sm text-gray-500">
                          ${investment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Porcentaje completado</span>
                      <span className="text-blue-600 font-medium">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-blue-100" />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Resumen de inversiones</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total inversores</span>
                        <span className="text-blue-900 font-medium">{investments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Inversión promedio</span>
                        <span className="text-blue-900 font-medium">
                          ${investments.length > 0 ? Math.round(totalInvested / investments.length).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monto pendiente</span>
                        <span className="text-blue-900 font-medium">${remainingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default ProjectOwnerDashboard;