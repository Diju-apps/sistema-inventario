import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search,
  BarChart,
  Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { getAll } from '../utils/firebaseUtils';

const ReportsView = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getAll('inventory');
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory for reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      if (!inventory || inventory.length === 0) {
        alert("Atención: No hay equipos registrados en el inventario para generar un reporte.");
        return;
      }

      console.log("Generando PDF con datos:", inventory);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- HEADER ---
      doc.setFillColor(220, 38, 38);
      doc.rect(14, 15, 40, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("CORPOELEC", 20, 25);

      doc.setTextColor(17, 24, 39);
      doc.setFontSize(22);
      doc.text("REPORTE DE INVENTARIO", 60, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Sistema Automatizado de Gestión de Activos Tecnológicos", 60, 31);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 40, pageWidth - 14, 40);

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      const today = new Date().toLocaleString();
      doc.text(`Fecha de Emisión: ${today}`, 14, 48);
      doc.text(`Total Activos: ${inventory.length}`, 14, 53);
      doc.text("Departamento: Tecnologías de la Información (IT)", 14, 58);

      // --- TABLE ---
      const tableHeaders = [["ID", "Descripción", "Marca / Modelo", "Serial", "Ubicación", "Estado"]];
      const tableData = inventory.map(item => [
        item.id || '-',
        item.description || '-',
        `${item.brand || '-'} / ${item.model || '-'}`,
        item.serial || '-',
        item.location || '-',
        item.status || '-'
      ]);

      autoTable(doc, {
        startY: 65,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [220, 38, 38], 
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'center'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [220, 38, 38] },
          5: { fontStyle: 'bold', halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252]
        }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(156, 163, 175);
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          doc.text(`Página ${i} de ${pageCount}`, pageW - 30, pageH - 10);
          doc.text("Documento oficial generado por INVENTARIO CORPOELEC", 14, pageH - 10);
      }

      doc.save(`Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error crítico al generar PDF: " + error.message);
    }
  };

  const filteredReports = inventory.filter(i => 
    (i.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (i.id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="animate-fadeIn" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos del reporte...</div>;

  return (
    <div className="animate-fadeIn">
      <div className="content-header">
        <h1 className="page-title">Reportes y Consultas</h1>
        <button 
          onClick={generatePDF}
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}
        >
          <FileText size={20} /> Generar Reporte PDF Profesional
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', background: '#fef2f2', color: 'var(--primary)', borderRadius: '12px' }}>
              <BarChart size={24}/>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Activos en Reporte</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{inventory.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Filtrar vista previa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
            />
          </div>
        </div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>EQUIPO</th>
              <th>UBICACION</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? filteredReports.map((report) => (
              <tr key={report.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{report.id}</td>
                <td>{report.description}</td>
                <td>{report.location}</td>
                <td>
                  <span className={`badge ${report.status === 'Operativo' ? 'badge-success' : report.status === 'En Mantenimiento' ? 'badge-warning' : 'badge-danger'}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay datos para mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsView;
