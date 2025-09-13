"use client"

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const MentorSlides = [
    {
        titulo: "Encuentra tu camino al éxito con las mentorías",
        subtitulo: "Conoce la diversidad de mentores que tenemos en EmprenDO para impulsar tu negocio y juntos lograr el éxito.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/emprendo-17910.firebasestorage.app/o/generics%2Farchitects-making-thumbs-up-gesture-removebg-preview%201.png?alt=media&token=d0a6737a-f4a3-47e3-a695-330b87f5a672"
    },
    {
        titulo: "Encuentra tu camino al éxito con las mentorías",
        subtitulo: "Conoce la diversidad de mentores que tenemos en EmprenDO para impulsar tu negocio y juntos lograr el éxito.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/emprendo-17910.firebasestorage.app/o/generics%2Farchitects-making-thumbs-up-gesture-removebg-preview%201.png?alt=media&token=d0a6737a-f4a3-47e3-a695-330b87f5a672"
    }
];

export default function MentoringHeader() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    const [animating, setAnimating] = useState(false);

    const handleSlideChange = (newIndex:number) => {
        if (animating) return;
        
        setDirection(newIndex > currentIndex ? 1 : -1);
        setAnimating(true);
        setCurrentIndex(newIndex);
        
        setTimeout(() => {
            setAnimating(false);
        }, 500);
    };

    return (
        <section className="w-full min-h-[30rem] bg-blue-900 relative flex flex-col justify-center py-8 space-y-10">
            <div className="absolute w-full px-6 flex justify-between items-center top-1/2 -translate-y-1/2">
                <button 
                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Anterior slide"
                    onClick={() => currentIndex > 0 && handleSlideChange(currentIndex - 1)}
                    disabled={currentIndex === 0 || animating}
                >
                    <ArrowLeft size={30} className="text-red-600" />
                </button>

                <button 
                    className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Siguiente slide"
                    onClick={() => currentIndex < MentorSlides.length - 1 && handleSlideChange(currentIndex + 1)}
                    disabled={currentIndex === MentorSlides.length - 1 || animating}
                >
                    <ArrowRight size={30} className="text-red-600" />
                </button>
            </div>

            <div className="mx-[10%] relative overflow-x-hidden">
                <div
                    className={`transition-all duration-500 ease-in-out ${
                        animating 
                            ? direction > 0 
                                ? '-translate-x-full opacity-0' 
                                : 'translate-x-full opacity-0'
                            : 'translate-x-0 opacity-100'
                    }`}
                >
                    <div className="space-y-6">
                        <h1 className="text-white text-5xl font-bold max-w-lg">
                            {MentorSlides[currentIndex].titulo}
                        </h1>
                        <p className="text-white text-lg max-w-lg">
                            {MentorSlides[currentIndex].subtitulo}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="mx-[10%] space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-white text-lg font-bold">
                        Ir a mentorias
                    </h2>
                    <button 
                        className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                        aria-label="Ir a mentorias"
                    >
                        <ArrowRight size={15} />
                    </button>
                </div>

                <ul className="flex gap-2">
                    {MentorSlides.map((_, index) => (
                        <li 
                            key={index} 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentIndex === index 
                                    ? 'bg-white w-9' 
                                    : 'bg-gray-300 w-2'
                            }`}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}