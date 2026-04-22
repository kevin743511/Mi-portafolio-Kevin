// ════════════════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════════════════
const SUPABASE_URL = 'https://kdsfvnwrhtlfryqlrhya.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Tzr847YIW5vuNjvWBXAL7w_iUbRgtyN';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ════════════════════════════════════════════
// AUDIO ENGINE (Web Audio API — sin archivos externos)
// ════════════════════════════════════════════
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, vol, delay = 0) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch(e) {}
}

// Sonido al entrar al landing
function soundLanding() {
  playTone(220, 'sine', 0.6, 0.12, 0);
  playTone(330, 'sine', 0.5, 0.08, 0.1);
  playTone(440, 'sine', 0.4, 0.06, 0.2);
  playTone(880, 'sine', 0.8, 0.05, 0.35);
}

// Sonido al ir al login
function soundPortal() {
  [200, 300, 450, 600, 800].forEach((f, i) => playTone(f, 'sawtooth', 0.3, 0.06, i * 0.06));
}

// Sonido login exitoso
function soundSuccess() {
  [523, 659, 784, 1046].forEach((f, i) => playTone(f, 'sine', 0.4, 0.1, i * 0.1));
}

// Sonido error
function soundError() {
  playTone(180, 'sawtooth', 0.3, 0.15, 0);
  playTone(120, 'sawtooth', 0.4, 0.12, 0.15);
}

// Sonido abrir unidad
function soundOpen() {
  playTone(440, 'triangle', 0.2, 0.1, 0);
  playTone(660, 'triangle', 0.15, 0.08, 0.08);
}

// Sonido upload completado
function soundUpload() {
  [392, 523, 784].forEach((f, i) => playTone(f, 'sine', 0.3, 0.09, i * 0.08));
}

// Sonido click suave
function soundClick() {
  playTone(600, 'sine', 0.08, 0.08, 0);
}

// ════════════════════════════════════════════
// PARTICLES
// ════════════════════════════════════════════
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function rsz() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
rsz(); window.addEventListener('resize', rsz);

function mkP() {
  return {
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .38, vy: (Math.random() - .5) * .38 - .14,
    sz: Math.random() * 2 + .5, al: Math.random() * .55 + .1,
    life: Math.random() * 200 + 100, ml: 0,
    c: Math.random() > .5 ? 'rgba(0,212,255,' : 'rgba(0,150,255,'
  };
}
for (let i = 0; i < 120; i++) { const p = mkP(); p.ml = p.life; particles.push(p); }

function animP() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; p.life--;
    const a = (p.life / p.ml) * p.al;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
    ctx.fillStyle = p.c + a + ')'; ctx.fill();
    if (p.sz > 1.5) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.c + (a * .11) + ')'; ctx.fill();
    }
    if (p.life <= 0) { particles[i] = mkP(); particles[i].ml = particles[i].life; }
  });
  requestAnimationFrame(animP);
}
animP();

