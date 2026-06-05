/* ══════════════════════════════════════════════════════════════
   Minneapolis Walks — App Logic
══════════════════════════════════════════════════════════════ */

const MPLS = [44.9778, -93.2650];
const MPLS_ZOOM = 14;
const STORAGE_KEY = 'mpls-walks-v1';

const ROUTE_NAMES = [
  'Stone Arch Sunset Walk', 'Mill District Meander', 'Riverfront Ramble',
  'Nicollet Mall Stroll', 'Gold Medal Park Loop', 'Mississippi Morning Walk',
  'Warehouse District Wander', 'Guthrie Theater Path', 'Heritage Trail Hike',
  'Boom Island Breeze', 'Downtown Discovery Loop', 'Northeast Bridge Walk',
  'Loring Park Promenade', 'Hennepin Hustle', 'Pillsbury Trail Trek'
];

const COLORS = [
  '#00d4ff', '#8b5cf6', '#f59e0b', '#10b981', '#f97316',
  '#ec4899', '#3b82f6', '#14b8a6', '#a3e635', '#e879f9'
];

// ── State ─────────────────────────────────────────────────────
let map;
let routes = [];
let routeLayers = {};
let selectedId = null;
let colorIdx = 0;

let genStart = null; // [lat, lon]
let genEnd = null;
let genRouteData = null;
let genPreviewLayer = null;
let genMarkers = [];

let drawMode = false;
let drawWaypoints = [];
let drawMarkers = [];
let drawPolyline = null;

// ── Init ──────────────────────────────────────────────────────
function init() {
  map = L.map('map', { center: MPLS, zoom: MPLS_ZOOM, zoomControl: false });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  bindUI();
  loadRoutes();
}

// ── UI bindings ───────────────────────────────────────────────
function bindUI() {
  // Header / sidebar
  get('addRouteBtn').addEventListener('click', openModal);
  get('emptyCta').addEventListener('click', openModal);
  get('centerMapBtn').addEventListener('click', () => map.flyTo(MPLS, MPLS_ZOOM, { duration: 1.2 }));

  // Modal
  get('modalClose').addEventListener('click', closeModal);
  get('modalOverlay').addEventListener('click', e => { if (e.target === get('modalOverlay')) closeModal(); });
  get('selectGenerate').addEventListener('click', () => showStep('generate'));
  get('selectCustom').addEventListener('click', startDrawMode);
  get('backToType').addEventListener('click', () => showStep('type'));

  // Generate form
  setupGeocoding('genStart', 'startResults', coords => { genStart = coords; });
  setupGeocoding('genEnd', 'endResults', coords => { genEnd = coords; });
  get('genFindBtn').addEventListener('click', findRoute);
  get('genSaveBtn').addEventListener('click', saveGeneratedRoute);

  // Custom panel
  get('customPanelClose').addEventListener('click', exitDrawMode);
  get('customUndoBtn').addEventListener('click', undoLastPoint);
  get('customClearBtn').addEventListener('click', clearDraw);
  get('customSaveBtn').addEventListener('click', saveCustomRoute);

  // Banner undo
  get('bannerUndo').addEventListener('click', undoLastPoint);

  // Map click for drawing
  map.on('click', e => { if (drawMode) addDrawPoint(e.latlng); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (drawMode) exitDrawMode();
      else closeModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && drawMode) {
      e.preventDefault();
      undoLastPoint();
    }
  });
}

// ── Modal ─────────────────────────────────────────────────────
function openModal() {
  showStep('type');
  get('modalOverlay').classList.add('active');
}

function closeModal() {
  get('modalOverlay').classList.remove('active');
  clearGenPreview();
  resetGenForm();
}

function showStep(step) {
  get('stepType').style.display = step === 'type' ? '' : 'none';
  get('stepGenerate').style.display = step === 'generate' ? '' : 'none';
  get('modalTitle').textContent = step === 'generate' ? 'Auto-Generate Route' : 'Add New Route';
}

// ── Geocoding ─────────────────────────────────────────────────
function setupGeocoding(inputId, dropdownId, onSelect) {
  const input = get(inputId);
  const dropdown = get(dropdownId);
  let timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3) { dropdown.classList.remove('open'); return; }
    timer = setTimeout(() => fetchLocations(q, dropdown, input, onSelect), 380);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

