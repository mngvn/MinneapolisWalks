/* ══════════════════════════════════════════════════════════════
   Minneapolis Walks — App Logic
══════════════════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────────────────
const MPLS        = [44.9778, -93.2650];
const MPLS_ZOOM   = 14;
const STORAGE_KEY = 'mpls-walks-v2';

const ROUTE_NAMES = [
  'Stone Arch Sunset Walk', 'Mill District Meander', 'Riverfront Ramble',
  'Nicollet Mall Stroll', 'Gold Medal Park Loop', 'Mississippi Morning Walk',
  'Warehouse District Wander', 'Guthrie Theater Path', 'Heritage Trail Hike',
  'Boom Island Breeze', 'Downtown Discovery Loop', 'Northeast Bridge Walk',
  'Loring Park Promenade', 'Hennepin Hustle', 'Pillsbury Trail Trek',
  'Chain of Lakes Amble', 'Midtown Greenway Glide', 'Cedar Lake Circuit'
];

const COLORS = [
  '#00d4ff', '#8b5cf6', '#f59e0b', '#10b981', '#f97316',
  '#ec4899', '#3b82f6', '#14b8a6', '#a3e635', '#e879f9',
  '#fb923c', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'
];

const TAGS = [
  { id: 'morning',  label: '☀️ Morning' },
  { id: 'evening',  label: '🌆 Evening' },
  { id: 'scenic',   label: '🌳 Scenic' },
  { id: 'historic', label: '🏛️ Historic' },
  { id: 'riverside',label: '🌊 Riverside' },
  { id: 'hidden',   label: '💎 Hidden Gem' },
  { id: 'dog',      label: '🐕 Dog-Friendly' },
  { id: 'short',    label: '🎯 Short Loop' }
];

const TAG_LABELS = Object.fromEntries(TAGS.map(t => [t.id, t.label]));

const WEATHER_ICONS = {
  113:'☀️', 116:'⛅', 119:'☁️', 122:'☁️', 143:'🌫️', 176:'🌦️',
  179:'🌨️', 182:'🌧️', 185:'🌧️', 200:'⛈️', 227:'❄️', 230:'❄️',
  248:'🌫️', 260:'🌫️', 263:'🌦️', 266:'🌧️', 281:'🌧️', 284:'🌧️',
  293:'🌦️', 296:'🌧️', 299:'🌧️', 302:'🌧️', 305:'🌧️', 308:'🌧️',
  311:'🌧️', 314:'🌧️', 317:'🌨️', 320:'🌨️', 323:'🌨️', 326:'❄️',
  329:'❄️', 332:'❄️', 335:'❄️', 338:'❄️', 350:'🌧️', 353:'🌦️',
  356:'🌧️', 359:'🌧️', 362:'🌨️', 365:'🌨️', 368:'🌨️', 371:'❄️',
  374:'🌨️', 377:'🌨️', 386:'⛈️', 389:'⛈️', 392:'⛈️', 395:'⛈️'
};

const MAP_LAYERS = {
  dark: {
    url:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    opts: { subdomains: 'abcd', maxZoom: 20 }
  },
  light: {
    url:  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    opts: { subdomains: 'abcd', maxZoom: 20 }
  },
  outdoor: {
    url:  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://opentopomap.org">OpenTopoMap</a>',
    opts: { subdomains: 'abc', maxZoom: 17 }
  },
  satellite: {
    url:  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '© <a href="https://esri.com">Esri</a>',
    opts: { maxZoom: 19 }
  }
};

const POIS = [
  { name:'Stone Arch Bridge',      coords:[44.9789,-93.2577], icon:'🌉', desc:'Historic 1883 railroad bridge spanning the Mississippi with stunning views.' },
  { name:'St. Anthony Falls',      coords:[44.9797,-93.2558], icon:'💧', desc:'The only natural waterfall on the entire Mississippi River.' },
  { name:'Mill Ruins Park',        coords:[44.9791,-93.2582], icon:'🏭', desc:'Atmospheric ruins of 19th-century flour mills along the river.' },
  { name:'Guthrie Theater',        coords:[44.9803,-93.2600], icon:'🎭', desc:'World-class theater with a dramatic cantilevered "Endless Bridge" overlook.' },
  { name:'Gold Medal Park',        coords:[44.9807,-93.2589], icon:'🌿', desc:'Spiral-hill park offering elevated views of the Minneapolis skyline.' },
  { name:'Father Hennepin Bluffs', coords:[44.9817,-93.2539], icon:'🌳', desc:'Scenic bluff park perched above the Mississippi — great sunsets.' },
  { name:'Boom Island Park',       coords:[44.9972,-93.2759], icon:'⛵', desc:'Beautiful riverfront park with views of downtown Minneapolis.' },
  { name:'Nicollet Mall',          coords:[44.9761,-93.2720], icon:'🛍️', desc:'Pedestrian-friendly street at the heart of downtown Minneapolis.' },
  { name:'Walker Art Center',      coords:[44.9690,-93.2891], icon:'🎨', desc:'World-class contemporary art museum with rotating outdoor installations.' },
  { name:'Minneapolis Sculpture Garden', coords:[44.9689,-93.2902], icon:'🐟', desc:'Home of the iconic Spoonbridge and Cherry — stunning year-round.' },
  { name:'Loring Park',            coords:[44.9704,-93.2834], icon:'🌻', desc:'Charming urban park with a pond, gardens, and walking paths.' },
  { name:'Bde Maka Ska',           coords:[44.9427,-93.3100], icon:'🏖️', desc:'Beautiful urban lake with sandy beaches and a 3-mile walking path.' },
  { name:'Lake Harriet',           coords:[44.9215,-93.3079], icon:'🎵', desc:'Beloved lake with a bandshell, rose garden, and trolley line.' },
  { name:'Minnehaha Falls',        coords:[44.9154,-93.2112], icon:'🌊', desc:'Stunning 53-foot waterfall immortalized by Longfellow — free to visit.' },
  { name:'Northeast Riverfront',   coords:[44.9871,-93.2617], icon:'🏙️', desc:'Vibrant arts district with galleries, breweries, and river access.' }
];

// ── State ─────────────────────────────────────────────────────
let map, currentTileLayer;
let routes    = [];
let routeLayers = {};
let selectedId  = null;
let colorIdx    = 0;

let genStart   = null;
let genEnd     = null;
let genRouteData = null;
let genPreviewLayer = null;
let genMarkers = [];
let genTags    = new Set();

let drawMode     = false;
let drawWaypoints = [];
let drawMarkers  = [];
let drawPolyline = null;
let customTags   = new Set();

let poiMarkers   = [];
let poisVisible  = false;
let locateMarker = null;

let filterState = { query: '', filter: 'all', sort: 'newest' };

// ── Init ──────────────────────────────────────────────────────
function init() {
  map = L.map('map', { center: MPLS, zoom: MPLS_ZOOM, zoomControl: false });
  switchLayer('dark');
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  buildTagPicker('genTagPicker',    genTags);
  buildTagPicker('customTagPicker', customTags);

  bindUI();
  loadRoutes();
  fetchWeather();
}

// ── UI bindings ───────────────────────────────────────────────
function bindUI() {
  get('addRouteBtn').addEventListener('click', openModal);
  get('emptyCta').addEventListener('click', openModal);
  get('centerMapBtn').addEventListener('click', () => map.flyTo(MPLS, MPLS_ZOOM, { duration: 1.2 }));
  get('locateBtn').addEventListener('click', locateMe);

  get('modalClose').addEventListener('click', closeModal);
  get('modalOverlay').addEventListener('click', e => { if (e.target === get('modalOverlay')) closeModal(); });
  get('selectGenerate').addEventListener('click', () => showStep('generate'));
  get('selectCustom').addEventListener('click', startDrawMode);
  get('backToType').addEventListener('click', () => showStep('type'));

  setupGeocoding('genStart', 'startResults', c => { genStart = c; });
  setupGeocoding('genEnd',   'endResults',   c => { genEnd   = c; });
  get('genFindBtn').addEventListener('click', findRoute);
  get('genSaveBtn').addEventListener('click', saveGeneratedRoute);

  get('customPanelClose').addEventListener('click', exitDrawMode);
  get('customUndoBtn').addEventListener('click', undoLastPoint);
  get('customClearBtn').addEventListener('click', clearDraw);
  get('customSaveBtn').addEventListener('click', saveCustomRoute);
  get('bannerUndo').addEventListener('click', undoLastPoint);

  // Filter/search/sort
  get('searchInput').addEventListener('input', e => {
    filterState.query = e.target.value.trim().toLowerCase();
    renderSidebar();
  });
  get('filterPills').addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    get('filterPills').querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterState.filter = pill.dataset.filter;
    renderSidebar();
  });
  get('sortSelect').addEventListener('change', e => {
    filterState.sort = e.target.value;
    renderSidebar();
  });

  // Layer switcher
  get('layerBtn').addEventListener('click', e => {
    e.stopPropagation();
    get('layerSwitcher').classList.toggle('open');
  });
  get('layerMenu').addEventListener('click', e => {
    const opt = e.target.closest('.layer-opt');
    if (!opt) return;
    switchLayer(opt.dataset.layer);
    get('layerSwitcher').classList.remove('open');
  });
  document.addEventListener('click', () => get('layerSwitcher').classList.remove('open'));

  // POI toggle
  get('poisBtn').addEventListener('click', togglePOIs);

  // Map click for drawing
  map.on('click', e => { if (drawMode) addDrawPoint(e.latlng); });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (drawMode) exitDrawMode();
      else closeModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && drawMode) {
      e.preventDefault();
      undoLastPoint();
    }
    const tag = document.activeElement?.tagName;
    if (e.key === 'n' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      openModal();
    }
  });
}

// ── Weather ───────────────────────────────────────────────────
async function fetchWeather() {
  try {
    const res  = await fetch('https://wttr.in/Minneapolis?format=j1');
    const data = await res.json();
    const cond = data.current_condition[0];
    const code = parseInt(cond.weatherCode);
    get('weatherIcon').textContent = WEATHER_ICONS[code] || '🌤️';
    get('weatherTemp').textContent = `${cond.temp_F}°F`;
    get('weatherDesc').textContent = cond.weatherDesc[0].value;
  } catch { /* silently fail — default display is fine */ }
}

