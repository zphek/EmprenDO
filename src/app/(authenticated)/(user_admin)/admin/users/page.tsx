'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, Edit } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db } from '@/firebase';

const UserManagementUI = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'Activo',
    cedula: ''
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      let filtered = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (selectedRole !== 'all') {
        filtered = filtered.filter(user => user.role === selectedRole);
      }

      setFilteredUsers(filtered);
    }
  }, [searchTerm, selectedRole, users]);

  // Reemplaza la función fetchAllUsers con esta versión:
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from Firestore
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        firestoreId: doc.id // Mantener referencia al ID de Firestore
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
      try {
        if (isEditMode && selectedUser) {
          // Update existing user in Firestore
          const userData = {
            name: formData.name,
            role: formData.role,
            status: formData.status,
            cedula: formData.cedula,
            updatedAt: new Date().toISOString()
          };
    
          await setDoc(doc(db, 'users', selectedUser.id), userData, { merge: true });
        } else {
          // Create new user in Auth and then in Firestore
          const auth = getAuth();
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            'DefaultPassword123!' // Implementa un sistema seguro de contraseñas
          );
    
          const userData = {
            uid: userCredential.user.uid,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            cedula: formData.cedula,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
    
          await addDoc(collection(db, 'users'), userData);
        }
    
        await fetchAllUsers();
        handleCloseModal();
      } catch (error) {
        console.error('Error managing user:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteUser = async (user) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        setLoading(true);
        
        // Solo eliminamos de Firestore
        if (user.id) {
          await deleteDoc(doc(db, 'users', user.id));
          await fetchAllUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || 'Activo',
      cedula: user.cedula || ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'Activo',
      cedula: ''
    });
  };

  const formatDate = (dateString:any) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl min-h-screen mx-auto text-center">
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl min-h-screen mx-auto text-red-500">
        {error}
      </div>
    );
  }
  return (
    <div className="p-8 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Gestionar usuarios</h1>
        
        {/* Botones y filtros */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2"
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Registrar usuario
          </button>
          
          {/* Búsqueda y filtros */}
          <div className="flex gap-4 flex-1 justify-end">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-4 max-h-screen overflow-y-scroll">
        {filteredUsers.map((user) => (
          <div key={user.uid} className="bg-white border rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {user.name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        Cédula: {user.cedula || 'No registrada'}
                      </span>
                      <span className="text-sm text-gray-500 ml-4">
                        Estado: {user.status || 'Activo'}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-4">
                        {user.role || 'Sin rol'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-6 h-6" />
                  </button>
                  <button 
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de crear/editar usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={handleCloseModal}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              {isEditMode ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ingrese el nombre del usuario"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Ingrese el correo electrónico"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                  placeholder="Ingrese la cédula"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rol de usuario
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
};

export default UserManagementUI;