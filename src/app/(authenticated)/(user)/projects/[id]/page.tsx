"use client"

import LoadingSpinner from "@/components/LoadingSpinner";
import CalificationAndReviewTab from "@/components/projects/tabs/CalificationAndReviewTab";
import DetailProjectTab from "@/components/projects/tabs/DetailProjectTab";
import { Star, ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";

interface NavTab{
    tabName: string;
    value: string;
}

const tabs: NavTab[] = [{
    tabName: "Detalles del producto",
    value: "ProductDetail"
}, 
{
    tabName: "Calificaciones y Reseñas",
    value: "Reviews"
}]

export default function Page() {
  const [currentTab, setCurrentTab] = useState<string>(tabs[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  

  async function changeTab(value: string) {
    if (currentTab === value) return;
    
    setFadeOut(true);
    setIsLoading(true);
    
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setCurrentTab(value);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    setFadeOut(false);
  }


  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Back button */}
      <button className="mb-6">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Images */}
        <div className="grid grid-cols-5 gap-4">
          {/* Thumbnail gallery */}
          <div className="col-span-1 space-y-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src="/api/placeholder/150/150"
                  alt={`Thumbnail ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main image */}
          <div className="col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            <img
              src="/api/placeholder/600/450"
              alt="Main product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right side - Product info */}
        <div className="space-y-6">
          {/* Header with title and like button */}
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">InnovaRD</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star
                  key={index}
                  size={20}
                  color="orange"
                  fill="orange"
                  className="mr-1"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">4.5/5</span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
              <img
                src="/api/placeholder/32/32"
                alt="María Rosario"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium text-gray-900">María Rosario</h3>
          </div>

          {/* Description */}
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
            <p>
              InnovaRD diseña y construye drones personalizados para aplicaciones
              industriales, agrícolas y de seguridad.
            </p>
          </div>

          {/* Values */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Valores</h3>
            <div className="flex flex-wrap gap-2">
              {["Honestidad", "Perseverancia", "Responsabilidad"].map(
                (value, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {value}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Objetivo</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-blue-600 font-semibold">45%</span>
            </div>
          </div>

          {/* Support button */}
          <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors">
            Apoyar
          </button>
        </div>
      </section>

      <div className="flex flex-grow mt-10">
        {tabs.map(({tabName, value}, index) => (
          <button 
            key={index} 
            onClick={() => changeTab(value)} 
            className={`grow py-4 transition-[400ms] ${
              currentTab === value 
                ? 'border-b-2 border-blue-700 text-blue-700' 
                : 'border-b-2 border-white text-slate-400'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      <div className={`transition-opacity duration-200 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          currentTab === tabs[0].value ? <DetailProjectTab /> : <CalificationAndReviewTab />
        )}
      </div>
    </main>
  );
}