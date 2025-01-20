'use client'

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Users, Upload, Star, Send, Check, X } from 'lucide-react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import UploadResourceSection from './UploadResourceSection';

// ID fijo del mentor para pruebas
const MENTOR_ID = "Phg9MrejEtrI4YgBdC2n";

interface Resource {
  id: string;
  title: string;
  type: string;
  rating: number;
  description: string;
  mentorId: string;
  fileUrl?: string;
}

interface Mentorship {
  id: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  status: 'active' | 'completed';
  startDate: string;
  endDate?: string;
  hourlyRate: number;
  studentAvatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'mentor' | 'student';
  timestamp: string;
  mentorshipId: string;
}

interface Subscription {
  id: string;
  userId: string;
  mentorId: string;
  studentName: string;
  hourlyRate: number;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: any;
}

const MentorDashboard = () => {
  // Estados y funciones existentes...
  const [mentorProfile, setMentorProfile] = useState({
    mentorFullname: '',
    email: '',
    mentorDescription: '',
    image_url: '',
    categoryId: '',
    specialty: '',
    skills: [] as string[]
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<Mentorship | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: '',
    fileUrl: ''
  });
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState('');
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0
  });

  // Toda la lógica useEffect y funciones handlers existentes...
  useEffect(() => {
    const loadMentorData = async () => {
      try {
        const mentorDoc = await getDoc(doc(db, 'mentorUser', MENTOR_ID));
        if (mentorDoc.exists()) {
          setMentorProfile(mentorDoc.data() as any);
        }

        // Cargar recursos
        const resourcesQuery = query(
          collection(db, 'resources'), 
          where('mentorId', '==', MENTOR_ID)
        );
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const resourcesData = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
        setResources(resourcesData);

        // Cargar mentorías
        const mentorshipsQuery = query(
          collection(db, 'mentorships'),
          where('mentorId', '==', MENTOR_ID)
        );
        const mentorshipsSnapshot = await getDocs(mentorshipsQuery);
        const mentorshipsData = mentorshipsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mentorship[];
        setMentorships(mentorshipsData);

        // Cargar subscripciones
        const subscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('mentorId', '==', MENTOR_ID)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const subscriptionsData = subscriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subscription[];
        setSubscriptions(subscriptionsData);

        // Calcular estadísticas
        const activeCount = mentorshipsData.filter(m => m.status === 'active').length;
        const completedCount = mentorshipsData.filter(m => m.status === 'completed').length;
        const pendingCount = subscriptionsData.filter(s => s.status === 'PENDING').length;

        setStats({
          active: activeCount,
          completed: completedCount,
          pending: pendingCount
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading mentor data:', error);
        setLoading(false);
      }
    };

    loadMentorData();
  }, []);

  const handleProfileSave = async () => {
    try {
      await setDoc(doc(db, 'mentorUser', MENTOR_ID), mentorProfile, { merge: true });
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleResourceUpload = async () => {
    if (!newResource.title || !newResource.type) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const resourceData = {
        ...newResource,
        mentorId: MENTOR_ID,
        rating: 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'resources'), resourceData);
      setResources([...resources, { ...resourceData, id: docRef.id }]);
      setNewResource({ title: '', description: '', type: '', fileUrl: '' });
      alert('Recurso agregado correctamente');
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Error al subir el recurso');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await setDoc(
        doc(db, 'resources', resourceId),
        { status: 'deleted' },
        { merge: true }
      );
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error al eliminar el recurso');
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async (subscriptionId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(subscriptionRef, {
        status: newStatus
      });
  
      setSubscriptions(prevSubscriptions =>
        prevSubscriptions.map(sub =>
          sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
        )
      );
  
      setIsDetailsDialogOpen(false);
      alert(`Solicitud ${newStatus === 'ACCEPTED' ? 'aceptada' : 'rechazada'} correctamente`);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      alert('Error al actualizar el estado de la solicitud');
    }
  };

  const handleOpenChat = async (mentorship: Mentorship) => {
    setCurrentChat(mentorship);
    setChatOpen(true);

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('mentorshipId', '==', mentorship.id)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Error al cargar los mensajes');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    try {
      const messageData = {
        text: newMessage,
        sender: 'mentor',
        mentorshipId: currentChat.id,
        timestamp: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      setMessages([...messages, { ...messageData, id: docRef.id } as Message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a8a] text-white py-6 px-6 mb-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img 
                src={mentorProfile.image_url || '/api/placeholder/64/64'} 
                alt="Foto de perfil" 
                className="h-16 w-16 rounded-full border-4 border-white/20 object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{mentorProfile.mentorFullname || 'Panel de Mentor'}</h1>
                <div className="flex gap-3 mt-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 py-1 px-3 rounded-full">
                    {stats.active} mentorías activas
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 py-1 px-3 rounded-full">
                    {stats.pending} solicitudes pendientes
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 py-1 px-3 rounded-full">
                    {stats.completed} completadas
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-[#1e3a8a] hover:bg-white/90 rounded-full px-6">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-full border shadow-sm w-full flex justify-center gap-2">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 rounded-full px-6 py-2.5 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white transition-all"
            >
              <Users className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="resources"
              className="flex items-center gap-2 rounded-full px-6 py-2.5 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger 
              value="mentorships"
              className="flex items-center gap-2 rounded-full px-6 py-2.5 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white transition-all"
            >
              <Star className="h-4 w-4" />
              Mentorías
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className="flex items-center gap-2 rounded-full px-6 py-2.5 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white transition-all"
            >
              <Upload className="h-4 w-4" />
              Subir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-[#1e3a8a] text-xl">Información del Perfil</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                    <Input 
                      value={mentorProfile.mentorFullname}
                      onChange={(e) => setMentorProfile({
                        ...mentorProfile,
                        mentorFullname: e.target.value
                      })}
                      className="rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input 
                      value={mentorProfile.email}
                      onChange={(e) => setMentorProfile({
                        ...mentorProfile,
                        email: e.target.value
                      })}
                      className="rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Especialidad</label>
                    <Input 
                      value={mentorProfile.specialty}
                      onChange={(e) => setMentorProfile({
                        ...mentorProfile,
                        specialty: e.target.value
                      })}
                      className="rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">URL de imagen</label>
                    <Input 
                      value={mentorProfile.image_url}
                      onChange={(e) => setMentorProfile({
                        ...mentorProfile,
                        image_url: e.target.value
                      })}
                      className="rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <textarea 
                      value={mentorProfile.mentorDescription}
                      onChange={(e) => setMentorProfile({
                        ...mentorProfile,
                        mentorDescription: e.target.value
                      })}
                      className="w-full rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] p-3"
                      rows={4}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleProfileSave} 
                  className="mt-6 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-full px-8"
                >
                  Guardar cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-[#1e3a8a] text-xl">Recursos Educativos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} 
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-500">Tipo: {resource.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-full">
                          {resource.rating || 0} ★
                        </Badge>
                        {resource.fileUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-full hover:bg-[#1e3a8a] hover:text-white"
                            onClick={() => window.open(resource.fileUrl, '_blank')}
                          >
                            Descargar
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentorships">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-[#1e3a8a] text-xl">Gestión de Mentorías</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Solicitudes Pendientes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes Pendientes</h3>
                    <div className="space-y-4">
                      {subscriptions
                        .filter(sub => sub.status === 'PENDING')
                        .map((subscription) => (
                          <div key={subscription.id} 
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{subscription.studentName}</h4>
                              <p className="text-sm text-gray-500">
                                Tarifa: ${subscription.hourlyRate}/hora
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => handleViewDetails(subscription)}
                              >
                                Ver detalles
                              </Button>
                              <Button
                                size="sm"
                                className="rounded-full bg-green-500 hover:bg-green-600"
                                onClick={() => handleUpdateStatus(subscription.id, 'ACCEPTED')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full"
                                onClick={() => handleUpdateStatus(subscription.id, 'REJECTED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentorías Activas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorías Activas</h3>
                    <div className="space-y-4">
                      {mentorships
                        .filter(mentorship => mentorship.status === 'active')
                        .map((mentorship) => (
                          <div key={mentorship.id} 
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{mentorship.studentName}</h4>
                              <p className="text-sm text-gray-500">
                                Inicio: {new Date(mentorship.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="rounded-full flex items-center gap-2 hover:bg-[#1e3a8a] hover:text-white"
                              onClick={() => handleOpenChat(mentorship)}
                            >
                              <Send className="h-4 w-4" />
                              Chat
                            </Button>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentorías Completadas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorías Completadas</h3>
                    <div className="space-y-4">
                      {mentorships
                        .filter(mentorship => mentorship.status === 'completed')
                        .map((mentorship) => (
                          <div key={mentorship.id} 
                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{mentorship.studentName}</h4>
                              <p className="text-sm text-gray-500">
                                Finalizada: {mentorship.endDate ? new Date(mentorship.endDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full">Completada</Badge>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-[#1e3a8a] text-xl">Subir Nuevo Recurso</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Título del recurso</label>
                    <Input 
                      value={newResource.title}
                      onChange={(e) => setNewResource({
                        ...newResource,
                        title: e.target.value
                      })}
                      className="rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                      placeholder="Ingrese el título"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <textarea 
                      value={newResource.description}
                      onChange={(e) => setNewResource({
                        ...newResource,
                        description: e.target.value
                      })}
                      className="w-full rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] p-3"
                      rows={4}
                      placeholder="Ingrese una descripción del recurso"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipo de recurso</label>
                    <select 
                      value={newResource.type}
                      onChange={(e) => setNewResource({
                        ...newResource,
                        type: e.target.value
                      })}
                      className="w-full rounded-lg border-gray-200 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] p-2"
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="libro">Libro</option>
                      <option value="video">Video</option>
                      <option value="documento">Documento</option>
                      <option value="presentacion">Presentación</option>
                    </select>
                  </div>
                  <div>
                    <UploadResourceSection 
                      onFileUploaded={(url) => {
                        setFileUrl(url);
                        setNewResource(prev => ({
                          ...prev,
                          fileUrl: url
                        }));
                      }} 
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-full"
                    onClick={handleResourceUpload}
                  >
                    Subir recurso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogos */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a8a]">Detalles de la Solicitud</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Estudiante</h4>
                <p className="text-gray-900">{selectedSubscription.studentName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Tarifa por hora</h4>
                <p className="text-gray-900">${selectedSubscription.hourlyRate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Descripción</h4>
                <p className="text-sm text-gray-600">{selectedSubscription.description}</p>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  className="rounded-full bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus(selectedSubscription.id, 'ACCEPTED')}
                >
                  Aceptar
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => handleUpdateStatus(selectedSubscription.id, 'REJECTED')}
                >
                  Rechazar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a8a] flex items-center gap-2">
              {currentChat && (
                <>
                  <img 
                    src={currentChat.studentAvatar || '/api/placeholder/32/32'} 
                    alt="" 
                    className="w-8 h-8 rounded-full" 
                  />
                  <span>{currentChat.studentName}</span>
                </>
              )}
          </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-96">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'mentor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.sender === 'mentor'
                        ? 'bg-[#1e3a8a] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="rounded-full"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="rounded-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorDashboard;