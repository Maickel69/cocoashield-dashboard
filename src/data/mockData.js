// mockData.js — Shared dataset for CocoaShield Cloud Ecosystem dashboard

export const KPI_DATA = {
  totalScans: 1842,
  activeAlerts: 23,
  topDisease: 'Monilia del Cacao',
  iotSensors: 47,
};

export const MONTHLY_OUTBREAKS = [
  { month: 'Ene', Monilia: 12, EscobaDebruja: 8, MazorcaNegra: 4 },
  { month: 'Feb', Monilia: 19, EscobaDebruja: 10, MazorcaNegra: 6 },
  { month: 'Mar', Monilia: 28, EscobaDebruja: 14, MazorcaNegra: 9 },
  { month: 'Abr', Monilia: 22, EscobaDebruja: 11, MazorcaNegra: 7 },
  { month: 'May', Monilia: 35, EscobaDebruja: 18, MazorcaNegra: 12 },
  { month: 'Jun', Monilia: 41, EscobaDebruja: 22, MazorcaNegra: 14 },
  { month: 'Jul', Monilia: 38, EscobaDebruja: 19, MazorcaNegra: 11 },
  { month: 'Ago', Monilia: 52, EscobaDebruja: 27, MazorcaNegra: 16 },
  { month: 'Sep', Monilia: 47, EscobaDebruja: 24, MazorcaNegra: 15 },
  { month: 'Oct', Monilia: 61, EscobaDebruja: 31, MazorcaNegra: 18 },
  { month: 'Nov', Monilia: 55, EscobaDebruja: 28, MazorcaNegra: 17 },
  { month: 'Dic', Monilia: 44, EscobaDebruja: 23, MazorcaNegra: 14 },
];

export const PATHOGEN_PIE = [
  { name: 'Monilia', value: 54, color: '#005088' },
  { name: 'Escoba de Bruja', value: 29, color: '#11CAA0' },
  { name: 'Mazorca Negra', value: 17, color: '#F4B400' },
];

export const MAP_MARKERS = [
  { id: 'M01', farm: 'Finca La Estrella – Lote A', lat: -1.0234, lng: -77.5432, disease: 'Monilia', confidence: 98, date: '2026-05-25', farmer: 'Carlos Muñoz', svgX: 190, svgY: 155, severity: 'alta' },
  { id: 'M02', farm: 'Cooperativa Sur – Parcela 3', lat: -1.0289, lng: -77.5478, disease: 'Escoba de Bruja', confidence: 91, date: '2026-05-24', farmer: 'Rosa Tipán', svgX: 280, svgY: 295, severity: 'media' },
  { id: 'M03', farm: 'Finca El Placer – Norte', lat: -1.0321, lng: -77.5385, disease: 'Mazorca Negra', confidence: 88, date: '2026-05-23', farmer: 'Héctor Villacís', svgX: 370, svgY: 120, severity: 'media' },
  { id: 'M04', farm: 'Finca La Estrella – Lote B', lat: -1.0256, lng: -77.5401, disease: 'Monilia', confidence: 95, date: '2026-05-22', farmer: 'Ana Torres', svgX: 230, svgY: 205, severity: 'alta' },
  { id: 'M05', farm: 'Lote Comunitario Bajo', lat: -1.0310, lng: -77.5502, disease: 'Escoba de Bruja', confidence: 93, date: '2026-05-21', farmer: 'José Lema', svgX: 110, svgY: 330, severity: 'alta' },
  { id: 'M06', farm: 'Finca San Pedro – Centro', lat: -1.0198, lng: -77.5460, disease: 'Sano', confidence: 99, date: '2026-05-20', farmer: 'Lucía Cárdenas', svgX: 310, svgY: 80, severity: 'ninguna' },
  { id: 'M07', farm: 'Hacienda Los Cedros', lat: -1.0345, lng: -77.5350, disease: 'Monilia', confidence: 97, date: '2026-05-19', farmer: 'Manuel Quispe', svgX: 440, svgY: 250, severity: 'alta' },
];

export const CASES_TABLE = [
  { id: 'CS-001', location: 'Finca La Estrella – Lote A', region: 'Sucumbíos', date: '2026-05-25', diagnosis: 'Monilia', confidence: 98, status: 'Crítico', farmer: 'Carlos Muñoz', lat: -1.0234, lng: -77.5432 },
  { id: 'CS-002', location: 'Cooperativa Sur – Parcela 3', region: 'Napo', date: '2026-05-24', diagnosis: 'Escoba de Bruja', confidence: 91, status: 'En seguimiento', farmer: 'Rosa Tipán', lat: -1.0289, lng: -77.5478 },
  { id: 'CS-003', location: 'Finca El Placer – Norte', region: 'Sucumbíos', date: '2026-05-23', diagnosis: 'Mazorca Negra', confidence: 88, status: 'Resuelto', farmer: 'Héctor Villacís', lat: -1.0321, lng: -77.5385 },
  { id: 'CS-004', location: 'Finca La Estrella – Lote B', region: 'Napo', date: '2026-05-22', diagnosis: 'Monilia', confidence: 95, status: 'Crítico', farmer: 'Ana Torres', lat: -1.0256, lng: -77.5401 },
  { id: 'CS-005', location: 'Lote Comunitario Bajo', region: 'Orellana', date: '2026-05-21', diagnosis: 'Escoba de Bruja', confidence: 93, status: 'Crítico', farmer: 'José Lema', lat: -1.0310, lng: -77.5502 },
  { id: 'CS-006', location: 'Finca San Pedro – Centro', region: 'Pastaza', date: '2026-05-20', diagnosis: 'Sano', confidence: 99, status: 'Resuelto', farmer: 'Lucía Cárdenas', lat: -1.0198, lng: -77.5460 },
  { id: 'CS-007', location: 'Hacienda Los Cedros', region: 'Napo', date: '2026-05-19', diagnosis: 'Monilia', confidence: 97, status: 'En seguimiento', farmer: 'Manuel Quispe', lat: -1.0345, lng: -77.5350 },
  { id: 'CS-008', location: 'Finca La Aurora', region: 'Sucumbíos', date: '2026-05-18', diagnosis: 'Mazorca Negra', confidence: 84, status: 'Resuelto', farmer: 'Patricia Yumbay', lat: -1.0271, lng: -77.5419 },
  { id: 'CS-009', location: 'Cooperativa Norte – Bloque 2', region: 'Napo', date: '2026-05-17', diagnosis: 'Escoba de Bruja', confidence: 89, status: 'En seguimiento', farmer: 'Diego Shiguango', lat: -1.0233, lng: -77.5388 },
  { id: 'CS-010', location: 'Lote Familiar Tena', region: 'Napo', date: '2026-05-16', diagnosis: 'Monilia', confidence: 96, status: 'Crítico', farmer: 'Marina Grefa', lat: -1.0299, lng: -77.5467 },
  { id: 'CS-011', location: 'Finca Comunitaria Puyo', region: 'Pastaza', date: '2026-05-15', diagnosis: 'Sano', confidence: 99, status: 'Resuelto', farmer: 'Rodrigo Vargas', lat: -1.0215, lng: -77.5510 },
  { id: 'CS-012', location: 'Asociación Cacao Orellana', region: 'Orellana', date: '2026-05-14', diagnosis: 'Mazorca Negra', confidence: 87, status: 'En seguimiento', farmer: 'Elena Tapuy', lat: -1.0330, lng: -77.5330 },
];
