'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRouter } from 'next/navigation';

// Firebase imports
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

interface Mentor {
  id: string;
  mentorFullname: string;
  categoryId: string;
  mentorDescription: string;
  image_url: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MentorCardProps extends Mentor {
  onSubscribe: (id: string) => void;
}

const MentorCard = ({ id, mentorFullname, mentorDescription, image_url, onSubscribe }: MentorCardProps) => (
  <Card className="mb-4 p-6 flex items-start gap-6">
    <img 
      src={image_url} 
      className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 object-cover" 
      alt={`Foto de ${mentorFullname}`} 
    />
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{mentorFullname}</h3>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="ml-1 text-sm">4.0</span>
          </div>
        </div>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => onSubscribe(id)}
        >
          Suscríbete
        </Button>
      </div>
      <p className="mt-3 text-sm text-gray-600">{mentorDescription}</p>
    </div>
  </Card>
);

const Page = () => {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentorsCollection = collection(db, 'mentorUser');
        const mentorsSnapshot = await getDocs(mentorsCollection);
        const mentorsList = mentorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Mentor[];
        
        setMentors(mentorsList.filter(mentor => mentor.status === "Activo"));
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los mentores');
        setLoading(false);
        console.error('Error fetching mentors:', err);
      }
    };

    fetchMentors();
  }, []);

  const handleSubscribe = (mentorId: string) => {
    router.push(`/mentors/${mentorId}`);
  };

  return (
    <main>
      <div className="min-h-[50vh] w-full bg-[#F2F0F1] p-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-extrabold text-5xl text-[#152080] max-w-[500px] mb-4">
            Conecta con mentores expertos que guiarán tu camino hacia el éxito
          </h1>
          <h4 className="text-lg text-gray-600 max-w-[600px]">
            Recibe orientación de mentores experimentados y lleva tu proyecto al siguiente nivel 
            con conocimiento y experiencia compartidos en EmprenDO.
          </h4>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-[#152080] mb-8">
          Construye tu camino con nuestros mentores
        </h2>
        
        {loading && (
          <div className="text-center py-8">
            <p>Cargando mentores...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {mentors.map((mentor) => (
            <MentorCard 
              key={mentor.id} 
              {...mentor} 
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;