async function fetchLocations(query, dropdown, input, onSelect) {
  try {
    const params = new URLSearchParams({
      q: query.toLowerCase().includes('minneapolis') ? query : `${query}, Minneapolis MN`,
      format: 'json',
      limit: 5,
      addressdetails: 1
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept-Language': 'en-US,en' }
    });
    const data = await res.json();

    if (!data.length) {
      dropdown.innerHTML = '<div class="search-item-empty">No results — try a different search</div>';
      dropdown.classList.add('open');
      return;
    }

    dropdown.innerHTML = data.map(item => {
      const parts = item.display_name.split(',');
      const name = parts.slice(0, 2).join(',').trim();
      const sub = parts.slice(2, 4).join(',').trim();
      return `
        <div class="search-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escHtml(name)}">
          <span class="search-item-icon">📍</span>
          <div>
            <div class="search-item-name">${escHtml(name)}</div>
            ${sub ? `<div class="search-item-sub">${escHtml(sub)}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    dropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        input.value = item.dataset.name;
        onSelect([lat, lon]);
        dropdown.classList.remove('open');
        map.flyTo([lat, lon], 16, { duration: 1 });
      });
    });

    dropdown.classList.add('open');
  } catch {
    dropdown.innerHTML = '<div class="search-item-empty">Search unavailable — check your connection</div>';
    dropdown.classList.add('open');
  }
}

// ── OSRM Routing ──────────────────────────────────────────────
async function findRoute() {
  if (!genStart || !genEnd) {
    toast('Please select both a start and end location', 'error');
    return;
  }

  const btn = get('genFindBtn');
  btn.textContent = 'Finding…';
  btn.disabled = true;
  clearGenPreview();

  try {
    const [sLat, sLon] = genStart;
    const [eLat, eLon] = genEnd;

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`
    );
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      toast('No walkable route found between those points', 'error');
      return;
    }

    genRouteData = data.routes[0];
    const geojson = genRouteData.geometry;

    genPreviewLayer = L.geoJSON(geojson, {
      style: { color: '#00d4ff', weight: 4, opacity: 0.85, dashArray: '10 5' }
    }).addTo(map);

    const startM = L.circleMarker(genStart, dotStyle('#10b981')).addTo(map).bindPopup('Start');
    const endM   = L.circleMarker(genEnd,   dotStyle('#ef4444')).addTo(map).bindPopup('End');
    genMarkers = [startM, endM];

    map.fitBounds(genPreviewLayer.getBounds(), { padding: [60, 60] });

    const distMi = (genRouteData.distance / 1609.34).toFixed(2);
    const distKm = (genRouteData.distance / 1000).toFixed(2);
    const mins   = Math.round(genRouteData.duration / 60);

    get('previewDistance').textContent = `${distMi} mi (${distKm} km)`;
    get('previewDuration').textContent = `~${mins} min`;
    get('routePreview').style.display = '';
    get('genSaveBtn').disabled = false;

  } catch {
    toast('Routing service unavailable — try again later', 'error');
  } finally {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Find Route`;
    btn.disabled = false;
  }
}

function clearGenPreview() {
  if (genPreviewLayer) { map.removeLayer(genPreviewLayer); genPreviewLayer = null; }
  genMarkers.forEach(m => map.removeLayer(m));
  genMarkers = [];
  genRouteData = null;
  get('routePreview').style.display = 'none';
  get('genSaveBtn').disabled = true;
}

function resetGenForm() {
  ['genName','genStart','genEnd','genNotes'].forEach(id => get(id).value = '');
  ['startResults','endResults'].forEach(id => { get(id).innerHTML = ''; get(id).classList.remove('open'); });
  genStart = null;
  genEnd = null;
  clearGenPreview();
}

function saveGeneratedRoute() {
  if (!genRouteData) return;

  const name  = get('genName').value.trim() || pickName();
  const notes = get('genNotes').value.trim();
  const color = COLORS[colorIdx % COLORS.length];

  const coords = genRouteData.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

  const route = {
    id:    Date.now(),
    name,
    notes,
    type:  'generated',
    color,
    coords,
    distance: {
      mi: (genRouteData.distance / 1609.34).toFixed(2),
      km: (genRouteData.distance / 1000).toFixed(2)
    },
    duration: Math.round(genRouteData.duration / 60),
    createdAt: new Date().toISOString()
  };

  colorIdx++;
  addRoute(route);
  closeModal();
  toast(`"${name}" saved!`, 'success');
  selectRoute(route.id);
}

