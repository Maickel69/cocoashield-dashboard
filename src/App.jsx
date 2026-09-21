import { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, Map as MapIcon, FileSpreadsheet,
  AlertTriangle, Search, Download, X,
  MapPin, User, Cpu, Send, Sparkles, Info, LogOut,
  Shield, Activity, Users, BarChart3, Lock, Eye, EyeOff,
  ShieldAlert, Sun, Moon
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from "recharts";
import { MONTHLY_OUTBREAKS, CASES_TABLE } from "./data/mockData";
import GisMap from "./components/GisMap";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://cocoashield-backend.onrender.com";

const RECS = {
  "Monilia": "Aplicar remocion de mazorcas infectadas antes de la esporulacion. Realizar podas fitosanitarias para facilitar la aireacion del dosel. Cubrir frutos caidos con hojarasca.",
  "Escoba de Bruja": "Cortar ramas deformadas a 30 cm por debajo de la base infectada. Desinfectar herramientas con alcohol al 70%. Enterrar o quemar residuos vegetales.",
  "Mazorca Negra": "Mejorar el drenaje del terreno. Realizar podas para mayor entrada de radiacion solar. Retirar frutos momificados.",
  "Sano": "Mantener cronograma regular de monitoreo preventivo semanal."
};

// ── CUENTAS AUTORIZADAS ────────────────────────────────────────────────────────
const REGISTERED_ACCOUNTS = [
  {
    identifiers: ["8040182@unamad.edu.pe", "8040182", "maickel"],
    passwords: ["cocoashield2026", "8040182", "maickel2026", "123456"],
    name: "Maickel (UNAMAD)",
    email: "8040182@unamad.edu.pe",
    role: "Dueño / Propietario",
    canAccessDashboard: true,
    avatar: null
  },
  {
    identifiers: ["admin@cocoashield.com", "admin"],
    passwords: ["cocoashield2026", "admin2026", "admin", "123456"],
    name: "Administrador Central",
    email: "admin@cocoashield.com",
    role: "Administrador",
    canAccessDashboard: true,
    avatar: null
  },
  {
    identifiers: ["maicolalverto158@gmail.com", "maicolalverto158", "maicol"],
    passwords: ["cocoashield2026", "maicol158", "123456"],
    name: "Maicol Alberto",
    email: "maicolalverto158@gmail.com",
    role: "Trabajador de Campo",
    canAccessDashboard: false, // Solo app móvil
    avatar: null
  }
];

// ── PANTALLA DE LOGIN TRADICIONAL ──────────────────────────────────────────────
function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [workerBlocked, setWorkerBlocked] = useState(null);

  // Limpiar parámetros feos de OAuth previos en la barra de direcciones
  useEffect(() => {
    if (window.location.search.includes("error") || window.location.search.includes("code")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setWorkerBlocked(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMsg("Por favor, ingresa tu correo o usuario.");
      return;
    }
    if (!cleanPass) {
      setErrorMsg("Por favor, ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Buscar cuenta
      const account = REGISTERED_ACCOUNTS.find(acc =>
        acc.identifiers.some(id => id.toLowerCase() === cleanId)
      );

      if (!account) {
        setLoading(false);
        setErrorMsg("Usuario o correo no registrado en el sistema.");
        return;
      }

      // Validar contraseña
      const passValid = account.passwords.includes(cleanPass);
      if (!passValid) {
        setLoading(false);
        setErrorMsg("Contraseña incorrecta. Inténtalo nuevamente.");
        return;
      }

      // Verificar si es trabajador (acceso exclusivo a app móvil)
      if (!account.canAccessDashboard) {
        setLoading(false);
        setWorkerBlocked(account);
        return;
      }

      // Login exitoso
      const sessionData = {
        name: account.name,
        email: account.email,
        role: account.role,
        avatar: account.avatar,
        loginAt: new Date().toISOString()
      };

      if (rememberMe) {
        localStorage.setItem("cocoashield_user", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("cocoashield_user", JSON.stringify(sessionData));
      }

      setLoading(false);
      onLoginSuccess(sessionData);
    }, 450);
  };

  const fillQuick = (accType) => {
    if (accType === "owner") {
      setIdentifier("8040182@unamad.edu.pe");
      setPassword("cocoashield2026");
      setErrorMsg("");
      setWorkerBlocked(null);
    } else if (accType === "admin") {
      setIdentifier("admin");
      setPassword("cocoashield2026");
      setErrorMsg("");
      setWorkerBlocked(null);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 50% 20%, #0d2744 0%, #0B192C 75%, #060e18 100%)",
      fontFamily: "Outfit, sans-serif", position: "relative", overflow: "hidden", padding: "20px"
    }}>
      {/* Luces de fondo decorativas */}
      <div style={{ position: "absolute", top: "-15%", right: "-10%", width: 520, height: 520,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(17,202,160,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", left: "-15%", width: 620, height: 620,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,80,136,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        background: "rgba(15, 29, 49, 0.75)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "42px 38px",
        width: "100%", maxWidth: 430, boxShadow: "0 32px 70px rgba(0,0,0,0.55)", position: "relative", zIndex: 1
      }}>
        {/* Cabecera del login */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #005088 0%, #11CAA0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 10px 24px rgba(17,202,160,0.3)"
          }}>🌿</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0 }}>
            CocoaShield
          </h1>
          <p style={{ fontSize: 12, color: "#11CAA0", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", margin: "4px 0 10px" }}>
            Panel de Control Central
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
            Acceso administrativo y monitoreo fitosanitario
          </p>
        </div>

        {/* Alerta de bloqueo para trabajadores */}
        {workerBlocked && (
          <div style={{
            background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FBBF24", fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
              <ShieldAlert size={17} />
              <span>Cuenta de Trabajador de Campo</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.45 }}>
              Hola <strong>{workerBlocked.name}</strong>. Esta cuenta solo tiene acceso a la <strong>App Móvil</strong> para capturar fotos y diagnósticos en campo.
            </p>
            <div style={{ marginTop: 10 }}>
              <a href="https://movil-chi.vercel.app" target="_blank" rel="noreferrer" style={{
                display: "inline-block", background: "#F59E0B", color: "#1E293B", padding: "6px 12px",
                borderRadius: 8, fontSize: 11.5, fontWeight: 700, textDecoration: "none"
              }}>
                Abrir App Móvil de Trabajadores →
              </a>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 12, padding: "12px 14px", marginBottom: 20, color: "#FCA5A5", fontSize: 12.5,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 7 }}>
              Usuario o Correo Electrónico
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ej. 8040182 o admin"
                autoComplete="username"
                style={{
                  width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                  color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#11CAA0"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                Contraseña
              </label>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingresa tu clave"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "12px 42px 12px 40px", borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                  color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#11CAA0"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4,
                  display: "flex", alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: "#11CAA0", width: 15, height: 15, cursor: "pointer" }}
              />
              <span>Recordar sesión</span>
            </label>
            <span style={{ fontSize: 11, color: "#11CAA0", opacity: 0.8 }}>Seguro y Privado</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, marginTop: 4,
              background: loading ? "rgba(17,202,160,0.5)" : "linear-gradient(135deg, #11CAA0 0%, #008f6f 100%)",
              border: "none", color: "#0B192C", fontSize: 14.5, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10, transition: "all 0.2s",
              boxShadow: "0 8px 20px rgba(17,202,160,0.3)"
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 18, height: 18, border: "2px solid rgba(11,25,44,0.3)",
                  borderTopColor: "#0B192C", borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.8s linear infinite"
                }} />
                <span>Ingresando al panel...</span>
              </>
            ) : (
              <span>Ingresar al Panel de Control</span>
            )}
          </button>
        </form>

        {/* Acceso rápido / Atajos para Dueño y Admin */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 10px", textAlign: "center" }}>
            Autocompletar acceso rápido:
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => fillQuick("owner")}
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#11CAA0", fontSize: 11.5,
                fontWeight: 700, cursor: "pointer", transition: "all 0.2s", textAlign: "center"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(17,202,160,0.12)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              👑 Dueño (8040182)
            </button>
            <button
              type="button"
              onClick={() => fillQuick("admin")}
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#38BDF8", fontSize: 11.5,
                fontWeight: 700, cursor: "pointer", transition: "all 0.2s", textAlign: "center"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(56,189,248,0.12)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser]     = useState(null);
  const [authLoading, setAuthLoading]     = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [backendStatus, setBackendStatus] = useState("connecting");
  const sseRef = useRef(null);
  const [cases, setCases]           = useState([]);
  const [monthlyData, setMonthlyData] = useState(MONTHLY_OUTBREAKS);
  const [toasts, setToasts]         = useState([]);
  const [selectedCase, setSelectedCase]         = useState(null);
  const [prescriptionCase, setPrescriptionCase] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [selectedMapCase, setSelectedMapCase]   = useState(null);
  const [filterRegion, setFilterRegion]   = useState("Todas");
  const [filterDisease, setFilterDisease] = useState("Todas");
  const [filterDate, setFilterDate]       = useState("Todos");
  const [searchQuery, setSearchQuery]     = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [theme, setTheme]                 = useState(() => localStorage.getItem("cocoashield_theme") || "dark");

  // Sincronizar tema con elemento raíz HTML
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cocoashield_theme", theme);
  }, [theme]);

  // Cargar sesión persistida al arrancar
  useEffect(() => {
    try {
      const savedLocal = localStorage.getItem("cocoashield_user");
      const savedSession = sessionStorage.getItem("cocoashield_user");
      const saved = savedLocal || savedSession;
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error cargando sesion", e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cocoashield_user");
    sessionStorage.removeItem("cocoashield_user");
    setCurrentUser(null);
  };

  const addToast = (title, msg) => {
    const id = Date.now() + "";
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

  // Cargar casos desde backend
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${BACKEND_URL}/api/cases`, { signal: AbortSignal.timeout(15000) })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          const normalized = d.map(c => ({
            ...c,
            image: c.image || c.photo,
            photo: c.image || c.photo
          }));
          const existingIds = new Set(normalized.map(x => x.id));
          const merged = [...normalized, ...CASES_TABLE.filter(x => !existingIds.has(x.id))];
          setCases(merged);
        } else {
          setCases(CASES_TABLE);
        }
        setBackendStatus("connected");
      })
      .catch(() => {
        setCases(CASES_TABLE);
        setBackendStatus("offline");
      });
  }, [currentUser]);

  // Suscripción SSE en tiempo real
  useEffect(() => {
    if (!currentUser) return;
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
  }, [currentUser]);

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
    if (filterDisease !== "Todas" && !c.diagnosis?.toLowerCase().includes(filterDisease.toLowerCase())) return false;
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
  }), [cases, filterRegion, filterDisease, filterDate, searchQuery]);

  const openPrescription = (c) => {
    setPrescriptionCase(c);
    setPrescriptionText(c.prescription || RECS[c.diagnosis] || RECS["Sano"]);
  };

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

  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0B192C" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:36, height:36, border:"3px solid rgba(17,202,160,0.25)", borderTopColor:"#11CAA0",
            borderRadius:"50%", margin:"0 auto 14px", animation:"spin 0.8s linear infinite" }} />
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontFamily:"Outfit,sans-serif" }}>Cargando CocoaShield...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={setCurrentUser} />;
  }

  const name = currentUser.name || "Usuario";
  const role = currentUser.role || "Administrador";

  return (
    <div className="dashboard-root">
      {/* Notificaciones Toast */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div className="toast-icon"><Sparkles size={15}/></div>
            <div className="toast-body"><h4 className="toast-title">{t.title}</h4><p className="toast-msg">{t.msg}</p></div>
            <button className="toast-close" onClick={() => setToasts(p=>p.filter(x=>x.id!==t.id))}><X size={13}/></button>
          </div>
        ))}
      </div>

      {/* Barra lateral / Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge" style={{ fontSize:20 }}>🌿</div>
          <div className="brand-info">
            <span className="brand-name">CocoaShield</span>
            <span className="brand-tagline">Panel Central</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(255,255,255,0.25)", padding:"12px 20px 6px" }}>Navegacion</p>
          {[
            { id:"dashboard", icon:<LayoutDashboard size={16}/>, label:"Inicio General" },
            { id:"map",       icon:<MapIcon size={16}/>,          label:"Mapa Epidemiologico" },
            { id:"reports",   icon:<FileSpreadsheet size={16}/>,  label:"Reportes y Recetas" }
          ].map(it => (
            <button key={it.id} onClick={() => setActiveSection(it.id)}
              className={`nav-item ${activeSection===it.id?"active":""}`}>
              {it.icon}<span>{it.label}</span>
            </button>
          ))}
        </nav>

        {/* Informacion del Usuario logueado */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#005088,#11CAA0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 10px rgba(17,202,160,0.25)"
            }}>
              {name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {name}
              </div>
              <div style={{ fontSize: 10.5, color: "#11CAA0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesion"
              style={{
                background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 7,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                e.currentTarget.style.color = "#EF4444";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              <LogOut size={15} color="currentColor" />
            </button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 6 }}>
            CocoaShield AI v1.0 · UNAMAD
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="main-wrapper">
        <header className="top-navbar">
          <div className="page-title-group">
            {activeSection==="dashboard" && <><h1>Panel Analitico</h1><p>Monitoreo fitosanitario del cacao en tiempo real</p></>}
            {activeSection==="map"       && <><h1>Mapa Epidemiologico</h1><p>Distribucion geografica de brotes activos</p></>}
            {activeSection==="reports"   && <><h1>Reportes y Recetas</h1><p>Historial de diagnosticos IA y fichas agronomicas</p></>}
          </div>
          <div className="top-nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(p => p === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {theme === "dark" ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#38BDF8" />}
              <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>

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
          {/* DASHBOARD PRINCIPAL */}
          {activeSection==="dashboard" && (
            <>
              <section className="kpi-row">
                {[
                  {
                    icon: <Activity size={20} color="#0284C7" />,
                    title: "Total Escaneos",
                    value: metrics.totalScans,
                    trend: "+12% este mes",
                    trendType: "pos",
                    accent: "linear-gradient(90deg, #0284C7, #38BDF8)",
                    iconBg: "rgba(2, 132, 199, 0.12)"
                  },
                  {
                    icon: <AlertTriangle size={20} color="#EF4444" />,
                    title: "Alertas Fitosanitarias",
                    value: metrics.alerts,
                    trend: "Requieren atención",
                    trendType: "neg",
                    accent: "linear-gradient(90deg, #DC2626, #EF4444)",
                    iconBg: "rgba(239, 68, 68, 0.12)"
                  },
                  {
                    icon: <Cpu size={20} color="#F59E0B" />,
                    title: "Patógeno Predominante",
                    value: metrics.top,
                    trend: "Incidencia prioritaria",
                    trendType: "warn",
                    accent: "linear-gradient(90deg, #D97706, #F59E0B)",
                    iconBg: "rgba(245, 158, 11, 0.12)",
                    isText: true
                  },
                  {
                    icon: <Users size={20} color="#10B981" />,
                    title: "Productores en Campo",
                    value: metrics.farmers,
                    trend: "13 brigadas activas",
                    trendType: "pos",
                    accent: "linear-gradient(90deg, #059669, #10B981)",
                    iconBg: "rgba(16, 185, 129, 0.12)"
                  }
                ].map((k, i) => (
                  <div key={i} className="kpi-card-v2" style={{ "--kpi-gradient": k.accent }}>
                    <div className="kpi-card-v2-header">
                      <span className="kpi-card-v2-title">{k.title}</span>
                      <div className="kpi-card-v2-icon" style={{ backgroundColor: k.iconBg }}>
                        {k.icon}
                      </div>
                    </div>
                    <div className="kpi-card-v2-body">
                      <div className="kpi-card-v2-value" style={{ fontSize: k.isText ? 21 : 34 }}>
                        {k.value}
                      </div>
                    </div>
                    <div className="kpi-card-v2-footer">
                      <span
                        className="kpi-card-v2-trend"
                        style={{
                          backgroundColor:
                            k.trendType === "pos"
                              ? "rgba(16, 185, 129, 0.12)"
                              : k.trendType === "neg"
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(245, 158, 11, 0.12)",
                          color:
                            k.trendType === "pos"
                              ? "#10B981"
                              : k.trendType === "neg"
                              ? "#EF4444"
                              : "#F59E0B"
                        }}
                      >
                        {k.trend}
                      </span>
                    </div>
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
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#F1F5F9"}/>
                        <XAxis dataKey="month" stroke={theme === "dark" ? "#64748B" : "#94A3B8"} fontSize={11} fontWeight={600}/>
                        <YAxis stroke={theme === "dark" ? "#64748B" : "#94A3B8"} fontSize={11} fontWeight={600}/>
                        <Tooltip contentStyle={{
                          borderRadius:12,
                          border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
                          boxShadow:"0 8px 24px rgba(0,0,0,0.25)",
                          backgroundColor: theme === "dark" ? "#121C30" : "#FFFFFF",
                          color: theme === "dark" ? "#F8FAFC" : "#0F172A",
                          fontFamily:"Outfit,sans-serif"
                        }}/>
                        <Legend wrapperStyle={{ fontSize:12, fontWeight:600 }}/>
                        <Line type="monotone" dataKey="Monilia" stroke="#38BDF8" strokeWidth={2.5} activeDot={{ r:6 }}/>
                        <Line type="monotone" dataKey="EscobaDebruja" stroke="#11CAA0" strokeWidth={2.5} name="Escoba de Bruja"/>
                        <Line type="monotone" dataKey="MazorcaNegra" stroke="#F59E0B" strokeWidth={2.5} name="Mazorca Negra"/>
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
                        <Tooltip formatter={v => [`${v} casos`,"Frecuencia"]} contentStyle={{
                          borderRadius:10,
                          backgroundColor: theme === "dark" ? "#121C30" : "#FFFFFF",
                          border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
                          color: theme === "dark" ? "#F8FAFC" : "#0F172A"
                        }}/>
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
                    <h2 style={{ display:"flex", alignItems:"center", gap:8 }}><BarChart3 size={17} color="#11CAA0"/>Ultimos Diagnosticos</h2>
                    <p>Los casos mas recientes registrados en el sistema</p>
                  </div>
                </div>
                <div style={{ padding:"0 20px 16px" }}>
                  {cases.slice(0,6).map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid var(--color-border)" }}>
                      <span className="case-id-badge">{c.id}</span>
                      <div 
                        onClick={() => (c.image || c.photo) && setLightboxImage({ url: c.image || c.photo, title: `Caso ${c.id} · ${c.diagnosis}` })}
                        title={(c.image || c.photo) ? "Clic para ampliar foto" : "Sin foto"}
                        style={{
                          width: 40, height: 40, borderRadius: 10, overflow: "hidden",
                          border: "1px solid var(--color-border)", flexShrink: 0, cursor: (c.image || c.photo) ? "pointer" : "default",
                          backgroundColor: "var(--color-card-subtle)", display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        {(c.image || c.photo) ? (
                          <img src={c.image || c.photo} alt={c.diagnosis} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 16 }}>🌿</span>
                        )}
                      </div>
                      <div style={{ flex:1, minWidth: 0 }}>
                        <div style={{ fontSize:13.5, fontWeight:700, color:"var(--color-text-dark)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {c.diagnosis}
                        </div>
                        <div style={{ fontSize:11.5, color:"var(--color-text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {c.location} · {c.farmer}
                        </div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:"#10B981" }}>{c.confidence}%</span>
                      <SBadge s={c.status}/>
                    </div>
                  ))}
                  {cases.length===0 && <p style={{ color:"var(--color-text-muted)", textAlign:"center", padding:"28px 0", fontSize:13 }}>Sin diagnósticos aún. Usa la app móvil para registrar el primer caso.</p>}
                </div>
              </section>
            </>
          )}

          {/* MAPA EPIDEMIOLOGICO GIS INTERACTIVO */}
          {activeSection==="map" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <GisMap
                cases={filtered}
                theme={theme}
                filterDisease={filterDisease}
                setFilterDisease={setFilterDisease}
                selectedCase={selectedMapCase}
                setSelectedCase={setSelectedMapCase}
                onOpenPrescription={openPrescription}
                onOpenLightbox={setLightboxImage}
              />
            </div>
          )}

          {/* REPORTES Y RECETAS */}
          {activeSection==="reports" && (
            <section className="table-card">
              <div className="table-header-row" style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20, borderBottom:"1px solid #E2E8F0", paddingBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div style={{ display:"flex", gap:12, flex:1, flexWrap:"wrap", alignItems:"center" }}>
                    <div style={{ position:"relative", flex:1, minWidth:240, maxWidth:380 }}>
                      <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
                      <input className="search-input" placeholder="Buscar por ID, finca, productor, patógeno..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                    </div>
                    <select className="filter-select" style={{ maxWidth:190 }} value={filterRegion} onChange={e=>setFilterRegion(e.target.value)}>
                      {["Todas","Sucumbios","Napo","Orellana","Pastaza"].map(v=><option key={v} value={v}>{v==="Todas"?"Todas las provincias":v}</option>)}
                    </select>
                  </div>
                  <button className="export-btn" onClick={exportCSV}><Download size={14}/> Exportar Excel</button>
                </div>

                {/* Filtros rápidos de Enfermedad */}
                <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
                  {["Todas", "Monilia", "Mazorca Negra", "Escoba de Bruja", "Sano"].map(d => (
                    <button
                      key={d}
                      onClick={() => setFilterDisease(d)}
                      className={`disease-filter-chip ${filterDisease === d ? "active" : ""}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid #E2E8F0" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {["ID Caso", "Evidencia", "Ubicación / Finca", "Provincia", "Fecha", "Diagnóstico IA", "Certeza", "Estado", "Productor", "Acciones"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0
                      ? <tr><td colSpan={10} style={{ textAlign:"center", padding:40, color:"#94A3B8" }}>No se encontraron registros con los filtros seleccionados.</td></tr>
                      : filtered.map(c => (
                          <tr key={c.id}>
                            <td><span className="case-id-badge">{c.id}</span></td>
                            <td>
                              <div 
                                onClick={() => (c.image || c.photo) && setLightboxImage({ url: c.image || c.photo, title: `Caso ${c.id} · ${c.diagnosis}` })}
                                title={(c.image || c.photo) ? "Clic para ampliar foto" : "Sin foto"}
                                style={{
                                  width: 46, height: 46, borderRadius: 10, overflow: "hidden",
                                  border: "1.5px solid #E2E8F0", backgroundColor: "#F8FAFC",
                                  cursor: (c.image || c.photo) ? "pointer" : "default",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)", position: "relative"
                                }}
                              >
                                {(c.image || c.photo) ? (
                                  <img src={c.image || c.photo} alt={c.diagnosis} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <span style={{ fontSize: 20 }}>🌿</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight:700, color:"#1E293B", fontSize:13 }}>{c.location}</div>
                              <div style={{ fontSize:11, color:"#94A3B8" }}>GPS: {c.lat?.toFixed(4)}, {c.lng?.toFixed(4)}</div>
                            </td>
                            <td style={{ fontSize:13, fontWeight:600, color:"#475569" }}>{c.region}</td>
                            <td style={{ fontSize:12, color:"#64748B" }}>{c.date?.split("T")[0]}</td>
                            <td>
                              <span style={{ display:"inline-flex", flexDirection:"column", gap:2 }}>
                                <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontWeight:750, fontSize:13, color:"#1E293B" }}>
                                  <span style={{
                                    width:9, height:9, borderRadius:"50%",
                                    backgroundColor: c.diagnosis==="Sano"?"#10B981":c.diagnosis==="Monilia"?"#EF4444":c.diagnosis==="Mazorca Negra"?"#F59E0B":"#D97706",
                                    boxShadow: `0 0 6px ${c.diagnosis==="Sano"?"#10B981":c.diagnosis==="Monilia"?"#EF4444":"#F59E0B"}`
                                  }}/>
                                  {c.diagnosis}
                                </span>
                                <span style={{ fontSize:10.5, fontStyle:"italic", color:"#94A3B8" }}>
                                  {c.diagnosis==="Monilia"?"M. roreri":c.diagnosis==="Mazorca Negra"?"Phytophthora spp.":c.diagnosis==="Escoba de Bruja"?"M. perniciosa":"Saludable"}
                                </span>
                              </span>
                            </td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:38, height:6, backgroundColor:"#E2E8F0", borderRadius:4, overflow:"hidden" }}>
                                  <div style={{ width:`${c.confidence}%`, height:"100%", backgroundColor: c.confidence>90?"#10B981":"#F59E0B" }}/>
                                </div>
                                <span style={{ fontWeight:800, color:"#005088", fontSize:12.5 }}>{c.confidence}%</span>
                              </div>
                            </td>
                            <td><SBadge s={c.status}/></td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:24, height:24, borderRadius:"50%", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10.5, fontWeight:800, color:"#475569" }}>
                                  {c.farmer ? c.farmer[0]?.toUpperCase() : "T"}
                                </div>
                                <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{c.farmer}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display:"flex", gap:6 }}>
                                <button onClick={()=>setSelectedCase(c)} className="table-btn-outline" title="Ver ficha técnica completa">
                                  <Eye size={13} style={{ display:"inline", marginRight:4 }}/> Ver
                                </button>
                                <button onClick={()=>openPrescription(c)} className="table-btn-primary" title="Emitir receta agronómica">
                                  <Send size={13} style={{ display:"inline", marginRight:4 }}/> Receta
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"#94A3B8" }}>
                <span>Mostrando {filtered.length} de {cases.length} caso(s)</span>
                <span>CocoaShield Cloud Database · Sincronizado</span>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL DE FICHA TÉCNICA DETALLADA */}
      {selectedCase && (
        <MModal onClose={()=>setSelectedCase(null)} title={`Ficha Técnica · Caso ${selectedCase.id}`}>
          <div style={{ display:"flex", gap:16, flexDirection:"column" }}>
            {/* Fotografía de Campo Ampliada */}
            <div style={{
              width: "100%", height: 230, borderRadius: 16, overflow: "hidden",
              backgroundColor: "#0B192C", border: "1.5px solid #E2E8F0",
              position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
            }}>
              {(selectedCase.image || selectedCase.photo) ? (
                <img 
                  src={selectedCase.image || selectedCase.photo} 
                  alt={selectedCase.diagnosis} 
                  style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "zoom-in" }}
                  onClick={() => setLightboxImage({ url: selectedCase.image || selectedCase.photo, title: `${selectedCase.id} - ${selectedCase.diagnosis}` })}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#94A3B8" }}>
                  <span style={{ fontSize: 40, display:"block", marginBottom:6 }}>🌿</span>
                  <div style={{ fontSize: 12 }}>Sin imagen capturada para este caso</div>
                </div>
              )}
              <div style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.75)", color: "#11CAA0", padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 800 }}>
                {selectedCase.confidence}% Certeza IA
              </div>
            </div>

            {/* Grid de Metadatos */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10 }}>
              {[
                ["Diagnóstico IA", selectedCase.diagnosis],
                ["Nombre Científico", selectedCase.diagnosis === "Monilia" ? "Moniliophthora roreri" : (selectedCase.diagnosis === "Escoba de Bruja" ? "Moniliophthora perniciosa" : (selectedCase.diagnosis === "Mazorca Negra" ? "Phytophthora spp." : "Theobroma cacao"))],
                ["Finca / Parcela", selectedCase.location],
                ["Productor Responsable", selectedCase.farmer],
                ["Provincia", selectedCase.region],
                ["Fecha de Escaneo", selectedCase.date?.split("T")[0]],
                ["Nivel de Severidad", selectedCase.severity || "Alta"],
                ["Estado Operativo", selectedCase.status]
              ].map(([k,v])=>(
                <div key={k} style={{ background:"#F8FAFC", borderRadius:12, padding:"10px 12px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:"#94A3B8", marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:"#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Coordenadas GPS */}
            {selectedCase.lat && selectedCase.lng && (
              <a 
                href={`https://www.google.com/maps?q=${selectedCase.lat},${selectedCase.lng}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", borderRadius: 12, backgroundColor: "#E6FDF4",
                  border: "1.5px solid #A7F3D0", color: "#047857", textDecoration: "none", fontSize: 12.5, fontWeight: 700
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} />
                  <span>GPS: {selectedCase.lat?.toFixed(4)}, {selectedCase.lng?.toFixed(4)}</span>
                </div>
                <span style={{ fontSize: 11, textDecoration: "underline" }}>Ver en Google Maps ↗</span>
              </a>
            )}

            {/* Protocolo Fitosanitario */}
            <div style={{ background: "#F0F9FF", border: "1.5px solid #BAE6FD", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0369A1", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> Recomendación de Manejo Agronómico:
              </div>
              <p style={{ fontSize: 12, color: "#0C4A6E", margin: 0, lineHeight: 1.5 }}>
                {selectedCase.prescription || RECS[selectedCase.diagnosis] || RECS["Sano"]}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button 
                onClick={()=>{openPrescription(selectedCase);setSelectedCase(null);}} 
                className="table-btn-primary" 
                style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Send size={15}/> Emitir / Modificar Receta
              </button>
              <button 
                onClick={()=>setSelectedCase(null)} 
                className="table-btn-outline" 
                style={{ padding: "12px 20px" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </MModal>
      )}

      {/* MODAL DE RECETA AGRONÓMICA */}
      {prescriptionCase && (
        <MModal onClose={()=>setPrescriptionCase(null)} title={`Receta Agronómica · ${prescriptionCase.farmer}`}>
          <p style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
            Diagnóstico: <strong style={{ color:"#1E293B" }}>{prescriptionCase.diagnosis}</strong> · Certeza: <strong style={{ color:"#005088" }}>{prescriptionCase.confidence}%</strong> · Finca: <strong style={{ color:"#1E293B" }}>{prescriptionCase.location}</strong>
          </p>
          <textarea value={prescriptionText} onChange={e=>setPrescriptionText(e.target.value)}
            placeholder="Escribe las indicaciones técnicas para el productor..."
            style={{ width:"100%", minHeight:130, padding:14, borderRadius:12, border:"1.5px solid #CBD5E1",
              fontFamily:"Outfit,sans-serif", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box", color:"#1E293B" }}/>
          <button onClick={savePrescription} className="table-btn-primary" style={{ width:"100%", marginTop:14, padding:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Send size={15}/> Guardar y Enviar al Agricultor
          </button>
        </MModal>
      )}

      {/* MODAL LIGHTBOX PARA FOTOS EN PANTALLA COMPLETA */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            backgroundColor: "rgba(10, 18, 30, 0.9)",
            backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 24, cursor: "zoom-out"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 12, alignItems: "center" }}>
              <span style={{ color: "#FFF", fontSize: 14, fontWeight: 700 }}>{lightboxImage.title}</span>
              <button onClick={()=>setLightboxImage(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#FFF", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.title}
              style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 16, border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", objectFit: "contain" }}
            />
          </div>
        </div>
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
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,0.65)", backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:26, width:"100%", maxWidth:560, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:"#1E293B" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:8, cursor:"pointer" }}><X size={15}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
