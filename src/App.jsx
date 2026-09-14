import { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, Map as MapIcon, FileSpreadsheet,
  AlertTriangle, Search, Download, X,
  MapPin, User, Cpu, Send, Sparkles, Info, LogOut,
  Shield, Activity, Users, BarChart3
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from "recharts";
import { MONTHLY_OUTBREAKS } from "./data/mockData";
import { supabase, isEmailAllowed } from "./supabaseClient";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://cocoashield-backend.onrender.com";

const RECS = {
  "Monilia": "Aplicar remocion de mazorcas infectadas antes de la esporulacion. Realizar podas fitosanitarias para facilitar la aireacion del dosel. Cubrir frutos caidos con hojarasca.",
  "Escoba de Bruja": "Cortar ramas deformadas a 30 cm por debajo de la base infectada. Desinfectar herramientas con alcohol al 70%. Enterrar o quemar residuos vegetales.",
  "Mazorca Negra": "Mejorar el drenaje del terreno. Realizar podas para mayor entrada de radiacion solar. Retirar frutos momificados.",
  "Sano": "Mantener cronograma regular de monitoreo preventivo semanal."
};

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true); setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch {
      setError("Error al conectar con Google. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0B192C 0%,#0d2137 60%,#0B192C 100%)",
      fontFamily:"Outfit,sans-serif", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:500, height:500,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(17,202,160,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"-20%", left:"-10%", width:600, height:600,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(0,80,136,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(24px)",
        border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"48px 40px",
        width:"100%", maxWidth:400, boxShadow:"0 32px 64px rgba(0,0,0,0.4)", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:36 }}>
          <div style={{ width:68, height:68, borderRadius:20,
            background:"linear-gradient(135deg,#005088,#11CAA0)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:30, boxShadow:"0 8px 24px rgba(17,202,160,0.3)" }}>🌿</div>
          <div>
            <div style={{ fontSize:26, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>CocoaShield</div>
            <div style={{ fontSize:11, color:"#11CAA0", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>Panel de Control</div>
          </div>
        </div>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:28, lineHeight:1.6 }}>
          Acceso exclusivo para administradores del sistema fitosanitario
        </p>
        {error && <div style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:12, padding:"12px 16px", marginBottom:20, color:"#FCA5A5", fontSize:13 }}>{error}</div>}
        <button onClick={login} disabled={loading} style={{ width:"100%", padding:"14px 20px", borderRadius:14,
          background: loading ? "rgba(255,255,255,0.06)" : "#fff",
          border:"1px solid rgba(255,255,255,0.12)",
          color: loading ? "rgba(255,255,255,0.4)" : "#1E293B",
          fontSize:15, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:12,
          cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s",
          boxShadow: loading ? "none" : "0 4px 16px rgba(0,0,0,0.2)" }}>
          {loading ? (
            <><span style={{ width:20, height:20, border:"2px solid rgba(255,255,255,0.2)",
              borderTopColor:"#11CAA0", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />Conectando...</>
          ) : (
            <><svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>Iniciar sesion con Google</>
          )}
        </button>
        <div style={{ marginTop:24, padding:"12px 16px", background:"rgba(17,202,160,0.06)",
          borderRadius:12, border:"1px solid rgba(17,202,160,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Shield size={13} color="#11CAA0" />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>Solo usuarios autorizados pueden acceder</span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AccessDenied({ user, onLogout }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0B192C,#1a0a0a)", fontFamily:"Outfit,sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(24px)",
        border:"1px solid rgba(239,68,68,0.2)", borderRadius:24, padding:"48px 40px", maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
        <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, marginBottom:8 }}>Sin Acceso al Panel</h2>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:6 }}>
          La cuenta <strong style={{ color:"#FCA5A5" }}>{user?.email}</strong> no tiene permisos.
        </p>
        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginBottom:28 }}>
          Contacta al administrador si crees que esto es un error.
        </p>
        <button onClick={onLogout} style={{ padding:"12px 24px", borderRadius:12,
          background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
          color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", width:"100%" }}>
          Salir y usar otra cuenta
        </button>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]             = useState(null);
  const [authLoading, setAuthLoading]     = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [backendStatus, setBackendStatus] = useState("connecting");
  const sseRef = useRef(null);
  const [cases, setCases]           = useState([]);
  const [monthlyData, setMonthlyData] = useState(MONTHLY_OUTBREAKS);
  const [toasts, setToasts]         = useState([]);
  const [selectedCase, setSelectedCase]     = useState(null);
  const [prescriptionCase, setPrescriptionCase] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [selectedMapCase, setSelectedMapCase]   = useState(null);
  const [filterRegion, setFilterRegion]   = useState("Todas");
  const [filterDate, setFilterDate]       = useState("Todos");
  const [searchQuery, setSearchQuery]     = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setAuthLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); setSession(null); };

  const addToast = (title, msg) => {
    const id = Date.now()+"";
    setToasts(p => [...p, { id, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 6000);
  };

  const applyCase = (c) => {
    setCases(p => {
      if (p.find(x => x.id === c.id)) return p;
      addToast("Nuevo Escaneo", `${c.diagnosis} (${c.confidence}%) en ${c.location}`);
      return [c, ...p];
    });
  };

  useEffect(() => {
    if (!session) return;
    fetch(`${BACKEND_URL}/api/cases`, { signal: AbortSignal.timeout(5000) })
      .then(r => r.json()).then(d => { setCases(d); setBackendStatus("connected"); })
      .catch(() => setBackendStatus("offline"));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const connect = () => {
      const es = new EventSource(`${BACKEND_URL}/api/events`);
      sseRef.current = es;
      es.onopen = () => setBackendStatus("connected");
      es.onmessage = (e) => {
        try {
          const p = JSON.parse(e.data);
          if (p.type === "ADD_CASE") applyCase(p.caseData);
          if (p.type === "UPDATE_CASE") setCases(prev => prev.map(c => c.id === p.caseData.id ? p.caseData : c));
          if (p.type === "RESET_DB") { setCases(p.cases); setMonthlyData(MONTHLY_OUTBREAKS); }
        } catch {}
      };
      es.onerror = () => { setBackendStatus("offline"); es.close(); setTimeout(connect, 5000); };
    };
    connect();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, [session]);

  const metrics = useMemo(() => {
    const counts = {};
    cases.forEach(c => { if (c.diagnosis !== "Sano") counts[c.diagnosis] = (counts[c.diagnosis]||0)+1; });
    let top = "Ninguna", max = 0;
    Object.entries(counts).forEach(([d,n]) => { if (n > max) { max = n; top = d; } });
    return {
      totalScans: cases.length,
      alerts: cases.filter(c => c.status === "Critico" || c.status === "En seguimiento").length,
      top: top === "Monilia" ? "Monilia del Cacao" : top,
      farmers: new Set(cases.map(c => c.farmer).filter(Boolean)).size || 3
    };
  }, [cases]);

  const pie = useMemo(() => {
    let m=0,e=0,n=0;
    cases.forEach(c => { if(c.diagnosis==="Monilia")m++; if(c.diagnosis==="Escoba de Bruja")e++; if(c.diagnosis==="Mazorca Negra")n++; });
    const t = m+e+n||1;
    return [
      { name:"Monilia del Cacao", value:m, color:"#005088", pct:Math.round(m/t*100) },
      { name:"Escoba de Bruja",   value:e, color:"#11CAA0", pct:Math.round(e/t*100) },
      { name:"Mazorca Negra",     value:n, color:"#F59E0B", pct:Math.round(n/t*100) }
    ];
  }, [cases]);

  const filtered = useMemo(() => cases.filter(c => {
    if (filterRegion !== "Todas" && c.region !== filterRegion) return false;
    if (filterDate !== "Todos") {
      const diff = Math.abs(new Date() - new Date(c.date)) / 864e5;
      if (filterDate === "7d" && diff > 7) return false;
      if (filterDate === "30d" && diff > 30) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return [c.id,c.location,c.farmer,c.diagnosis,c.region].some(v => v?.toLowerCase().includes(q));
    }
    return true;
  }), [cases, filterRegion, filterDate, searchQuery]);

  const openPrescription = (c) => { setPrescriptionCase(c); setPrescriptionText(c.prescription || RECS[c.diagnosis] || RECS["Sano"]); };

  const savePrescription = async () => {
    if (!prescriptionCase) return;
    const status = prescriptionCase.status === "Critico" ? "En seguimiento" : prescriptionCase.status;
    setCases(p => p.map(c => c.id === prescriptionCase.id ? { ...c, prescription: prescriptionText, status } : c));
    setPrescriptionCase(null);
    try {
      await fetch(`${BACKEND_URL}/api/cases/prescription`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ id: prescriptionCase.id, prescription: prescriptionText, status }),
        signal: AbortSignal.timeout(5000)
      });
      addToast("Receta Guardada", `Emitida para ${prescriptionCase.farmer}`);
    } catch { addToast("Receta local", "Sin conexion al servidor"); }
  };

  const exportCSV = () => {
    const h = ["ID","Ubicacion","Region","Fecha","Diagnostico","Certeza","Estado","Productor"];
    const rows = filtered.map(c => [c.id,c.location,c.region,c.date?.split("T")[0],c.diagnosis,`${c.confidence}%`,c.status,c.farmer]);
    const csv = [h,...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv"}));
    a.download = `CocoaShield_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("Exportado", `${filtered.length} registros descargados`);
  };

  const mapPos = (lat, lng) => {
    const x = 40 + ((lng-(-77.552))/((-77.531)-(-77.552)))*420;
    const y = 360 - ((lat-(-1.036))/((-1.018)-(-1.036)))*320;
    return { x: Math.max(40,Math.min(460,x)), y: Math.max(40,Math.min(360,y)) };
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0B192C" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid rgba(17,202,160,0.25)", borderTopColor:"#11CAA0",
          borderRadius:"50%", margin:"0 auto 14px", animation:"spin 0.8s linear infinite" }} />
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontFamily:"Outfit,sans-serif" }}>Verificando sesion...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!session) return <LoginPage />;
  if (!isEmailAllowed(session.user?.email)) return <AccessDenied user={session.user} onLogout={logout} />;

  const name   = session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Admin";
  const avatar = session.user?.user_metadata?.avatar_url;

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-root">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div className="toast-icon"><Sparkles size={15}/></div>
            <div className="toast-body"><h4 className="toast-title">{t.title}</h4><p className="toast-msg">{t.msg}</p></div>
            <button className="toast-close" onClick={() => setToasts(p=>p.filter(x=>x.id!==t.id))}><X size={13}/></button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge" style={{ fontSize:20 }}>🌿</div>
          <div className="brand-info">
            <span className="brand-name">CocoaShield</span>
            <span className="brand-tagline">Panel de Control</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(255,255,255,0.25)", padding:"12px 20px 6px" }}>Navegacion</p>
          {[
            { id:"dashboard", icon:<LayoutDashboard size={16}/>, label:"Inicio" },
            { id:"map",       icon:<MapIcon size={16}/>,          label:"Mapa Epidemiologico" },
            { id:"reports",   icon:<FileSpreadsheet size={16}/>,  label:"Reportes y Recetas" }
          ].map(it => (
            <button key={it.id} onClick={() => setActiveSection(it.id)}
              className={`nav-item ${activeSection===it.id?"active":""}`}>
              {it.icon}<span>{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            {avatar
              ? <img src={avatar} alt="" style={{ width:34, height:34, borderRadius:"50%", border:"2px solid rgba(17,202,160,0.4)", flexShrink:0 }} />
              : <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#005088,#11CAA0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {name[0]?.toUpperCase()}
                </div>
            }
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
              <div style={{ fontSize:10, color:"#11CAA0", fontWeight:600 }}>Administrador</div>
            </div>
            <button onClick={logout} title="Cerrar sesion"
              style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, padding:6, cursor:"pointer", display:"flex" }}
              onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,0.15)"}
              onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
              <LogOut size={14} color="rgba(255,255,255,0.5)"/>
            </button>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.18)", textAlign:"center", marginTop:8 }}>CocoaShield AI v1.0 · UNAMAD</div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-wrapper">
        <header className="top-navbar">
          <div className="page-title-group">
            {activeSection==="dashboard" && <><h1>Panel Analitico</h1><p>Monitoreo fitosanitario del cacao en tiempo real</p></>}
            {activeSection==="map"       && <><h1>Mapa Epidemiologico</h1><p>Distribucion geografica de brotes activos</p></>}
            {activeSection==="reports"   && <><h1>Reportes y Recetas</h1><p>Historial de diagnosticos IA y fichas agronomicas</p></>}
          </div>
          <div className="top-nav-actions">
            <div className="sync-status-indicator">
              <span className="sync-dot-blink" style={{
                backgroundColor: backendStatus==="connected" ? "#11CAA0" : backendStatus==="offline" ? "#EF4444" : "#F59E0B",
                boxShadow: backendStatus==="connected" ? "0 0 0 3px rgba(17,202,160,0.25)" : "none"
              }}/>
              <span style={{ color: backendStatus==="offline" ? "#EF4444" : undefined }}>
                {backendStatus==="connected" ? "En linea — Tiempo Real" : backendStatus==="offline" ? "Sin conexion" : "Conectando..."}
              </span>
            </div>
          </div>
        </header>

        <div className="content-body">

          {/* DASHBOARD */}
          {activeSection==="dashboard" && (
            <>
              <section className="kpi-row">
                {[
                  { icon:<Activity size={22}/>,    title:"Total Escaneos",        value:metrics.totalScans, trend:"+12% este mes",     bg:"linear-gradient(135deg,#005088,#0070bb)", glow:"rgba(0,80,136,0.25)" },
                  { icon:<AlertTriangle size={22}/>, title:"Alertas Activas",     value:metrics.alerts,     trend:"Requieren atencion", bg:"linear-gradient(135deg,#DC2626,#EF4444)", glow:"rgba(239,68,68,0.25)" },
                  { icon:<Cpu size={22}/>,          title:"Patogeno Frecuente",   value:metrics.top,        trend:"Incidencia alta",    bg:"linear-gradient(135deg,#D97706,#F59E0B)", glow:"rgba(245,158,11,0.25)", small:true },
                  { icon:<Users size={22}/>,        title:"Productores Activos",  value:metrics.farmers,    trend:"Brigadas en campo",  bg:"linear-gradient(135deg,#059669,#10B981)", glow:"rgba(16,185,129,0.25)" }
                ].map((k,i) => (
                  <div key={i} className="kpi-card" style={{ background:k.bg, boxShadow:`0 8px 24px ${k.glow}`, border:"none" }}>
                    <div className="kpi-info">
                      <span className="kpi-title" style={{ color:"rgba(255,255,255,0.75)" }}>{k.title}</span>
                      <span className="kpi-value" style={{ color:"#fff", fontSize:k.small?18:32 }}>{k.value}</span>
                      <span className="kpi-trend" style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>{k.trend}</span>
                    </div>
                    <div className="kpi-icon-container" style={{ backgroundColor:"rgba(255,255,255,0.15)", color:"#fff" }}>{k.icon}</div>
                  </div>
                ))}
              </section>

              <section className="charts-row">
                <div className="panel-card">
                  <div className="panel-card-header">
                    <div className="panel-card-title-group"><h2>Evolucion Temporal de Brotes</h2><p>Registros mensuales por enfermedad</p></div>
                  </div>
                  <div className="chart-viewport">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top:10, right:30, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                        <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} fontWeight={600}/>
                        <YAxis stroke="#94A3B8" fontSize={11} fontWeight={600}/>
                        <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", fontFamily:"Outfit,sans-serif" }}/>
                        <Legend wrapperStyle={{ fontSize:12, fontWeight:600 }}/>
                        <Line type="monotone" dataKey="Monilia"      stroke="#005088" strokeWidth={2.5} activeDot={{ r:6 }}/>
                        <Line type="monotone" dataKey="EscobaDebruja" stroke="#11CAA0" strokeWidth={2.5} name="Escoba de Bruja"/>
                        <Line type="monotone" dataKey="MazorcaNegra"  stroke="#F59E0B" strokeWidth={2.5} name="Mazorca Negra"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-card-header">
                    <div className="panel-card-title-group"><h2>Distribucion de Patogenos</h2><p>Porcentaje acumulado</p></div>
                  </div>
                  <div className="chart-viewport" style={{ flexDirection:"column" }}>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie data={pie} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value">
                          {pie.map((e,i) => <Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip formatter={v => [`${v} casos`,"Frecuencia"]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="custom-legend-grid">
                      {pie.map((e,i) => (
                        <div key={i} className="legend-item">
                          <div className="legend-label-group"><span className="legend-dot" style={{ backgroundColor:e.color }}/><span>{e.name}</span></div>
                          <span className="legend-percent">{e.value} casos ({e.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel-card" style={{ marginTop:24 }}>
                <div className="panel-card-header">
                  <div className="panel-card-title-group">
                    <h2 style={{ display:"flex", alignItems:"center", gap:8 }}><BarChart3 size={17} color="#005088"/>Ultimos Diagnosticos</h2>
                    <p>Los casos mas recientes registrados en el sistema</p>
                  </div>
                </div>
                <div style={{ padding:"0 20px 16px" }}>
                  {cases.slice(0,6).map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #F8FAFC" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#005088", background:"rgba(0,80,136,0.08)", padding:"3px 10px", borderRadius:6, minWidth:64, textAlign:"center" }}>{c.id}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#1E293B" }}>{c.diagnosis}</div>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>{c.location} · {c.farmer}</div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:"#11CAA0" }}>{c.confidence}%</span>
                      <SBadge s={c.status}/>
                    </div>
                  ))}
                  {cases.length===0 && <p style={{ color:"#94A3B8", textAlign:"center", padding:"28px 0", fontSize:13 }}>Sin diagnosticos aun. Usa la app movil para el primer escaneo.</p>}
                </div>
              </section>
            </>
          )}

          {/* MAP */}
          {activeSection==="map" && (
            <section className="map-layout-container">
              <div className="map-wrapper-box">
                <div className="map-legend-overlay">
                  <h4 className="map-legend-title">Severidad</h4>
                  {[["var(--color-critical)","Critico"],["var(--color-warning)","En Seguimiento"],["var(--color-success)","Sano"]].map(([c,l])=>(
                    <div key={l} className="map-legend-row"><span className="map-legend-color" style={{ backgroundColor:c }}/><span>{l}</span></div>
                  ))}
                </div>
                <svg viewBox="0 0 500 400" className="svg-map-element" style={{ background:"#E2E8F0" }}>
                  <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/></pattern></defs>
                  <rect width="100%" height="100%" fill="url(#grid)"/>
                  <path d="M0,0 L220,0 L190,140 L0,80Z" fill="#D8E8D5" opacity="0.4"/>
                  <path d="M220,0 L500,0 L500,120 L280,180Z" fill="#CBDCC3" opacity="0.3"/>
                  <path d="M0,80 L190,140 L160,340 L0,400Z" fill="#D3E4CD" opacity="0.3"/>
                  <path d="M-20,290 C120,300 140,210 240,190 C340,170 380,80 520,70" fill="none" stroke="#A3C6D3" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
                  <path d="M120,-10 L120,410 M0,160 L510,160" fill="none" stroke="#F1E3D3" strokeWidth="3" strokeDasharray="5 3" opacity="0.6"/>
                  <text x="170" y="128" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.7">FINCA LA ESTRELLA</text>
                  <text x="310" y="375" fontSize="9" fontWeight="bold" fill="#4A5D4E" opacity="0.7">COOPERATIVA SUR</text>
                  {filtered.map(item => {
                    const p = mapPos(item.lat, item.lng);
                    const sel = selectedMapCase?.id===item.id;
                    const col = item.status==="Resuelto" ? "var(--color-success)" : item.status==="En seguimiento" ? "var(--color-warning)" : "var(--color-critical)";
                    return (
                      <g key={item.id} onClick={()=>setSelectedMapCase(item)} style={{ cursor:"pointer" }}>
                        <circle cx={p.x} cy={p.y} r={sel?16:10} fill={col} fillOpacity={sel?0.28:0.15}/>
                        <circle cx={p.x} cy={p.y} r={sel?7:5} fill={col} stroke="#fff" strokeWidth={sel?2:1.5}/>
                      </g>
                    );
                  })}
                </svg>
                {selectedMapCase && (
                  <div className="map-popup-drawer">
                    <div className="popup-body" style={{ padding:20 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                        <div>
                          <div className="popup-location-name">{selectedMapCase.location}</div>
                          <div className="popup-farmer-name"><User size={11} style={{ display:"inline", marginRight:4 }}/>{selectedMapCase.farmer}</div>
                        </div>
                        <button onClick={()=>setSelectedMapCase(null)} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:6, cursor:"pointer" }}><X size={14}/></button>
                      </div>
                      <div className="popup-stats-grid" style={{ marginBottom:14 }}>
                        {[["Diagnostico",selectedMapCase.diagnosis],["Certeza",`${selectedMapCase.confidence}%`],["Estado",selectedMapCase.status],["Region",selectedMapCase.region]].map(([k,v])=>(
                          <div key={k}><span className="popup-stat-title">{k}</span><span className="popup-stat-val">{v}</span></div>
                        ))}
                      </div>
                      <button onClick={()=>openPrescription(selectedMapCase)} className="popup-btn-action primary" style={{ width:"100%" }}>Emitir Receta</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="map-filters-panel">
                <div className="panel-card-title-group" style={{ borderBottom:"1px solid var(--color-border)", paddingBottom:12 }}>
                  <h2>Filtros del Mapa</h2><p>Refinar visualizacion</p>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Fecha</label>
                  <select className="filter-select" value={filterDate} onChange={e=>setFilterDate(e.target.value)}>
                    <option value="Todos">Todos los registros</option>
                    <option value="7d">Ultimos 7 dias</option>
                    <option value="30d">Ultimos 30 dias</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Provincia</label>
                  <select className="filter-select" value={filterRegion} onChange={e=>setFilterRegion(e.target.value)}>
                    {["Todas","Sucumbios","Napo","Orellana","Pastaza"].map(v=><option key={v} value={v}>{v==="Todas"?"Todas las provincias":v}</option>)}
                  </select>
                </div>
                <div style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", padding:14, borderRadius:12, display:"flex", gap:8 }}>
                  <Info size={15} style={{ color:"#0284C7", flexShrink:0, marginTop:2 }}/>
                  <p style={{ fontSize:11, color:"#0369A1", lineHeight:1.5 }}>Haz clic en un pin del mapa para ver el detalle y emitir receta agronomica.</p>
                </div>
              </div>
            </section>
          )}

          {/* REPORTS */}
          {activeSection==="reports" && (
            <section className="table-card">
              <div className="table-header-row">
                <div style={{ display:"flex", gap:12, flex:1, flexWrap:"wrap" }}>
                  <div style={{ position:"relative", flex:1, minWidth:220, maxWidth:380 }}>
                    <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
                    <input className="search-input" placeholder="Buscar por ID, finca, productor..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ paddingLeft:36 }}/>
                  </div>
                  <select className="filter-select" style={{ maxWidth:180 }} value={filterRegion} onChange={e=>setFilterRegion(e.target.value)}>
                    {["Todas","Sucumbios","Napo","Orellana","Pastaza"].map(v=><option key={v} value={v}>{v==="Todas"?"Todas las provincias":v}</option>)}
                  </select>
                </div>
                <button className="export-btn" onClick={exportCSV}><Download size={14}/> Exportar Excel</button>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table className="data-table">
                  <thead><tr>{["ID Caso","Ubicacion / Finca","Provincia","Fecha","Diagnostico IA","Certeza","Estado","Productor","Acciones"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.length===0
                      ? <tr><td colSpan={9} style={{ textAlign:"center", padding:36, color:"#94A3B8" }}>Sin registros con ese filtro.</td></tr>
                      : filtered.map(c => (
                          <tr key={c.id}>
                            <td><span className="case-id-badge">{c.id}</span></td>
                            <td>
                              <div style={{ fontWeight:600, color:"#1E293B", fontSize:13 }}>{c.location}</div>
                              <div style={{ fontSize:11, color:"#94A3B8" }}>GPS: {c.lat?.toFixed(4)}, {c.lng?.toFixed(4)}</div>
                            </td>
                            <td style={{ fontSize:13 }}>{c.region}</td>
                            <td style={{ fontSize:12, color:"#64748B" }}>{c.date?.split("T")[0]}</td>
                            <td>
                              <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontWeight:700, fontSize:13 }}>
                                <span style={{ width:8, height:8, borderRadius:"50%", backgroundColor: c.diagnosis==="Sano"?"#10B981":c.diagnosis==="Monilia"?"#EF4444":"#F59E0B", display:"inline-block" }}/>
                                {c.diagnosis}
                              </span>
                            </td>
                            <td style={{ fontWeight:700, color:"#005088", fontSize:13 }}>{c.confidence}%</td>
                            <td><SBadge s={c.status}/></td>
                            <td style={{ fontSize:13 }}>{c.farmer}</td>
                            <td>
                              <div style={{ display:"flex", gap:8 }}>
                                <button onClick={()=>setSelectedCase(c)} className="table-btn-outline">Ver</button>
                                <button onClick={()=>openPrescription(c)} className="table-btn-primary">Receta</button>
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"10px 20px", borderTop:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", fontSize:12, color:"#94A3B8" }}>
                <span>{filtered.length} registro(s)</span><span>Total: {cases.length}</span>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedCase && (
        <MModal onClose={()=>setSelectedCase(null)} title={`Caso ${selectedCase.id}`}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            {[["Ubicacion",selectedCase.location],["Productor",selectedCase.farmer],["Diagnostico IA",selectedCase.diagnosis],["Certeza",`${selectedCase.confidence}%`],["Estado",selectedCase.status],["Fecha",selectedCase.date?.split("T")[0]],["Region",selectedCase.region],["GPS",`${selectedCase.lat?.toFixed(4)}, ${selectedCase.lng?.toFixed(4)}`]].map(([k,v])=>(
              <div key={k} style={{ background:"#F8FAFC", borderRadius:10, padding:"10px 14px" }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:"#94A3B8", marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#1E293B" }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{openPrescription(selectedCase);setSelectedCase(null);}} className="table-btn-primary" style={{ width:"100%", padding:12 }}>
            <Send size={14} style={{ display:"inline", marginRight:6 }}/>Emitir Receta Agronomica
          </button>
        </MModal>
      )}

      {/* Prescription Modal */}
      {prescriptionCase && (
        <MModal onClose={()=>setPrescriptionCase(null)} title={`Receta · ${prescriptionCase.farmer}`}>
          <p style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
            Diagnostico: <strong style={{ color:"#1E293B" }}>{prescriptionCase.diagnosis}</strong> · Certeza: <strong style={{ color:"#005088" }}>{prescriptionCase.confidence}%</strong>
          </p>
          <textarea value={prescriptionText} onChange={e=>setPrescriptionText(e.target.value)}
            style={{ width:"100%", minHeight:130, padding:12, borderRadius:10, border:"1.5px solid #E2E8F0",
              fontFamily:"Outfit,sans-serif", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box", color:"#1E293B" }}/>
          <button onClick={savePrescription} className="table-btn-primary" style={{ width:"100%", marginTop:12, padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Send size={14}/> Guardar y Enviar Receta
          </button>
        </MModal>
      )}
    </div>
  );
}

function SBadge({ s }) {
  const m = { "Critico":["#FEF2F2","#DC2626","#FECACA"], "En seguimiento":["#FFFBEB","#D97706","#FDE68A"], "Resuelto":["#F0FDF4","#16A34A","#BBF7D0"] };
  const [bg,color,border] = m[s] || ["#F8FAFC","#64748B","#E2E8F0"];
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, backgroundColor:bg, color, border:`1px solid ${border}`, whiteSpace:"nowrap" }}>{s||"Sin estado"}</span>;
}

function MModal({ onClose, title, children }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,0.6)", backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:520, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:"#1E293B" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:8, cursor:"pointer" }}><X size={15}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
