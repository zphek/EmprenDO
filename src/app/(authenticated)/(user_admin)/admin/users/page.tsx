'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import { listAllUsers } from '../../../../../../actions/userActions';

const UserManagementUI = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    status: 'Activo'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      let filtered = users.filter((user:any) => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (selectedRole !== 'all') {
        filtered = filtered.filter(user => user.role === selectedRole);
      }

      setFilteredUsers(filtered);
    }
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers:any = await listAllUsers();
      // Añadir roles por defecto si no existen
      const usersWithRoles = fetchedUsers.map((user:any) => ({
        ...user,
        role: user.role || 'viewer',
        status: user.status || 'Activo'
      }));
      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Aquí implementarías la lógica de registro con Firebase
      // Por ejemplo: await registerUser(newUser);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      await fetchUsers(); // Recargar usuarios
      setIsModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        role: '',
        status: 'Activo'
      });
    } catch (error) {
      console.error('Error registering user:', error);
    } finally {
      setIsLoading(false);
    }
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
        
        <div className="flex justify-between items-center gap-4 mb-6">
          <button 
            className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Registrar usuario
          </button>
          
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

      <div className="space-y-4">
        {filteredUsers.map((user:any) => (
          <div key={user.uid} className="bg-white border rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 font-medium">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {user.displayName || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">
                        Estado: {user.status || 'Activo'}
                      </span>
                      <span className="text-sm text-gray-500 ml-4">
                        Registro: {formatDate(user.createdAt)}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-4">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  aria-label="Eliminar usuario"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron usuarios
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-6">Registrar Nuevo Usuario</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ingrese el nombre del usuario"
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
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Ingrese el correo electrónico"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rol de usuario
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
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
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value})}
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
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

export default UserManagementUI;