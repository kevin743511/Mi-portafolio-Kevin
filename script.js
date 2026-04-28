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
    <path d="M118 8 A. " fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" class="dragon-scale" style="color:${c}"/>
    <path d="M200 45 A. " fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.9"/>
    <path d="M226 118 A. " fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.8"/>
    <path d="M200 191 A. " fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.7"/>
    <path d="M118 228 A. " fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.6"/>
    <path d="M36 191 A. " fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.5"/>
    <path d="M10 118 A. " fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" class="dragon-scale" stroke-opacity="0.4"/>

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
  { num: 1, roman: 'I',   label: 'UNIDAD 1', cls: 'unit-1', mcls: 'modal-u1', color: '#00aaff', color2: '#00ffee' },
  { num: 2, roman: 'II',  label: 'UNIDAD 2', cls: 'unit-2', mcls: 'modal-u2', color: '#aa00ff', color2: '#dd88ff' },
  { num: 3, roman: 'III', label: 'UNIDAD 3', cls: 'unit-3', mcls: 'modal-u3', color: '#00ff88', color2: '#aaffdd' },
  { num: 4, roman: 'IV',  label: 'UNIDAD 4',  cls: 'unit-4', mcls: 'modal-u4', color: '#ff3344', color2: '#ff9966' },
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
  showTransition('ACCEDIENDO AL SISTEMA...', () => {
    document.getElementById('landingScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    // Animación entrada login
    document.querySelector('.arcana-logo').style.animation = 'none';
    setTimeout(() => document.querySelector('.arcana-logo').style.animation = '', 50);
  }, 800);
}

function goToLanding() {
  soundClick();
  showTransition('REGRESANDO AL INICIO...', () => {
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
    card.className = `unit-card ${ud.cls} ${fc > 0 ? 'has-files' : 'no-files'}`;
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
        <div class="mana-label">ARCHIVOS: ${fc}</div>
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
    card.className = `unit-card ${ud.cls} ${fc > 0 ? 'has-files' : 'no-files'}`;
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
        <div class="mana-label">ARCHIVOS: ${fc}</div>
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
      <div>NO HAY ARCHIVOS EN ESTA SEMANA</div>
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
    err.textContent = '✕ Usuario no reconocido en el sistema';
  } else {
    soundSuccess();
    localStorage.setItem('arcana_user', u);
    localStorage.setItem('arcana_role', 'viewer');
    state.currentUser = u; state.isAdmin = false; state.isViewer = true;
    showTransition('👁 ARCHIVOS CARGANDO — BIENVENIDO, VISUALIZADOR', () => enterMain(), 1000);
  }
}

async function handleRegister() {
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value;
  const p2 = document.getElementById('regPass2').value;
  const err = document.getElementById('registerError');
  if (!u || !p) { soundError(); err.textContent = '⚠ Completa todos los campos'; return; }
  if (p !== p2) { soundError(); err.textContent = '✕ Las claves no coinciden'; return; }
  if (u === ADMIN.user) { soundError(); err.textContent = '✕ Nombre reservado del sistema'; return; }

  err.textContent = '⟳ Creando usuario...';
  const { error } = await sb.from('users').insert({ username: u, password: p, role: 'viewer' });

  if (error) {
    soundError();
    err.textContent = error.code === '23505' ? '✕ Usuario ya existe' : '✕ Error: ' + error.message;
  } else {
    soundSuccess();
    showToast('✦ Visualizador creado. ¡Ya puedes acceder!');
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
// UNIT MODAL (admin/viewer)
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

function closeModal() {
  document.getElementById('unitModal').classList.remove('open');
}

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
        <div class="upload-icon">☁</div>
        <p>ARRASTRA ARCHIVOS O HAZ CLIC PARA SUBIR</p>
        <input type="file" id="fileInput" multiple onchange="handleFiles(this.files)">
      </div>
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-lbl" id="progressLbl">SUBIENDO...</div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      </div>`;
  }

  html += '<div class="files-list">';
  if (files.length === 0) {
    html += `<div class="empty-state">
      <div class="es-icon">◌</div>
      <div>NO HAY ARCHIVOS EN ESTA SEMANA</div>
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
            <button class="btn-fa btn-dl" onclick="downloadFile('${f.id}')">⬇ DL</button>
            ${state.isAdmin ? `
              <button class="btn-fa btn-edit" onclick="editFile('${f.id}')">✎ EDIT</button>
              <button class="btn-fa btn-del" onclick="deleteFile('${f.id}')">✕ DEL</button>
            ` : ''}
          </div>
        </div>`;
    });
  }
  html += '</div>';
  body.innerHTML = html;

  if (state.isAdmin) {
    const zone = document.getElementById('uploadZone');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }
}

