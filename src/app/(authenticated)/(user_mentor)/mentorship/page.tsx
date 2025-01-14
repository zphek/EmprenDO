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
  // Estado para el perfil del mentor
  const [mentorProfile, setMentorProfile] = useState({
    mentorFullname: '',
    email: '',
    mentorDescription: '',
    image_url: '',
    categoryId: '',
    specialty: '',
    skills: [] as string[]
  });

  // Estados para recursos y mentorías
  const [resources, setResources] = useState<Resource[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Estados para el chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<Mentorship | null>(null);

  // Estado para nuevo recurso
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: '',
    fileUrl: ''
  });

  // Estados para diálogos y carga
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState('');
  
  // Estado para estadísticas
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0
  });

  // Cargar datos del mentor
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

  // Guardar cambios del perfil
  const handleProfileSave = async () => {
    try {
      await setDoc(doc(db, 'mentorUser', MENTOR_ID), mentorProfile, { merge: true });
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  // Subir nuevo recurso
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

  // Eliminar recurso
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

  // Gestión de solicitudes
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

  // Funciones de chat
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
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={mentorProfile.image_url || '/api/placeholder/64/64'} 
              alt="Foto de perfil" 
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">Panel de Mentor</h1>
              <div className="flex gap-2 mt-1">
                <Badge variant="default" className="bg-blue-500">
                  {stats.active} mentorías activas
                </Badge>
                <Badge variant="default" className="bg-yellow-500">
                  {stats.pending} solicitudes pendientes
                </Badge>
                <Badge variant="default" className="bg-green-500">
                  {stats.completed} completadas
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="destructive" className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="mentorships" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Mentorías
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Subir
          </TabsTrigger>
        </TabsList>

        {/* Tab de Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre completo</label>
                  <Input 
                    value={mentorProfile.mentorFullname}
                    onChange={(e) => setMentorProfile({
                      ...mentorProfile,
                      mentorFullname: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    value={mentorProfile.email}
                    onChange={(e) => setMentorProfile({
                      ...mentorProfile,
                      email: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Especialidad</label>
                  <Input 
                    value={mentorProfile.specialty}
                    onChange={(e) => setMentorProfile({
                      ...mentorProfile,
                      specialty: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL de imagen</label>
                  <Input 
                    value={mentorProfile.image_url}
                    onChange={(e) => setMentorProfile({
                      ...mentorProfile,
                      image_url: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea 
                    value={mentorProfile.mentorDescription}
                    onChange={(e) => setMentorProfile({
                      ...mentorProfile,
                      mentorDescription: e.target.value
                    })}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <Button onClick={handleProfileSave} className="mt-4">
                Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Recursos */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Educativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-gray-500">Tipo: {resource.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{resource.rating || 0} ★</Badge>
                      {resource.fileUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(resource.fileUrl, '_blank')}
                        >
                          Descargar
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
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

        {/* Tab de Mentorías */}
        <TabsContent value="mentorships">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Mentorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sección de Solicitudes Pendientes */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Solicitudes Pendientes</h3>
                  <div className="space-y-4">
                    {subscriptions
                      .filter(sub => sub.status === 'PENDING')
                      .map((subscription) => (
                        <div key={subscription.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{subscription.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Tarifa: ${subscription.hourlyRate}/hora
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(subscription)}
                            >
                              Ver detalles
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleUpdateStatus(subscription.id, 'ACCEPTED')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(subscription.id, 'REJECTED')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Mentorías Activas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mentorías Activas</h3>
                  <div className="space-y-4">
                    {mentorships
                      .filter(mentorship => mentorship.status === 'active')
                      .map((mentorship) => (
                        <div key={mentorship.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{mentorship.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Inicio: {new Date(mentorship.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleOpenChat(mentorship)}
                            >
                              <Send className="h-4 w-4" />
                              Chat
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Sección de Mentorías Completadas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mentorías Completadas</h3>
                  <div className="space-y-4">
                    {mentorships
                      .filter(mentorship => mentorship.status === 'completed')
                      .map((mentorship) => (
                        <div key={mentorship.id} 
                          className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                        >
                          <div>
                            <h4 className="font-medium">{mentorship.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Finalizada: {mentorship.endDate ? new Date(mentorship.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Badge variant="secondary">Completada</Badge>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Subir Recursos */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Subir Nuevo Recurso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título del recurso</label>
                  <Input 
                    value={newResource.title}
                    onChange={(e) => setNewResource({
                      ...newResource,
                      title: e.target.value
                    })}
                    className="mt-1" 
                    placeholder="Ingrese el título"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea 
                    value={newResource.description}
                    onChange={(e) => setNewResource({
                      ...newResource,
                      description: e.target.value
                    })}
                    className="w-full mt-1 p-2 border rounded-md" 
                    rows={4}
                    placeholder="Ingrese una descripción del recurso"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de recurso</label>
                  <select 
                    value={newResource.type}
                    onChange={(e) => setNewResource({
                      ...newResource,
                      type: e.target.value
                    })}
                    className="w-full mt-1 p-2 border rounded-md"
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
                  className="w-full"
                  onClick={handleResourceUpload}
                >
                  Subir recurso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Detalles de Solicitud */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Estudiante</h4>
                <p>{selectedSubscription.studentName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Tarifa por hora</h4>
                <p>${selectedSubscription.hourlyRate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Descripción</h4>
                <p className="text-sm text-gray-600">{selectedSubscription.description}</p>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus(selectedSubscription.id, 'ACCEPTED')}
                >
                  Aceptar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedSubscription.id, 'REJECTED')}
                >
                  Rechazar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Chat */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'mentor'
                        ? 'bg-blue-500 text-white'
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
                />
                <Button onClick={handleSendMessage}>
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