// ════════════════════════════════════════════
// DRAGON SVG generator
// ════════════════════════════════════════════
function dragonSVG(color, color2) {
  // Dragón hecho con paths SVG circulares — cuerpo segmentado alrededor del domo
  const c = color, c2 = color2;
  return `<svg viewBox="0 0 236 236" xmlns="http://www.w3.org/2000/svg">
    <!-- Cuerpo del dragón: segmentos en arco -->
    <circle cx="118" cy="118" r="110" fill="none" stroke="${c}" stroke-width="2.5" stroke-opacity="0.15"/>
    <!-- Segmentos escamados -->
    <path d="M118 8 A110 110 0 0 1 200 45" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" class="dragon-scale" style="color:${c}"/>
    <path d="M200 45 A110 110 0 0 1 226 118" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.9"/>
    <path d="M226 118 A110 110 0 0 1 200 191" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.8"/>
    <path d="M200 191 A110 110 0 0 1 118 228" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.7"/>
    <path d="M118 228 A110 110 0 0 1 36 191" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.6"/>
    <path d="M36 191 A110 110 0 0 1 10 118" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.5"/>
    <path d="M10 118 A110 110 0 0 1 36 45" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.4"/>

    <!-- Escamas decorativas a lo largo del cuerpo -->
    <ellipse cx="165" cy="20" rx="7" ry="4" fill="${c}" opacity="0.7" transform="rotate(30 165 20)"/>
    <ellipse cx="210" cy="70" rx="7" ry="4" fill="${c}" opacity="0.65" transform="rotate(60 210 70)"/>
    <ellipse cx="225" cy="135" rx="7" ry="4" fill="${c}" opacity="0.6" transform="rotate(90 225 135)"/>
    <ellipse cx="195" cy="200" rx="7" ry="4" fill="${c}" opacity="0.55" transform="rotate(120 195 200)"/>
    <ellipse cx="130" cy="226" rx="7" ry="4" fill="${c}" opacity="0.5" transform="rotate(150 130 226)"/>
    <ellipse cx="55" cy="205" rx="6" ry="3.5" fill="${c}" opacity="0.4" transform="rotate(165 55 205)"/>
    <ellipse cx="14" cy="140" rx="6" ry="3.5" fill="${c}" opacity="0.35" transform="rotate(180 14 140)"/>
    <ellipse cx="22" cy="65" rx="5" ry="3" fill="${c}" opacity="0.3" transform="rotate(210 22 65)"/>

    <!-- CABEZA del dragón -->
    <g transform="translate(118, 8)">
      <!-- Cráneo -->
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="${c}" opacity="0.95" class="dragon-head" style="color:${c}"/>
      <!-- Mandíbula -->
      <path d="M-10 4 Q0 14 10 4" fill="${c2}" opacity="0.8"/>
      <!-- Ojo izquierdo -->
      <circle cx="-5" cy="-2" r="3" fill="#000" opacity="0.9"/>
      <circle cx="-5" cy="-2" r="1.5" fill="${c2}" opacity="1"/>
      <circle cx="-4.2" cy="-2.5" r=".6" fill="#fff" opacity=".9"/>
      <!-- Ojo derecho -->
      <circle cx="5" cy="-2" r="3" fill="#000" opacity="0.9"/>
      <circle cx="5" cy="-2" r="1.5" fill="${c2}" opacity="1"/>
      <circle cx="5.8" cy="-2.5" r=".6" fill="#fff" opacity=".9"/>
      <!-- Cuernos -->
      <path d="M-6 -8 L-10 -20 L-4 -14" fill="${c}" opacity="0.9"/>
      <path d="M6 -8 L10 -20 L4 -14" fill="${c}" opacity="0.9"/>
      <!-- Lengua -->
      <path d="M-2 8 Q0 14 2 8" fill="none" stroke="#ff3344" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M-1 13 L-3 17 M1 13 L3 17" stroke="#ff3344" stroke-width="1.2" stroke-linecap="round"/>
    </g>

    <!-- FUEGO que sale de la boca -->
    <g transform="translate(118, 18)" class="dragon-fire">
      <ellipse cx="0" cy="0" rx="6" ry="10" fill="${c2}" opacity="0.7"/>
      <ellipse cx="3" cy="-4" rx="3" ry="6" fill="#ffcc00" opacity="0.5"/>
      <ellipse cx="-3" cy="-6" rx="2.5" ry="5" fill="#fff" opacity="0.3"/>
    </g>

    <!-- Cola del dragón (desvanece) -->
    <path d="M36 45 Q20 30 8 8" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" opacity="0.3"/>
    <path d="M8 8 Q2 -2 14 4" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>

    <!-- Destellos en el cuerpo -->
    <circle cx="186" cy="32" r="2.5" fill="${c2}" opacity="0.8"/>
    <circle cx="220" cy="90" r="2" fill="${c2}" opacity="0.7"/>
    <circle cx="222" cy="155" r="2" fill="${c2}" opacity="0.6"/>
    <circle cx="170" cy="212" r="2" fill="${c2}" opacity="0.5"/>
  </svg>`;
}

