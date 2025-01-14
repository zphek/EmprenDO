"use client"

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, StarHalf, Heart } from 'lucide-react';
import { db } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  deleteDoc 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import getSession from '../../../../../actions/verifySession';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"/>
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"/>
      <div className="flex items-center gap-x-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-12"/>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"/>
          ))}
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2"/>
    </div>
  </div>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0
  }).format(amount);
};

const FavoritesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // TODO: Reemplazar con tu sistema de autenticación
  const [userId, setUserId] = useState<any>("123"); // Temporal - Usar tu sistema de auth

  useEffect(() => {

    async function fetchUserId(){
      const {user}:any = await getSession();
      setUserId(user.uid);
    }

    fetchUserId();

    const fetchSavedProjects = async () => {
      try {
        setIsLoading(true);
        
        // Obtener los IDs de proyectos guardados
        const savedProjectsRef = collection(db, "saved_projects");
        const savedQuery = query(
          savedProjectsRef,
          where("userId", "==", userId),
          orderBy("savedAt", "desc")
        );
        const savedSnapshot = await getDocs(savedQuery);
        const savedProjectIds = savedSnapshot.docs.map(doc => ({
          savedId: doc.id,
          projectId: doc.data().projectId
        }));

        // Obtener los detalles de los proyectos guardados
        const projectsRef = collection(db, "projects");
        const projectPromises = savedProjectIds.map(async ({ savedId, projectId }) => {
          const projectQuery = query(projectsRef, where("__name__", "==", projectId));
          const projectSnapshot = await getDocs(projectQuery);
          const projectData = projectSnapshot.docs[0]?.data();
          return { 
            ...projectData, 
            id: projectId,
            savedId: savedId,
            isSaved: true
          };
        });

        const projectsData = await Promise.all(projectPromises);
        setSavedProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error("Error fetching saved projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProjects();
  }, [userId]);

  useEffect(() => {
    const filtered = savedProjects.filter(project =>
      project.projectObj?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, savedProjects]);

  const handleRemoveFavorite = async (savedId: string, projectId: string) => {
    try {
      // Eliminar de Firestore
      const savedProjectsRef = collection(db, "saved_projects");
      await deleteDoc(doc(savedProjectsRef, savedId));
      
      // Actualizar estado local
      setSavedProjects(prev => prev.filter(p => p.id !== projectId));
      setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light text-[#152080] mb-12">
          Mis Favoritos
        </h1>

        {/* Barra de búsqueda */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Buscar en favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="relative">
                  <img
                    src={project.images?.[0] || '/api/placeholder/300/200'}
                    alt={project.projectObj}
                    className="w-full h-48 object-cover"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(project.savedId, project.id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className="text-[#152080] transition-colors"
                      fill="#152080"
                    />
                  </button>
                </div>
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => router.push(`projects/${project.id}`)}
                >
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 hover:text-[#152080] transition-[400ms]">
                      {project.projectObj}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-gray-700">4.5</span>
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          className="fill-yellow-400 text-yellow-400" 
                        />
                      ))}
                      <StarHalf 
                        size={16} 
                        className="text-yellow-400" 
                      />
                    </div>
                  </div>

                  <p className="text-[#152080] font-medium">
                    {project.contributors || 'Anónimo'}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{Math.round((project.moneyReached / project.moneyGoal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#152080] h-full rounded-full"
                        style={{ 
                          width: `${Math.min((project.moneyReached / project.moneyGoal) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="font-medium text-gray-700">
                        {formatCurrency(project.moneyReached)}
                      </span>
                      <span className="text-gray-500">
                        Meta: {formatCurrency(project.moneyGoal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron proyectos favoritos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;