// ── Map layers ────────────────────────────────────────────────
function switchLayer(name) {
  if (currentTileLayer) map.removeLayer(currentTileLayer);
  const cfg = MAP_LAYERS[name];
  currentTileLayer = L.tileLayer(cfg.url, { attribution: cfg.attr, ...cfg.opts }).addTo(map);
  document.querySelectorAll('.layer-opt').forEach(o => o.classList.toggle('active', o.dataset.layer === name));
}

// ── POI markers ───────────────────────────────────────────────
function togglePOIs() {
  poisVisible = !poisVisible;
  get('poisBtn').classList.toggle('active', poisVisible);

  if (poisVisible) {
    POIS.forEach(poi => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="poi-marker" title="${escHtml(poi.name)}">${poi.icon}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const m = L.marker(poi.coords, { icon })
        .addTo(map)
        .bindPopup(`<strong>${escHtml(poi.name)}</strong><br><span style="color:var(--text-muted);font-size:11px">${escHtml(poi.desc)}</span>`);
      poiMarkers.push(m);
    });
    toast(`${POIS.length} Minneapolis landmarks shown`, 'info');
  } else {
    poiMarkers.forEach(m => map.removeLayer(m));
    poiMarkers = [];
  }
}

// ── Locate me ─────────────────────────────────────────────────
function locateMe() {
  if (!navigator.geolocation) { toast('Geolocation not supported by your browser', 'error'); return; }
  const btn = get('locateBtn');
  btn.classList.add('active');

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    if (locateMarker) map.removeLayer(locateMarker);
    locateMarker = L.circleMarker([lat, lng], {
      radius: 9, fillColor: '#00d4ff', color: '#fff', weight: 2, fillOpacity: 1
    }).addTo(map).bindPopup('You are here');
    map.flyTo([lat, lng], 16, { duration: 1.2 });
    setTimeout(() => {
      if (locateMarker) { map.removeLayer(locateMarker); locateMarker = null; }
      btn.classList.remove('active');
    }, 10000);
  }, () => {
    toast('Could not get your location', 'error');
    btn.classList.remove('active');
  });
}