// ════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════
const ADMIN = { user: 'kevin', pass: 'upla' };
let state = {
  currentUser: localStorage.getItem('arcana_user') || null,
  isAdmin: localStorage.getItem('arcana_role') === 'admin',
  isViewer: localStorage.getItem('arcana_role') === 'viewer',
  files: {}
};
let currentUnit = 1, currentWeek = 1, editingFileId = null;
let publicCurrentUnit = 1, publicCurrentWeek = 1;

// ════════════════════════════════════════════
// UNIT DEFS
// ════════════════════════════════════════════
const unitDefs = [
  { num: 1, roman: 'I',   label: 'PRIMERA CRÓNICA', cls: 'unit-1', mcls: 'modal-u1', color: '#00aaff', color2: '#00ffee' },
  { num: 2, roman: 'II',  label: 'SEGUNDA CRÓNICA', cls: 'unit-2', mcls: 'modal-u2', color: '#aa00ff', color2: '#dd88ff' },
  { num: 3, roman: 'III', label: 'TERCERA CRÓNICA', cls: 'unit-3', mcls: 'modal-u3', color: '#00ff88', color2: '#aaffdd' },
  { num: 4, roman: 'IV',  label: 'CUARTA CRÓNICA',  cls: 'unit-4', mcls: 'modal-u4', color: '#ff3344', color2: '#ff9966' },
];

// ════════════════════════════════════════════
// TRANSITION
// ════════════════════════════════════════════
function showTransition(text, callback, delay = 900) {
  const ov = document.getElementById('transitionOverlay');
  const tx = document.getElementById('transitionText');
  tx.textContent = text;
  ov.classList.add('active');
  setTimeout(() => {
    callback();
    setTimeout(() => ov.classList.remove('active'), 500);
  }, delay);
}

