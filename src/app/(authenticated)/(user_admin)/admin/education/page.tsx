'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, storage } from '@/firebase';
import { 
  collection, 
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

const ITEMS_PER_PAGE = 5;

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-900"></div>
    </div>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white border rounded-lg shadow-sm animate-pulse">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

const EducationalResources = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newResource, setNewResource] = useState({
    erTitle: '',
    erDescription: '',
    erTypeld: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue]);

  const fetchResources = async () => {
    try {
      setIsInitialLoading(true);
      const resourcesCol = collection(db, 'educativeResources');
      const resourcesSnapshot = await getDocs(query(resourcesCol, orderBy('createdAt', 'desc')));
      const resourcesList: any = resourcesSnapshot.docs.map(doc => ({
        erld: doc.id,
        ...doc.data()
      }));
      setResources(resourcesList);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let erUrlFile = '';
      
      if (selectedFile) {
        const storageRef = ref(storage, `educativeResources/${selectedFile.name}`);
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        erUrlFile = await getDownloadURL(uploadResult.ref);
      }

      const resourceData = {
        ...newResource,
        erUrlFile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'educativeResources'), resourceData);
      await fetchResources();
      
      setIsModalOpen(false);
      setNewResource({
        erTitle: '',
        erDescription: '',
        erTypeld: '',
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error adding resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resource: any) => {
    try {
      if (resource.erUrlFile) {
        const storageRef = ref(storage, resource.erUrlFile);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'educativeResources', resource.erld));
      await fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  // Filtrar recursos
  const filteredResources = resources
    .filter((resource:any) => filterValue === 'all' || resource.erTypeld === filterValue)
    .filter((resource:any) => 
      resource.erTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.erDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calcular paginación
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResources = filteredResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-8 w-full min-h-screen max-h-screen overflow-y-scroll">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestionar Recursos Educativos</h1>
        
        {/* Header actions */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Registrar recurso
          </button>
          
          <div className="flex gap-4 flex-1 justify-end">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar recursos..."
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            <select 
              className="px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="1">Videos</option>
              <option value="2">Documentos</option>
              <option value="3">Presentaciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources list */}
      <div className="space-y-4">
        {isInitialLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-2">No hay recursos educativos disponibles</p>
            <p className="text-gray-400">Haz clic en "Registrar recurso" para agregar uno nuevo</p>
          </div>
        ) : (
          <>
            {paginatedResources.map((resource:any) => (
              <div key={resource.erld} className="bg-white border rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        {resource.erTitle}
                      </h3>
                      <p className="text-gray-600 mb-2">{resource.erDescription}</p>
                      <div className="space-y-1 text-sm text-gray-500">
                        {resource.erUrlFile && (
                          <a 
                            href={resource.erUrlFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver archivo
                          </a>
                        )}
                        <p>Fecha de creación: {new Date(resource.createdAt).toLocaleDateString()}</p>
                        <p>Última actualización: {new Date(resource.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <button 
                      className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(resource)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border enabled:hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-blue-900 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border enabled:hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Recurso Educativo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={newResource.erTitle}
                  onChange={(e) => setNewResource({...newResource, erTitle: e.target.value})}
                  placeholder="Ingrese el título del recurso"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={newResource.erDescription}
                  onChange={(e) => setNewResource({...newResource, erDescription: e.target.value})}
                  placeholder="Ingrese una descripción del recurso"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Archivo
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de recurso
                </label>
                <select
                  value={newResource.erTypeld}
                  onChange={(e) => setNewResource({...newResource, erTypeld: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione el tipo de recurso</option>
                  <option value="1">Video</option>
                  <option value="2">Documento</option>
                  <option value="3">Presentación</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalResources;