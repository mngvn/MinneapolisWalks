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
  { id: 'morning',   label: '☀️ Morning' },
  { id: 'evening',   label: '🌆 Evening' },
  { id: 'scenic',    label: '🌳 Scenic' },
  { id: 'historic',  label: '🏛️ Historic' },
  { id: 'riverside', label: '🌊 Riverside' },
  { id: 'hidden',    label: '💎 Hidden Gem' },
  { id: 'dog',       label: '🐕 Dog-Friendly' },
  { id: 'short',     label: '🎯 Short Loop' }
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
  { name:'Stone Arch Bridge',            coords:[44.9789,-93.2577], icon:'🌉', desc:'Historic 1883 railroad bridge spanning the Mississippi with stunning views.' },
  { name:'St. Anthony Falls',            coords:[44.9797,-93.2558], icon:'💧', desc:'The only natural waterfall on the entire Mississippi River.' },
  { name:'Mill Ruins Park',              coords:[44.9791,-93.2582], icon:'🏭', desc:'Atmospheric ruins of 19th-century flour mills along the river.' },
  { name:'Guthrie Theater',              coords:[44.9803,-93.2600], icon:'🎭', desc:'World-class theater with a dramatic cantilevered "Endless Bridge" overlook.' },
  { name:'Gold Medal Park',              coords:[44.9807,-93.2589], icon:'🌿', desc:'Spiral-hill park offering elevated views of the Minneapolis skyline.' },
  { name:'Father Hennepin Bluffs',       coords:[44.9817,-93.2539], icon:'🌳', desc:'Scenic bluff park perched above the Mississippi — great sunsets.' },
  { name:'Boom Island Park',             coords:[44.9972,-93.2759], icon:'⛵', desc:'Beautiful riverfront park with views of downtown Minneapolis.' },
  { name:'Nicollet Mall',                coords:[44.9761,-93.2720], icon:'🛍️', desc:'Pedestrian-friendly street at the heart of downtown Minneapolis.' },
  { name:'Walker Art Center',            coords:[44.9690,-93.2891], icon:'🎨', desc:'World-class contemporary art museum with rotating outdoor installations.' },
  { name:'Minneapolis Sculpture Garden', coords:[44.9689,-93.2902], icon:'🐟', desc:'Home of the iconic Spoonbridge and Cherry — stunning year-round.' },
  { name:'Loring Park',                  coords:[44.9704,-93.2834], icon:'🌻', desc:'Charming urban park with a pond, gardens, and walking paths.' },
  { name:'Bde Maka Ska',                 coords:[44.9427,-93.3100], icon:'🏖️', desc:'Beautiful urban lake with sandy beaches and a 3-mile walking path.' },
  { name:'Lake Harriet',                 coords:[44.9215,-93.3079], icon:'🎵', desc:'Beloved lake with a bandshell, rose garden, and trolley line.' },
  { name:'Minnehaha Falls',              coords:[44.9154,-93.2112], icon:'🌊', desc:'Stunning 53-foot waterfall immortalized by Longfellow — free to visit.' },
  { name:'Northeast Riverfront',         coords:[44.9871,-93.2617], icon:'🏙️', desc:'Vibrant arts district with galleries, breweries, and river access.' }
];

// ── State ─────────────────────────────────────────────────────
let map, currentTileLayer;
let routes      = [];
let routeLayers = {};
let selectedId  = null;
let colorIdx    = 0;

let genStart        = null;
let genEnd          = null;
let genRouteData    = null;
let genPreviewLayer = null;
let genMarkers      = [];
let genTags         = new Set();
let currentGenStep  = 0;
let genPickMode     = null; // 'start' | 'end' | null
let genStartMarker  = null;
let genEndMarker    = null;

let saving        = false; // prevents duplicate saves while sheet animates closed
let drawMode      = false;
let drawWaypoints = [];
let drawMarkers   = [];
let drawPolyline  = null;
let customTags    = new Set();

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

// ── Sheet helpers ─────────────────────────────────────────────
function showSheet(sheetId, backdropId) {
  get(sheetId).classList.add('open');
  if (backdropId) get(backdropId).classList.add('open');
}

function hideSheet(sheetId, backdropId) {
  get(sheetId).classList.remove('open');
  if (backdropId) get(backdropId).classList.remove('open');
}