// ════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════
function goToLogin() {
  soundPortal();
  showTransition('INVOCANDO PORTAL...', () => {
    document.getElementById('landingScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    // Animación entrada login
    document.querySelector('.arcana-logo').style.animation = 'none';
    setTimeout(() => document.querySelector('.arcana-logo').style.animation = '', 50);
  }, 800);
}

function goToLanding() {
  soundClick();
  showTransition('REGRESANDO AL ARCANA...', () => {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('landingScreen').classList.add('active');
    renderLandingUnits();
  }, 600);
}

// ════════════════════════════════════════════
// LANDING RENDER
// ════════════════════════════════════════════
function getFileCount(n) {
  let c = 0;
  for (let w = 1; w <= 4; w++) c += (state.files[`u${n}_w${w}`] || []).length;
  return c;
}

function renderLandingUnits() {
  const container = document.getElementById('landingUnits');
  container.innerHTML = '';
  unitDefs.forEach((ud, idx) => {
    const fc = getFileCount(ud.num);
    const mp = Math.min(100, fc * 8);
    const card = document.createElement('div');
    card.className = `unit-card ${ud.cls}`;
    card.style.animationDelay = `${0.6 + idx * 0.15}s`;
    card.style.animation = `fadeInUp .7s ${0.6 + idx * 0.15}s cubic-bezier(.34,1.56,.64,1) both`;
    card.onclick = () => openPublicUnit(ud.num);
    card.innerHTML = `
      <div class="dome-wrapper">
        <div class="dome-outer"></div>
        <div class="dome-fire-ring"></div>
        <div class="dragon-ring-outer">${dragonSVG(ud.color, ud.color2)}</div>
        <div class="dome-inner">
          <div class="dome-num">${ud.roman}</div>
          <div class="dome-label">UNIDAD</div>
        </div>
      </div>
      <div class="unit-info">
        <div class="unit-title">${ud.label}</div>
        <div class="mana-bar-wrap"><div class="mana-bar" style="width:${mp}%"></div></div>
        <div class="mana-label">FRAGMENTOS: ${fc}</div>
      </div>`;
    container.appendChild(card);
  });
}

function renderUnits() {
  const grid = document.getElementById('unitsGrid');
  grid.innerHTML = '';
  unitDefs.forEach(ud => {
    const fc = getFileCount(ud.num);
    const mp = Math.min(100, fc * 8);
    const card = document.createElement('div');
    card.className = `unit-card ${ud.cls}`;
    card.onclick = () => openUnit(ud.num);
    card.innerHTML = `
      <div class="dome-wrapper">
        <div class="dome-outer"></div>
        <div class="dome-fire-ring"></div>
        <div class="dragon-ring-outer">${dragonSVG(ud.color, ud.color2)}</div>
        <div class="dome-inner">
          <div class="dome-num">${ud.roman}</div>
          <div class="dome-label">UNIDAD</div>
        </div>
      </div>
      <div class="unit-info">
        <div class="unit-title">${ud.label}</div>
        <div class="mana-bar-wrap"><div class="mana-bar" style="width:${mp}%"></div></div>
        <div class="mana-label">FRAGMENTOS: ${fc}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ════════════════════════════════════════════
// PUBLIC MODAL (landing → ver archivos sin login)
// ════════════════════════════════════════════
function openPublicUnit(n) {
  soundOpen();
  publicCurrentUnit = n; publicCurrentWeek = 1;
  const ud = unitDefs[n - 1];
  const box = document.getElementById('publicModalBox');
  box.className = `modal-box ${ud.mcls}`;
  document.getElementById('pubModalDome').textContent = ud.roman;
  document.getElementById('pubModalTitle').textContent = `UNIDAD ${ud.roman}`;
  document.getElementById('pubModalSub').textContent = ud.label;
  document.querySelectorAll('#pubWeekTabs .week-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('publicModal').classList.add('open');
  renderPublicWeekContent();
}

function closePublicModal() {
  document.getElementById('publicModal').classList.remove('open');
}

function switchPublicWeek(w) {
  soundClick();
  publicCurrentWeek = w;
  document.querySelectorAll('#pubWeekTabs .week-tab').forEach((t, i) => t.classList.toggle('active', i === w - 1));
  renderPublicWeekContent();
}

function renderPublicWeekContent() {
  const body = document.getElementById('pubModalBody');
  const key = `u${publicCurrentUnit}_w${publicCurrentWeek}`;
  const files = state.files[key] || [];
  let html = '<div class="files-list">';
  if (files.length === 0) {
    html += `<div class="empty-state">
      <div class="es-icon">◌</div>
      <div>NO HAY FRAGMENTOS EN ESTA SEMANA</div>
      <div style="margin-top:7px;font-size:.62rem;opacity:.45;">El administrador aún no ha subido archivos aquí</div>
    </div>`;
  } else {
    files.forEach(f => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      html += `
        <div class="file-item">
          <div class="file-icon">${getFileIcon(ext)}</div>
          <div class="file-info">
            <div class="file-name" title="${esc(f.name)}">${esc(f.name)}</div>
            <div class="file-meta">${f.size} · ${f.date}${f.desc ? ' · <em>' + esc(f.desc) + '</em>' : ''}</div>
          </div>
          <div class="file-actions">
            <button class="btn-fa btn-dl" onclick="downloadPublicFile('${f.id}')">⬇ DL</button>
          </div>
        </div>`;
    });
  }
  html += '</div>';
  body.innerHTML = html;
}

function downloadPublicFile(id) {
  const key = `u${publicCurrentUnit}_w${publicCurrentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f || !f.url) return;
  const a = document.createElement('a');
  a.href = f.url; a.download = f.name; a.target = '_blank'; a.click();
  soundClick();
  showToast('⬇ Descargando: ' + f.name);
}

// ════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════
function switchAuthTab(tab) {
  soundClick();
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1))
  );
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRole(r) {
  if (r === 'admin_attempt') { soundError(); showToast('♛ El rol Administrador es único y ya está asignado', 'tw'); }
}

async function handleLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!u || !p) { soundError(); err.textContent = '⚠ Completa los campos'; return; }

  if (u === ADMIN.user && p === ADMIN.pass) {
    soundSuccess();
    localStorage.setItem('arcana_user', u);
    localStorage.setItem('arcana_role', 'admin');
    state.currentUser = u; state.isAdmin = true; state.isViewer = false;
    showTransition('⚡ ACCESO CONCEDIDO — BIENVENIDO, ADMINISTRADOR', () => enterMain(), 1000);
    return;
  }

  err.textContent = '⟳ Verificando...';
  const { data, error } = await sb.from('users').select('*').eq('username', u).eq('password', p).single();

  if (error || !data) {
    soundError();
    err.textContent = '✕ Héroe no reconocido en el Arcana';
  } else {
    soundSuccess();
    localStorage.setItem('arcana_user', u);
    localStorage.setItem('arcana_role', 'viewer');
    state.currentUser = u; state.isAdmin = false; state.isViewer = true;
    showTransition('👁 FRAGMENTOS CARGANDO — BIENVENIDO, VISUALIZADOR', () => enterMain(), 1000);
  }
}

