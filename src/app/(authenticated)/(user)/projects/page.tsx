"use client"

import React, { useState, useEffect } from 'react';
import { Heart, Star, StarHalf } from 'lucide-react';
import MentoringHeader from './MentoringHeader';

// Firebase imports
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';

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

const SkeletonCategories = () => (
  <div className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-16">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-3 animate-pulse"/>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"/>
      </div>
    ))}
  </div>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0
  }).format(amount);
};

const CareerPathsUI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener categorías
        const categoriesCollection = collection(db, 'category');
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);

        // Obtener proyectos
        const projectsCollection = collection(db, 'projects');
        const projectsQuery = query(projectsCollection, orderBy('createdAt', 'desc'));
        const projectSnapshot = await getDocs(projectsQuery);
        const projectList = projectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MentoringHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-light text-[#152080] mb-12">
          Cambia tu futuro con EmprenDO
        </h2>

        {isLoading ? (
          <SkeletonCategories />
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-16">
            {categories.map((category: any) => (
              <div key={category.id} className="flex flex-col items-center group cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <img 
                    src={category.imageUrl} 
                    alt={category.categoryName}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {category.categoryName}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            projects.map((project: any) => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="relative">
                  <img
                    src={project.images?.[0] || '/api/placeholder/300/200'}
                    alt={project.projectObj}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart size={20} className="text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="mb-2">
                    <h3 
                      className="font-semibold text-lg text-gray-800 cursor-pointer hover:text-[#152080] transition-[400ms]" 
                      onClick={() => router.push(`projects/${project.id}`)}
                    >
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerPathsUI;