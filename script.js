// ════════════════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════════════════
const SUPABASE_URL = 'https://kdsfvnwrhtlfryqlrhya.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Tzr847YIW5vuNjvWBXAL7w_iUbRgtyN';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ════════════════════════════════════════════
// PARTICLES
// ════════════════════════════════════════════
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function rsz() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
rsz();
window.addEventListener('resize', rsz);

function mkP() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .38,
    vy: (Math.random() - .5) * .38 - .14,
    sz: Math.random() * 2 + .5,
    al: Math.random() * .55 + .1,
    life: Math.random() * 200 + 100,
    ml: 0,
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

// ════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════
function switchAuthTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1))
  );
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRole(r) {
  if (r === 'admin_attempt') { showToast('♛ El rol Administrador es único y ya está asignado', 'tw'); }
}

async function handleLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!u || !p) { err.textContent = '⚠ Completa los campos'; return; }

  // Admin fijo
  if (u === ADMIN.user && p === ADMIN.pass) {
    localStorage.setItem('arcana_user', u);
    localStorage.setItem('arcana_role', 'admin');
    state.currentUser = u; state.isAdmin = true; state.isViewer = false;
    enterMain();
    return;
  }

  // Buscar en Supabase
  err.textContent = '⟳ Verificando...';
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('username', u)
    .eq('password', p)
    .single();

  if (error || !data) {
    err.textContent = '✕ Héroe no reconocido en el Arcana';
  } else {
    localStorage.setItem('arcana_user', u);
    localStorage.setItem('arcana_role', 'viewer');
    state.currentUser = u; state.isAdmin = false; state.isViewer = true;
    enterMain();
  }
}

async function handleRegister() {
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value;
  const p2 = document.getElementById('regPass2').value;
  const err = document.getElementById('registerError');
  if (!u || !p) { err.textContent = '⚠ Completa todos los campos'; return; }
  if (p !== p2) { err.textContent = '✕ Las claves no coinciden'; return; }
  if (u === ADMIN.user) { err.textContent = '✕ Nombre reservado del Void'; return; }

  err.textContent = '⟳ Forjando héroe...';
  const { error } = await sb.from('users').insert({ username: u, password: p, role: 'viewer' });

  if (error) {
    if (error.code === '23505') err.textContent = '✕ Héroe ya existe';
    else err.textContent = '✕ Error: ' + error.message;
  } else {
    showToast('✦ Visualizador forjado. ¡Ya puedes acceder!');
    switchAuthTab('login');
    document.getElementById('loginUser').value = u;
    err.textContent = '';
  }
}