async function handleRegister() {
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value;
  const p2 = document.getElementById('regPass2').value;
  const err = document.getElementById('registerError');
  if (!u || !p) { soundError(); err.textContent = '⚠ Completa todos los campos'; return; }
  if (p !== p2) { soundError(); err.textContent = '✕ Las claves no coinciden'; return; }
  if (u === ADMIN.user) { soundError(); err.textContent = '✕ Nombre reservado del Void'; return; }

  err.textContent = '⟳ Forjando héroe...';
  const { error } = await sb.from('users').insert({ username: u, password: p, role: 'viewer' });

  if (error) {
    soundError();
    err.textContent = error.code === '23505' ? '✕ Héroe ya existe' : '✕ Error: ' + error.message;
  } else {
    soundSuccess();
    showToast('✦ Visualizador forjado. ¡Ya puedes acceder!');
    switchAuthTab('login');
    document.getElementById('loginUser').value = u;
    err.textContent = '';
  }
}

function handleLogout() {
  soundClick();
  localStorage.removeItem('arcana_user');
  localStorage.removeItem('arcana_role');
  state.currentUser = null; state.isAdmin = false; state.isViewer = false; state.files = {};
  showTransition('CERRANDO SESIÓN...', () => {
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('landingScreen').classList.add('active');
    renderLandingUnits();
    ['loginUser', 'loginPass'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('loginError').textContent = '';
  }, 600);
}

// ════════════════════════════════════════════
// SUPABASE — CARGAR ARCHIVOS
// ════════════════════════════════════════════
async function loadAllFiles() {
  const { data, error } = await sb.from('files').select('*').order('created_at', { ascending: true });
  if (error) { setSyncStatus('err', 'ERROR BD'); showToast('✕ Error cargando archivos', 'te'); return; }
  state.files = {};
  (data || []).forEach(f => {
    const key = `u${f.unit}_w${f.week}`;
    if (!state.files[key]) state.files[key] = [];
    state.files[key].push({
      id: f.id, name: f.name, desc: f.description || '',
      url: f.file_url, storage_path: f.storage_path,
      size: f.size, date: f.upload_date
    });
  });
  setSyncStatus('ok', '✓ SYNC');
}

// ════════════════════════════════════════════
// ENTER MAIN
// ════════════════════════════════════════════
async function enterMain() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('landingScreen').classList.remove('active');
  document.getElementById('mainScreen').classList.add('active');
  document.getElementById('headerUsername').textContent = state.currentUser.toUpperCase();
  const badge = document.getElementById('userBadge');
  const crown = document.getElementById('headerCrown');
  if (state.isAdmin) {
    badge.className = 'user-badge badge-admin'; crown.textContent = '♛ ';
    document.getElementById('btnShare').style.display = '';
    document.getElementById('btnSync').style.display = 'none';
    document.getElementById('btnImport').style.display = 'none';
  } else {
    badge.className = 'user-badge badge-viewer'; crown.textContent = '👁 ';
    document.getElementById('btnShare').style.display = 'none';
    document.getElementById('btnSync').style.display = '';
    document.getElementById('btnImport').style.display = 'none';
  }
  setSyncStatus('ing', 'CARGANDO...');
  await loadAllFiles();
  renderUnits();
}

