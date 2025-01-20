'use client'

import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Smartphone, 
  CreditCard, 
  Shield, 
  Languages, 
  HelpCircle,
  ChevronRight,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsPage = () => {
  // State for various settings
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    activityUpdates: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true
  });
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('light');

  // Handler for notification settings
  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handler for security settings
  const toggleSecuritySetting = (key: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Logout handler
  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out');
  };

  // Go back handler
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#152080] text-white p-8 relative overflow-hidden">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-4 text-blue-100 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
            <img 
              src="/api/placeholder/150/150"
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-blue-100 mt-1">
              Personaliza tu experiencia
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 w-6 h-6 text-[#152080]" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setProfileDialogOpen(true)}
              >
                <div className="flex items-center">
                  <User className="mr-2 w-5 h-5" />
                  Editar Perfil
                </div>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 w-6 h-6 text-orange-500" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">
                Notificaciones por Email
              </Label>
              <Switch
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={() => toggleNotificationSetting('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">
                Notificaciones Push
              </Label>
              <Switch
                id="push-notifications"
                checked={notificationSettings.pushNotifications}
                onCheckedChange={() => toggleNotificationSetting('pushNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity-updates">
                Actualizaciones de Actividad
              </Label>
              <Switch
                id="activity-updates"
                checked={notificationSettings.activityUpdates}
                onCheckedChange={() => toggleNotificationSetting('activityUpdates')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 w-6 h-6 text-red-500" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor-auth">
                Autenticación de Dos Factores
              </Label>
              <Switch
                id="two-factor-auth"
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={() => toggleSecuritySetting('twoFactorAuth')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-alerts">
                Alertas de Inicio de Sesión
              </Label>
              <Switch
                id="login-alerts"
                checked={securitySettings.loginAlerts}
                onCheckedChange={() => toggleSecuritySetting('loginAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 w-6 h-6 text-purple-500" />
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tema</Label>
              <Select 
                value={theme} 
                onValueChange={(value) => setTheme(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Idioma</Label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 w-6 h-6 text-green-500" />
              Ayuda y Soporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <HelpCircle className="mr-2 w-5 h-5" />
                Centro de Ayuda
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 w-5 h-5" />
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" placeholder="tu@email.com" type="email" />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="Número de teléfono" type="tel" />
            </div>
            <Button className="w-full">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;