// ════════════════════════════════════════════
// FILE UPLOAD (admin)
// ════════════════════════════════════════════
async function handleFiles(fileList) {
  if (!state.isAdmin) return;
  const files = Array.from(fileList);
  if (files.length === 0) return;

  const pw = document.getElementById('progressWrap');
  const pf = document.getElementById('progressFill');
  const pl = document.getElementById('progressLbl');
  pw.style.display = 'block';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    pl.textContent = `SUBIENDO ${i + 1}/${files.length}: ${file.name}`;
    pf.style.width = '0%';

    const path = `u${currentUnit}/w${currentWeek}/${Date.now()}_${file.name}`;
    const { data: upData, error: upErr } = await sb.storage.from('arcana-files').upload(path, file);

    if (upErr) {
      soundError();
      showToast('✕ Error subiendo: ' + file.name, 'te');
      continue;
    }

    pf.style.width = '50%';
    const { data: urlData } = sb.storage.from('arcana-files').getPublicUrl(path);
    const url = urlData.publicUrl;

    const meta = {
      unit: currentUnit, week: currentWeek, name: file.name,
      file_url: url, storage_path: path,
      size: formatSize(file.size), upload_date: new Date().toLocaleDateString('es-ES'),
      description: ''
    };

    const { data: dbData, error: dbErr } = await sb.from('files').insert(meta).select().single();
    if (dbErr) {
      soundError();
      showToast('✕ Error guardando metadata: ' + file.name, 'te');
    } else {
      const key = `u${currentUnit}_w${currentWeek}`;
      if (!state.files[key]) state.files[key] = [];
      state.files[key].push({
        id: dbData.id, name: dbData.name, desc: dbData.description || '',
        url: dbData.file_url, storage_path: dbData.storage_path,
        size: dbData.size, date: dbData.upload_date
      });
      soundUpload();
    }
    pf.style.width = '100%';
  }

  pw.style.display = 'none';
  showToast(`✓ ${files.length} archivo(s) subido(s)`);
  renderWeekContent();
  renderUnits();
  renderLandingUnits();
}

// ════════════════════════════════════════════
// FILE ACTIONS
// ════════════════════════════════════════════
function downloadFile(id) {
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f || !f.url) return;
  const a = document.createElement('a');
  a.href = f.url; a.download = f.name; a.target = '_blank'; a.click();
  soundClick();
  showToast('⬇ Descargando: ' + f.name);
}

function editFile(id) {
  if (!state.isAdmin) return;
  soundClick();
  editingFileId = id;
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f) return;
  document.getElementById('editFileName').value = f.name;
  document.getElementById('editFileDesc').value = f.desc;
  document.getElementById('editOverlay').classList.add('open');
}

function closeEdit() {
  document.getElementById('editOverlay').classList.remove('open');
  editingFileId = null;
}

async function saveEdit() {
  if (!state.isAdmin || !editingFileId) return;
  const newName = document.getElementById('editFileName').value.trim();
  const newDesc = document.getElementById('editFileDesc').value.trim();
  if (!newName) { soundError(); showToast('✕ El nombre no puede estar vacío', 'te'); return; }

  const { error } = await sb.from('files').update({ name: newName, description: newDesc }).eq('id', editingFileId);
  if (error) {
    soundError();
    showToast('✕ Error actualizando archivo', 'te');
  } else {
    soundSuccess();
    showToast('✓ Archivo actualizado');
    const key = `u${currentUnit}_w${currentWeek}`;
    const f = (state.files[key] || []).find(x => x.id === editingFileId);
    if (f) { f.name = newName; f.desc = newDesc; }
    closeEdit();
    renderWeekContent();
    renderUnits();
    renderLandingUnits();
  }
}

async function deleteFile(id) {
  if (!state.isAdmin) return;
  if (!confirm('¿Eliminar este archivo permanentemente?')) return;
  soundClick();

  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f) return;

  const { error: storageErr } = await sb.storage.from('arcana-files').remove([f.storage_path]);
  if (storageErr) console.warn('Error eliminando storage:', storageErr);

  const { error: dbErr } = await sb.from('files').delete().eq('id', id);
  if (dbErr) {
    soundError();
    showToast('✕ Error eliminando archivo', 'te');
  } else {
    soundSuccess();
    showToast('✓ Archivo eliminado');
    state.files[key] = state.files[key].filter(x => x.id !== id);
    renderWeekContent();
    renderUnits();
    renderLandingUnits();
  }
}

// ════════════════════════════════════════════
// SHARE / SYNC
// ════════════════════════════════════════════
function openShareModal() {
  if (!state.isAdmin) return;
  soundClick();
  document.getElementById('shareOverlay').classList.add('open');
}

function closeShareModal() {
  document.getElementById('shareOverlay').classList.remove('open');
}

