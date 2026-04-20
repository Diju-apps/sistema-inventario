import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  MapPin, 
  History, 
  Search, 
  Plus, 
  Users, 
  Building2,
  Calendar,
  MoreVertical,
  Link as LinkIcon,
  X,
  Check,
  Laptop,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentCard = ({ id, employee, area, equipment, date, status, delay, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="stat-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
          {employee?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div>
          <span style={{ display: 'block', fontWeight: 700, fontSize: '1rem' }}>{employee}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12}/> {area}</span>
        </div>
      </div>
      <button onClick={() => onDelete(id)} style={{ color: 'var(--danger)', padding: '0.5rem' }} title="Eliminar"><Trash2 size={18}/></button>
    </div>

    <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Equipo Asignado</span>
      <p style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '0.25rem' }}>{equipment}</p>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14}/> {date}</span>
      <span className="badge badge-success">{status}</span>
    </div>
  </motion.div>
);

const AssignmentsView = () => {
  const [assignments, setAssignments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    area: '',
    equipment: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Asignado'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignData, invData] = await Promise.all([
        getAll('assignments'),
        getAll('inventory')
      ]);
      setAssignments(assignData);
      setInventory(invData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const saved = await add('assignments', formData);
      setAssignments([saved, ...assignments]);
      setShowModal(false);
      setFormData({
        employee: '',
        area: '',
        equipment: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Asignado'
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta asignación?')) {
      try {
        await remove('assignments', id);
        setAssignments(assignments.filter(a => a.id !== id));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.equipment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Asignación de Responsables</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LinkIcon size={20} /> Nueva Asignación
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
         <div style={{ position: 'relative', maxWidth: '500px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar responsable, área o equipo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem', background: 'white' }}
            />
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredAssignments.length > 0 ? filteredAssignments.map((item, idx) => (
          <AssignmentCard key={item.id} {...item} delay={idx * 0.05} onDelete={handleDelete} />
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No hay asignaciones registradas.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-card"
            >
              <div className="modal-header">
                <h3>Nueva Asignación</h3>
                <button onClick={() => setShowModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSave} className="login-form" style={{ padding: '1.5rem 2rem' }}>
                <div className="input-group">
                  <label>Trabajador / Responsable</label>
                  <input required type="text" value={formData.employee} onChange={(e) => setFormData({...formData, employee: e.target.value})} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="input-group">
                  <label>Área o Departamento</label>
                  <input required type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} placeholder="Ej: Gerencia de Distribución" />
                </div>
                <div className="input-group">
                  <label>Seleccionar Equipo del Inventario</label>
                  <select required value={formData.equipment} onChange={(e) => setFormData({...formData, equipment: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <option value="">-- Seleccione un equipo --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={`${item.description} (${item.id})`}>
                        {item.description} - {item.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Fecha de Asignación</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <button type="submit" className="login-submit">
                  Confirmar Asignación <Check size={18}/>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentsView;
