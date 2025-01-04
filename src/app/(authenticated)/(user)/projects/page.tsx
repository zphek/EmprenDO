"use client"

import React, { useState, useEffect } from 'react';
import { Heart, Star, StarHalf } from 'lucide-react';
import MentoringHeader from './MentoringHeader';

// Firebase imports
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; // Asegúrate de tener este archivo configurado
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

const CareerPathsUI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'category');
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList:any = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const careerPaths = [
    {
      id: 1,
      title: 'InnovatiDO',
      rating: 4.5,
      reviews: 150,
      image: '/api/placeholder/300/200',
      mentor: 'María Rosario'
    },
    {
      id: 2,
      title: 'EcoPack',
      rating: 4.2,
      reviews: 120,
      image: '/api/placeholder/300/200',
      mentor: 'María Rosario'
    },
    {
      id: 3,
      title: 'GenStart',
      rating: 4.8,
      reviews: 200,
      image: '/api/placeholder/300/200',
      mentor: 'María Rosario'
    },
    {
      id: 4,
      title: 'Emprendix',
      rating: 4.6,
      reviews: 180,
      image: '/api/placeholder/300/200',
      mentor: 'María Rosario'
    },
  ];

  const renderStars = (rating:any) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf size={16} className="text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300" />
        ))}
      </div>
    );
  };
  
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
            {categories.map((category:any) => (
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
            careerPaths.map((path) => (
              <div key={path.id} className="bg-white rounded-xl overflow-hidden transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={path.image}
                    alt={path.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-5 relative">
                  <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart size={20} className="text-gray-400 hover:text-red-500 transition-colors" />
                  </button>

                  <h3 className="font-semibold text-lg text-gray-800 mb-2 cursor-pointer hover:underline transition-[400ms]" onClick={()=> router.push("projects/1")}>{path.title}</h3>
                  <div className="flex items-center gap-x-2">
                    <div className="text-sm text-gray-600 mb-2">
                      {path.rating}
                    </div>
                    <div className="text-yellow-400 mb-2">
                      {renderStars(path.rating)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {path.mentor}
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