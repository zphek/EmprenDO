import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react"

// Componente asíncrono que simula una carga
async function TestimonialsSection() {
    // Simular una carga de datos
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    return (
      <>
      
      {/* Testimonials Carousel */}
      <div className="relative max-w-6xl mx-auto">
                                {/* Navigation Arrows */}
                                <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg">
                                        <span className="text-gray-400">←</span>
                                    </div>
                                </button>
                                <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg">
                                        <span className="text-gray-400">→</span>
                                    </div>
                                </button>

                                {/* Testimonial Cards */}
                                <div className="flex gap-6 overflow-x-auto px-8">
                                    {/* Previous Card */}
                                    <div className="bg-gray-100 rounded-lg p-6 min-w-[280px] shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img 
                                                src="/api/placeholder/40/40" 
                                                alt="Daniel Pérez" 
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">Daniel Pérez</p>
                                                <p className="text-xs text-gray-600">Fundador EcoPack RD</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm mb-4">★★★★☆</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Cuando comencé mi emprendimiento, tenía una gran idea, pero me faltaban recursos y orientación para llevarla al siguiente nivel. Gracias a EmprenDO, recibí mentoría personalizada, acceso a financiamiento y una red de contactos invaluable.
                                        </p>
                                    </div>

                                    {/* Current Card */}
                                    <div className="bg-gray-100 rounded-lg p-8 min-w-[400px] shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img 
                                                src="/api/placeholder/48/48" 
                                                alt="Daniel Pérez" 
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div>
                                                <p className="text-lg font-medium text-indigo-900">Daniel Pérez</p>
                                                <p className="text-sm text-gray-600">Fundador EcoPack RD</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-lg mb-4">★★★★☆ 4.5/5</div>
                                        <p className="text-gray-600 leading-relaxed">
                                            Cuando comencé mi emprendimiento, tenía una gran idea, pero me faltaban recursos y orientación para llevarla al siguiente nivel. Gracias a EmprenDO, recibí mentoría personalizada, acceso a financiamiento y una red de contactos invaluable. Con su apoyo, logré convertir mi proyecto en una empresa sostenible que ahora genera empleo y aporta al desarrollo de mi comunidad. Hoy, miro hacia el futuro con optimismo, sabiendo que todo comenzó con una oportunidad que EmprenDO hizo posible.
                                        </p>
                                    </div>

                                    {/* Next Card */}
                                    <div className="bg-gray-100 rounded-lg p-6 min-w-[280px] shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img 
                                                src="/api/placeholder/40/40" 
                                                alt="Daniel Pérez" 
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">Daniel Pérez</p>
                                                <p className="text-xs text-gray-600">Fundador EcoPack RD</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm mb-4">★★★★☆</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Cuando comencé mi emprendimiento, tenía una gran idea, pero me faltaban recursos y orientación para llevarla al siguiente nivel. Gracias a EmprenDO, recibí mentoría personalizada, acceso a financiamiento y una red de contactos invaluable.
                                        </p>
                                    </div>
                                </div>
                            </div>

      </>
    );
  }

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <main>
                <section className="w-full min-h-screen bg-blue-900">
                    <div className="container mx-auto px-4 py-16">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                    Inspírate con historias de éxito hechas realidad con EmprenDO
                                </h2>
                                <p className="text-gray-300 text-lg">
                                    Conoce la historia de otros emprendedores que, así como tú, soñaban alcanzar el éxito.
                                </p>
                            </div>
                            <div className="w-full md:w-1/2">
                                <img 
                                    src="/api/placeholder/600/400"
                                    alt="Emprendedores exitosos"
                                    className="w-full rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="bg-white py-16">
                        <div className="container mx-auto px-4">
                            <h3 className="text-2xl font-bold text-indigo-900 mb-12">
                                Testimonios
                            </h3>

                            <TestimonialsSection/>

                            {/* Add Testimonial Form */}
                            <div className="max-w-6xl mx-auto mt-16">
                                <h4 className="text-xl font-bold text-indigo-900 mb-6">
                                    Agrega tu testimonio
                                </h4>
                                <div>
                                    <p className="text-gray-600 mb-2">Calificación</p>
                                    <div className="flex text-gray-300 text-2xl mb-4">
                                        ★★★★★
                                    </div>
                                    <div className="mb-4">
                                        <textarea 
                                            className="w-full p-4 bg-gray-100 rounded-lg resize-none"
                                            placeholder="Testimonio"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="bg-red-600 text-white px-8 py-2 rounded-full hover:bg-red-700">
                                            Enviar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </Suspense>
    );
}