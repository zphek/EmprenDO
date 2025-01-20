'use client'

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  ChevronRight,
  LogOut,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/firebase";
import { updateEmail, updatePassword, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    lastPasswordUpdate: '',
    lastLogin: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get initial user data
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            name: user.displayName || '',
            email: user.email || '',
            lastPasswordUpdate: userData.lastPasswordUpdate || '',
            lastLogin: userData.lastLogin || ''
          });
        }

        // Set up real-time listener for user document
        const unsubscribeFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setProfileData(prev => ({
              ...prev,
              lastPasswordUpdate: userData.lastPasswordUpdate || '',
              lastLogin: userData.lastLogin || ''
            }));
          }
        });

        return () => unsubscribeFirestore();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      // Update display name in Auth
      await updateProfile(currentUser, {
        displayName: profileData.name
      });

      // Update email if changed
      if (currentUser.email !== profileData.email) {
        await updateEmail(currentUser, profileData.email);
      }

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: profileData.name,
        email: profileData.email,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "¡Éxito!",
        description: "Tu perfil ha sido actualizado",
      });
      
      setProfileDialogOpen(false);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      await updatePassword(currentUser, passwordData.newPassword);
      
      // Update lastPasswordUpdate in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        lastPasswordUpdate: new Date().toISOString()
      });

      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido actualizada",
      });
      
      setChangePasswordOpen(false);
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-[#152080] to-[#1e3ac2] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"/>
        <div className="relative px-6 lg:px-8 py-12 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6 text-blue-100 hover:text-white hover:bg-blue-800/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/90 shadow-lg">
                <img 
                  src="/api/placeholder/150/150"
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg 
                               group-hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4 text-gray-600"/>
              </button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                {profileData.name || 'Usuario'}
              </h1>
              <p className="text-blue-100 mt-2">
                {profileData.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel Principal */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="mr-2 w-5 h-5 text-[#152080]" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-gray-50"
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 w-4 h-4 text-gray-500" />
                      <span className="text-sm">Editar Perfil</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-gray-50"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <div className="flex items-center">
                      <Lock className="mr-2 w-4 h-4 text-gray-500" />
                      <span className="text-sm">Cambiar Contraseña</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Shield className="mr-2 w-5 h-5 text-red-500" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Última actualización de contraseña: {' '}
                      <span className="font-medium">
                        {formatDate(profileData.lastPasswordUpdate)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Bell className="mr-2 w-5 h-5 text-orange-500" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>Último inicio de sesión:</p>
                  <p className="font-medium mt-1">
                    {formatDate(profileData.lastLogin)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de Edición de Perfil */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre Completo
              </Label>
              <Input 
                id="name" 
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                className="mt-1.5"
                disabled={loading}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input 
                id="email" 
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                className="mt-1.5"
                disabled={loading}
                required
              />
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Cambio de Contraseña */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Crea una nueva contraseña segura
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Nueva Contraseña
              </Label>
              <Input 
                id="newPassword" 
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                className="mt-1.5"
                disabled={loading}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña
              </Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                className="mt-1.5"
                disabled={loading}
                required
              />
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;