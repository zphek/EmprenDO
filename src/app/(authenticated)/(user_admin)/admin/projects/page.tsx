'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, storage } from '@/firebase';
import { 
  collection, 
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [newProject, setNewProject] = useState({
    projectObj: '',
    founder: '',
    founderDescription: '',
    mission: '',
    vision: '',
    projectDescription: '',
    minInvestmentAmount: 0,
    moneyGoal: 0,
    moneyReached: 0,
    ubicacion: '',
    status: 'active',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchProjects = async () => {
    try {
      setIsInitialLoading(true);
      const projectsCol = collection(db, 'projects');
      const projectsSnapshot = await getDocs(query(projectsCol, orderBy('projectObj', 'asc')));
      const projectsList:any = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error al cargar los proyectos');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('Por favor seleccione un archivo de imagen válido');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.projectObj.trim()) {
      toast.error('El nombre del proyecto es requerido');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = editingProject?.imageUrl || '';
      
      if (selectedFile) {
        const imageRef = ref(storage, `projects/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);

        if (editingProject?.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingProject.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      }

      const projectData = {
        ...newProject,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingProject) {
        const projectRef = doc(db, 'projects', editingProject.id);
        await updateDoc(projectRef, projectData);
        toast.success('Proyecto actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString()
        });
        toast.success('Proyecto creado exitosamente');
      }

      await fetchProjects();
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error al guardar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (project) => {
    if (window.confirm('¿Está seguro de que desea eliminar este proyecto?')) {
      try {
        if (project.imageUrl) {
          const imageRef = ref(storage, project.imageUrl);
          await deleteObject(imageRef);
        }
        
        await deleteDoc(doc(db, 'projects', project.id));
        toast.success('Proyecto eliminado exitosamente');
        await fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Error al eliminar el proyecto');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setNewProject({
      projectObj: project.projectObj,
      founder: project.founder,
      founderDescription: project.founderDescription,
      mission: project.mission,
      vision: project.vision,
      projectDescription: project.projectDescription,
      minInvestmentAmount: project.minInvestmentAmount,
      moneyGoal: project.moneyGoal,
      moneyReached: project.moneyReached,
      ubicacion: project.ubicacion,
      status: project.status,
      imageUrl: project.imageUrl
    });
    setPreviewUrl(project.imageUrl);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewProject({
      projectObj: '',
      founder: '',
      founderDescription: '',
      mission: '',
      vision: '',
      projectDescription: '',
      minInvestmentAmount: 0,
      moneyGoal: 0,
      moneyReached: 0,
      ubicacion: '',
      status: 'active',
      imageUrl: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter((project:any) => 
    project.projectObj.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page:any) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateProgress = (reached:any, goal:any) => {
    return goal > 0 ? (reached / goal * 100).toFixed(1) : 0;
  };

  return (
    <div className="p-8 w-full min-h-screen max-h-screen overflow-y-scroll mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestionar Proyectos</h1>
        
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar proyecto
          </button>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar proyectos..."
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isInitialLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg shadow-sm p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No se encontraron proyectos</p>
          </div>
        ) : (
          paginatedProjects.map((project) => (
            <div key={project.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 relative bg-gray-100">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.projectObj}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {project.projectObj}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.founder}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Meta:</span>
                    <span className="font-medium">${project.moneyGoal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recaudado:</span>
                    <span className="font-medium">${project.moneyReached?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${calculateProgress(project.moneyReached, project.moneyGoal)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    onClick={() => handleEdit(project)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    onClick={() => handleDelete(project)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={resetForm}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nombre del proyecto */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del proyecto
                  </label>
                  <input
                    type="text"
                    value={newProject.projectObj}
                    onChange={(e) => setNewProject({...newProject, projectObj: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Fundador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fundador
                  </label>
                  <input
                    type="text"
                    value={newProject.founder}
                    onChange={(e) => setNewProject({...newProject, founder: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={newProject.ubicacion}
                    onChange={(e) => setNewProject({...newProject, ubicacion: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Meta financiera */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta financiera ($)
                  </label>
                  <input
                    type="number"
                    value={newProject.moneyGoal}
                    onChange={(e) => setNewProject({...newProject, moneyGoal: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                {/* Inversión mínima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inversión mínima ($)
                  </label>
                  <input
                    type="number"
                    value={newProject.minInvestmentAmount}
                    onChange={(e) => setNewProject({...newProject, minInvestmentAmount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>

                {/* Descripción del fundador */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del fundador
                  </label>
                  <textarea
                    value={newProject.founderDescription}
                    onChange={(e) => setNewProject({...newProject, founderDescription: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Descripción del proyecto */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del proyecto
                  </label>
                  <textarea
                    value={newProject.projectDescription}
                    onChange={(e) => setNewProject({...newProject, projectDescription: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Misión */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Misión
                  </label>
                  <textarea
                    value={newProject.mission}
                    onChange={(e) => setNewProject({...newProject, mission: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Visión */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visión
                  </label>
                  <textarea
                    value={newProject.vision}
                    onChange={(e) => setNewProject({...newProject, vision: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                {/* Imagen */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen
                  </label>
                  {(previewUrl || editingProject?.imageUrl) && (
                    <div className="mb-4">
                      <img
                        src={previewUrl || editingProject?.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

export default ProjectManagement;