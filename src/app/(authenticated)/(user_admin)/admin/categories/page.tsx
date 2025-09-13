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

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    status: true,
    imageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setIsInitialLoading(true);
      const categoriesCol = collection(db, 'category');
      const categoriesSnapshot = await getDocs(query(categoriesCol, orderBy('categoryName', 'asc')));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        categoryId: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
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
    if (!newCategory.categoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = editingCategory?.imageUrl || '';
      
      if (selectedFile) {
        const imageRef = ref(storage, `categories/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);

        if (editingCategory?.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingCategory.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      }

      const categoryData = {
        categoryName: newCategory.categoryName,
        status: newCategory.status,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingCategory) {
        const categoryRef = doc(db, 'category', editingCategory.categoryId);
        await updateDoc(categoryRef, categoryData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await addDoc(collection(db, 'category'), {
          ...categoryData,
          createdAt: new Date().toISOString()
        });
        toast.success('Categoría creada exitosamente');
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
      try {
        if (category.imageUrl) {
          const imageRef = ref(storage, category.imageUrl);
          await deleteObject(imageRef);
        }
        
        await deleteDoc(doc(db, 'category', category.categoryId));
        toast.success('Categoría eliminada exitosamente');
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      categoryName: category.categoryName,
      status: category.status,
      imageUrl: category.imageUrl
    });
    setPreviewUrl(category.imageUrl);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewCategory({
      categoryName: '',
      status: true,
      imageUrl: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  // Filtrar y paginar categorías
  const filteredCategories = categories.filter(category => 
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-8 w-full min-h-screen max-h-screen overflow-y-scroll mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestionar Categorías</h1>
        
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar categoría
          </button>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar categorías..."
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {isInitialLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg shadow-sm p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No se encontraron categorías</p>
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <div key={category.categoryId} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="h-32 relative bg-gray-100">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.categoryName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm">
                      {category.categoryName}
                    </h3>
                    <span className={`text-xs ${
                      category.status ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={resetForm}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={newCategory.categoryName}
                  onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagen
                </label>
                <div className="mt-2">
                  {(previewUrl || editingCategory?.imageUrl) && (
                    <div className="mb-4">
                      <img
                        src={previewUrl || editingCategory?.imageUrl}
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={newCategory.status.toString()}
                  onChange={(e) => setNewCategory({...newCategory, status: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
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

export default CategoryManagement;