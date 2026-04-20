import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Laptop, 
  UserCheck, 
  Wrench, 
  BarChart3, 
  ChevronRight, 
  Database,
  Users
} from 'lucide-react';
import '../App.css';

const Sidebar = ({ user }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Inventario', icon: <Laptop size={20} />, path: '/inventario' },
    { name: 'Asignaciones', icon: <UserCheck size={20} />, path: '/asignaciones', adminOnly: true },
    { name: 'Mantenimiento', icon: <Wrench size={20} />, path: '/mantenimiento', adminOnly: true },
    { name: 'Reportes', icon: <BarChart3 size={20} />, path: '/reportes' },
    { name: 'Gestión Usuarios', icon: <Users size={20} />, path: '/usuarios', adminOnly: true },
  ];

  const filteredItems = menuItems.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">
          <Database size={24} />
        </div>
        <div className="logo-text">
          <span>INVENTARIO</span><br/>
          <span>CORPOELEC</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <p>© 2026 Corp Tech IT</p>
        <p>V 1.0.0 Alpha</p>
      </div>
    </aside>
  );
};

export default Sidebar;
