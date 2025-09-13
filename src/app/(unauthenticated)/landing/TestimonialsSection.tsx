'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sara M.",
      isVerified: true,
      rating: 5,
      text: "Me impresiona la calidad del apoyo recibido en EmprenDO. Desde la mentoría inicial hasta el proceso de financiamiento, cada paso ha superado mis expectativas. Mi startup ha crecido más de lo que imaginaba."
    },
    {
      id: 2,
      name: "Alejandro K.",
      isVerified: true,
      rating: 5,
      text: "Encontrar mentores que se alineen con mi visión empresarial solía ser un desafío hasta que descubrí EmprenDO. La variedad de expertos disponibles es realmente notable, adaptándose a diferentes industrias y necesidades."
    },
    {
      id: 3,
      name: "Jaime L.",
      isVerified: true,
      rating: 5,
      text: "Como emprendedor siempre en búsqueda de oportunidades de crecimiento, estoy encantado de haber encontrado EmprenDO. La plataforma no solo conecta con inversores, sino que también ofrece recursos invaluables para el desarrollo empresarial."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const StarRating = () => (
    <motion.div 
      className="flex gap-1"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.svg
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </motion.div>
  );

  return (
    <motion.section 
      className="py-16 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.h1 
        className="text-4xl font-bold text-[#1B153D] mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Testimonios y casos de éxito
      </motion.h1>
      
      <div className="relative max-w-7xl mx-auto">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center z-10"
        >
          <span className="sr-only">Anterior</span>
          ←
        </motion.button>

        <div className="flex gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="flex-none w-full md:w-1/3"
                initial={{ opacity: 0, x: 100 }}
                animate={{ 
                  opacity: index === currentSlide ? 1 : 0.5,
                  x: 0,
                  scale: index === currentSlide ? 1 : 0.95
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`
                }}
              >
                <motion.div 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <StarRating />
                  <motion.p 
                    className="mt-4 text-gray-600 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {testimonial.text}
                  </motion.p>
                  <motion.div 
                    className="mt-4 flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="font-medium text-gray-900">
                      {testimonial.name}
                    </span>
                    {testimonial.isVerified && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center z-10"
        >
          <span className="sr-only">Siguiente</span>
          →
        </motion.button>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;