// ════════════════════════════════════════════
// MODAL (admin/viewer)
// ════════════════════════════════════════════
function openUnit(n) {
  soundOpen();
  currentUnit = n; currentWeek = 1;
  const ud = unitDefs[n - 1];
  const box = document.getElementById('modalBox');
  box.className = `modal-box ${ud.mcls}`;
  document.getElementById('modalDomeMini').textContent = ud.roman;
  document.getElementById('modalTitle').textContent = `UNIDAD ${ud.roman}`;
  document.getElementById('modalSub').textContent = ud.label;
  document.querySelectorAll('#weekTabs .week-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('unitModal').classList.add('open');
  renderWeekContent();
}

function closeModal() { document.getElementById('unitModal').classList.remove('open'); renderUnits(); }

function switchWeek(w) {
  soundClick();
  currentWeek = w;
  document.querySelectorAll('#weekTabs .week-tab').forEach((t, i) => t.classList.toggle('active', i === w - 1));
  renderWeekContent();
}

function renderWeekContent() {
  const body = document.getElementById('modalBody');
  const key = `u${currentUnit}_w${currentWeek}`;
  const files = state.files[key] || [];
  let html = '';

  if (state.isAdmin) {
    html += `
      <div class="upload-zone" id="uploadZone">
        <div class="upload-icon">⬆</div>
        <p>Arrastra archivos o haz clic para inyectar fragmentos</p>
        <input type="file" id="fileInput" multiple onchange="handleFileUpload(event)">
      </div>
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-lbl" id="progressLbl">INYECTANDO...</div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      </div>
      <button class="btn-inject" onclick="document.getElementById('fileInput').click()">⚡ INYECTAR DATOS</button>`;
  }

  html += '<div class="files-list">';
  if (files.length === 0) {
    html += `<div class="empty-state">
      <div class="es-icon">◌</div>
      <div>NO HAY FRAGMENTOS EN ESTA SEMANA</div>
      ${state.isViewer ? '<div style="margin-top:7px;font-size:.62rem;opacity:.45;">El administrador aún no ha subido archivos aquí</div>' : ''}
    </div>`;
  } else {
    files.forEach(f => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      html += `
        <div class="file-item" id="fi_${f.id}">
          <div class="file-icon">${getFileIcon(ext)}</div>
          <div class="file-info">
            <div class="file-name" title="${esc(f.name)}">${esc(f.name)}</div>
            <div class="file-meta">${f.size} · ${f.date}${f.desc ? ' · <em>' + esc(f.desc) + '</em>' : ''}</div>
          </div>
          <div class="file-actions">
            <button class="btn-fa btn-dl" onclick="downloadFile('${f.id}')">⬇ DL</button>
            ${state.isAdmin ? `
              <button class="btn-fa btn-edit" onclick="openEdit('${f.id}')">✎</button>
              <button class="btn-fa btn-del" onclick="deleteFile('${f.id}')">✕</button>` : ''}
          </div>
        </div>`;
    });
  }
  html += '</div>';
  body.innerHTML = html;

  const zone = document.getElementById('uploadZone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleFilesFromList(e.dataTransfer.files); });
  }
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getFileIcon(e) {
  const m = {pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📋',pptx:'📋',jpg:'🖼',jpeg:'🖼',png:'🖼',gif:'🖼',svg:'🎨',bmp:'🖼',mp4:'🎬',avi:'🎬',mkv:'🎬',mp3:'🎵',wav:'🎵',zip:'📦',rar:'📦','7z':'📦',txt:'📃',md:'📃',js:'⚙',py:'🐍',html:'🌐',css:'🎨',json:'📋',xml:'📋',csv:'📊',c:'⚙',cpp:'⚙',java:'☕'};
  return m[e] || '📁';
}

// ════════════════════════════════════════════
// FILE UPLOAD — Supabase Storage
// ════════════════════════════════════════════
function handleFileUpload(e) { handleFilesFromList(e.target.files); }

async function handleFilesFromList(fileList) {
  if (!state.isAdmin) return;
  const key = `u${currentUnit}_w${currentWeek}`;
  if (!state.files[key]) state.files[key] = [];
  const arr = Array.from(fileList);
  if (!arr.length) return;

  const pw = document.getElementById('progressWrap');
  const pf = document.getElementById('progressFill');
  const pl = document.getElementById('progressLbl');
  if (pw) pw.style.display = 'block';

  let done = 0;
  for (let fi = 0; fi < arr.length; fi++) {
    const file = arr[fi];
    if (pl) pl.textContent = `SUBIENDO ${fi + 1}/${arr.length}: ${file.name}`;
    if (pf) pf.style.width = Math.round(((fi + 0.1) / arr.length) * 100) + '%';
    try {
      const { path, url } = await uploadToStorage(file, currentUnit, currentWeek);
      if (pf) pf.style.width = Math.round(((fi + 0.7) / arr.length) * 100) + '%';
      const fileObj = {
        id: 'f' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: file.name, desc: '', url, storage_path: path,
        size: fmtSize(file.size), date: new Date().toLocaleDateString('es-PE')
      };
      await saveFileMetaToDB(fileObj, currentUnit, currentWeek);
      state.files[key].push(fileObj);
      done++;
      if (pf) pf.style.width = Math.round(((fi + 1) / arr.length) * 100) + '%';
    } catch (err) {
      console.error(err);
      showToast('✕ Error subiendo: ' + file.name, 'te');
    }
  }
  if (pw) pw.style.display = 'none';
  if (done > 0) { soundUpload(); showToast(`✦ ${done} fragmento${done > 1 ? 's' : ''} inyectado${done > 1 ? 's' : ''}`); }
  renderWeekContent(); renderUnits();
}

async function uploadToStorage(file, unit, week) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `u${unit}_w${week}/${Date.now()}_${safeName}`;
  const { error } = await sb.storage.from('archivos').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error('Storage: ' + error.message);
  const { data: urlData } = sb.storage.from('archivos').getPublicUrl(path);
  return { path, url: urlData.publicUrl };
}

async function saveFileMetaToDB(fileObj, unit, week) {
  const { error } = await sb.from('files').insert({
    id: fileObj.id, unit, week, name: fileObj.name,
    description: fileObj.desc || '', file_url: fileObj.url,
    storage_path: fileObj.storage_path, size: fileObj.size, upload_date: fileObj.date
  });
  if (error) throw new Error('DB: ' + error.message);
}

function downloadFile(id) {
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f || !f.url) return;
  soundClick();
  const a = document.createElement('a');
  a.href = f.url; a.download = f.name; a.target = '_blank'; a.click();
  showToast('⬇ Descargando: ' + f.name);
}