// ── Geocoding ─────────────────────────────────────────────────
function setupGeocoding(inputId, dropdownId, onSelect) {
  const input    = get(inputId);
  const dropdown = get(dropdownId);
  let timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3) { dropdown.classList.remove('open'); return; }
    timer = setTimeout(() => fetchLocations(q, dropdown, input, onSelect), 380);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.remove('open');
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
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
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
      const name  = parts.slice(0, 2).join(',').trim();
      const sub   = parts.slice(2, 4).join(',').trim();
      return `<div class="search-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${escHtml(name)}">
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
  get('stepType').style.display    = step === 'type'     ? '' : 'none';
  get('stepGenerate').style.display = step === 'generate' ? '' : 'none';
  get('modalTitle').textContent    = step === 'generate' ? 'Auto-Generate Route' : 'Add New Route';
}

// ── Tag pickers ───────────────────────────────────────────────
function buildTagPicker(containerId, tagSet) {
  const c = get(containerId);
  c.innerHTML = TAGS.map(t =>
    `<button class="tag-btn${tagSet.has(t.id) ? ' active' : ''}" data-tag="${t.id}">${t.label}</button>`
  ).join('');
  c.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (tagSet.has(tag)) { tagSet.delete(tag); btn.classList.remove('active'); }
      else { tagSet.add(tag); btn.classList.add('active'); }
    });
  });
}

// ── OSRM routing ──────────────────────────────────────────────
async function findRoute() {
  if (!genStart || !genEnd) { toast('Please select both a start and end location', 'error'); return; }

  const btn = get('genFindBtn');
  btn.textContent = 'Finding…';
  btn.disabled = true;
  clearGenPreview();

  try {
    const [sLat, sLon] = genStart;
    const [eLat, eLon] = genEnd;
    const res  = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`
    );
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      toast('No walkable route found between those points', 'error');
      return;
    }

    genRouteData = data.routes[0];

    genPreviewLayer = L.geoJSON(genRouteData.geometry, {
      style: { color: '#00d4ff', weight: 4, opacity: 0.85, dashArray: '10 5' }
    }).addTo(map);

    genMarkers = [
      L.circleMarker(genStart, dotStyle('#10b981')).addTo(map).bindPopup('Start'),
      L.circleMarker(genEnd,   dotStyle('#ef4444')).addTo(map).bindPopup('End')
    ];

    map.fitBounds(genPreviewLayer.getBounds(), { padding: [60, 60] });

    const distMi = (genRouteData.distance / 1609.34).toFixed(2);
    const distKm = (genRouteData.distance / 1000).toFixed(2);
    const mins   = Math.round(genRouteData.duration / 60);
    const cals   = Math.round(parseFloat(distMi) * 80);

    get('previewDistance').textContent = `${distMi} mi (${distKm} km)`;
    get('previewDuration').textContent = `~${mins} min`;
    get('previewCals').textContent     = `~${cals}`;
    get('routePreview').style.display  = '';
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
  ['genName','genStart','genEnd','genNotes'].forEach(id => { if (get(id)) get(id).value = ''; });
  ['startResults','endResults'].forEach(id => { get(id).innerHTML = ''; get(id).classList.remove('open'); });
  genStart = null; genEnd = null;
  genTags.clear();
  buildTagPicker('genTagPicker', genTags);
  clearGenPreview();
}