// ── Gen pick mode (tap map to set start/end) ──────────────────
function startGenPick(which) {
  genPickMode = which;
  get('genPickHint').textContent = which === 'start'
    ? 'Tap the map to set your start point'
    : 'Tap the map to set your end point';
  // Temporarily hide wizard so full map is visible
  get('wizardSheet').classList.remove('open');
  get('wizardBackdrop').classList.remove('open');
  get('genPickBar').classList.add('visible');
  map.getContainer().style.cursor = 'crosshair';
}

function endGenPick(latlng) {
  const coords = [latlng.lat, latlng.lng];
  const coordLabel = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;

  if (genPickMode === 'start') {
    genStart = coords;
    if (genStartMarker) map.removeLayer(genStartMarker);
    genStartMarker = L.circleMarker(latlng, dotStyle('#10b981', 8)).addTo(map).bindPopup('Start');
    get('startHint').textContent = coordLabel;
    get('pickStartBtn').classList.add('set');
    get('gS1Next').disabled = false;
  } else {
    genEnd = coords;
    if (genEndMarker) map.removeLayer(genEndMarker);
    genEndMarker = L.circleMarker(latlng, dotStyle('#ef4444', 8)).addTo(map).bindPopup('End');
    get('endHint').textContent = coordLabel;
    get('pickEndBtn').classList.add('set');
    get('gS2Find').disabled = false;
  }

  map.flyTo(latlng, 15, { duration: 0.6 });
  cancelGenPick(); // re-show wizard
}

function cancelGenPick() {
  if (!genPickMode) return;
  genPickMode = null;
  get('genPickBar').classList.remove('visible');
  map.getContainer().style.cursor = '';
  showSheet('wizardSheet', 'wizardBackdrop');
}

function setRandomEnd() {
  const center = genStart || MPLS;
  const [lat, lng] = center;
  const dist  = 0.5 + Math.random() * 2;   // 0.5–2.5 km
  const angle = Math.random() * 2 * Math.PI;
  const dLat  = (dist / 111) * Math.cos(angle);
  const dLng  = (dist / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
  genEnd = [lat + dLat, lng + dLng];

  if (genEndMarker) map.removeLayer(genEndMarker);
  genEndMarker = L.circleMarker(genEnd, dotStyle('#ef4444', 8)).addTo(map).bindPopup('Random end');

  get('endHint').textContent = '🎲 Random spot';
  get('pickEndBtn').classList.add('set');
  get('gS2Find').disabled = false;

  if (genStart) {
    map.fitBounds(L.latLngBounds([genStart, genEnd]), { padding: [80, 80] });
  }

  findRoute(); // auto-route for random destination
}

// ── Wizard (add route sheet) ──────────────────────────────────
function openWizard() {
  showWizType();
  showSheet('wizardSheet', 'wizardBackdrop');
}

function closeWizard() {
  // Cancel any active pick without re-showing the wizard
  genPickMode = null;
  get('genPickBar').classList.remove('visible');
  map.getContainer().style.cursor = '';
  hideSheet('wizardSheet', 'wizardBackdrop');
  clearGenPreview();
  resetGenForm();
}

function showWizType() {
  get('wStep0').style.display    = '';
  get('wGenerate').style.display = 'none';
}

function showWizGenerate() {
  get('wStep0').style.display    = 'none';
  get('wGenerate').style.display = '';
  showGenStep(0);
}

function showGenStep(n) {
  for (let i = 0; i < 4; i++) {
    const el = get(`gStep${i}`);
    if (el) el.style.display = i === n ? '' : 'none';
  }
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === n);
  });
  currentGenStep = n;
}

// ── Draw save sheet ───────────────────────────────────────────
function openDrawSaveSheet() {
  if (drawWaypoints.length < 2) {
    toast('Add at least 2 waypoints first', 'error');
    return;
  }
  const n    = drawWaypoints.length;
  const dist = calcDistance(drawWaypoints);
  get('customPoints').textContent   = n;
  get('customDistance').textContent = `${dist.mi} mi`;
  get('customDuration').textContent = Math.round((parseFloat(dist.mi) / 3) * 60);
  showSheet('drawSaveSheet', 'drawSaveBackdrop');
}

function closeDrawSaveSheet() {
  hideSheet('drawSaveSheet', 'drawSaveBackdrop');
}

