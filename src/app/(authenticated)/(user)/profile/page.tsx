'use client'

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Bell, 
  Users, 
  Briefcase, 
  ChevronRight, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  PieChart 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from "firebase/firestore";

// Interfaces
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
  // State Management
  const [user, setUser] = useState<any>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Data Fetching Effects (same as previous implementation)
  // ... (keep the existing useEffect hooks for fetchUserData, fetchActivityData, etc.)

  // UI Helper Functions
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects where userId matches current user
        const projectsQuery = query(
          collection(db, "projects"),
          where("userId", "==", "current-user-id"),
          where("status", "==", "active"),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().projectObj,
          progress: (doc.data().moneyReached / doc.data().moneyGoal) * 100 || 0,
          imageUrl: "/api/placeholder/150/150",
          lastUpdated: doc.data().updatedAt?.toDate() || new Date(),
        }));
        setProjects(projectsData);

        // Fetch subscriptions (mentor relationships) for current user
        const subscriptionsQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", "current-user-id"),
          where("status", "==", "ACCEPTED"),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const mentorsData = subscriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: "Mentor " + doc.data().mentorId,
          specialty: `$${doc.data().hourlyRate}/hora`,
          imageUrl: "/api/placeholder/150/150"
        }));
        setMentors(mentorsData);

        // Fetch recent activity data
        const today = new Date();
        const activityData = Array.from({length: 6}, (_, i) => {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
          return {
            month: month.toLocaleString('default', { month: 'short' }),
            projects: Math.floor(Math.random() * 10),
            mentoring: Math.floor(Math.random() * 8)
          };
        }).reverse();
        setActivityData(activityData);

        // Create sample notifications from projects and mentors
        const notifications = [
          ...projectsData.map(project => ({
            id: `project-${project.id}`,
            type: 'project' as const,
            title: `Actualización en proyecto: ${project.name}`,
            timestamp: project.lastUpdated
          })),
          ...mentorsData.map(mentor => ({
            id: `mentor-${mentor.id}`,
            type: 'mentor' as const,
            title: `Nueva sesión con ${mentor.name}`,
            timestamp: new Date()
          }))
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
        
        setNotifications(notifications);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#152080] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#152080] to-blue-700 text-white p-8 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-full bg-white/10 transform rotate-45 origin-top-right"></div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Volver
          </Button>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Clock className="mr-2 w-4 h-4" />
            Última actualización: Ahora
          </Badge>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full ring-4 ring-white/30 overflow-hidden shadow-lg">
            <img 
              src={user?.photoURL || "/api/placeholder/150/150"}
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.name}</h1>
            <p className="text-blue-100 flex items-center">
              <Bell className="mr-2 w-5 h-5 text-blue-200" />
              {notifications.length} notificaciones nuevas
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 w-6 h-6 text-[#152080]" />
                  Actividad Reciente
                </CardTitle>
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#152080" 
                      strokeWidth={3} 
                      dot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mentoring" 
                      stroke="#38BDF8" 
                      strokeWidth={3} 
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 w-6 h-6 text-orange-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'project' ? 'bg-blue-100' :
                      notification.type === 'mentor' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-[#152080] transition-colors">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(notification.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects & Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 w-6 h-6 text-green-600" />
                  Proyectos Activos
                </CardTitle>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm">
                      <img 
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-[#152080] transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#152080] h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentors */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 w-6 h-6 text-purple-600" />
                  Mis Mentores
                </CardTitle>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {mentors.map((mentor) => (
                  <div 
                    key={mentor.id} 
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-sm">
                      <img 
                        src={mentor.imageUrl}
                        alt={mentor.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-[#152080] transition-colors">
                        {mentor.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {mentor.specialty}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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