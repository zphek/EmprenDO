'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { db, storage } from '@/firebase';
import { 
  collection, 
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  where 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { toast } from 'react-hot-toast';

const MentorManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingMentor, setEditingMentor] = useState<any>(null);

  const [newMentor, setNewMentor] = useState<any>({
    mentorFullname: '',
    email: '',
    password: '',
    mentorDescription: '',
    categoryId: '',
    status: 'Activo',
    image_url: '',
    passwordHash: ''
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setIsInitialLoading(true);
      const mentorsCol = collection(db, 'mentorUser');
      const mentorsSnapshot = await getDocs(query(mentorsCol, orderBy('createdAt', 'desc')));
      const mentorsList:any = mentorsSnapshot.docs.map(doc => ({
        mentorUserId: doc.id,
        ...doc.data()
      }));
      setMentors(mentorsList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Error al cargar los mentores');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleFileChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error('Por favor seleccione un archivo de imagen válido');
      }
    }
  };

  const validateForm = () => {
    if (!newMentor.mentorFullname || !newMentor.email || (!editingMentor && !newMentor.password)) {
      toast.error('Por favor complete todos los campos requeridos');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let image_url = editingMentor?.image_url || '';
      
      // Manejar la imagen si se seleccionó una nueva
      if (selectedFile) {
        const imageRef = ref(storage, `mentors/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedFile);
        image_url = await getDownloadURL(uploadResult.ref);

        // Si estamos editando y había una imagen anterior, la eliminamos
        if (editingMentor?.image_url) {
          try {
            const oldImageRef = ref(storage, editingMentor.image_url);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      }

      // Crear objeto con datos del mentor
      const mentorData:any = {
        mentorFullname: newMentor.mentorFullname,
        email: newMentor.email,
        mentorDescription: newMentor.mentorDescription,
        categoryId: newMentor.categoryId,
        status: newMentor.status,
        image_url,
        updatedAt: new Date().toISOString()
      };

      if (!editingMentor) {
        // Si es un nuevo mentor, agregamos los campos adicionales
        mentorData.createdAt = new Date().toISOString();
        mentorData.passwordHash = newMentor.password; // En producción deberías hashear la contraseña
      }

      if (editingMentor) {
        // Actualizar mentor existente
        const mentorRef = doc(db, 'mentorUser', editingMentor.mentorUserId);
        await updateDoc(mentorRef, mentorData);
        toast.success('Mentor actualizado exitosamente');
      } else {
        // Crear nuevo mentor
        await addDoc(collection(db, 'mentorUser'), mentorData);
        toast.success('Mentor registrado exitosamente');
      }

      await fetchMentors();
      resetForm();
    } catch (error) {
      console.error('Error saving mentor:', error);
      toast.error('Error al guardar el mentor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mentor:any) => {
    if (window.confirm('¿Está seguro de que desea eliminar este mentor?')) {
      try {
        // Eliminar imagen si existe
        if (mentor.image_url) {
          const imageRef = ref(storage, mentor.image_url);
          await deleteObject(imageRef);
        }
        
        // Eliminar documento
        await deleteDoc(doc(db, 'mentorUser', mentor.mentorUserId));
        toast.success('Mentor eliminado exitosamente');
        await fetchMentors();
      } catch (error) {
        console.error('Error deleting mentor:', error);
        toast.error('Error al eliminar el mentor');
      }
    }
  };

  const handleEdit = (mentor:any) => {
    setEditingMentor(mentor);
    setNewMentor({
      mentorFullname: mentor.mentorFullname,
      email: mentor.email,
      password: '', // No mostramos la contraseña actual
      mentorDescription: mentor.mentorDescription || '',
      categoryId: mentor.categoryId || '',
      status: mentor.status || 'Activo',
      image_url: mentor.image_url || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewMentor({
      mentorFullname: '',
      email: '',
      password: '',
      mentorDescription: '',
      categoryId: '',
      status: 'Activo',
      image_url: ''
    });
    setSelectedFile(null);
    setEditingMentor(null);
    setIsModalOpen(false);
  };

  // Filtrar mentores
  const filteredMentors = mentors
    .filter((mentor:any) => categoryFilter === 'all' || mentor.categoryId === categoryFilter)
    .filter((mentor:any) => 
      mentor.mentorFullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = [
    { id: '1', name: 'Tecnología' },
    { id: '2', name: 'Negocios' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'Diseño' },
    { id: '5', name: 'Ventas' }
  ];

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestionar mentores</h1>
        
        {/* Header actions */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Registrar mentor
          </button>
          
          <div className="flex gap-4 flex-1 justify-end">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar mentores..."
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            <select 
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mentors list */}
      <div className="space-y-4">
        {isInitialLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No se encontraron mentores</p>
          </div>
        ) : (
          filteredMentors.map((mentor:any) => (
            <div key={mentor.mentorUserId} className="bg-white border rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {mentor.image_url ? (
                        <img 
                          src={mentor.image_url} 
                          alt={mentor.mentorFullname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-900 font-medium">
                          {mentor.mentorFullname.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-blue-900">{mentor.mentorFullname}</h3>
                      <p className="text-sm text-gray-600">{mentor.email}</p>
                      <div className="mt-1">
                        <span className={`text-sm ${
                          mentor.status === 'Activo' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mentor.status}
                        </span>
                        <span className="text-sm text-gray-500 ml-4">
                          Categoría: {categories.find(c => c.id === mentor.categoryId)?.name || 'No asignada'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{mentor.mentorDescription}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => handleEdit(mentor)}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => handleDelete(mentor)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={resetForm}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editingMentor ? 'Editar Mentor' : 'Registrar Nuevo Mentor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newMentor.mentorFullname}
                  onChange={(e) => setNewMentor({...newMentor, mentorFullname: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({...newMentor, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {!editingMentor && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={newMentor.password}
                    onChange={(e) => setNewMentor({...newMentor, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingMentor}
                    minLength={6}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={newMentor.mentorDescription}
                  onChange={(e) => setNewMentor({...newMentor, mentorDescription: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={newMentor.categoryId}
                  onChange={(e) => setNewMentor({...newMentor, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagen de perfil
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                />
                {editingMentor?.image_url && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Imagen actual:</p>
                    <img 
                      src={editingMentor.image_url} 
                      alt="Current profile" 
                      className="mt-1 w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={newMentor.status}
                  onChange={(e) => setNewMentor({...newMentor, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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

export default MentorManagement;