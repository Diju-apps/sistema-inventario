import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Settings,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, update, remove } from '../utils/firebaseUtils';

const MaintenanceView = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    equipment: '',
    type: 'Preventivo',
    date: new Date().toISOString().split('T')[0],
    technician: '',
    cost: '',
    status: 'Pendiente'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintData, invData] = await Promise.all([
        getAll('maintenance'),
        getAll('inventory')
      ]);
      setMaintenance(maintData);
      setInventory(invData);
    } catch (error) {
      console.error("Error loading maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      const record = maintenance.find(m => m.id === id);
      await update('maintenance', id, { ...record, status: 'Completado' });
      setMaintenance(maintenance.map(m => 
        m.id === id ? { ...m, status: 'Completado' } : m
      ));
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de mantenimiento?')) {
      try {
        await remove('maintenance', id);
        setMaintenance(maintenance.filter(m => m.id !== id));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const filteredMaintenance = maintenance.filter(m => 
    m.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Historial de Mantenimientos</h1>
      </div>

      <div className="table-container">
        <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar por equipo o técnico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>EQUIPO / ID</th>
              <th>TIPO</th>
              <th>FECHA</th>
              <th>TÉCNICO</th>
              <th>COSTO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaintenance.length > 0 ? filteredMaintenance.map((record) => (
              <tr key={record.id}>
                <td>
                  <span style={{ fontWeight: 600, display: 'block' }}>{record.equipment}</span>
                </td>
                <td>
                  <span className={`badge ${record.type === 'Correctivo' ? 'badge-danger' : 'badge-warning'}`}>
                    {record.type}
                  </span>
                </td>
                <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14}/> {record.date}</span></td>
                <td>{record.technician}</td>
                <td style={{ fontWeight: 600 }}>${record.cost || '0.00'}</td>
                <td>
                  <span className={`badge ${record.status === 'Completado' ? 'badge-success' : 'badge-warning'}`}>
                    {record.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {record.status === 'Pendiente' && (
                      <button 
                        onClick={() => handleComplete(record.id)}
                        style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <CheckCircle size={16}/> Marcar Listo
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(record.id)}
                      style={{ color: 'var(--danger)', padding: '0.25rem' }} 
                      title="Eliminar registro"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay registros de mantenimiento</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceView;
