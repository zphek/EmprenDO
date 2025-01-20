'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import getSession from '../../../../../../actions/verifySession';

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface Resource {
  id: string;
  title: string;
  type: string;
  description: string;
  fileUrl?: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  verified?: boolean;
}

interface MentorProfile {
  mentorFullname: string;
  specialty: string;
  mentorDescription: string;
  image_url: string;
  rating?: number;
  skills?: string[];
}

interface SubscriptionData {
  mentorId: string;
  userId: string;
  hourlyRate: number;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: any;
}


export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const mentorId = resolvedParams.id;
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    hourlyRate: '',
    description: ''
  });

  const handleSubscriptionSubmit = async () => {
    try {
      // Aquí deberías obtener el userId del usuario autenticado
      const session:any = await getSession(); // Reemplazar con la lógica real de autenticación
      
      const subscriptionObj: SubscriptionData = {
        mentorId: mentorId,
        userId: session.user?.uid || '',
        hourlyRate: Number(subscriptionData.hourlyRate),
        description: subscriptionData.description,
        status: 'PENDING',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'subscriptions'), subscriptionObj);
      
      setIsDialogOpen(false);
      alert('Solicitud enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const renderReviews = () => {
    if (reviews.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No hay reseñas disponibles para este mentor.</p>
          <p className="text-sm mt-2">¡Sé el primero en dejar una reseña!</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.name}</span>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">Verificado</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{review.text}</p>
          </Card>
        ))}
      </div>
    );
  };


  useEffect(() => {
    const loadMentorData = async () => {
      try {

        // Obtener la sesión del usuario actual
        const session: any = await getSession();
        const userId = session?.user?.uid;

        // Verificar si existe una suscripción activa
        if (userId) {
          const subscriptionsQuery = query(
            collection(db, 'subscriptions'),
            where('mentorId', '==', params.id),
            where('userId', '==', userId)
          );
          const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
          const hasSubscription = !subscriptionsSnapshot.empty;
          setIsSubscribed(hasSubscription);
        }

        // Cargar datos del mentor
        const mentorDoc = await getDoc(doc(db, 'mentorUser', params.id));
        if (mentorDoc.exists()) {
          setMentor(mentorDoc.data() as MentorProfile);
        }

        // Cargar recursos
        const resourcesQuery = query(
          collection(db, 'resources'),
          where('mentorId', '==', params.id)
        );
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const resourcesData = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
        setResources(resourcesData);

        // Cargar reseñas
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('mentorId', '==', params.id)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        setReviews(reviewsData);

        // Calcular rating promedio
        if (reviewsData.length > 0) {
          const avgRating = reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length;
          setAverageRating(Number(avgRating.toFixed(2)));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading mentor data:', error);
        setLoading(false);
      }
    };

    loadMentorData();
  }, [mentorId]);

  const handleDownload = async (resource: Resource) => {
    if (!resource.fileUrl) {
      alert('No hay archivo disponible para descargar');
      return;
    }
    window.open(resource.fileUrl, '_blank');
  };

  const handleSubscribe = async () => {
    try {
      // Aquí puedes implementar la lógica de suscripción
      alert('Funcionalidad de suscripción en desarrollo');
    } catch (error) {
      console.error('Error en suscripción:', error);
      alert('Error al procesar la suscripción');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Mentor no encontrado</div>
      </div>
    );
  }

  return (<>
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <img 
            src={mentor.image_url || "/api/placeholder/600/400"} 
            alt={`Foto de ${mentor.mentorFullname}`} 
            className="rounded-lg w-full h-[400px] object-cover"
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <img 
              key={i} 
              src={mentor.image_url || "/api/placeholder/200/133"} 
              alt={`Foto adicional ${i}`} 
              className="rounded-lg w-full h-[133px] object-cover" 
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{mentor.mentorFullname}</h1>
            <p className="text-gray-600">{mentor.specialty}</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="ml-1">{averageRating}</span>
            </div>
          </div>
          <Button 
            className={isSubscribed ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"}
            onClick={() => !isSubscribed && setIsDialogOpen(true)}
            disabled={isSubscribed}
          >
            {isSubscribed ? 'Ya inscrito' : 'Inscribirse'}
        </Button>
        </div>

        <p className="text-gray-700 mb-4">
          {mentor.mentorDescription}
        </p>

        <div className="flex gap-2 mb-4">
          {mentor.skills?.map((skill, index) => (
            <Badge key={index} variant="secondary">{skill}</Badge>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reseñas</h2>
          <Button variant="outline">Escribir una reseña</Button>
        </div>
        
        {renderReviews()}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Certificaciones y Recursos</h2>
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold">{resource.type}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(resource)}
                      disabled={!resource.fileUrl}
                    >
                      <Download size={20} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar mentoría</AlertDialogTitle>
            <AlertDialogDescription>
              Complete los siguientes datos para enviar su solicitud de mentoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="hourlyRate" className="text-sm font-medium">
                Pago por hora (USD)
              </label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="Ej: 50"
                value={subscriptionData.hourlyRate}
                onChange={(e) => setSubscriptionData(prev => ({
                  ...prev,
                  hourlyRate: e.target.value
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción de la mentoría
              </label>
              <Textarea
                id="description"
                placeholder="Describe el objetivo de la mentoría y tus expectativas..."
                value={subscriptionData.description}
                onChange={(e) => setSubscriptionData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button onClick={handleSubscriptionSubmit}>
              Enviar solicitud
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  </>
  );
}