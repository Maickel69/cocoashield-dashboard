import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { User, MapPin, ExternalLink, X, Compass, Layers, ShieldAlert, Sparkles } from "lucide-react";

export default function GisMap({
  cases,
  theme,
  filterDisease,
  setFilterDisease,
  selectedCase,
  setSelectedCase,
  onOpenPrescription,
  onOpenLightbox
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [mapLayer, setMapLayer] = useState("carto"); // "carto" | "osm" | "satellite"

  // Inicializar mapa de Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Coordenadas centrales región cacaotera Amazonía / Napo / Sucumbíos
    const centerLat = -1.025;
    const centerLng = -77.545;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar capa de mosaicos según tema y selección
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remover capas de azulejos existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = "";
    if (mapLayer === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (theme === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(map);
  }, [theme, mapLayer]);

  // Actualizar marcadores interactivos georreferenciados
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const bounds = [];

    cases.forEach((item) => {
      if (typeof item.lat !== "number" || typeof item.lng !== "number") return;

      const isCritical = item.status === "Crítico" || item.diagnosis === "Monilia";
      const isWarning = item.status === "En seguimiento" || item.diagnosis === "Escoba de Bruja" || item.diagnosis === "Mazorca Negra";
      const color = item.diagnosis === "Sano" ? "#10B981" : isCritical ? "#EF4444" : isWarning ? "#F59E0B" : "#3B82F6";

      const isSelected = selectedCase?.id === item.id;

      // Icono HTML con núcleo brillante y anillo pulsante
      const iconHtml = `
        <div class="gis-pulse-marker">
          <div class="gis-marker-pulse" style="background-color: ${color}; transform: scale(${isSelected ? 1.4 : 1});"></div>
          <div class="gis-marker-core" style="background-color: ${color}; transform: scale(${isSelected ? 1.3 : 1}); box-shadow: 0 0 ${isSelected ? 12 : 6}px ${color};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      marker.on("click", () => {
        setSelectedCase(item);
        map.panTo([item.lat, item.lng], { animate: true, duration: 0.5 });
      });

      marker.addTo(layer);
      bounds.push([item.lat, item.lng]);
    });

    if (bounds.length > 0 && !selectedCase) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [cases, selectedCase]);

  // Si se selecciona un caso desde fuera, centrar mapa en sus coordenadas
  useEffect(() => {
    if (selectedCase && mapInstanceRef.current && typeof selectedCase.lat === "number") {
      mapInstanceRef.current.setView([selectedCase.lat, selectedCase.lng], 14, { animate: true });
    }
  }, [selectedCase]);

  return (
    <div className="gis-map-wrapper">
      {/* Controles flotantes superiores */}
      <div className="gis-floating-header">
        {/* Chips de filtro por patógeno */}
        <div className="gis-floating-pills">
          {["Todas", "Monilia", "Mazorca Negra", "Escoba de Bruja", "Sano"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDisease(d)}
              className={`disease-filter-chip ${filterDisease === d ? "active" : ""}`}
              style={{ fontSize: 11.5, padding: "5px 12px" }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* HUD resumen y selector de capa */}
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <div className="gis-hud-badge">
            <Compass size={14} color="#11CAA0" />
            <span>{cases.length} Fincas Monitoreadas</span>
          </div>

          <button
            onClick={() => setMapLayer((p) => (p === "carto" ? "satellite" : "carto"))}
            title="Alternar satélite / mapa"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 12,
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-dark)",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              cursor: "pointer"
            }}
          >
            <Layers size={13} color="#11CAA0" />
            <span>{mapLayer === "satellite" ? "Mapa" : "Satélite"}</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div ref={mapContainerRef} className="gis-map-element" />

      {/* Ficha Emergente de Finca / Caso Seleccionado */}
      {selectedCase && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 1000,
            width: 340,
            backgroundColor: "var(--color-modal-bg)",
            borderRadius: 16,
            border: "1px solid var(--color-border)",
            boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
            animation: "fadeIn 0.25s ease-out"
          }}
        >
          {/* Header de la ficha */}
          <div style={{ position: "relative", height: 130, backgroundColor: "#0B192C" }}>
            {selectedCase.image || selectedCase.photo ? (
              <img
                src={selectedCase.image || selectedCase.photo}
                alt={selectedCase.diagnosis}
                style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                onClick={() =>
                  onOpenLightbox({
                    url: selectedCase.image || selectedCase.photo,
                    title: `Caso ${selectedCase.id} · ${selectedCase.diagnosis}`
                  })
                }
              />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                🌿
              </div>
            )}
            <button
              onClick={() => setSelectedCase(null)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0, 0, 0, 0.65)",
                border: "none",
                borderRadius: 8,
                padding: 5,
                color: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={14} />
            </button>
            <span
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                backgroundColor: "rgba(11, 25, 44, 0.85)",
                color: "#38BDF8",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "monospace"
              }}
            >
              {selectedCase.id}
            </span>
          </div>

          {/* Cuerpo de la ficha */}
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--color-text-dark)" }}>
                  {selectedCase.location}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--color-text-muted)" }}>
                  {selectedCase.farmer} · {selectedCase.region}
                </p>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor:
                    selectedCase.diagnosis === "Sano"
                      ? "rgba(16, 185, 129, 0.15)"
                      : selectedCase.diagnosis === "Monilia"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color:
                    selectedCase.diagnosis === "Sano"
                      ? "#10B981"
                      : selectedCase.diagnosis === "Monilia"
                      ? "#EF4444"
                      : "#F59E0B"
                }}
              >
                {selectedCase.diagnosis}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
              <div style={{ background: "var(--color-card-subtle)", padding: "8px 10px", borderRadius: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>CERTEZA IA</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#10B981" }}>{selectedCase.confidence}%</span>
              </div>
              <div style={{ background: "var(--color-card-subtle)", padding: "8px 10px", borderRadius: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", display: "block" }}>ESTADO</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-dark)" }}>{selectedCase.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <a
                href={`https://maps.google.com/?q=${selectedCase.lat},${selectedCase.lng}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "var(--color-card-subtle)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-dark)",
                  fontSize: 11.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center"
                }}
              >
                <ExternalLink size={13} />
                <span>Google Maps</span>
              </a>

              <button
                onClick={() => onOpenPrescription(selectedCase)}
                style={{
                  flex: 1.3,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #005088, #0070bb)",
                  color: "#FFFFFF",
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0, 80, 136, 0.3)"
                }}
              >
                Emitir Receta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
