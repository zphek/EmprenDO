'use client'

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { db } from '@/firebase';
import { 
  collection, 
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';

const ResourceCard = ({ resource }: any) => {
  const getDefaultThumbnail = (type: string) => {
    switch (type) {
      case "1":
        return "/icons/video-thumbnail.png";
      case "2":
        return "/icons/doc-thumbnail.png";
      case "3":
        return "/icons/presentation-thumbnail.png";
      default:
        return "/icons/file-thumbnail.png";
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative group">
        <img
          src={getDefaultThumbnail(resource.erTypeld)}
          alt={resource.erTitle}
          className="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
        />
        <a
          href={resource.erUrlFile}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300"
        >
          <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium">
              Descargar
            </button>
          </div>
        </a>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {resource.erTitle}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {resource.erDescription}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
          <a 
            href={resource.erUrlFile}
            download
            className="text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

const EducationResources = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const resourcesCol = collection(db, 'educativeResources');
      const resourcesSnapshot = await getDocs(query(resourcesCol, orderBy('createdAt', 'desc')));
      const resourcesList: any = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResources(resourcesList);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter((resource: any) => 
    (filterValue === 'all' || resource.erTypeld === filterValue) &&
    (resource.erTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.erDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const documentResources = filteredResources.filter((resource: any) => 
    resource.erTypeld !== "4" // Asumiendo que 4 es el tipo para plantillas
  );

  const templateResources = filteredResources.filter((resource: any) => 
    resource.erTypeld === "4"
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-8">Educación y Recursos</h1>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Buscar recursos..."
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
        <select
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          <option value="1">Videos</option>
          <option value="2">Documentos</option>
          <option value="3">Presentaciones</option>
          <option value="4">Plantillas</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Documents Section */}
          {documentResources.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6">Recursos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {documentResources.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* Templates Section */}
          {templateResources.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Plantillas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templateResources.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {filteredResources.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg mb-2">No hay recursos disponibles</p>
              <p className="text-gray-400">No se encontraron recursos que coincidan con tu búsqueda</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EducationResources;