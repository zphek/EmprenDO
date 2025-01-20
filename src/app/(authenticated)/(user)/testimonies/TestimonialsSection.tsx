'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { collection, getDocs, addDoc, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Datos de ejemplo
const mockTestimonials = [
  {
    id: '1',
    userName: 'Daniel Pérez',
    userImage: '/api/placeholder/48/48',
    rating: 4.5,
    testimonialDescription: 'Cuando comencé mi emprendimiento, tenía una idea clara, pero me faltaban recursos y orientación. Gracias a EmprenDO encontré mentores increíbles y el apoyo financiero que necesitaba. ¡Ahora mi startup está creciendo más rápido de lo que imaginé!',
    position: 'Fundador de TechPro',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    userName: 'Ana Martínez',
    userImage: '/api/placeholder/48/48',
    rating: 5,
    testimonialDescription: 'EmprenDO transformó mi pequeño negocio en una empresa exitosa. La red de contactos y las herramientas que me proporcionaron fueron fundamentales. Su programa de mentoría es excepcional.',
    position: 'CEO de EcoStyle',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    userName: 'Carlos Ruiz',
    userImage: '/api/placeholder/48/48',
    rating: 4,
    testimonialDescription: 'Como emprendedor primerizo, estaba perdido en muchos aspectos del negocio. El equipo de EmprenDO me guió paso a paso, desde la validación de mi idea hasta conseguir mi primera ronda de inversión.',
    position: 'Director de InnovateLab',
    createdAt: new Date('2024-01-05')
  },
  {
    id: '4',
    userName: 'Laura Sánchez',
    userImage: '/api/placeholder/48/48',
    rating: 5,
    testimonialDescription: 'Increíble plataforma para emprendedores. Los talleres y eventos de networking me ayudaron a conectar con otros fundadores y potenciales inversores. La comunidad es muy activa y colaborativa.',
    position: 'Fundadora de HealthTech',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    userName: 'Miguel Torres',
    userImage: '/api/placeholder/48/48',
    rating: 4.5,
    testimonialDescription: 'El programa de aceleración de EmprenDO fue clave para escalar mi negocio. Los mentores son expertos en sus campos y siempre están disponibles para ayudar. ¡Altamente recomendado!',
    position: 'CEO de LogisTech',
    createdAt: new Date('2023-12-28')
  }
];

const TestimonialsSection = ({ isAuthenticated }:any) => {
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [testimonialText, setTestimonialText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const testimonialQuery = query(
        collection(db, 'testimonies'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(testimonialQuery);
      const fetchedTestimonials:any = [];

      for (const docSnapshot of snapshot.docs) {
        const testimonial = docSnapshot.data();
        const userDocRef = doc(db, 'users', testimonial.userId);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();
        
        fetchedTestimonials.push({
          id: docSnapshot.id,
          ...testimonial,
          userName: userData?.username || 'Anonymous',
          userImage: userData?.image_url || '/api/placeholder/48/48'
        });
      }
      
      // Si hay testimonios reales, los usamos; si no, mantenemos los de ejemplo
      if (fetchedTestimonials.length > 0) {
        setTestimonials(fetchedTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleSubmitTestimonial = async () => {
    if (!isAuthenticated?.id) {
      alert('Por favor inicia sesión para dejar un testimonio');
      return;
    }

    if (userRating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!testimonialText.trim()) {
      alert('Por favor escribe tu testimonio');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'testimonies'), {
        userId: isAuthenticated.id,
        testimonialDescription: testimonialText,
        rating: userRating,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setTestimonialText('');
      setUserRating(0);
      await fetchTestimonials();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('Error al enviar el testimonio. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-12 shadow-xl">
      {/* Enhanced Testimonials Carousel */}
      <div className="relative max-w-6xl mx-auto mb-20"
           onMouseEnter={() => setIsHovering(true)}
           onMouseLeave={() => setIsHovering(false)}>
        <button 
          onClick={handlePrevious}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-blue-600" />
        </button>
        
        <button 
          onClick={handleNext}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-blue-600" />
        </button>

        <div className="overflow-hidden px-16">
          <div className="flex transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {testimonials.map((testimonial:any, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="group bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                      <img 
                        src={testimonial.userImage}
                        alt={testimonial.userName}
                        className="relative w-16 h-16 rounded-full object-cover border-2 border-white"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {testimonial.userName}
                      </h4>
                      <p className="text-sm text-gray-600">{testimonial.position}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 transition-colors ${
                              i < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400 group-hover:fill-yellow-500 group-hover:text-yellow-500'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    "{testimonial.testimonialDescription}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index
                  ? 'w-6 bg-blue-600'
                  : 'bg-gray-300 hover:bg-blue-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Submit Form Section - Sin cambios */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">
          Comparte tu experiencia
        </h3>
        
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación
            </label>
            <div className="flex gap-2">
              {[...Array(5)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setUserRating(index + 1)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      index < userRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    } transition-colors hover:fill-yellow-300 hover:text-yellow-300`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tu testimonio
            </label>
            <textarea
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all hover:shadow-md"
              placeholder="Comparte tu experiencia con nosotros..."
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmitTestimonial}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-8 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar testimonio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;