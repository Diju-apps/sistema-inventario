import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { migrateFromLocalStorage } from '../utils/firebaseUtils';

const MigrationTool = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleMigrate = async () => {
    setLoading(true);
    try {
      const data = await migrateFromLocalStorage();
      setResults(data);
    } catch (error) {
      alert("Error en la migración: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="modal-card"
            style={{ maxWidth: '500px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Database size={24} color="var(--primary)" />
                <h3>Migración a Firebase</h3>
              </div>
              <button onClick={onClose}><X size={20}/></button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Esto subirá todos sus registros locales (Inventario, Usuarios, Asignaciones y Mantenimientos) a su nueva base de datos de Firebase.
              </p>

              {results ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(results).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ color: value.includes('Already') ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                  <button 
                    onClick={onClose}
                    className="login-submit"
                    style={{ marginTop: '1rem' }}
                  >
                    Cerrar y Usar Firebase
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                   <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertTriangle color="#d97706" size={20} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: '#92400e', textAlign: 'left' }}>
                      Asegúrese de que el sistema esté configurado correctamente. Esta acción solo migrará datos si las colecciones en Firebase están vacías.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleMigrate}
                    disabled={loading}
                    className="login-submit"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    {loading ? (
                      <><RefreshCw size={18} className="animate-spin" /> Migrando datos...</>
                    ) : (
                      <><Database size={18} /> Iniciar Migración Ahora</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MigrationTool;
