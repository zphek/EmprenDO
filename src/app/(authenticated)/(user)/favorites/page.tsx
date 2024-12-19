import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Heart } from 'lucide-react';

const ProjectCard = ({ title, rating, author, isFavorite }: any) => (
  <Card className="overflow-hidden">
    <div className="relative">
      <img
        src="/api/placeholder/400/300"
        alt={title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
    </div>
    <CardContent className="p-4">
      <div className="flex justify-between items-start relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute -top-2 -right-2 hover:bg-white/50"
      >
        <Heart 
          className={`h-14 w-14 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
        />
      </Button>

        <div>
          <h3 className="font-semibold">{title}</h3>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-sm text-gray-600">{rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{author}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const FavoritesPage = () => {
  const projects = [
    { id: 1, title: 'InnovaRD', rating: 4.5, author: 'María Rosario', isFavorite: true },
    { id: 2, title: 'EcoPack', rating: 3.8, author: 'María Rosario', isFavorite: true },
    { id: 3, title: 'GenStart', rating: 4.2, author: 'María Rosario', isFavorite: true },
    { id: 4, title: 'Emprendix', rating: 4.7, author: 'María Rosario', isFavorite: true }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Mis favoritos</h1>
      
      {/* Search bar */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Input
            placeholder="Search for products..."
            className="pl-10 bg-gray-50 rounded-2xl"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {projects.map(project => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {/* Duplicate grid for demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {projects.map(project => (
          <ProjectCard key={`dup-${project.id}`} {...project} />
        ))}
      </div>

      {/* Recommendations Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Recomendados</h2>
        <p className="text-gray-600 mb-6">
          Basado en tus preferencias, hemos seleccionado proyectos que reflejan tus
          intereses y pasión por el crecimiento.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map(project => (
            <ProjectCard key={`rec-${project.id}`} {...project} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default FavoritesPage;