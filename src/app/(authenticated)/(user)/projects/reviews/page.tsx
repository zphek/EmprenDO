'use client';

import React, { useState } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  verified: boolean;
  rating: number;
  date: string;
  content: string;
}

interface Project {
  title: string;
  rating: number;
  progress: number;
  description: string;
  values: string[];
  details: string;
}

const ProjectShowcase = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const project: Project = {
    title: "InnovaRD",
    rating: 4.5,
    progress: 45,
    description: "Proyecto diseñado en atención personalizada para aplicaciones industriales, agrícolas y de seguridad",
    values: ["Innovación", "Perseverancia", "Responsabilidad"],
    details: "Aquí va la descripción detallada del producto, especificaciones, características, etc."
  };

  const tabs = [
    { id: 'details' as const, label: 'Detalles del producto' },
    { id: 'reviews' as const, label: 'Calificaciones y Reseñas' }
  ];

  const reviews: Review[] = [
    {
      id: 1,
      author: "Samantha D.",
      verified: true,
      rating: 4.5,
      date: "Posted on August 14, 2023",
      content: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt."
    },
    {
      id: 2,
      author: "Alex M.",
      verified: true,
      rating: 4,
      date: "Posted on August 15, 2023",
      content: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me."
    },
    {
      id: 3,
      author: "Ethan R.",
      verified: true,
      rating: 3.5,
      date: "Posted on August 16, 2023",
      content: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt."
    },
    {
      id: 4,
      author: "Olivia P.",
      verified: true,
      rating: 4,
      date: "Posted on August 17, 2023",
      content: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out."
    }
  ];

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'details') {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del producto</h2>
          <p className="text-gray-600">{project.details}</p>
          <p className="mt-4 text-gray-600">{project.description}</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Reseñas</h2>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Escribir una reseña
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex justify-between items-start">
                {renderStars(review.rating)}
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{review.author}</span>
                {review.verified && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <p className="text-gray-600 text-sm">{review.content}</p>
              <p className="text-gray-500 text-sm">{review.date}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          <div className="space-y-2">
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
              <img 
                src="/api/placeholder/300/300"
                alt="Project preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map((i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  <img 
                    src="/api/placeholder/100/100"
                    alt={`Preview ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                {renderStars(project.rating)}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-x-2">
                {project.values.map((value) => (
                  <span 
                    key={value}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Objetivo</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                Apoyar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ProjectShowcase;