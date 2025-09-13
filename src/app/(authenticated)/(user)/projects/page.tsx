"use client"

import React, { useState, useEffect } from 'react';
import { Heart, Star, StarHalf, Search, Filter, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import MentoringHeader from './MentoringHeader';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';

// ScrollReveal component for lazy loading
const ScrollReveal = ({ children, className, delay = 0 }:any) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Skeleton loading component with animation
const SkeletonCard = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl overflow-hidden animate-pulse"
  >
    <div className="w-full h-48 bg-gray-200"/>
    <div className="p-5 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"/>
      <div className="h-3 bg-gray-200 rounded w-1/2"/>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full"/>
        ))}
      </div>
    </div>
  </motion.div>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const CareerPathsUI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent');
  const router = useRouter();
  
  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const categoriesCollection = collection(db, 'category');
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);

        const projectsCollection = collection(db, 'projects');
        const projectsQuery = query(
          projectsCollection,
          orderBy('createdAt', 'desc')
        );
        const projectSnapshot = await getDocs(projectsQuery);
        const projectList = projectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          images: doc.data().images || [],
          moneyReached: doc.data().moneyReached || 0,
          moneyGoal: doc.data().moneyGoal || 1,
          contributors: doc.data().contributors || 'Anónimo',
          projectObj: doc.data().projectObj || 'Proyecto sin título'
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

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.projectObj.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || project.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'progress') {
      return (b.moneyReached / b.moneyGoal) - (a.moneyReached / a.moneyGoal);
    }
    return 0;
  });

  const featuredCategories = categories.slice(0, 6);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MentoringHeader />
      
      {/* Animated Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto px-6 -mt-8 relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-4">
          <Input
            placeholder="Buscar proyectos..."
            className="rounded-full flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<Search className="text-gray-400" />}
          />
          <Button variant="outline" className="rounded-full gap-2 hover:scale-105 transition-transform">
            <Filter size={20} />
            Filtros
          </Button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Categories Section */}
        <ScrollReveal className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Categorías</h2>
              <p className="text-gray-600 mt-1">Explora proyectos por área de interés</p>
            </div>
            {/* <Button variant="ghost" className="text-[#152080] hover:text-[#152080]/80 hover:scale-105 transition-transform">
              Ver todas <ChevronRight size={20} />
            </Button> */}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((category: any, index: number) => (
                <ScrollReveal key={category.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden ${
                      selectedCategory === category.id ? 'ring-2 ring-[#152080]' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#152080]/90"/>
                    <img
                      src={category.imageUrl || '/api/placeholder/300/200'}
                      alt={category.categoryName}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium truncate">
                        {category.categoryName}
                      </p>
                      <p className="text-xs text-white/80">
                        {category.projectCount || 0} proyectos
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Projects Section */}
        <ScrollReveal>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Proyectos Destacados
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  onClick={() => setSortBy('recent')}
                  className="rounded-full gap-2 hover:scale-105 transition-transform"
                >
                  <Clock size={20} />
                  Recientes
                </Button>
                <Button
                  variant={sortBy === 'progress' ? 'default' : 'outline'}
                  onClick={() => setSortBy('progress')}
                  className="rounded-full gap-2 hover:scale-105 transition-transform"
                >
                  <TrendingUp size={20} />
                  Mayor progreso
                </Button>
              </div>
              <span className="text-gray-500">
                {filteredProjects.length} proyectos
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                [...Array(8)].map((_, index) => <SkeletonCard key={index} />)
              ) : sortedProjects.length > 0 ? (
                sortedProjects.map((project: any, index: number) => (
                  <ScrollReveal key={project.id} delay={index * 0.1}>
                    <motion.div 
                      whileHover={{ y: -8 }}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={project.images?.[0] || '/api/placeholder/300/200'}
                          alt={project.projectObj}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart size={20} className="text-gray-400 hover:text-red-500 transition-colors" />
                        </motion.button>
                        {project.featured && (
                          <Badge className="absolute top-4 left-4 bg-[#152080]">
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 
                          className="font-semibold text-lg text-gray-800 hover:text-[#152080] transition-colors cursor-pointer line-clamp-2 mb-3" 
                          onClick={() => router.push(`projects/${project.id}`)}
                        >
                          {project.projectObj}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((star) => (
                              <Star key={star} size={16} className="fill-yellow-400 text-yellow-400" />
                            ))}
                            <StarHalf size={16} className="fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">4.5</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progreso</span>
                            <span className="font-medium">
                              {Math.round((project.moneyReached / project.moneyGoal) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${Math.min((project.moneyReached / project.moneyGoal) * 100, 100)}%` 
                              }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-[#152080] h-full rounded-full"
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(project.moneyReached)}
                            </span>
                            <span className="text-gray-500">
                              Meta: {formatCurrency(project.moneyGoal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))
              ) : (
                <motion.div 
                  variants={itemVariants}
                  className="col-span-full text-center py-8 text-gray-500"
                >
                  No se encontraron proyectos
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </ScrollReveal>
      </div>
    </div>
  );

};

export default CareerPathsUI;