'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Users, Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  DocumentData 
} from "firebase/firestore";

interface ActivityData {
  month: string;
  projects: number;
  mentoring: number;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  imageUrl: string;
  lastUpdated: Date;
}

interface Mentor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

interface Notification {
  id: string;
  type: 'project' | 'mentor' | 'feedback';
  title: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // Aquí deberías obtener el usuario actual de tu sistema de autenticación
      // Por ejemplo: const user = auth.currentUser;
      setUser({ id: 'user-id', name: 'Usuario' }); // Temporal
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          where('userId', '==', user?.id),
          orderBy('month', 'desc'),
          limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        const activities: ActivityData[] = [];
        
        querySnapshot.forEach((doc) => {
          activities.push(doc.data() as ActivityData);
        });
        
        setActivityData(activities.reverse());
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    if (user?.id) {
      fetchActivityData();
    }
  }, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(
          projectsRef,
          where('userId', '==', user?.id),
          where('status', '==', 'active'),
          orderBy('lastUpdated', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const projectsList: Project[] = [];
        
        querySnapshot.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() } as Project);
        });
        
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentorsRef = collection(db, 'mentors');
        const userMentorsRef = collection(db, 'user_mentors');
        
        // Primero obtenemos las relaciones mentor-usuario
        const userMentorsQuery = query(
          userMentorsRef,
          where('userId', '==', user?.id)
        );
        
        const userMentorsSnapshot = await getDocs(userMentorsQuery);
        const mentorIds = userMentorsSnapshot.docs.map(doc => doc.data().mentorId);
        
        // Luego obtenemos los datos de los mentores
        const mentorsQuery = query(
          mentorsRef,
          where('__name__', 'in', mentorIds)
        );
        
        const mentorsSnapshot = await getDocs(mentorsQuery);
        const mentorsList: Mentor[] = [];
        
        mentorsSnapshot.forEach((doc) => {
          mentorsList.push({ id: doc.id, ...doc.data() } as Mentor);
        });
        
        setMentors(mentorsList);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    if (user?.id) {
      fetchMentors();
    }
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user?.id),
          where('read', '==', false),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const notificationsList: Notification[] = [];
        
        querySnapshot.forEach((doc) => {
          notificationsList.push({ id: doc.id, ...doc.data() } as Notification);
        });
        
        setNotifications(notificationsList);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'mentor':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'feedback':
        return <Bell className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `Hace ${hours} horas`;
    } else {
      const days = Math.floor(hours / 24);
      return `Hace ${days} días`;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Cargando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#152080] text-white p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-full opacity-10">
          <img 
            src="/api/placeholder/400/320" 
            alt="background pattern" 
            className="object-cover w-full h-full"
          />
        </div>
        {/* Back button */}
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
              src={user?.photoURL || "/api/placeholder/150/150"}
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bienvenido devuelta, {user?.name}</h1>
            <p className="text-blue-100 mt-1">
              {notifications.length} notificaciones nuevas desde tu &uacute;ltima visita.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#152080" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mentoring" 
                      stroke="#38BDF8" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'project' ? 'bg-blue-100' :
                      notification.type === 'mentor' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(notification.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects & Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Projects */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Proyectos Activos</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg">
                      <img 
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-500">
                        En progreso - {project.progress}%
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentors */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Mis Mentores</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </button>
              </div>
              <div className="space-y-4">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      <img 
                        src={mentor.imageUrl}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{mentor.name}</h3>
                      <p className="text-sm text-gray-500">{mentor.specialty}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;