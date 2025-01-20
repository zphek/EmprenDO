import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";
import TestimonialsSection from "./TestimonialsSection";

export default function Page() {
    const isAuthenticated = true;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <main>
                {/* Hero Section - Matching the dark blue background */}
                <section className="w-full bg-[#1a237e]">
                    <div className="container mx-auto px-4 py-16 md:py-24">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            {/* Left content */}
                            <div className="w-full md:w-1/2 pr-0 md:pr-12">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                    Inspírate con historias de éxito hechas realidad con{' '}
                                    <span className="text-white">EmprenDO</span>
                                </h1>
                                <p className="text-gray-200 text-lg mb-8">
                                    Conoce la historia de otros emprendedores que, así como tú, soñaban alcanzar el éxito.
                                </p>
                            </div>
                            
                            {/* Right image */}
                            <div className="w-full md:w-1/2">
                                <img 
                                    src="/api/placeholder/600/400"
                                    alt="Emprendedores exitosos"
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section - Matching the design */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12">
                            Testimonios
                        </h2>
                        <TestimonialsSection isAuthenticated={isAuthenticated} />
                    </div>
                </section>
            </main>
        </Suspense>
    );
}