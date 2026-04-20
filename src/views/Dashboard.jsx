import React, { useState, useEffect } from 'react';
import { 
  Laptop, CheckCircle, Wrench, Trash2, AlertTriangle, TrendingUp, FileText, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, add, update } from '../utils/firebaseUtils';

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="stat-card"
  >
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
  </motion.div>
);

const MaintenanceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    equipment: '',
    type: 'Preventivo',
    date: new Date().toISOString().split('T')[0],
    technician: '',
    cost: '',
    status: 'Pendiente'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventory, assignments, maintenance] = await Promise.all([
        getAll('inventory'),
        getAll('assignments'),
        getAll('maintenance')
      ]);

      const now = new Date();
      const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;

      const newAlerts = inventory.map(item => {
        const activeMaint = maintenance.find(m => m.equipment.includes(item.id) && m.status === 'Pendiente');
        const itemAsgn = assignments
          .filter(a => a.equipment.includes(item.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const itemMaint = maintenance
          .filter(m => m.equipment.includes(item.id) && m.status === 'Completado')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const assignmentDate = itemAsgn ? new Date(itemAsgn.date) : null;
        const maintenanceDate = itemMaint ? new Date(itemMaint.date) : null;
        const creationDate = new Date(item.dateCreated || now);

        const lastReferenceDate = [assignmentDate, maintenanceDate, creationDate]
          .filter(Boolean)
          .sort((a, b) => b - a)[0];

        const diff = now - lastReferenceDate;
        const needsMaintenance = diff > sixMonthsInMs || activeMaint;
        
        if (needsMaintenance && item.status === 'Operativo') {
          return {
            id: item.id,
            equipment: item.description,
            type: itemAsgn ? 'Preventivo Post-Asignación' : 'Preventivo Sugerido',
            limitDate: new Date(lastReferenceDate.getTime() + sixMonthsInMs).toLocaleDateString(),
            activeMaint: activeMaint
          };
        }
        return null;
      }).filter(Boolean);

      setAlerts(newAlerts);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (alert) => {
    setSelectedAlert(alert);
    setFormData({ ...formData, equipment: `${alert.equipment} (${alert.id})` });
    setShowModal(true);
  };

  const handleSaveMaint = async (e) => {
    e.preventDefault();
    try {
      await add('maintenance', { ...formData, dateCreated: new Date().toISOString() });
      setShowModal(false);
      loadData();
    } catch (error) {
      alert("Error al guardar mantenimiento");
    }
  };

  const handleMarkDone = async (maintId) => {
    try {
      await update('maintenance', maintId, { status: 'Completado' });
      loadData();
    } catch (error) {
      alert("Error al actualizar mantenimiento");
    }
  };

  const viewOrder = (maint) => {
    setSelectedAlert(maint);
    setShowOrder(true);
  };

  return (
    <div className="table-container" style={{ padding: '0' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle color="var(--warning)" size={20} /> Alertas de Mantenimiento
        </h3>
      </div>
      <table className="modern-table">
        <thead>
          <tr>
            <th>EQUIPO</th>
            <th>MOTIVO</th>
            <th>FECHA LÍMITE</th>
            <th>GESTIÓN</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? alerts.map((alert) => (
            <tr key={alert.id}>
              <td style={{ fontWeight: 600 }}>{alert.equipment}</td>
              <td style={{ fontSize: '0.75rem' }}>{alert.type}</td>
              <td>{alert.limitDate}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!alert.activeMaint ? (
                    <button 
                      onClick={() => handleOpenAssign(alert)}
                      style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                    >
                      Asignar Mant.
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => viewOrder(alert.activeMaint)}
                        style={{ background: '#f1f5f9', color: 'var(--text-main)', fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, border: '1px solid var(--border)' }}
                      >
                        Ver Ordenanza
                      </button>
                      <button 
                        onClick={() => handleMarkDone(alert.activeMaint.id)}
                        style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                      >
                        Marcar Realizado
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay alertas activas</td>
            </tr>
          )}
        </tbody>
      </table>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="modal-card">
              <div className="modal-header">
                <h3>Asignar Mantenimiento</h3>
                <button onClick={() => setShowModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveMaint} className="login-form" style={{ padding: '1.5rem 2rem' }}>
                <div className="input-group">
                  <label>Equipo</label>
                  <input readOnly value={formData.equipment} />
                </div>
                <div className="input-group">
                  <label>Técnico Encargado</label>
                  <input required placeholder="Nombre del técnico" value={formData.technician} onChange={(e) => setFormData({...formData, technician: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Costo Estimado ($)</label>
                  <input type="number" placeholder="0.00" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
                </div>
                <button type="submit" className="login-submit">
                  Generar Ordenanza <Check size={18}/>
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showOrder && selectedAlert && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><FileText size={48} style={{ margin: '0 auto' }}/></div>
              <h3 style={{ marginBottom: '1rem' }}>Ordenanza de Mantenimiento</h3>
              <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p><strong>Equipo:</strong> {selectedAlert.equipment}</p>
                <p><strong>Técnico:</strong> {selectedAlert.technician}</p>
                <p><strong>Costo:</strong> ${selectedAlert.cost}</p>
                <p><strong>Estado:</strong> <span style={{ color: 'var(--warning)' }}>Pendiente</span></p>
              </div>
              <button onClick={() => setShowOrder(false)} className="login-submit" style={{ marginTop: '1.5rem', background: 'var(--text-main)' }}>Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    operative: 0,
    maintenance: 0,
    decommissioned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const inventory = await getAll('inventory');
      setStats({
        total: inventory.length,
        operative: inventory.filter(i => i.status === 'Operativo').length,
        maintenance: inventory.filter(i => i.status === 'En Mantenimiento').length,
        decommissioned: inventory.filter(i => i.status === 'Desincorporado').length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Resumen del Inventario</h1>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span>Actualizado: Hoy, {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Equipos" value={stats.total} icon={<Laptop size={24}/>} color="#dc2626" delay={0.1} />
        <StatCard label="Operativos" value={stats.operative} icon={<CheckCircle size={24}/>} color="#10b981" delay={0.2} />
        <StatCard label="En Mantenimiento" value={stats.maintenance} icon={<Wrench size={24}/>} color="#f59e0b" delay={0.3} />
        <StatCard label="Desincorporados" value={stats.decommissioned} icon={<Trash2 size={24}/>} color="#ef4444" delay={0.4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <MaintenanceAlerts />
        
        <div className="table-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp color="var(--primary)" size={20} /> Tendencias
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Estado de Salud General</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {stats.total > 0 ? Math.round((stats.operative / stats.total) * 100) : 0}% Equipos OK
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Tasa de Mantenimiento</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {stats.total > 0 ? Math.round((stats.maintenance / stats.total) * 100) : 0}% Actualmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