function saveGeneratedRoute() {
  if (!genRouteData) return;

  const name  = get('genName').value.trim() || pickName();
  const notes = get('genNotes').value.trim();
  const color = COLORS[colorIdx % COLORS.length];
  const coords = genRouteData.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

  const route = {
    id: Date.now(), name, notes, type: 'generated', color,
    tags: [...genTags], favorite: false,
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

// ── Draw mode ─────────────────────────────────────────────────
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
  get('customName').value  = '';
  get('customNotes').value = '';
  customTags.clear();
  buildTagPicker('customTagPicker', customTags);
}

function addDrawPoint(latlng) {
  drawWaypoints.push(latlng);
  const first = drawWaypoints.length === 1;
  const m = L.circleMarker(latlng, dotStyle(first ? '#10b981' : '#00d4ff')).addTo(map);
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
  if (drawPolyline) { map.removeLayer(drawPolyline); drawPolyline = null; }
  if (drawWaypoints.length > 1) {
    drawPolyline = L.polyline(drawWaypoints, { color: '#00d4ff', weight: 3, opacity: 0.7, dashArray: '7 4' }).addTo(map);
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
  get('bannerCount').textContent   = n ? `${n} pt${n !== 1 ? 's' : ''}` : '';

  if (!n) {
    get('waypointsList').innerHTML = '<p class="waypoints-hint">No points added yet</p>';
    get('customStats').style.display = 'none';
    get('customPanelStatus').textContent = 'Click the map to add waypoints';
    return;
  }

  get('waypointsList').innerHTML = drawWaypoints.map((wp, i) => `
    <div class="waypoint-item">
      <span class="wpt-num">${i + 1}</span>
      <span>${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>
    </div>`).join('');
  get('customPanelStatus').textContent = n < 2 ? 'Add at least one more point' : 'Looking good — keep adding or save!';

  if (n >= 2) {
    const dist = calcDistance(drawWaypoints);
    get('customDistance').textContent = `${dist.mi} mi`;
    get('customDuration').textContent  = Math.round((parseFloat(dist.mi) / 3) * 60);
    get('customCals').textContent      = Math.round(parseFloat(dist.mi) * 80);
    get('customStats').style.display   = 'flex';
  }
}

function saveCustomRoute() {
  if (drawWaypoints.length < 2) { toast('Add at least 2 waypoints to save a route', 'error'); return; }

  const name  = get('customName').value.trim() || pickName();
  const notes = get('customNotes').value.trim();
  const dist  = calcDistance(drawWaypoints);
  const color = COLORS[colorIdx % COLORS.length];

  const route = {
    id: Date.now(), name, notes, type: 'custom', color,
    tags: [...customTags], favorite: false,
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

  const startM = L.circleMarker(route.coords[0],                       dotStyle('#10b981', 7));
  const endM   = L.circleMarker(route.coords[route.coords.length - 1], dotStyle('#ef4444', 7));

  const group = L.layerGroup([line, startM, endM]).addTo(map);
  routeLayers[route.id] = group;

  line.on('click', () => selectRoute(route.id));
  line.on('mouseover', () => {
    if (selectedId !== route.id) {
      line.setStyle({ opacity: 0.9, weight: 5 });
      line.bindTooltip(route.name, { permanent: false, className: '' });
      line.openTooltip();
    }
  });
  line.on('mouseout', () => {
    if (selectedId !== route.id) {
      line.setStyle({ opacity: 0.72, weight: 4 });
      line.closeTooltip();
    }
  });
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
        l.setStyle({ opacity: active ? 1 : 0.25, weight: active ? 6 : 3 });
        if (active) l.bringToFront();
      }
    });
  });

  const route = routes.find(r => r.id === id);
  if (route) {
    const line = routeLayers[id]?.getLayers().find(l => l instanceof L.Polyline);
    if (line) map.fitBounds(line.getBounds(), { padding: [60, 60] });

    // Scroll card into view
    const card = document.querySelector(`.route-card[data-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

function toggleFavorite(id) {
  const route = routes.find(r => r.id === id);
  if (!route) return;
  route.favorite = !route.favorite;
  saveRoutes();
  renderSidebar();
  if (selectedId === id) selectRoute(id);
}

function deleteRoute(id) {
  if (!confirm(`Delete "${routes.find(r => r.id === id)?.name}"? This can't be undone.`)) return;
  if (routeLayers[id]) { map.removeLayer(routeLayers[id]); delete routeLayers[id]; }
  routes = routes.filter(r => r.id !== id);
  if (selectedId === id) deselectAll();
  saveRoutes();
  renderSidebar();
  toast('Route deleted', 'info');
}

// ── Filtering ─────────────────────────────────────────────────
function getFiltered() {
  let res = [...routes];

  // Type/tag filter
  const f = filterState.filter;
  if (f === 'favorites') res = res.filter(r => r.favorite);
  else if (f === 'generated') res = res.filter(r => r.type === 'generated');
  else if (f === 'custom')    res = res.filter(r => r.type === 'custom');
  else if (f !== 'all')       res = res.filter(r => r.tags?.includes(f));

  // Search
  if (filterState.query) {
    const q = filterState.query;
    res = res.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.includes(q))
    );
  }

  // Sort
  switch (filterState.sort) {
    case 'newest':   res.sort((a, b) => b.id - a.id); break;
    case 'oldest':   res.sort((a, b) => a.id - b.id); break;
    case 'dist-asc': res.sort((a, b) => parseFloat(a.distance.mi) - parseFloat(b.distance.mi)); break;
    case 'dist-desc':res.sort((a, b) => parseFloat(b.distance.mi) - parseFloat(a.distance.mi)); break;
    case 'dur-asc':  res.sort((a, b) => a.duration - b.duration); break;
  }

  return res;
}

