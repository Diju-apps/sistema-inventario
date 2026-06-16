import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Inventory from './views/Inventory';
import Assignments from './views/Assignments';
import Maintenance from './views/Maintenance';
import Reports from './views/Reports';
import Login from './views/Login';
import { LogOut, User as UserIcon, Settings, Key, GraduationCap, X, Check } from 'lucide-react';
import UserManagement from './views/UserManagement';
import MigrationTool from './components/MigrationTool';
import './App.css';

const ProfileModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    carrera: user.carrera || '',
    password: user.password || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-card"
      >
        <div className="modal-header">
          <h3>Mi Perfil</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="login-form" style={{ padding: '1.5rem 2rem' }}>
          <div className="input-group">
            <label>Nombre Completo</label>
            <div className="input-with-icon">
              <UserIcon size={18} className="icon" />
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <UserIcon size={18} className="icon" />
              <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label>Carrera / Especialidad</label>
            <div className="input-with-icon">
              <GraduationCap size={18} className="icon" />
              <input type="text" value={formData.carrera} onChange={(e) => setFormData({...formData, carrera: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Key size={18} className="icon" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="login-submit">
            Guardar Cambios <Check size={18}/>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Topbar = ({ user, onLogout, onOpenProfile, onOpenMigration }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="topbar-vintage">
      <div className="topbar-logo-wrap">
        <img 
          src="/sistema-inventario/corpoelec_logo.png" 
          alt="Logo de la Empresa" 
          className="topbar-logo-vintage"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div>
          <div className="topbar-brand-sub">Sistema de Gestión IT</div>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {user?.role === 'admin' && (
          <button 
            onClick={onOpenMigration}
            style={{ 
              padding: '0.4rem 0.9rem', 
              background: 'var(--bg-paper)', 
              color: 'var(--accent)', 
              border: '1px solid var(--accent)', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            }}
          >
            <Settings size={13} /> Migrar a Firebase
          </button>
        )}
        <div style={{ textAlign: 'right', cursor: 'pointer', fontFamily: 'monospace' }} onClick={() => setShowMenu(!showMenu)}>
          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)', letterSpacing: '0.04em' }}>{user?.name || user?.username}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
          </p>
        </div>
        <div 
          onClick={() => setShowMenu(!showMenu)}
          style={{ 
            width: '38px', 
            height: '38px', 
            background: 'var(--primary)', 
            border: '2px solid var(--primary-dark)', 
            color: 'var(--text-inverse)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            cursor: 'pointer', 
            fontFamily: 'serif',
            fontSize: '1rem' 
          }}
        >
          {user?.username?.[0].toUpperCase() || 'U'}
        </div>
        
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="profile-dropdown"
          >
            <div className="dropdown-item" onClick={() => { onOpenProfile(); setShowMenu(false); }}>
              <Settings size={15} /> Configuración
            </div>
            <div className="dropdown-item danger" onClick={onLogout}>
              <LogOut size={15} /> Cerrar Sesión
            </div>
          </motion.div>
        )}

        <button 
          onClick={onLogout}
          title="Cerrar Sesión"
          style={{ 
            color: 'var(--danger)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '0.4rem', 
            border: '1px solid var(--danger)', 
            background: '#f5e8e8' 
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleUpdateProfile = (newData) => {
    const finalUser = { ...user, ...newData };
    setUser(finalUser);
    localStorage.setItem('currentUser', JSON.stringify(finalUser));
  };

  if (loading) return null;

  return (
    <Router>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="layout-container">
          <Sidebar user={user} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Topbar 
              user={user} 
              onLogout={handleLogout} 
              onOpenProfile={() => setShowProfile(true)} 
              onOpenMigration={() => setShowMigration(true)}
            />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/inventario" element={<Inventory user={user} />} />
                <Route path="/asignaciones" element={user.role === 'admin' ? <Assignments user={user} /> : <Navigate to="/" />} />
                <Route path="/mantenimiento" element={user.role === 'admin' ? <Maintenance user={user} /> : <Navigate to="/" />} />
                <Route path="/reportes" element={<Reports user={user} />} />
                <Route path="/usuarios" element={user.role === 'admin' ? <UserManagement /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            {showProfile && (
              <ProfileModal 
                user={user} 
                onClose={() => setShowProfile(false)} 
                onUpdate={handleUpdateProfile} 
              />
            )}
            <MigrationTool 
              isOpen={showMigration} 
              onClose={() => setShowMigration(false)} 
            />
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