function handleLogout() {
  localStorage.removeItem('arcana_user');
  localStorage.removeItem('arcana_role');
  state.currentUser = null; state.isAdmin = false; state.isViewer = false; state.files = {};
  document.getElementById('mainScreen').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
  ['loginUser', 'loginPass'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('loginError').textContent = '';
}

async function enterMain() {
  document.getElementById('loginScreen').classList.remove('active');
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
// SUPABASE — CARGAR ARCHIVOS
// ════════════════════════════════════════════
async function loadAllFiles() {
  const { data, error } = await sb.from('files').select('*').order('created_at', { ascending: true });
  if (error) {
    setSyncStatus('err', 'ERROR BD');
    showToast('✕ Error cargando archivos', 'te');
    return;
  }
  state.files = {};
  (data || []).forEach(f => {
    const key = `u${f.unit}_w${f.week}`;
    if (!state.files[key]) state.files[key] = [];
    state.files[key].push({
      id: f.id,
      name: f.name,
      desc: f.description || '',
      url: f.file_url,
      storage_path: f.storage_path,
      size: f.size,
      date: f.upload_date
    });
  });
  setSyncStatus('ok', '✓ SYNC');
}

// ════════════════════════════════════════════
// SUPABASE STORAGE — SUBIR ARCHIVO
// ════════════════════════════════════════════
async function uploadToStorage(file, unit, week) {
  const ext = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `u${unit}_w${week}/${Date.now()}_${safeName}`;

  const { data, error } = await sb.storage
    .from('archivos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error('Storage: ' + error.message);

  // Obtener URL pública
  const { data: urlData } = sb.storage.from('archivos').getPublicUrl(path);
  return { path, url: urlData.publicUrl };
}

async function saveFileMetaToDB(fileObj, unit, week) {
  const { error } = await sb.from('files').insert({
    id: fileObj.id,
    unit: unit,
    week: week,
    name: fileObj.name,
    description: fileObj.desc || '',
    file_url: fileObj.url,
    storage_path: fileObj.storage_path,
    size: fileObj.size,
    upload_date: fileObj.date
  });
  if (error) throw new Error('DB: ' + error.message);
}

async function deleteFileFromStorage(storagePath) {
  if (!storagePath) return;
  await sb.storage.from('archivos').remove([storagePath]);
}

async function deleteFileFromDB(id) {
  const { error } = await sb.from('files').delete().eq('id', id);
  if (error) throw error;
}

async function updateFileInDB(id, name, desc) {
  const { error } = await sb.from('files').update({ name, description: desc }).eq('id', id);
  if (error) throw error;
}

// ════════════════════════════════════════════
// UNITS
// ════════════════════════════════════════════
const unitDefs = [
  { num: 1, roman: 'I',   label: 'PRIMERA CRÓNICA', cls: 'unit-1', mcls: 'modal-u1' },
  { num: 2, roman: 'II',  label: 'SEGUNDA CRÓNICA', cls: 'unit-2', mcls: 'modal-u2' },
  { num: 3, roman: 'III', label: 'TERCERA CRÓNICA', cls: 'unit-3', mcls: 'modal-u3' },
  { num: 4, roman: 'IV',  label: 'CUARTA CRÓNICA',  cls: 'unit-4', mcls: 'modal-u4' },
];

function getFileCount(n) {
  let c = 0;
  for (let w = 1; w <= 4; w++) c += (state.files[`u${n}_w${w}`] || []).length;
  return c;
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
        <div class="dome-outer"></div><div class="dome-fire-ring"></div>
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
// MODAL
// ════════════════════════════════════════════
function openUnit(n) {
  currentUnit = n; currentWeek = 1;
  const ud = unitDefs[n - 1];
  const box = document.getElementById('modalBox');
  box.className = `modal-box ${ud.mcls}`;
  document.getElementById('modalDomeMini').textContent = ud.roman;
  document.getElementById('modalTitle').textContent = `UNIDAD ${ud.roman}`;
  document.getElementById('modalSub').textContent = ud.label;
  document.querySelectorAll('.week-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('unitModal').classList.add('open');
  renderWeekContent();
}

function closeModal() {
  document.getElementById('unitModal').classList.remove('open');
  renderUnits();
}

function switchWeek(w) {
  currentWeek = w;
  document.querySelectorAll('.week-tab').forEach((t, i) => t.classList.toggle('active', i === w - 1));
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
      <button class="btn-inject" onclick="document.getElementById('fileInput').click()">
        ⚡ INYECTAR DATOS
      </button>`;
  }

  html += `<div class="files-list">`;
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
  html += `</div>`;
  body.innerHTML = html;

  // Drag & drop
  const zone = document.getElementById('uploadZone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      handleFilesFromList(e.dataTransfer.files);
    });
  }
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getFileIcon(e) {
  const m = {
    pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📋',pptx:'📋',
    jpg:'🖼',jpeg:'🖼',png:'🖼',gif:'🖼',svg:'🎨',bmp:'🖼',
    mp4:'🎬',avi:'🎬',mkv:'🎬',mp3:'🎵',wav:'🎵',
    zip:'📦',rar:'📦','7z':'📦',txt:'📃',md:'📃',
    js:'⚙',py:'🐍',html:'🌐',css:'🎨',json:'📋',xml:'📋',
    csv:'📊',c:'⚙',cpp:'⚙',java:'☕'
  };
  return m[e] || '📁';
}

// ════════════════════════════════════════════
// FILE UPLOAD
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
      // 1. Subir al Storage
      const { path, url } = await uploadToStorage(file, currentUnit, currentWeek);
      if (pf) pf.style.width = Math.round(((fi + 0.7) / arr.length) * 100) + '%';

      // 2. Guardar metadatos en la tabla files
      const fileObj = {
        id: 'f' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: file.name,
        desc: '',
        url: url,
        storage_path: path,
        size: fmtSize(file.size),
        date: new Date().toLocaleDateString('es-PE')
      };
      await saveFileMetaToDB(fileObj, currentUnit, currentWeek);

      // 3. Agregar al estado local
      state.files[key].push(fileObj);
      done++;
      if (pf) pf.style.width = Math.round(((fi + 1) / arr.length) * 100) + '%';

    } catch (err) {
      console.error(err);
      showToast('✕ Error subiendo: ' + file.name, 'te');
    }
  }

  if (pw) pw.style.display = 'none';
  renderWeekContent();
  renderUnits();
  if (done > 0) showToast(`✦ ${done} fragmento${done > 1 ? 's' : ''} inyectado${done > 1 ? 's' : ''}`);
}

// Descarga directa desde la URL pública de Supabase Storage
function downloadFile(id) {
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f || !f.url) return;
  const a = document.createElement('a');
  a.href = f.url;
  a.download = f.name;
  a.target = '_blank';
  a.click();
  showToast('⬇ Descargando: ' + f.name);
}

async function deleteFile(id) {
  if (!state.isAdmin) return;
  if (!confirm('¿Eliminar este fragmento del plano temporal?')) return;
  const key = `u${currentUnit}_w${currentWeek}`;
  const f = (state.files[key] || []).find(x => x.id === id);
  if (!f) return;
  try {
    await deleteFileFromStorage(f.storage_path);
    await deleteFileFromDB(id);
    state.files[key] = state.files[key].filter(x => x.id !== id);
    renderWeekContent();
    renderUnits();
    showToast('✕ Fragmento eliminado', 'tw');
  } catch (err) {
    console.error(err);
    showToast('✕ Error al eliminar', 'te');
  }
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
    await updateFileInDB(editingFileId, n || files[idx].name, d);
    if (n) files[idx].name = n;
    files[idx].desc = d;
    closeEdit();
    renderWeekContent();
    showToast('💾 Fragmento actualizado');
  } catch (err) {
    showToast('✕ Error al guardar', 'te');
  }
}

function closeEdit() {
  document.getElementById('editOverlay').classList.remove('open');
  editingFileId = null;
}

function fmtSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

// ════════════════════════════════════════════
// SHARE MODAL
// ════════════════════════════════════════════
function openShareModal() {
  document.getElementById('shareOverlay').classList.add('open');
}
function closeShareModal() {
  document.getElementById('shareOverlay').classList.remove('open');
}

// Sync manual — recarga archivos desde Supabase
async function doViewerSync() {
  setSyncStatus('ing', 'CARGANDO...');
  await loadAllFiles();
  renderUnits();
  showToast('✓ Archivos sincronizados');
}

function copyField(id) {
  const v = document.getElementById(id).value;
  if (!v) return;
  navigator.clipboard.writeText(v)
    .then(() => showToast('📋 Copiado al portapapeles'))
    .catch(() => {
      document.getElementById(id).select();
      document.execCommand('copy');
      showToast('📋 Copiado');
    });
}

// ════════════════════════════════════════════
// STATUS / TOAST
// ════════════════════════════════════════════
function setSyncStatus(type, txt) {
  const el = document.getElementById('syncIndicator');
  el.style.display = '';
  el.className = 'sync-indicator sync-' + type;
  el.textContent = txt;
}

function setShareStatus(type, txt) {
  const el = document.getElementById('shareStatusLine');
  el.className = 'status-line status-' + type;
  el.style.display = '';
  el.textContent = txt;
}

let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ════════════════════════════════════════════
// KEYBOARD
// ════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('editOverlay').classList.contains('open')) closeEdit();
    else if (document.getElementById('shareOverlay').classList.contains('open')) closeShareModal();
    else closeModal();
  }
  if (e.key === 'Enter' && document.getElementById('loginScreen').classList.contains('active')) handleLogin();
});
document.getElementById('unitModal').addEventListener('click', e => {
  if (e.target === document.getElementById('unitModal')) closeModal();
});
document.getElementById('editOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('editOverlay')) closeEdit();
});
document.getElementById('shareOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('shareOverlay')) closeShareModal();
});

// ════════════════════════════════════════════
// RESTORE SESSION
// ════════════════════════════════════════════
if (state.currentUser) {
  enterMain();
}
