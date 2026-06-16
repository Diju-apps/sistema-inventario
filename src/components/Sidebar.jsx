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
      <div className="logo-section" style={{ marginBottom: '2rem' }}>
        <img 
          src="/sistema-inventario/logo_figura.png" 
          alt="Logo CORPOELEC" 
          className="logo-vintage-figura" 
        />
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

      <div className="sidebar-footer">
        © {new Date().getFullYear()} CORPOELEC
      </div>
    </aside>
  );
};

export default Sidebar;