function exportJsonDownload() {
  soundClick();
  const exp = { files: state.files, exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kvn_upla_backup_${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
  showToast('📦 Backup descargado');
  const sl = document.getElementById('shareStatusLine');
  sl.className = 'status-line status-ok';
  sl.textContent = '✓ BACKUP GENERADO EXITOSAMENTE';
  sl.style.display = 'block';
  setTimeout(() => sl.style.display = 'none', 3000);
}

async function doViewerSync() {
  if (!state.isViewer) return;
  soundClick();
  setSyncStatus('ing', 'SINCRONIZANDO...');
  await loadAllFiles();
  renderUnits();
  renderLandingUnits();
  showToast('✓ Archivos sincronizados');
}

// ════════════════════════════════════════════
// SYNC STATUS
// ════════════════════════════════════════════
function setSyncStatus(type, text) {
  const ind = document.getElementById('syncIndicator');
  ind.className = `sync-indicator sync-${type}`;
  ind.textContent = text;
  ind.style.display = '';
}

// ════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════
function showToast(msg, cls = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${cls}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
// ════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(ext) {
  const icons = {
    pdf: '📕', doc: '📘', docx: '📘', txt: '📄',
    xls: '📗', xlsx: '📗', csv: '📗',
    ppt: '📙', pptx: '📙',
    zip: '📦', rar: '📦', '7z': '📦',
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', svg: '🖼',
    mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵',
    html: '🌐', css: '🎨', js: '⚙', json: '⚙',
    py: '🐍', java: '☕', cpp: '⚡', c: '⚡',
  };
  return icons[ext] || '📎';
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
async function init() {
  soundLanding();
  
  // Si ya hay sesión activa, ir directo a main
  if (state.currentUser) {
    showTransition('RESTAURANDO SESIÓN...', async () => {
      await enterMain();
    }, 800);
    return;
  }

  // Sino, mostrar landing
  document.getElementById('landingScreen').classList.add('active');
  
  // Cargar archivos públicos para el landing
  const { data, error } = await sb.from('files').select('*').order('created_at', { ascending: true });
  if (!error && data) {
    state.files = {};
    data.forEach(f => {
      const key = `u${f.unit}_w${f.week}`;
      if (!state.files[key]) state.files[key] = [];
      state.files[key].push({
        id: f.id, name: f.name, desc: f.description || '',
        url: f.file_url, storage_path: f.storage_path,
        size: f.size, date: f.upload_date
      });
    });
  }
  
  renderLandingUnits();
}

// ════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════
document.addEventListener('keydown', e => {
  // ESC para cerrar modales
  if (e.key === 'Escape') {
    if (document.getElementById('unitModal').classList.contains('open')) {
      closeModal();
    }
    if (document.getElementById('publicModal').classList.contains('open')) {
      closePublicModal();
    }
    if (document.getElementById('editOverlay').classList.contains('open')) {
      closeEdit();
    }
    if (document.getElementById('shareOverlay').classList.contains('open')) {
      closeShareModal();
    }
  }
  
  // ENTER en login
  if (e.key === 'Enter') {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen.classList.contains('active')) {
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      if (loginForm.style.display !== 'none') {
        handleLogin();
      } else if (registerForm.style.display !== 'none') {
        handleRegister();
      }
    }
  }
  
  // CTRL+S para guardar en edit
  if (e.ctrlKey && e.key === 's') {
    if (document.getElementById('editOverlay').classList.contains('open')) {
      e.preventDefault();
      saveEdit();
    }
  }
});

// ════════════════════════════════════════════
// CLICK OUTSIDE TO CLOSE MODALS
// ════════════════════════════════════════════
document.getElementById('unitModal').addEventListener('click', e => {
  if (e.target.id === 'unitModal') closeModal();
});

document.getElementById('publicModal').addEventListener('click', e => {
  if (e.target.id === 'publicModal') closePublicModal();
});

document.getElementById('editOverlay').addEventListener('click', e => {
  if (e.target.id === 'editOverlay') closeEdit();
});

document.getElementById('shareOverlay').addEventListener('click', e => {
  if (e.target.id === 'shareOverlay') closeShareModal();
});

// ════════════════════════════════════════════
// PREVENT DEFAULT DRAG & DROP ON DOCUMENT
// ════════════════════════════════════════════
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

// ════════════════════════════════════════════
// START APP
// ════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', init);

// ════════════════════════════════════════════
// CONSOLE EASTER EGG
// ════════════════════════════════════════════
console.log('%c⚡ KVN.UPLA SYSTEM ⚡', 'color:#00d4ff;font-size:24px;font-weight:bold;text-shadow:0 0 10px #00ffee');
console.log('%cUniversidad Peruana Los Andes', 'color:#ffd700;font-size:14px;letter-spacing:2px');
console.log('%cIngeniería de Sistemas y Computación', 'color:#00ffee;font-size:12px');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#00aaff');
console.log('%cDesarrollado por: Kevin Yeison Ccoñas Gomez', 'color:#aaa;font-size:11px');
console.log('%c5to Ciclo | 2025', 'color:#666;font-size:10px');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#00aaff');
console.log('%c🐉 Powered by Dragon Arcana Engine', 'color:#ff6600;font-size:11px;font-style:italic');
console.log('%c', '');
console.log('%c⚠ ADVERTENCIA:', 'color:#ff3344;font-size:13px;font-weight:bold');
console.log('%cEste sistema está protegido. No ejecutes código desconocido aquí.', 'color:#ff9966;font-size:11px');
console.log('%cSi alguien te pidió copiar/pegar algo, probablemente sea un intento de hackeo.', 'color:#ff9966;font-size:11px');
