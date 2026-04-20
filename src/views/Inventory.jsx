import React, { useState, useEffect } from 'react';
import { 
  Laptop, Search, Plus, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, X, Check, Monitor, Server, Printer, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, add, update, remove } from '../utils/firebaseUtils';

const InventoryView = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    brand: '',
    model: '',
    serial: '',
    location: '',
    assignedUser: '',
    status: 'Operativo'
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getAll('inventory');
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await update('inventory', isEditing, formData);
        setInventory(inventory.map(item => item.id === isEditing ? { ...formData, id: isEditing } : item));
      } else {
        const newItemData = {
          ...formData,
          dateCreated: new Date().toISOString()
        };
        const savedItem = await add('inventory', newItemData);
        setInventory([...inventory, savedItem]);
      }
      resetForm();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      brand: '',
      model: '',
      serial: '',
      location: '',
      assignedUser: '',
      status: 'Operativo'
    });
    setShowModal(false);
    setIsEditing(null);
  };

  const handleEdit = (item) => {
    setFormData({
      description: item.description,
      brand: item.brand,
      model: item.model,
      serial: item.serial,
      location: item.location,
      assignedUser: item.assignedUser,
      status: item.status
    });
    setIsEditing(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await remove('inventory', id);
        setInventory(inventory.filter(item => item.id !== id));
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const filteredData = inventory.filter(item => 
    Object.values(item).some(val => 
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Gestión de Inventario</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} /> Añadir Nuevo Equipo
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID, Marca o Modelo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            />
          </div>
          {loading && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Cargando...</span>}
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>ID INVENTARIO</th>
              <th>DESCRIPCIÓN / UBICACIÓN</th>
              <th>MARCA / MODELO</th>
              <th>SERIAL</th>
              <th>USUARIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.75rem' }}>{item.id}</td>
                <td>
                  <span style={{ display: 'block', fontWeight: 600 }}>{item.description}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</span>
                </td>
                <td>
                  <span style={{ display: 'block', fontWeight: 600 }}>{item.brand}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.model}</span>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{item.serial}</td>
                <td>{item.assignedUser || 'Sin asignar'}</td>
                <td>
                  <span className={`badge ${item.status === 'Operativo' ? 'badge-success' : item.status === 'En Mantenimiento' ? 'badge-warning' : 'badge-danger'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(item)} style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Editar"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)', padding: '0.25rem' }} title="Eliminar"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Cargando inventario...' : 'No hay equipos registrados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span>Mostrando {filteredData.length} equipos</span>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-card"
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-header">
                <h3>{isEditing ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</h3>
                <button onClick={resetForm}><X size={20}/></button>
              </div>
              <form onSubmit={handleSave} className="login-form" style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Descripción del Equipo</label>
                  <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ej: Laptop Dell Latitude 5420" />
                </div>
                <div className="input-group">
                  <label>Marca</label>
                  <input required type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="Ej: HP, Dell, Cisco..." />
                </div>
                <div className="input-group">
                  <label>Modelo</label>
                  <input required type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} placeholder="Ej: ProBook 450 G8" />
                </div>
                <div className="input-group">
                  <label>Serial</label>
                  <input required type="text" value={formData.serial} onChange={(e) => setFormData({...formData, serial: e.target.value})} placeholder="Número de serie" />
                </div>
                <div className="input-group">
                  <label>Ubicación / Área</label>
                  <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Ej: Piso 3, Oficina 302" />
                </div>
                <div className="input-group">
                  <label>Usuario Asignado</label>
                  <input type="text" value={formData.assignedUser} onChange={(e) => setFormData({...formData, assignedUser: e.target.value})} placeholder="Nombre del trabajador" />
                </div>
                <div className="input-group">
                  <label>Estado Actual</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <option value="Operativo">Operativo</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Desincorporado">Desincorporado</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="login-submit" style={{ flex: 1 }}>
                    {isEditing ? 'Guardar Cambios' : 'Registrar Equipo'} <Check size={18}/>
                  </button>
                  <button type="button" onClick={resetForm} className="login-submit" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryView;