// ── UI bindings ───────────────────────────────────────────────
function bindUI() {
  // FABs
  get('addFab').addEventListener('click', openWizard);
  get('routesFab').addEventListener('click', () => showSheet('routesSheet', 'routesBackdrop'));

  // Routes sheet
  get('routesClose').addEventListener('click', () => hideSheet('routesSheet', 'routesBackdrop'));
  get('routesBackdrop').addEventListener('click', () => hideSheet('routesSheet', 'routesBackdrop'));

  // Wizard sheet
  get('wizClose').addEventListener('click', closeWizard);
  get('wGenClose').addEventListener('click', closeWizard);
  get('wizardBackdrop').addEventListener('click', closeWizard);

  // Step 0: type selection
  get('selectGenerate').addEventListener('click', showWizGenerate);
  get('selectCustom').addEventListener('click', () => {
    closeWizard();
    startDrawMode();
  });

  // Generate nav: back button goes to prev step or type selection
  get('wGenBack').addEventListener('click', () => {
    if (currentGenStep > 0) showGenStep(currentGenStep - 1);
    else showWizType();
  });

  // G-Step 0: Name
  get('gS0Skip').addEventListener('click', () => showGenStep(1));
  get('gS0Next').addEventListener('click', () => showGenStep(1));

  // G-Step 1: Start location
  get('gS1Back').addEventListener('click', () => showGenStep(0));
  get('gS1Next').addEventListener('click', () => showGenStep(2));

  // G-Step 2: End location + find route
  get('gS2Back').addEventListener('click', () => showGenStep(1));
  get('gS2Find').addEventListener('click', findRoute);

  // G-Step 3: Tags/notes/save
  get('gS3Back').addEventListener('click', () => showGenStep(2));
  get('genSaveBtn').addEventListener('click', saveGeneratedRoute);

  // Tap-to-pick start/end
  get('pickStartBtn').addEventListener('click', () => startGenPick('start'));
  get('pickEndBtn').addEventListener('click',   () => startGenPick('end'));
  get('randomEndBtn').addEventListener('click', setRandomEnd);
  get('genPickCancel').addEventListener('click', cancelGenPick);

  // Draw toolbar
  get('bannerUndo').addEventListener('click', undoLastPoint);
  get('drawClear').addEventListener('click', clearDraw);
  get('drawDone').addEventListener('click', openDrawSaveSheet);
  get('drawCancel').addEventListener('click', exitDrawMode);

  // Draw save sheet
  get('drawSaveClose').addEventListener('click', closeDrawSaveSheet);
  get('drawSaveBack').addEventListener('click', closeDrawSaveSheet);
  get('drawSaveBackdrop').addEventListener('click', closeDrawSaveSheet);
  get('customSaveBtn').addEventListener('click', saveCustomRoute);

  // Map controls
  get('centerMapBtn').addEventListener('click', () => map.flyTo(MPLS, MPLS_ZOOM, { duration: 1.2 }));
  get('locateBtn').addEventListener('click', locateMe);

  // Filter / search / sort
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

  // Map click — gen pick mode takes priority over draw mode
  map.on('click', e => {
    if (genPickMode) { endGenPick(e.latlng); return; }
    if (drawMode) addDrawPoint(e.latlng);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (genPickMode) { cancelGenPick(); return; }
      if (drawMode) {
        if (get('drawSaveSheet').classList.contains('open')) closeDrawSaveSheet();
        else exitDrawMode();
      } else {
        closeWizard();
        hideSheet('routesSheet', 'routesBackdrop');
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && drawMode) {
      e.preventDefault();
      undoLastPoint();
    }
    const tag = document.activeElement?.tagName;
    if (e.key === 'n' && tag !== 'INPUT' && tag !== 'TEXTAREA') openWizard();
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
  } catch { /* silently fail — defaults shown */ }
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

  const btn = get('gS2Find');
  btn.textContent = 'Finding…';
  btn.disabled    = true;
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
    get('previewCals').textContent     = cals;

    showGenStep(3);

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
  if (genStartMarker) { map.removeLayer(genStartMarker); genStartMarker = null; }
  if (genEndMarker)   { map.removeLayer(genEndMarker);   genEndMarker   = null; }
  genRouteData = null;
}

function resetGenForm() {
  const nameEl  = get('genName');
  const notesEl = get('genNotes');
  if (nameEl)  nameEl.value  = '';
  if (notesEl) notesEl.value = '';
  genStart = null;
  genEnd   = null;
  if (get('gS1Next')) get('gS1Next').disabled = true;
  if (get('gS2Find')) get('gS2Find').disabled = true;
  // Reset pick buttons to unset state
  const startBtn = get('pickStartBtn');
  const endBtn   = get('pickEndBtn');
  if (startBtn) startBtn.classList.remove('set');
  if (endBtn)   endBtn.classList.remove('set');
  if (get('startHint')) get('startHint').textContent = 'Tap to pin on map';
  if (get('endHint'))   get('endHint').textContent   = 'Tap to pin on map';
  genTags.clear();
  buildTagPicker('genTagPicker', genTags);
  clearGenPreview();
}

function saveGeneratedRoute() {
  if (!genRouteData || saving) return;
  saving = true;
  get('genSaveBtn').disabled = true;

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
  closeWizard();
  saving = false;
  toast(`"${name}" saved!`, 'success');
  selectRoute(route.id);
}

// ── Draw mode ─────────────────────────────────────────────────
function startDrawMode() {
  drawMode = true;
  map.getContainer().style.cursor = 'crosshair';
  get('fabs').classList.add('hidden');
  get('drawToolbar').classList.add('visible');
  get('drawBanner').classList.add('visible');
  updateDrawUI();
}

function exitDrawMode() {
  drawMode = false;
  map.getContainer().style.cursor = '';
  get('fabs').classList.remove('hidden');
  get('drawToolbar').classList.remove('visible');
  get('drawBanner').classList.remove('visible');
  closeDrawSaveSheet();
  clearDraw();
  const nameEl  = get('customName');
  const notesEl = get('customNotes');
  if (nameEl)  nameEl.value  = '';
  if (notesEl) notesEl.value = '';
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
  get('drawPts').textContent    = `${n} pt${n !== 1 ? 's' : ''}`;
  get('bannerCount').textContent = n ? `${n} pt${n !== 1 ? 's' : ''}` : '';

  if (n >= 2) {
    const dist = calcDistance(drawWaypoints);
    get('drawMi').textContent = `${dist.mi} mi`;
  } else {
    get('drawMi').textContent = '';
  }
}

function saveCustomRoute() {
  if (drawWaypoints.length < 2) { toast('Add at least 2 waypoints to save a route', 'error'); return; }
  if (saving) return;
  saving = true;
  get('customSaveBtn').disabled = true;

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
  saving = false;
  toast(`"${name}" saved!`, 'success');
  selectRoute(route.id);
}

// ── Route management ──────────────────────────────────────────
function addRoute(route) {
  // Deduplicate: reject if an identical ID or same-name save within the last 2 seconds
  if (routes.some(r => r.id === route.id)) return;
  const recent = routes[routes.length - 1];
  if (recent && recent.name === route.name && route.id - recent.id < 2000) return;
  routes.push(route);
  saveRoutes();
  renderSidebar();
  drawRouteOnMap(route);
}

function drawRouteOnMap(route) {
  if (routeLayers[route.id]) map.removeLayer(routeLayers[route.id]);

  const line   = L.polyline(route.coords, { color: route.color, weight: 4, opacity: 0.72, lineJoin: 'round' });
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

  const f = filterState.filter;
  if      (f === 'favorites')  res = res.filter(r => r.favorite);
  else if (f === 'generated')  res = res.filter(r => r.type === 'generated');
  else if (f === 'custom')     res = res.filter(r => r.type === 'custom');
  else if (f !== 'all')        res = res.filter(r => r.tags?.includes(f));

  if (filterState.query) {
    const q = filterState.query;
    res = res.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.includes(q))
    );
  }

  switch (filterState.sort) {
    case 'newest':    res.sort((a, b) => b.id - a.id); break;
    case 'oldest':    res.sort((a, b) => a.id - b.id); break;
    case 'dist-asc':  res.sort((a, b) => parseFloat(a.distance.mi) - parseFloat(b.distance.mi)); break;
    case 'dist-desc': res.sort((a, b) => parseFloat(b.distance.mi) - parseFloat(a.distance.mi)); break;
    case 'dur-asc':   res.sort((a, b) => a.duration - b.duration); break;
  }

  return res;
}

// ── Sidebar / routes list rendering ──────────────────────────
function renderSidebar() {
  const list  = get('routesList');
  const empty = get('emptyState');
  updateStats();

  // Update FAB label with count
  const label = get('routesFabLabel');
  if (label) label.textContent = routes.length > 0 ? `My Routes (${routes.length})` : 'My Routes';

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
  if (mi <= 1) return { cls: 'easy',        label: '🟢 Easy' };
  if (mi <= 3) return { cls: 'moderate',    label: '🟡 Moderate' };
  return             { cls: 'challenging', label: '🔴 Challenging' };
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
  el.className  = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 350); }, 3200);
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
