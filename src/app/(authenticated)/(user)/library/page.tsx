'use client'

import React, { useState, useEffect } from 'react';
import { FileText, Video, Presentation, File, Download, ExternalLink, Search } from 'lucide-react';
import { db } from '@/firebase';
import { 
  collection, 
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';

const ResourceCard = ({ resource }: any) => {
  const getFileExtension = (url: string) => {
    if (!url) return '';
    try {
      // Extraer solo la extensión real del archivo sin parámetros
      const urlPath = new URL(url).pathname;
      const ext = urlPath.split('.').pop()?.split('?')[0];
      return ext ? ext.toLowerCase() : '';
    } catch {
      // Si la URL no es válida, intentar extraer la extensión de manera simple
      const parts = url.split('.');
      return parts[parts.length - 1].split('?')[0].toLowerCase();
    }
  };

  const getFileTypeInfo = (type: string, url: string) => {
    const extension = getFileExtension(url);
    switch (type) {
      case "1":
        return {
          icon: Video,
          color: "bg-red-50",
          textColor: "text-red-600",
          borderColor: "border-red-100",
          badgeColor: "bg-red-100",
          label: "VIDEO",
          extension: extension || "MP4"
        };
      case "2":
        return {
          icon: FileText,
          color: "bg-blue-50",
          textColor: "text-blue-600",
          borderColor: "border-blue-100",
          badgeColor: "bg-blue-100",
          label: "DOC",
          extension: extension || "PDF"
        };
      case "3":
        return {
          icon: Presentation,
          color: "bg-purple-50",
          textColor: "text-purple-600",
          borderColor: "border-purple-100",
          badgeColor: "bg-purple-100",
          label: "PRES",
          extension: extension || "PPT"
        };
      case "4":
        return {
          icon: File,
          color: "bg-green-50",
          textColor: "text-green-600",
          borderColor: "border-green-100",
          badgeColor: "bg-green-100",
          label: "TEMPLATE",
          extension: extension || "DOCX"
        };
      default:
        return {
          icon: File,
          color: "bg-gray-50",
          textColor: "text-gray-600",
          borderColor: "border-gray-100",
          badgeColor: "bg-gray-100",
          label: "FILE",
          extension: extension || "DOC"
        };
    }
  };

  const fileInfo = getFileTypeInfo(resource.erTypeld, resource.erUrlFile);
  const IconComponent = fileInfo.icon;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden">
      <div className={`relative h-40 ${fileInfo.color} p-6 flex flex-col items-center justify-center border-b ${fileInfo.borderColor}`}>
        <IconComponent className={`w-12 h-12 ${fileInfo.textColor}`} />
        <span className={`mt-2 text-xs font-medium uppercase ${fileInfo.textColor}`}>
          {fileInfo.extension}
        </span>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            <a
              href={resource.erUrlFile}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors shadow-sm"
              title="Abrir"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <a
              href={resource.erUrlFile}
              download
              className="bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors shadow-sm"
              title="Descargar"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
            {resource.erTitle}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${fileInfo.badgeColor} ${fileInfo.textColor} font-medium shrink-0`}>
            {fileInfo.label}
          </span>
        </div>
        {resource.erDescription && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {resource.erDescription}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
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
    resource.erTypeld !== "4"
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
              <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
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