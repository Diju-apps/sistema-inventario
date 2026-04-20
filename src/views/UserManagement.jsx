import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, ShieldAlert, Ban, UserPlus, Search, MoreVertical, Mail, User as UserIcon, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAll, update } from '../utils/firebaseUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAll('users');
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'normal' : 'admin';
      await update('users', userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Error al actualizar rol");
    }
  };

  const handleToggleBan = async (userId, currentBanStatus) => {
    try {
      await update('users', userId, { isBanned: !currentBanStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentBanStatus } : u));
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Gestión de Usuarios</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar usuario o nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>NOMBRE / CARRERA</th>
              <th>ROL</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Cargando usuarios...</td></tr>
            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id || user.username} style={{ opacity: user.isBanned ? 0.6 : 1 }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.username}</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'block', fontWeight: 500 }}>{user.name || 'N/A'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <GraduationCap size={12}/> {user.carrera || 'No especificada'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {user.role === 'admin' ? <Shield size={12}/> : <UserIcon size={12}/>}
                    {user.role === 'admin' ? 'Administrador' : 'Normal'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isBanned ? 'badge-danger' : 'badge-success'}`}>
                    {user.isBanned ? 'Baneado' : 'Activo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      style={{ color: user.role === 'admin' ? 'var(--warning)' : 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}
                      title={user.role === 'admin' ? "Quitar Admin" : "Hacer Admin"}
                    >
                      {user.role === 'admin' ? <ShieldAlert size={18}/> : <Shield size={18}/>}
                    </button>
                    <button 
                      onClick={() => handleToggleBan(user.id, user.isBanned)}
                      style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.75rem' }}
                      title={user.isBanned ? "Desbanear" : "Banear"}
                    >
                      <Ban size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