// ── Sidebar rendering ─────────────────────────────────────────
function renderSidebar() {
  const list  = get('routesList');
  const empty = get('emptyState');
  updateStats();

  if (!routes.length) {
    list.innerHTML = '';
    list.appendChild(empty);
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';
  const filtered = getFiltered();

  if (!filtered.length) {
    list.innerHTML = `<div class="no-results">
      <p>No routes match your current filters.</p>
      <button onclick="clearFilters()">Clear filters</button>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map(r => {
    const diff  = getDifficulty(r);
    const cals  = Math.round(parseFloat(r.distance.mi) * 80);
    const steps = Math.round(parseFloat(r.distance.mi) * 2100).toLocaleString();
    const tagHtml = r.tags?.length
      ? `<div class="card-tags">${r.tags.map(t => `<span class="tag-pill">${escHtml(TAG_LABELS[t] || t)}</span>`).join('')}</div>`
      : '';
    const notesHtml = r.notes ? `<p class="card-notes">${escHtml(r.notes)}</p>` : '';

    return `
    <div class="route-card${r.id === selectedId ? ' selected' : ''}" data-id="${r.id}" style="--rc:${r.color}">
      <div class="card-top">
        <div class="card-dot" style="background:${r.color};color:${r.color}"></div>
        <div class="card-title">
          <h3>${escHtml(r.name)}</h3>
          <div class="card-badges">
            <span class="card-badge ${r.type}">${r.type === 'generated' ? '🗺️ Generated' : '✏️ Custom'}</span>
            <span class="difficulty ${diff.cls}">${diff.label}</span>
          </div>
        </div>
        <button class="card-fav${r.favorite ? ' active' : ''}" data-id="${r.id}" title="${r.favorite ? 'Unfavorite' : 'Favorite'}">⭐</button>
        <button class="card-delete" data-id="${r.id}" title="Delete">✕</button>
      </div>
      <div class="card-stats">
        <span class="card-stat">📏 ${r.distance.mi} mi</span>
        <span class="card-stat">⏱️ ~${r.duration} min</span>
        <span class="card-stat">🔥 ${cals} cal</span>
        <span class="card-stat">👣 ${steps} steps</span>
      </div>
      ${tagHtml}
      ${notesHtml}
      <div class="card-footer">
        <button class="card-action" data-action="maps" data-id="${r.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Open in Maps
        </button>
        <button class="card-action" data-action="gpx" data-id="${r.id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export GPX
        </button>
        <span class="card-date">${formatDate(r.createdAt)}</span>
      </div>
    </div>`;
  }).join('');

  // Bind interactions
  list.querySelectorAll('.route-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.card-fav, .card-delete, .card-action')) return;
      const id = parseInt(card.dataset.id);
      if (selectedId === id) deselectAll();
      else selectRoute(id);
    });
  });

  list.querySelectorAll('.card-fav').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(parseInt(btn.dataset.id)); });
  });

  list.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteRoute(parseInt(btn.dataset.id)); });
  });

  list.querySelectorAll('.card-action').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id    = parseInt(btn.dataset.id);
      const route = routes.find(r => r.id === id);
      if (!route) return;
      if (btn.dataset.action === 'maps') shareRoute(route);
      if (btn.dataset.action === 'gpx')  exportGPX(route);
    });
  });
}

function clearFilters() {
  filterState = { query: '', filter: 'all', sort: 'newest' };
  get('searchInput').value = '';
  get('sortSelect').value  = 'newest';
  get('filterPills').querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
  renderSidebar();
}

// ── Stats bar ─────────────────────────────────────────────────
function updateStats() {
  const totalMiles = routes.reduce((s, r) => s + parseFloat(r.distance.mi), 0);
  const totalMins  = routes.reduce((s, r) => s + r.duration, 0);
  const totalCals  = Math.round(totalMiles * 80);
  const hours      = (totalMins / 60).toFixed(1);

  get('statRoutes').textContent = routes.length;
  get('statMiles').textContent  = totalMiles.toFixed(1);
  get('statHours').textContent  = `${hours}h`;
  get('statCals').textContent   = totalCals;
}

// ── Share & Export ────────────────────────────────────────────
function shareRoute(route) {
  const [sLat, sLon] = route.coords[0];
  const [eLat, eLon] = route.coords[route.coords.length - 1];
  const url = `https://www.google.com/maps/dir/?api=1&origin=${sLat},${sLon}&destination=${eLat},${eLon}&travelmode=walking`;
  window.open(url, '_blank', 'noopener');
}

function exportGPX(route) {
  const trkpts = route.coords
    .map(([lat, lon]) => `    <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
    .join('\n');

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Minneapolis Walks" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escXml(route.name)}</name></metadata>
  <trk>
    <name>${escXml(route.name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const a    = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${route.name.replace(/[^a-z0-9]/gi, '_')}.gpx`
  });
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`"${route.name}" exported as GPX`, 'success');
}

