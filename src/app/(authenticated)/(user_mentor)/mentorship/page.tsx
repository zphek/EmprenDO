'use client'

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Users, Upload, Star, Send } from 'lucide-react';

const MentorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState<any>('');

  const [resources, setResources] = useState([
    { id: 1, title: 'Gestión de proyectos', type: 'libro', rating: 4.5 },
    { id: 2, title: 'Dirección y gestión de proyectos de TI', type: 'libro', rating: 4.2 }
  ]);
  
  const [mentorships, setMentorships] = useState([
    { 
      id: 1, 
      student: 'Carlos Pérez', 
      status: 'activa', 
      startDate: '2024-12-01',
      avatar: '/api/placeholder/32/32'
    },
    { 
      id: 2, 
      student: 'Ana García', 
      status: 'pendiente', 
      startDate: '2024-12-15',
      avatar: '/api/placeholder/32/32'
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: newMessage, sender: 'mentor', timestamp: new Date() }
      ]);
      setNewMessage('');
      
      // Simular respuesta automática después de 1 segundo
      setTimeout(() => {
        setMessages((prev:any) => [
          ...prev,
          { 
            id: prev.length + 1, 
            text: '¡Gracias por tu mensaje! Te responderé pronto.', 
            sender: 'student', 
            timestamp: new Date() 
          }
        ]);
      }, 1000);
    }
  };

  const handleOpenChat = (mentorship:any) => {
    setCurrentChat(mentorship);
    setChatOpen(true);
    setMessages([
      { 
        id: 1, 
        text: `¡Hola! ¿Cómo va el proyecto?`, 
        sender: 'student', 
        timestamp: new Date(Date.now() - 3600000) 
      }
    ]);
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">  {/* Añadir justify-between aquí */}
            <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div>
                <h1 className="text-2xl font-bold">Panel de Mentor</h1>
                <div className="flex gap-2 mt-1">
                <Badge className="bg-blue-500">5 mentorías activas</Badge>
                <Badge className="bg-green-500">10 completadas</Badge>
                </div>
            </div>
            </div>
            
            <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={() => {
                    // Aquí iría la lógica de cerrar sesión
                    console.log('Cerrando sesión...');
                }}
                >
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

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre completo</label>
                  <Input defaultValue="Aida Gonzalez" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input defaultValue="aida.gonzalez@email.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Especialidad</label>
                  <Input defaultValue="Gestión de Proyectos" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Experiencia (años)</label>
                  <Input type="number" defaultValue="10" className="mt-1" />
                </div>
              </div>
              <Button className="mt-4">Guardar cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Educativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.map(resource => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-gray-500">Tipo: {resource.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{resource.rating} ★</Badge>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm">Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorships">
          <Card>
            <CardHeader>
              <CardTitle>Mentorías Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentorships.map(mentorship => (
                  <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{mentorship.student}</h3>
                      <p className="text-sm text-gray-500">Inicio: {mentorship.startDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={mentorship.status === 'activa' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {mentorship.status}
                      </Badge>
                      <Button variant="outline" size="sm">Ver detalles</Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleOpenChat(mentorship)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Subir Nuevo Recurso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título del recurso</label>
                  <Input className="mt-1" placeholder="Ingrese el título" />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea 
                    className="w-full mt-1 p-2 border rounded-md" 
                    rows={4}
                    placeholder="Ingrese una descripción del recurso"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Archivo</label>
                  <div className="mt-1 p-4 border-2 border-dashed rounded-lg text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar
                    </p>
                  </div>
                </div>
                <Button className="w-full">Subir recurso</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentChat && (
                <>
                  <img src={currentChat.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <span>{currentChat?.student}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-96">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message:any) => (
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