async function deleteFile(id) {
  if (!state.isAdmin) return;
  if (!confirm('¿Eliminar este fragmento del plano temporal?')) return;
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f) return;
  try {
    if (f.storage_path) await sb.storage.from('archivos').remove([f.storage_path]);
    await sb.from('files').delete().eq('id', id);
    state.files[key] = state.files[key].filter(x => x.id !== id);
    soundClick();
    renderWeekContent(); renderUnits();
    showToast('✕ Fragmento eliminado', 'tw');
  } catch (err) { showToast('✕ Error al eliminar', 'te'); }
}

function openEdit(id) {
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f) return;
  editingFileId = id;
  document.getElementById('editFileName').value = f.name;
  document.getElementById('editFileDesc').value = f.desc || '';
  document.getElementById('editOverlay').classList.add('open');
}

async function saveEdit() {
  const key = `u${currentUnit}_w${currentWeek}`;
  const files = state.files[key] || [];
  const idx = files.findIndex(x => x.id === editingFileId);
  if (idx < 0) return;
  const n = document.getElementById('editFileName').value.trim();
  const d = document.getElementById('editFileDesc').value.trim();
  try {
    await sb.from('files').update({ name: n || files[idx].name, description: d }).eq('id', editingFileId);
    if (n) files[idx].name = n;
    files[idx].desc = d;
    soundClick();
    closeEdit(); renderWeekContent();
    showToast('💾 Fragmento actualizado');
  } catch { showToast('✕ Error al guardar', 'te'); }
}