// ── Persistence ───────────────────────────────────────────────
function saveRoutes() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(routes)); } catch {}
}

function loadRoutes() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Migrate older saved routes that may lack new fields
    routes = raw.map(r => ({
      tags: [], favorite: false, createdAt: new Date().toISOString(),
      ...r,
      distance: { mi: '0.00', km: '0.00', ...(r.distance || {}) }
    }));
    colorIdx = routes.length;
    renderSidebar();
    routes.forEach(drawRouteOnMap);
  } catch {
    routes = [];
  }
}

// ── Helpers ───────────────────────────────────────────────────
function calcDistance(waypoints) {
  let m = 0;
  for (let i = 0; i < waypoints.length - 1; i++) m += waypoints[i].distanceTo(waypoints[i + 1]);
  return { mi: (m / 1609.34).toFixed(2), km: (m / 1000).toFixed(2) };
}

function dotStyle(color, r = 8) {
  return { radius: r, fillColor: color, color: '#fff', weight: 2, fillOpacity: 1 };
}

function getDifficulty(route) {
  const mi = parseFloat(route.distance.mi);
  if (mi <= 1)  return { cls: 'easy',        label: '🟢 Easy' };
  if (mi <= 3)  return { cls: 'moderate',    label: '🟡 Moderate' };
  return           { cls: 'challenging', label: '🔴 Challenging' };
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function pickName() {
  return ROUTE_NAMES[Math.floor(Math.random() * ROUTE_NAMES.length)];
}

function get(id) { return document.getElementById(id); }

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escXml(s) { return escHtml(s); }

function toast(msg, type = 'info') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 350); }, 3200);
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