// ── Draw Mode ─────────────────────────────────────────────────
function startDrawMode() {
  closeModal();
  drawMode = true;
  map.getContainer().style.cursor = 'crosshair';
  get('customPanel').classList.add('active');
  get('mapBanner').classList.add('visible');
  updateDrawUI();
}

function exitDrawMode() {
  drawMode = false;
  map.getContainer().style.cursor = '';
  get('customPanel').classList.remove('active');
  get('mapBanner').classList.remove('visible');
  clearDraw();
  get('customName').value = '';
  get('customNotes').value = '';
}

function addDrawPoint(latlng) {
  drawWaypoints.push(latlng);

  const isFirst = drawWaypoints.length === 1;
  const m = L.circleMarker(latlng, dotStyle(isFirst ? '#10b981' : '#00d4ff')).addTo(map);
  drawMarkers.push(m);

  if (drawPolyline) map.removeLayer(drawPolyline);
  if (drawWaypoints.length > 1) {
    drawPolyline = L.polyline(drawWaypoints, {
      color: '#00d4ff', weight: 3, opacity: 0.7, dashArray: '7 4'
    }).addTo(map);
  }

  updateDrawUI();
}

function undoLastPoint() {
  if (!drawWaypoints.length) return;
  drawWaypoints.pop();
  const m = drawMarkers.pop();
  if (m) map.removeLayer(m);
  if (drawPolyline) map.removeLayer(drawPolyline);
  if (drawWaypoints.length > 1) {
    drawPolyline = L.polyline(drawWaypoints, {
      color: '#00d4ff', weight: 3, opacity: 0.7, dashArray: '7 4'
    }).addTo(map);
  } else {
    drawPolyline = null;
  }
  updateDrawUI();
}

function clearDraw() {
  drawWaypoints = [];
  drawMarkers.forEach(m => map.removeLayer(m));
  drawMarkers = [];
  if (drawPolyline) { map.removeLayer(drawPolyline); drawPolyline = null; }
  updateDrawUI();
}

function updateDrawUI() {
  const n = drawWaypoints.length;
  get('waypointCount').textContent = `${n} point${n !== 1 ? 's' : ''}`;
  get('bannerCount').textContent = n ? `${n} point${n !== 1 ? 's' : ''}` : '';

  if (!n) {
    get('waypointsList').innerHTML = '<p class="waypoints-hint">No points added yet</p>';
    get('customStats').style.display = 'none';
    get('customPanelStatus').textContent = 'Click the map to add waypoints';
  } else {
    get('waypointsList').innerHTML = drawWaypoints.map((wp, i) => `
      <div class="waypoint-item">
        <span class="wpt-num">${i + 1}</span>
        <span>${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>
      </div>`).join('');
    get('customPanelStatus').textContent = n < 2 ? 'Add at least one more point' : 'Looking good — keep adding or save!';

    if (n >= 2) {
      const dist = calcDistance(drawWaypoints);
      get('customDistance').textContent = `${dist.mi} mi`;
      get('customDuration').textContent = Math.round((parseFloat(dist.mi) / 3) * 60);
      get('customStats').style.display = 'flex';
    }
  }
}

function saveCustomRoute() {
  if (drawWaypoints.length < 2) {
    toast('Add at least 2 waypoints to save a route', 'error');
    return;
  }

  const name  = get('customName').value.trim() || pickName();
  const notes = get('customNotes').value.trim();
  const dist  = calcDistance(drawWaypoints);
  const color = COLORS[colorIdx % COLORS.length];

  const route = {
    id:    Date.now(),
    name,
    notes,
    type:  'custom',
    color,
    coords: drawWaypoints.map(wp => [wp.lat, wp.lng]),
    distance: dist,
    duration: Math.round((parseFloat(dist.mi) / 3) * 60),
    createdAt: new Date().toISOString()
  };

  colorIdx++;
  addRoute(route);
  exitDrawMode();
  toast(`"${name}" saved!`, 'success');
  selectRoute(route.id);
}

// ── Route management ──────────────────────────────────────────
function addRoute(route) {
  routes.push(route);
  saveRoutes();
  renderSidebar();
  drawRouteOnMap(route);
}

