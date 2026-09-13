import { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  FileSpreadsheet,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  Search,
  Download,
  X,
  MapPin,
  User,
  Cpu,
  Send,
  Sparkles,
  Info,
  Battery
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { MONTHLY_OUTBREAKS } from './data/mockData';

// ─── Backend URL — Uses VITE_API_URL or defaults to Cloud Render backend ──────────
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://cocoashield-backend.onrender.com';

// presaved catalog of recommendations for custom prescriptions
const RECOMMENDATION_TEMPLATES = {
  'Monilia': 'Aplicar remoción de mazorcas infectadas antes de la esporulación. Realizar podas fitosanitarias para facilitar la aireación del dosel. Cubrir frutos caídos con hojarasca para bloquear la dispersión por viento.',
  'Escoba de Bruja': 'Cortar ramas deformadas (escobas) a 30 cm por debajo de la base infectada. Desinfectar herramientas de corte con alcohol al 70% o solución de cloro. Enterrar o quemar residuos vegetales retirados.',
  'Mazorca Negra': 'Mejorar el drenaje del terreno para reducir la escorrentía superficial. Realizar podas para permitir mayor entrada de radiación solar directa. Retirar frutos momificados en el suelo.',
  'Sano': 'Mantener cronograma regular de deshierbe y monitoreo preventivo semanal. Aplicar abonos orgánicos balanceados para mantener el vigor inmunológico de la planta.'
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connected' | 'connecting' | 'offline'
  const sseRef = useRef(null);

  // Cases loaded from backend (source of truth)
  const [cases, setCases] = useState([]);

  // Monthly outbreak chart data
  const [monthlyData, setMonthlyData] = useState(MONTHLY_OUTBREAKS);

  const [toasts, setToasts] = useState([]);
  const [showMobileSimulator, setShowMobileSimulator] = useState(false);

  // Selection/Detail Modals State
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);
  const [prescriptionCase, setPrescriptionCase] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [technicianName, setTechnicianName] = useState('Ing. Agr. Santiago Viteri');

  // Map Interactive State
  const [selectedMapCase, setSelectedMapCase] = useState(null);

  // Map Filter State
  const [filterRegion, setFilterRegion] = useState('Todas');
  const [filterDateRange, setFilterDateRange] = useState('Todos');
  const [filterCropType, setFilterCropType] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Map GPS points to SVG layout coordinates and assign region
  const mapGpsToSvg = (lat, lng) => {
    // Preset markers mapping to match mockData.js coordinate style
    if (lat === -1.0234 && lng === -77.5432) return { x: 190, y: 155, region: 'Sucumbíos' };
    if (lat === -1.0289 && lng === -77.5478) return { x: 280, y: 295, region: 'Napo' };
    if (lat === -1.0321 && lng === -77.5385) return { x: 370, y: 120, region: 'Sucumbíos' };
    if (lat === -1.0256 && lng === -77.5401) return { x: 230, y: 205, region: 'Napo' };
    if (lat === -1.0310 && lng === -77.5502) return { x: 110, y: 330, region: 'Orellana' };
    if (lat === -1.0198 && lng === -77.5460) return { x: 310, y: 80, region: 'Pastaza' };
    if (lat === -1.0345 && lng === -77.5350) return { x: 440, y: 250, region: 'Napo' };
    if (lat === -1.0271 && lng === -77.5419) return { x: 250, y: 180, region: 'Sucumbíos' };
    if (lat === -1.0233 && lng === -77.5388) return { x: 340, y: 140, region: 'Napo' };
    if (lat === -1.0299 && lng === -77.5467) return { x: 170, y: 260, region: 'Napo' };
    if (lat === -1.0215 && lng === -77.5510) return { x: 80, y: 190, region: 'Pastaza' };
    if (lat === -1.0330 && lng === -77.5330) return { x: 410, y: 320, region: 'Orellana' };

    // Bounding coordinates mapping for interpolation of new/dynamic points
    const minLat = -1.036;
    const maxLat = -1.018;
    const minLng = -77.552;
    const maxLng = -77.531;

    // Linear mapping to SVG viewBox (x: 40 to 460, y: 40 to 360)
    const x = 40 + ((lng - minLng) / (maxLng - minLng)) * 420;
    const y = 360 - ((lat - minLat) / (maxLat - minLat)) * 320;

    // Region assignment by quadrants using ternary to avoid no-useless-assignment lint error
    const region = lng < -77.544
      ? (lat < -1.027 ? 'Orellana' : 'Pastaza')
      : (lat < -1.027 ? 'Napo' : 'Sucumbíos');

    return {
      x: Math.max(40, Math.min(460, x)),
      y: Math.max(40, Math.min(360, y)),
      region
    };
  };

  // Add toast alert helper
  const addToast = (title, msg) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Helper: apply an incoming case event to state
  const applyNewCase = (newCase) => {
    setCases(prevCases => {
      const duplicate = prevCases.find(c => c.id === newCase.id);
      if (duplicate) return prevCases;
      const updated = [newCase, ...prevCases];

      addToast(
        '🔔 Nuevo Escaneo desde App Móvil',
        `Diagnóstico: ${newCase.diagnosis} (${newCase.confidence}%) en ${newCase.location}.`
      );

      // Update monthly chart dynamically
      setMonthlyData(prevMonthly => {
        const dateObj = new Date(newCase.date);
        const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const caseMonth = monthsNames[dateObj.getMonth()] || 'May';
        return prevMonthly.map(m => {
          if (m.month === caseMonth && newCase.diagnosis !== 'Sano') {
            let key = 'Monilia';
            if (newCase.diagnosis === 'Escoba de Bruja') key = 'EscobaDebruja';
            if (newCase.diagnosis === 'Mazorca Negra') key = 'MazorcaNegra';
            return { ...m, [key]: (m[key] || 0) + 1 };
          }
          return m;
        });
      });

      return updated;
    });
  };

  // ── 1. Load initial cases from backend on mount ────────────────────────────
  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/cases`, {
          signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) throw new Error('HTTP error');
        const data = await response.json();
        setCases(data);
        setBackendStatus('connected');
      } catch {
        setBackendStatus('offline');
        addToast('⚠️ Backend no disponible', `No se pudo conectar a ${BACKEND_URL}. Verifique que el servidor esté corriendo.`);
      }
    };
    loadCases();
  }, []);

  // ── 2. SSE — Real-time push from backend ──────────────────────────────────
  useEffect(() => {
    const connectSSE = () => {
      const es = new EventSource(`${BACKEND_URL}/api/events`);
      sseRef.current = es;

      es.onopen = () => {
        setBackendStatus('connected');
        console.log('[SSE] Conexión establecida con el servidor backend.');
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'ADD_CASE') {
            applyNewCase(payload.caseData);
          } else if (payload.type === 'UPDATE_CASE') {
            // A prescription was saved from another dashboard session
            setCases(prev =>
              prev.map(c => c.id === payload.caseData.id ? payload.caseData : c)
            );
            addToast('📋 Receta Actualizada', `Caso ${payload.caseData.id} actualizado por otro técnico.`);
          } else if (payload.type === 'RESET_DB') {
            setCases(payload.cases);
            setMonthlyData(MONTHLY_OUTBREAKS);
            addToast('🔄 Base de Datos Reiniciada', 'El servidor fue reiniciado a los datos iniciales.');
          }
        } catch (e) {
          console.error('[SSE] Error parseando evento:', e);
        }
      };

      es.onerror = () => {
        setBackendStatus('offline');
        es.close();
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, []);

  // 3. Dynamic computations for Dashboard Metrics
  const metrics = useMemo(() => {
    const totalScans = cases.length;
    const activeAlerts = cases.filter(c => c.status === 'Crítico' || c.status === 'En seguimiento').length;
    
    // Compute top disease (excluding "Sano")
    const diseaseCounts = {};
    cases.forEach(c => {
      if (c.diagnosis !== 'Sano') {
        diseaseCounts[c.diagnosis] = (diseaseCounts[c.diagnosis] || 0) + 1;
      }
    });

    let topDisease = 'Ninguna';
    let maxCount = 0;
    Object.entries(diseaseCounts).forEach(([disease, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDisease = disease;
      }
    });

    return {
      totalScans,
      activeAlerts,
      topDisease: topDisease === 'Monilia' ? 'Monilia del Cacao' : topDisease,
      iotSensors: 47 // Fixed simulation
    };
  }, [cases]);

  // Pathogen donut distribution
  const pathogenPieData = useMemo(() => {
    let monilia = 0;
    let escoba = 0;
    let mazorca = 0;

    cases.forEach(c => {
      if (c.diagnosis === 'Monilia') monilia++;
      if (c.diagnosis === 'Escoba de Bruja') escoba++;
      if (c.diagnosis === 'Mazorca Negra') mazorca++;
    });

    const total = monilia + escoba + mazorca;
    if (total === 0) return [
      { name: 'Monilia', value: 0, color: '#005088' },
      { name: 'Escoba de Bruja', value: 0, color: '#11CAA0' },
      { name: 'Mazorca Negra', value: 0, color: '#F59E0B' }
    ];

    return [
      { name: 'Monilia del Cacao', value: monilia, color: '#005088', percent: Math.round((monilia / total) * 100) },
      { name: 'Escoba de Bruja', value: escoba, color: '#11CAA0', percent: Math.round((escoba / total) * 100) },
      { name: 'Mazorca Negra', value: mazorca, color: '#F59E0B', percent: Math.round((mazorca / total) * 100) }
    ];
  }, [cases]);

  // Farmer devices telemetry memo
  const devicesList = useMemo(() => {
    const map = new Map();
    const sorted = [...cases].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const c of sorted) {
      if (c.farmer && !map.has(c.farmer)) {
        map.set(c.farmer, {
          farmer: c.farmer,
          deviceModel: c.deviceModel || 'Xiaomi Redmi Note 11',
          battery: c.battery || 85,
          lastActive: c.date,
          lastLocation: c.location,
          lastDiagnosis: c.diagnosis,
          status: 'online'
        });
      }
    }
    if (map.size < 3) {
      if (!map.has('Carlos Muñoz')) {
        map.set('Carlos Muñoz', { farmer: 'Carlos Muñoz', deviceModel: 'Xiaomi Redmi Note 11', battery: 92, lastActive: '2026-05-25', lastLocation: 'Finca La Estrella – Lote A', lastDiagnosis: 'Monilia', status: 'online' });
      }
      if (!map.has('Rosa Tipán')) {
        map.set('Rosa Tipán', { farmer: 'Rosa Tipán', deviceModel: 'Samsung Galaxy A33', battery: 74, lastActive: '2026-05-24', lastLocation: 'Cooperativa Sur – Parcela 3', lastDiagnosis: 'Escoba de Bruja', status: 'online' });
      }
      if (!map.has('Ana Torres')) {
        map.set('Ana Torres', { farmer: 'Ana Torres', deviceModel: 'Motorola Moto G52', battery: 45, lastActive: '2026-05-22', lastLocation: 'Finca La Estrella – Lote B', lastDiagnosis: 'Monilia', status: 'offline' });
      }
    }
    return Array.from(map.values());
  }, [cases]);

  // 4. Filtering mechanism
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // 1. Region filter
      if (filterRegion !== 'Todas' && c.region !== filterRegion) return false;

      // 2. Date Range Filter
      if (filterDateRange !== 'Todos') {
        const caseDate = new Date(c.date);
        const baselineDate = new Date('2026-05-25'); // Custom baseline
        const diffTime = Math.abs(baselineDate - caseDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filterDateRange === '7d' && diffDays > 7) return false;
        if (filterDateRange === '30d' && diffDays > 30) return false;
      }

      // 3. Crop Type simulation mapping
      // Simulated mapping by case id
      const cropMap = {
        '0': 'Nacional (Fino de Aroma)',
        '1': 'Colección (CCN-51)',
        '2': 'Híbrido Local'
      };
      const key = (c.id.charCodeAt(c.id.length - 1) % 3).toString();
      const crop = cropMap[key] || 'Nacional (Fino de Aroma)';
      if (filterCropType !== 'Todos' && crop !== filterCropType) return false;

      // 4. Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          c.id.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query) ||
          c.farmer.toLowerCase().includes(query) ||
          c.diagnosis.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [cases, filterRegion, filterDateRange, filterCropType, searchQuery]);

  // 5. Prescription Modal Submit
  const handleOpenPrescription = (caseItem) => {
    setPrescriptionCase(caseItem);
    setPrescriptionText(caseItem.prescription || RECOMMENDATION_TEMPLATES[caseItem.diagnosis] || RECOMMENDATION_TEMPLATES['Sano']);
  };

  const handleSavePrescription = async () => {
    if (!prescriptionCase) return;

    const newStatus = prescriptionCase.status === 'Crítico' ? 'En seguimiento' : prescriptionCase.status;

    // Optimistic local update immediately
    setCases(prev => prev.map(c =>
      c.id === prescriptionCase.id
        ? { ...c, prescription: prescriptionText, status: newStatus }
        : c
    ));
    setPrescriptionCase(null);

    // Persist to backend (will broadcast via SSE to all connected dashboards)
    try {
      const response = await fetch(`${BACKEND_URL}/api/cases/prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prescriptionCase.id,
          prescription: prescriptionText,
          status: newStatus
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        addToast(
          '✅ Receta Guardada y Persistida',
          `Receta emitida para ${prescriptionCase.farmer} (${prescriptionCase.location}) y guardada en el servidor.`
        );
      } else {
        throw new Error('Server error');
      }
    } catch {
      addToast(
        '⚠️ Receta guardada localmente',
        `La receta se aplicó en pantalla, pero no se pudo persistir en el servidor (sin conexión).`
      );
    }
  };

  // 6. CSV Report Export
  const handleExportCSV = () => {
    // Excel CSV structure
    const headers = ['ID de Caso', 'Ubicación', 'Región', 'Fecha de Reporte', 'Diagnóstico IA', 'Confianza %', 'Estado del Terreno', 'Productor', 'Latitud', 'Longitud', 'Receta Técnica Emitida'];
    const rows = filteredCases.map(c => [
      c.id,
      c.location.replace(/,/g, ' '),
      c.region,
      c.date,
      c.diagnosis,
      `${c.confidence}%`,
      c.status,
      c.farmer.replace(/,/g, ' '),
      c.lat,
      c.lng,
      (c.prescription || 'N/A').replace(/,/g, ';').replace(/\n/g, ' ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF8 compatibility
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CocoaShield_Reporte_Epidemiologico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      '📥 Exportación Exitosa',
      `Se descargó el reporte CSV filtrado con ${filteredCases.length} filas para uso directo en Excel.`
    );
  };

  return (
    <div className="dashboard-root">
      {/* Toast popup notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <div className="toast-icon">
              <Sparkles size={18} />
            </div>
            <div className="toast-body">
              <h4 className="toast-title">{toast.title}</h4>
              <p className="toast-msg">{toast.msg}</p>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Left Sidebar Fixed Menu */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">CS</div>
          <div className="brand-info">
            <span className="brand-name">CocoaShield</span>
            <span className="brand-tagline">Cloud Ecosystem</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Panel Principal</span>
          </button>
          
          <button
            onClick={() => setActiveSection('map')}
            className={`nav-item ${activeSection === 'map' ? 'active' : ''}`}
          >
            <MapIcon size={18} />
            <span>Mapa Epidemiológico</span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
          >
            <FileSpreadsheet size={18} />
            <span>Gestión de Reportes</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => setShowMobileSimulator(!showMobileSimulator)}
            className={`mobile-sim-toggle-btn ${showMobileSimulator ? 'active' : ''}`}
          >
            <Smartphone size={16} />
            <span>{showMobileSimulator ? 'Cerrar Simulador' : 'Simulador Móvil'}</span>
          </button>
        </div>
      </aside>

      {/* Main Dynamic View Wrapper */}
      <main className="main-wrapper">
        {/* Top Navbar Header */}
        <header className="top-navbar">
          <div className="page-title-group">
            {activeSection === 'dashboard' && (
              <>
                <h1>Panel Principal Analítico</h1>
                <p>Evolución de plagas fitosanitarias de cacao ecuatoriano</p>
              </>
            )}
            {activeSection === 'map' && (
              <>
                <h1>Mapa Epidemiológico Avanzado</h1>
                <p>Monitoreo geoespacial de brotes agrícolas en tiempo real</p>
              </>
            )}
            {activeSection === 'reports' && (
              <>
                <h1>Gestión Fitosanitaria y Recetas</h1>
                <p>Historial de diagnósticos reportados por satélite y brigadas móviles</p>
              </>
            )}
          </div>

          <div className="top-nav-actions">
            <div className="sync-status-indicator" title={`Backend: ${BACKEND_URL}`}>
              <span
                className="sync-dot-blink"
                style={{
                  backgroundColor:
                    backendStatus === 'connected' ? 'var(--color-brand-secondary)' :
                    backendStatus === 'offline' ? 'var(--color-critical)' : '#F4B400',
                  boxShadow:
                    backendStatus === 'connected' ? '0 0 0 3px rgba(17,202,160,0.25)' :
                    backendStatus === 'offline' ? '0 0 0 3px rgba(217,48,37,0.25)' : 'none'
                }}
              ></span>
              <span style={{ color: backendStatus === 'offline' ? 'var(--color-critical)' : undefined }}>
                {backendStatus === 'connected' ? 'Backend Activo — Tiempo Real (SSE)' :
                 backendStatus === 'offline' ? `Sin conexión al servidor (${BACKEND_URL})` :
                 'Conectando al servidor...'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Grid */}
        <div className="content-body">
          
          {/* SECTION 1: GENERAL ANALYTICS DASHBOARD */}
          {activeSection === 'dashboard' && (
            <>
              {/* KPI metrics row */}
              <section className="kpi-row">
                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">Total Escaneos Realizados</span>
                    <span className="kpi-value">{metrics.totalScans}</span>
                    <span className="kpi-trend positive">
                      <TrendingUp size={12} />
                      +12% este mes
                    </span>
                  </div>
                  <div className="kpi-icon-container">
                    <Sparkles size={22} />
                  </div>
                </div>

                <div className="kpi-card alert-active">
                  <div className="kpi-info">
                    <span className="kpi-title">Alertas Activas (Sucumbíos)</span>
                    <span className="kpi-value">{metrics.activeAlerts}</span>
                    <span className="kpi-trend negative">
                      <AlertTriangle size={12} />
                      Brote crítico activo
                    </span>
                  </div>
                  <div className="kpi-icon-container">
                    <AlertTriangle size={22} />
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">Patógeno más Frecuente</span>
                    <span className="kpi-value" style={{ fontSize: '20px', padding: '5px 0' }}>{metrics.topDisease}</span>
                    <span className="kpi-trend negative">
                      Incidencia alta
                    </span>
                  </div>
                  <div className="kpi-icon-container">
                    <Cpu size={22} />
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">Nodos de Sensores IoT</span>
                    <span className="kpi-value">{metrics.iotSensors}</span>
                    <span className="kpi-trend positive" style={{ color: 'var(--color-brand-secondary)' }}>
                      98% en línea
                    </span>
                  </div>
                  <div className="kpi-icon-container">
                    <MapPin size={22} />
                  </div>
                </div>
              </section>

              {/* Dynamic Recharts zone */}
              <section className="charts-row">
                {/* Outbreaks trend line chart */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div className="panel-card-title-group">
                      <h2>Evolución Temporal de Brotes</h2>
                      <p>Registros mensuales por tipología de hongo fitopatógeno</p>
                    </div>
                  </div>
                  <div className="chart-viewport">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={11} fontWeight={600} />
                        <YAxis stroke="#64748B" fontSize={11} fontWeight={600} />
                        <Tooltip contentStyle={{ fontFamily: 'var(--font-family)', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="Monilia" stroke="#005088" strokeWidth={3} activeDot={{ r: 8 }} name="Monilia" />
                        <Line type="monotone" dataKey="EscobaDebruja" stroke="#11CAA0" strokeWidth={3} name="Escoba de Bruja" />
                        <Line type="monotone" dataKey="MazorcaNegra" stroke="#F59E0B" strokeWidth={3} name="Mazorca Negra" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pathogen pie chart distribution */}
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div className="panel-card-title-group">
                      <h2>Distribución de Patógenos</h2>
                      <p>Porcentaje global acumulado de afecciones fitosanitarias</p>
                    </div>
                  </div>
                  <div className="chart-viewport" style={{ flexDirection: 'column' }}>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie
                          data={pathogenPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pathogenPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} casos`, 'Frecuencia']} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Custom descriptive legend grid */}
                    <div className="custom-legend-grid" style={{ width: '100%' }}>
                      {pathogenPieData.map((entry, index) => (
                        <div key={index} className="legend-item">
                          <div className="legend-label-group">
                            <span className="legend-dot" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}</span>
                          </div>
                          <span className="legend-percent">{entry.value} casos ({entry.percent}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 1.2: FARMER DEVICE TELEMETRY & LIVE MONITORING */}
              <section className="panel-card" style={{ marginTop: '24px' }}>
                <div className="panel-card-header">
                  <div className="panel-card-title-group">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-primary)' }}>
                      <Smartphone size={18} />
                      Telemetría y Estado de Dispositivos Móviles (Productores)
                    </h2>
                    <p>Monitoreo de nivel de batería, modelo de celular y última ubicación reportada desde el campo</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '16px' }}>
                  {devicesList.map((device, i) => {
                    const isLowBattery = device.battery < 25;
                    const isMediumBattery = device.battery >= 25 && device.battery < 60;
                    const batteryColor = isLowBattery ? 'var(--color-critical)' : isMediumBattery ? '#F59E0B' : 'var(--color-brand-secondary)';
                    
                    return (
                      <div key={i} className="device-card" style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-dark)' }}>{device.farmer}</h4>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{device.deviceModel}</p>
                          </div>
                          
                          {/* Battery status bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                            <div style={{ width: '20px', height: '10px', border: '1.5px solid #94A3B8', borderRadius: '3px', position: 'relative', display: 'flex', alignItems: 'center', padding: '1px' }}>
                              <div style={{ height: '100%', width: `${device.battery}%`, backgroundColor: batteryColor, borderRadius: '1px' }} />
                              <div style={{ width: '2px', height: '4px', backgroundColor: '#94A3B8', borderRadius: '1px', position: 'absolute', right: '-3px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 750, color: '#475569' }}>{device.battery}%</span>
                          </div>
                        </div>
                        
                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Última Actividad:</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{device.lastActive ? device.lastActive.split('T')[0] : 'Hoy'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Finca / Lote:</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }} title={device.lastLocation}>{device.lastLocation}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Estado IA Fitosanitario:</span>
                            <span style={{ fontWeight: 700, color: device.lastDiagnosis === 'Sano' ? 'var(--color-success)' : 'var(--color-critical)' }}>{device.lastDiagnosis}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* SECTION 2: MAP MONITORS */}
          {activeSection === 'map' && (
            <section className="map-layout-container">
              {/* SVG Map Canvas */}
              <div className="map-wrapper-box">
                {/* SVG Legends Overlay */}
                <div className="map-legend-overlay">
                  <h4 className="map-legend-title">Severidad</h4>
                  <div className="map-legend-row">
                    <span className="map-legend-color" style={{ backgroundColor: 'var(--color-critical)' }} />
                    <span>Crítico (Riesgo Alto)</span>
                  </div>
                  <div className="map-legend-row">
                    <span className="map-legend-color" style={{ backgroundColor: 'var(--color-warning)' }} />
                    <span>En Seguimiento (Riesgo Medio)</span>
                  </div>
                  <div className="map-legend-row">
                    <span className="map-legend-color" style={{ backgroundColor: 'var(--color-success)' }} />
                    <span>Sano (Estable)</span>
                  </div>
                </div>

                <svg viewBox="0 0 500 400" className="svg-map-element" style={{ background: '#E2E8F0' }}>
                  {/* Grid Lines simulating cached maps */}
                  <defs>
                    <pattern id="satGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#satGrid)" />

                  {/* Satellite background mock - Forests green shading */}
                  <path d="M 0,0 L 220,0 L 190,140 L 0,80 Z" fill="#D8E8D5" opacity="0.4" />
                  <path d="M 220,0 L 500,0 L 500,120 L 280,180 Z" fill="#CBDCC3" opacity="0.3" />
                  <path d="M 0,80 L 190,140 L 160,340 L 0,400 Z" fill="#D3E4CD" opacity="0.3" />
                  <path d="M 380,220 L 500,120 L 500,400 L 360,400 Z" fill="#B9D5B1" opacity="0.3" />
                  <polygon points="190,140 280,180 380,220 360,400 160,340" fill="#E2ECE9" opacity="0.3" />

                  {/* High fidelity sat-rivers overlay */}
                  <path
                    d="M -20,290 C 120,300 140,210 240,190 C 340,170 380,80 520,70"
                    fill="none"
                    stroke="#A3C6D3"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  
                  {/* Main highway overlay */}
                  <path
                    d="M 120,-10 L 120,410 M 0,160 L 510,160 M 240,160 L 390,380"
                    fill="none"
                    stroke="#F1E3D3"
                    strokeWidth="3.5"
                    strokeDasharray="5 3"
                    opacity="0.7"
                  />

                  {/* SVG text tags */}
                  <text x="35" y="40" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.75">LOTE COMUNITARIO BAJO</text>
                  <text x="380" y="55" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.75">FINCA EL PLACER</text>
                  <text x="320" y="380" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.75">COOPERATIVA SUR</text>
                  <text x="210" y="130" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.75">FINCA LA ESTRELLA</text>

                  {/* Interactive map markers from filtered list */}
                  {filteredCases.map(item => {
                    const isSelected = selectedMapCase?.id === item.id;
                    // determine marker color
                    let color = 'var(--color-critical)'; // alert
                    if (item.status === 'Resuelto') color = 'var(--color-success)';
                    if (item.status === 'En seguimiento') color = 'var(--color-warning)';
                    
                    return (
                      <g key={item.id} className="map-marker-pin" onClick={() => setSelectedMapCase(item)}>
                        <circle
                          cx={item.svgX}
                          cy={item.svgY}
                          r={isSelected ? 16 : 10}
                          fill={color}
                          fillOpacity={isSelected ? 0.35 : 0.2}
                          className={isSelected ? "animate-pulse" : ""}
                          style={{ transformOrigin: `${item.svgX}px ${item.svgY}px` }}
                        />
                        <circle
                          cx={item.svgX}
                          cy={item.svgY}
                          r={isSelected ? 7 : 5}
                          fill={color}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 2 : 1.5}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Satellite map details floating popup drawer */}
                {selectedMapCase && (
                  <div className="map-popup-drawer">
                    <div className="popup-cover-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* SVG drawing corresponding to pathogen pod */}
                      <div style={{ width: '80px', height: '80px' }}>
                        {selectedMapCase.diagnosis === 'Monilia' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect width="100" height="100" fill="#E2EBF0" rx="10" />
                            <path d="M50 15 C65 25, 75 40, 75 55 C75 70, 65 85, 50 90 C35 85, 25 70, 25 55 C25 40, 35 25, 50 15 Z" fill="#C68A4C" stroke="#8D5A2B" strokeWidth="3" />
                            <circle cx="50" cy="50" r="14" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2" />
                            <circle cx="48" cy="46" r="8" fill="#E5E7EB" opacity="0.9" />
                          </svg>
                        )}
                        {selectedMapCase.diagnosis === 'Escoba de Bruja' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect width="100" height="100" fill="#FAF0E6" rx="10" />
                            <path d="M50 85 C50 60, 45 40, 35 30" fill="none" stroke="#5C4033" strokeWidth="5" />
                            <path d="M50 85 C50 65, 52 45, 65 35" fill="none" stroke="#5C4033" strokeWidth="4" />
                            <path d="M35 30 C30 20, 25 25, 20 22" fill="none" stroke="#8B5A2B" strokeWidth="3" />
                          </svg>
                        )}
                        {selectedMapCase.diagnosis === 'Mazorca Negra' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect width="100" height="100" fill="#EADCC9" rx="10" />
                            <path d="M50 15 C65 25, 75 40, 75 55 C75 70, 65 85, 50 90 Z" fill="#B5804C" stroke="#7A4E26" strokeWidth="3" />
                            <path d="M50 90 C35 85, 27 72, 33 65 C40 58, 55 60, 64 68 Z" fill="#2B2017" />
                          </svg>
                        )}
                        {selectedMapCase.diagnosis === 'Sano' && (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect width="100" height="100" fill="#E6F2E7" rx="10" />
                            <path d="M50 15 C67 25, 76 40, 76 55 C76 70, 67 85, 50 90 Z" fill="#E5A93C" stroke="#A67117" strokeWidth="3" />
                          </svg>
                        )}
                      </div>
                      <span className={`popup-tag-overlay ${selectedMapCase.severity}`}>
                        Riesgo {selectedMapCase.severity === 'alta' ? 'Alto' : selectedMapCase.severity === 'media' ? 'Medio' : 'Nulo'}
                      </span>
                    </div>

                    <div className="popup-body">
                      <div className="popup-meta">
                        <span className="popup-location-name">{selectedMapCase.location}</span>
                        <span className="popup-farmer-name">
                          <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          Productor: {selectedMapCase.farmer}
                        </span>
                      </div>

                      <div className="popup-stats-grid">
                        <div>
                          <span className="popup-stat-title">Diagnóstico IA</span>
                          <span className="popup-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: selectedMapCase.diagnosis === 'Sano' ? 'var(--color-success)' : selectedMapCase.diagnosis === 'Monilia' ? 'var(--color-critical)' : 'var(--color-warning)'
                            }} />
                            {selectedMapCase.diagnosis}
                          </span>
                        </div>
                        <div>
                          <span className="popup-stat-title">Confianza IA</span>
                          <span className="popup-stat-val">{selectedMapCase.confidence}%</span>
                        </div>
                        <div>
                          <span className="popup-stat-title">Fecha</span>
                          <span className="popup-stat-val">{selectedMapCase.date}</span>
                        </div>
                        <div>
                          <span className="popup-stat-title">Región</span>
                          <span className="popup-stat-val">{selectedMapCase.region}</span>
                        </div>
                      </div>

                      <div className="popup-actions">
                        <button
                          onClick={() => handleOpenPrescription(selectedMapCase)}
                          className="popup-btn-action primary"
                        >
                          Emitir Receta
                        </button>
                        <button
                          onClick={() => setSelectedMapCase(null)}
                          className="popup-btn-action secondary"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Filters Panel Column */}
              <div className="map-filters-panel">
                <div className="panel-card-title-group" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                  <h2>Filtros del Mapa</h2>
                  <p>Ajuste los parámetros para análisis de brotes</p>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Fecha de Reporte</label>
                  <select
                    className="filter-select"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                  >
                    <option value="Todos">Todos los registros</option>
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Provincia / Región</label>
                  <select
                    className="filter-select"
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                  >
                    <option value="Todas">Todas las Provincias</option>
                    <option value="Sucumbíos">Sucumbíos</option>
                    <option value="Napo">Napo</option>
                    <option value="Orellana">Orellana</option>
                    <option value="Pastaza">Pastaza</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Tipo de Variedad Cacao</label>
                  <select
                    className="filter-select"
                    value={filterCropType}
                    onChange={(e) => setFilterCropType(e.target.value)}
                  >
                    <option value="Todos">Todas las variedades</option>
                    <option value="Nacional (Fino de Aroma)">Nacional (Fino de Aroma)</option>
                    <option value="Colección (CCN-51)">Colección (CCN-51)</option>
                    <option value="Híbrido Local">Híbrido Local</option>
                  </select>
                </div>

                {/* Helpful instructions note */}
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Info size={16} style={{ color: '#0284C7', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', color: '#0369A1', fontWeight: 500, lineHeight: 1.4 }}>
                    Haga clic en cualquier pin en el mapa satelital para abrir el visor fotográfico y emitir la receta agronómica directamente al lote.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: REPORTS MANAGEMENT & TABLES */}
          {activeSection === 'reports' && (
            <section className="table-card">
              <div className="table-header-row">
                <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
                  {/* Search bar inputs */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar por ID, Finca, Productor o Plaga..."
                      style={{ paddingLeft: '36px', height: '40px', backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Province filter shortcut */}
                  <select
                    className="filter-select"
                    style={{ width: '160px', height: '40px' }}
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                  >
                    <option value="Todas">Provincias</option>
                    <option value="Sucumbíos">Sucumbíos</option>
                    <option value="Napo">Napo</option>
                    <option value="Orellana">Orellana</option>
                    <option value="Pastaza">Pastaza</option>
                  </select>
                </div>

                <button onClick={handleExportCSV} className="btn-export-excel">
                  <Download size={16} />
                  <span>Exportar a Excel (.xlsx)</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID Caso</th>
                      <th>Ubicación / Finca</th>
                      <th>Provincia</th>
                      <th>Fecha</th>
                      <th>Diagnóstico IA</th>
                      <th>Certeza</th>
                      <th>Estado Lote</th>
                      <th>Productor</th>
                      <th>Celular / Batería</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          No se encontraron reportes fitosanitarios con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map(item => (
                        <tr key={item.id}>
                          <td style={{ color: 'var(--color-brand-primary)', fontWeight: 'bold' }}>{item.id}</td>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>{item.location}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>GPS: {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</div>
                          </td>
                          <td>{item.region}</td>
                          <td>{item.date}</td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: item.diagnosis === 'Sano' ? 'var(--color-success)' : item.diagnosis === 'Monilia' ? 'var(--color-critical)' : 'var(--color-warning)'
                              }} />
                              {item.diagnosis}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{item.confidence}%</td>
                          <td>
                            <span className={`badge-status ${item.status.toLowerCase().replace(/ /g, '')}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.farmer}</td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-dark)' }}>{item.deviceModel || 'Xiaomi Redmi Note 11'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                              <div style={{ width: '18px', height: '9px', border: '1.5px solid #94A3B8', borderRadius: '2px', position: 'relative', display: 'flex', alignItems: 'center', padding: '1px' }}>
                                <div style={{ height: '100%', width: `${item.battery || 85}%`, backgroundColor: (item.battery || 85) < 25 ? 'var(--color-critical)' : (item.battery || 85) < 60 ? '#F59E0B' : 'var(--color-brand-secondary)', borderRadius: '1px' }} />
                                <div style={{ width: '1px', height: '3px', backgroundColor: '#94A3B8', borderRadius: '1px', position: 'absolute', right: '-2px' }} />
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{item.battery || 85}%</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedCaseDetail(item)}
                              className="btn-table-action view"
                            >
                              Ver Detalle
                            </button>
                            <button
                              onClick={() => handleOpenPrescription(item)}
                              className="btn-table-action prescription"
                            >
                              Receta
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* MODAL 1: VIEW CASE DETAILS (Read Only) */}
      {selectedCaseDetail && (
        <div className="modal-overlay" onClick={() => setSelectedCaseDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ficha Fitosanitaria del Caso {selectedCaseDetail.id}</h3>
              <button onClick={() => setSelectedCaseDetail(null)} style={{ color: 'white' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="prescription-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">Ubicación</span>
                  <span className="meta-field-value">{selectedCaseDetail.location}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Provincia</span>
                  <span className="meta-field-value">{selectedCaseDetail.region}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Diagnóstico IA</span>
                  <span className="meta-field-value">{selectedCaseDetail.diagnosis} ({selectedCaseDetail.confidence}%)</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Fecha</span>
                  <span className="meta-field-value">{selectedCaseDetail.date}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Productor</span>
                  <span className="meta-field-value">{selectedCaseDetail.farmer}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Coordenadas GPS</span>
                  <span className="meta-field-value">{selectedCaseDetail.lat.toFixed(5)}, {selectedCaseDetail.lng.toFixed(5)}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Dispositivo</span>
                  <span className="meta-field-value">{selectedCaseDetail.deviceModel || 'Xiaomi Redmi Note 11'}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Batería Celular</span>
                  <span className="meta-field-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Battery size={12} color="#11CAA0" /> {selectedCaseDetail.battery || 85}%
                  </span>
                </div>
              </div>

              {/* Graphic Pod Draw */}
              <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ width: '120px', height: '120px' }}>
                  {selectedCaseDetail.diagnosis === 'Monilia' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 15 C65 25, 75 40, 75 55 C75 70, 65 85, 50 90 C35 85, 25 70, 25 55 Z" fill="#C68A4C" stroke="#8D5A2B" strokeWidth="3" />
                      <circle cx="50" cy="50" r="14" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3 2" />
                    </svg>
                  )}
                  {selectedCaseDetail.diagnosis === 'Escoba de Bruja' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 85 C50 60, 45 40, 35 30" fill="none" stroke="#5C4033" strokeWidth="5" />
                      <path d="M50 85 C50 65, 52 45, 65 35" fill="none" stroke="#5C4033" strokeWidth="4" />
                    </svg>
                  )}
                  {selectedCaseDetail.diagnosis === 'Mazorca Negra' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 15 C65 25, 75 40, 75 55 Z" fill="#B5804C" stroke="#7A4E26" strokeWidth="3" />
                      <path d="M50 90 C35 85, 27 72, 33 65 Z" fill="#2B2017" />
                    </svg>
                  )}
                  {selectedCaseDetail.diagnosis === 'Sano' && (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M50 15 C67 25, 76 40, 76 55 C76 70, 67 85, 50 90 Z" fill="#E5A93C" stroke="#A67117" strokeWidth="3" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Recipe/Resolution steps */}
              <div className="form-group">
                <label className="form-label">Receta Técnica Prescrita:</label>
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '12px', fontSize: '13.5px', color: '#166534', fontWeight: 600, lineHeight: 1.5 }}>
                  {selectedCaseDetail.prescription ? (
                    <p>{selectedCaseDetail.prescription}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-brand-primary)' }}>Recomendación del Ecosistema Base:</span>
                      <p>{RECOMMENDATION_TEMPLATES[selectedCaseDetail.diagnosis] || RECOMMENDATION_TEMPLATES['Sano']}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedCaseDetail(null)} className="modal-btn confirm">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE PERSONALIZED PRESCRIPTION (Editable) */}
      {prescriptionCase && (
        <div className="modal-overlay" onClick={() => setPrescriptionCase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: 'var(--color-brand-primary-light)' }}>
              <h3>Emitir Receta Técnica Personalizada</h3>
              <button onClick={() => setPrescriptionCase(null)} style={{ color: 'white' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="prescription-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">Productor</span>
                  <span className="meta-field-value">{prescriptionCase.farmer}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Ubicación / Finca</span>
                  <span className="meta-field-value">{prescriptionCase.location}</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Detección Inicial</span>
                  <span className="meta-field-value" style={{ fontWeight: 'bold' }}>{prescriptionCase.diagnosis} ({prescriptionCase.confidence}% Certeza)</span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Fecha Diagnóstico</span>
                  <span className="meta-field-value">{prescriptionCase.date}</span>
                </div>
              </div>

              {/* Technician signing info */}
              <div className="form-group">
                <label className="form-label">Técnico Agrónomo Emisor</label>
                <input
                  type="text"
                  className="form-input"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                />
              </div>

              {/* Recommendation textarea */}
              <div className="form-group">
                <label className="form-label">Prescripción de Manejo Fitosanitario</label>
                <textarea
                  className="form-textarea"
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Escriba las recomendaciones técnicas de manejo..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setPrescriptionCase(null)} className="modal-btn cancel">
                Cancelar
              </button>
              <button onClick={handleSavePrescription} className="modal-btn confirm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} />
                <span>Guardar y Emitir Receta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC SIDE DRAWER: EMBEDDED MOBILE APP SIMULATOR (IFRAME) */}
      {showMobileSimulator && (
        <div className="phone-simulator-drawer">
          <div className="drawer-header">
            <div className="drawer-title-group">
              <h3>Simulador de Dispositivo Fitosanitario</h3>
              <p>Móvil Offline Local Bridge</p>
            </div>
            <button className="drawer-close-btn" onClick={() => setShowMobileSimulator(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="drawer-body">
            {/* Phone Shell */}
            <div className="mockup-phone-frame">
              <iframe
                src="http://localhost:5173"
                className="mockup-phone-iframe"
                title="CocoaShield Mobile App"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