function closeEdit() { document.getElementById('editOverlay').classList.remove('open'); editingFileId = null; }
function fmtSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

// ════════════════════════════════════════════
// SHARE / SYNC
// ════════════════════════════════════════════
function openShareModal() { document.getElementById('shareOverlay').classList.add('open'); }
function closeShareModal() { document.getElementById('shareOverlay').classList.remove('open'); }

async function doViewerSync() {
  setSyncStatus('ing', 'CARGANDO...');
  await loadAllFiles();
  renderUnits();
  showToast('✓ Archivos sincronizados');
}

function exportJsonDownload() {
  const json = JSON.stringify({ files: state.files, ts: Date.now() }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'arcana_backup.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('📦 Backup descargado');
}

function setSyncStatus(type, txt) {
  const el = document.getElementById('syncIndicator');
  el.style.display = ''; el.className = 'sync-indicator sync-' + type; el.textContent = txt;
}
function setShareStatus(type, txt) {
  const el = document.getElementById('shareStatusLine');
  el.className = 'status-line status-' + type; el.style.display = ''; el.textContent = txt;
}

// ════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ════════════════════════════════════════════
// KEYBOARD
// ════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('editOverlay').classList.contains('open')) closeEdit();
    else if (document.getElementById('shareOverlay').classList.contains('open')) closeShareModal();
    else if (document.getElementById('publicModal').classList.contains('open')) closePublicModal();
    else closeModal();
  }
  if (e.key === 'Enter' && document.getElementById('loginScreen').classList.contains('active')) handleLogin();
});
document.getElementById('unitModal').addEventListener('click', e => { if (e.target === document.getElementById('unitModal')) closeModal(); });
document.getElementById('editOverlay').addEventListener('click', e => { if (e.target === document.getElementById('editOverlay')) closeEdit(); });
document.getElementById('shareOverlay').addEventListener('click', e => { if (e.target === document.getElementById('shareOverlay')) closeShareModal(); });
document.getElementById('publicModal').addEventListener('click', e => { if (e.target === document.getElementById('publicModal')) closePublicModal(); });

// ════════════════════════════════════════════
// INIT — cargar archivos y mostrar landing
// ════════════════════════════════════════════
(async () => {
  // Siempre cargamos archivos al inicio para mostrar contadores en landing
  await loadAllFiles();

  if (state.currentUser) {
    // Sesión activa — ir directo al main
    enterMain();
  } else {
    // Mostrar landing con unidades públicas
    renderLandingUnits();
    // Sonido de bienvenida con pequeño delay
    setTimeout(() => soundLanding(), 400);
  }
})();