function drawRouteOnMap(route) {
  if (routeLayers[route.id]) map.removeLayer(routeLayers[route.id]);

  const line = L.polyline(route.coords, {
    color: route.color, weight: 4, opacity: 0.72, lineJoin: 'round'
  });

  const startM = L.circleMarker(route.coords[0],               dotStyle('#10b981', 7));
  const endM   = L.circleMarker(route.coords[route.coords.length - 1], dotStyle('#ef4444', 7));

  const group = L.layerGroup([line, startM, endM]).addTo(map);
  routeLayers[route.id] = group;

  line.on('click', () => selectRoute(route.id));
}

function selectRoute(id) {
  selectedId = id;

  document.querySelectorAll('.route-card').forEach(c => {
    c.classList.toggle('selected', parseInt(c.dataset.id) === id);
  });

  Object.entries(routeLayers).forEach(([rid, group]) => {
    group.getLayers().forEach(l => {
      if (l instanceof L.Polyline) {
        const active = parseInt(rid) === id;
        l.setStyle({ opacity: active ? 1 : 0.28, weight: active ? 6 : 3 });
        if (active) l.bringToFront();
      }
    });
  });

  const route = routes.find(r => r.id === id);
  if (route) {
    const group = routeLayers[id];
    const line  = group?.getLayers().find(l => l instanceof L.Polyline);
    if (line) map.fitBounds(line.getBounds(), { padding: [60, 60] });
  }
}

function deselectAll() {
  selectedId = null;
  document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
  Object.values(routeLayers).forEach(group => {
    group.getLayers().forEach(l => {
      if (l instanceof L.Polyline) l.setStyle({ opacity: 0.72, weight: 4 });
    });
  });
}

function deleteRoute(id) {
  if (!confirm('Delete this route? This can\'t be undone.')) return;
  if (routeLayers[id]) { map.removeLayer(routeLayers[id]); delete routeLayers[id]; }
  routes = routes.filter(r => r.id !== id);
  if (selectedId === id) deselectAll();
  saveRoutes();
  renderSidebar();
  toast('Route deleted', 'info');
}

// ── Sidebar rendering ─────────────────────────────────────────
function renderSidebar() {
  const list  = get('routesList');
  const empty = get('emptyState');
  get('routeCount').textContent = `${routes.length} route${routes.length !== 1 ? 's' : ''}`;

  if (!routes.length) {
    list.innerHTML = '';
    list.appendChild(empty);
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';

  list.innerHTML = [...routes].reverse().map(r => `
    <div class="route-card${r.id === selectedId ? ' selected' : ''}"
         data-id="${r.id}"
         style="--rc:${r.color}">
      <div class="card-top">
        <div class="card-dot" style="background:${r.color};color:${r.color}"></div>
        <div class="card-title">
          <h3>${escHtml(r.name)}</h3>
          <span class="card-badge ${r.type}">${r.type === 'generated' ? '🗺️ Generated' : '✏️ Custom'}</span>
        </div>
        <button class="card-delete" data-id="${r.id}" title="Delete route">✕</button>
      </div>
      <div class="card-stats">
        <span class="card-stat">📏 ${r.distance.mi} mi</span>
        <span class="card-stat">⏱️ ~${r.duration} min</span>
        <span class="card-stat">📍 ${r.coords.length} pts</span>
      </div>
      ${r.notes ? `<p class="card-notes">${escHtml(r.notes)}</p>` : ''}
    </div>`).join('');

  list.querySelectorAll('.route-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('card-delete')) return;
      const id = parseInt(card.dataset.id);
      if (selectedId === id) deselectAll();
      else selectRoute(id);
    });
  });

  list.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteRoute(parseInt(btn.dataset.id));
    });
  });
}

// ── Persistence ───────────────────────────────────────────────
function saveRoutes() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(routes)); } catch {}
}

function loadRoutes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    routes = saved;
    colorIdx = routes.length;
    renderSidebar();
    routes.forEach(drawRouteOnMap);
  } catch {
    routes = [];
  }
}

// ── Helpers ───────────────────────────────────────────────────
function calcDistance(waypoints) {
  let meters = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    meters += waypoints[i].distanceTo(waypoints[i + 1]);
  }
  return {
    mi: (meters / 1609.34).toFixed(2),
    km: (meters / 1000).toFixed(2)
  };
}

function dotStyle(color, r = 8) {
  return { radius: r, fillColor: color, color: '#fff', weight: 2, fillOpacity: 1 };
}

function pickName() {
  return ROUTE_NAMES[Math.floor(Math.random() * ROUTE_NAMES.length)];
}

function get(id) { return document.getElementById(id); }

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg, type = 'info') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
