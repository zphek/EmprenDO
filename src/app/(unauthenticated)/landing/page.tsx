"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import TestimonialsSection from "./TestimonialsSection";
import FeaturedProjects from "./FeaturedProjects";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import getSession from "../../../../actions/verifySession";

// Reusable animation component
const ScrollReveal = ({ children, className = "" }:any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState<any>(null);

  useEffect(()=>{
    async function fetchUser(){
      const isAuthenticated = await getSession();

      setIsAuthenticated(isAuthenticated);
    }

    fetchUser();
  }, [])
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated?.isAuthenticated ?? false}/>
      <main className="bg-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <ScrollReveal className="w-full lg:w-1/2 space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                  Impulsa sueños,{' '}
                  <span className="block">transforma realidades,</span>
                  <span className="block">apoya a EmprenDO</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  EmprenDO es una plataforma de crowdfunding que conecta emprendedores con mentores e inversionistas para convertir ideas en negocios sostenibles.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full hover:bg-red-700 transition-colors"
                >
                  Conoce a EmprenDO
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 lg:pt-8">
                {[
                  { number: "200+", label: "Inversionistas" },
                  { number: "2000+", label: "Mentores" },
                  { number: "3000+", label: "Emprendedores" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">{stat.number}</h2>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-0">
              <div className="relative">
                <motion.img 
                  src="/landing.png"
                  alt="Emprendedores felices"
                  className="rounded-lg w-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-6 sm:w-8 h-6 sm:h-8 text-blue-600"
                >
                  ★
                </motion.div>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 text-blue-600"
                >
                  ★
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Mentores Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 text-center mb-6 sm:mb-8 lg:mb-12">
              El éxito de tu emprendimiento empieza aquí
            </h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              {
                name: "Laura Sánchez",
                role: "Administración de empresas",
                quote: "Me inspira ayudar a convertir ideas en negocios exitosos."
              },
              {
                name: "Daniel Pérez",
                role: "Marketing Digital",
                quote: "Ayudo a crear estrategias de marketing sostenibles."
              },
              {
                name: "Ana Rodríguez",
                role: "Finanzas",
                quote: "Experta en gestión financiera de startups."
              }
            ].map((mentor, index) => (
              <ScrollReveal key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gray-200"/>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                        {mentor.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {mentor.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    "{mentor.quote}"
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <Link href="/testimonies" className="flex justify-end items-center gap-3 sm:gap-4">
              <span className="text-sm sm:text-base text-blue-900 font-medium">
                Conoce los testimonios
              </span>
              <motion.button
                whileHover={{ x: 5 }}
                className="bg-red-600 text-white w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                →
              </motion.button>
            </Link>
          </ScrollReveal>
        </section>

        <div 
          className="w-full min-h-screen bg-cover bg-center relative flex items-center"
          style={{ backgroundImage: "url('/bg-landing.png')" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-40 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-red-600 text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300 hover:opacity-90"
          >
            Únete a EmprenDO
          </motion.button>
        </div>

        <TestimonialsSection/>
        <FeaturedProjects/>
      </main>
      <Footer/>
    </>
  );
}