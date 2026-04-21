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

for (let i = 0; i < 120; i++) {
  const p = mkP();
  p.ml = p.life;
  particles.push(p);
}

function animP() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    const a = (p.life / p.ml) * p.al;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
    ctx.fillStyle = p.c + a + ')';
    ctx.fill();
    if (p.sz > 1.5) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.c + (a * .11) + ')';
      ctx.fill();
    }
    if (p.life <= 0) {
      particles[i] = mkP();
      particles[i].ml = particles[i].life;
    }
  });
  requestAnimationFrame(animP);
}
animP();

// ════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════
const ADMIN = { user: 'kevin', pass: 'upla' };
const BLOB_API = 'https://jsonblob.com/api/jsonBlob';

function getState() {
  return JSON.parse(localStorage.getItem('arcana_v3') || JSON.stringify({
    users: [], currentUser: null, isAdmin: false, isViewer: false,
    files: {}, blobId: null
  }));
}
function saveState(s) { localStorage.setItem('arcana_v3', JSON.stringify(s)); }
let state = getState();
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
  if (r === 'admin_attempt') { showToast('♛ El rol Administrador es único y ya está asignado', 'tw'); return; }
}

function handleLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!u || !p) { err.textContent = '⚠ Completa los campos'; return; }
  if (u === ADMIN.user && p === ADMIN.pass) {
    state.currentUser = u; state.isAdmin = true; state.isViewer = false;
    saveState(state); enterMain();
  } else {
    const found = state.users.find(x => x.user === u && x.pass === p);
    if (found) { state.currentUser = u; state.isAdmin = false; state.isViewer = true; saveState(state); enterMain(); }
    else { err.textContent = '✕ Héroe no reconocido en el Arcana'; }
  }
}

function handleRegister() {
  const u = document.getElementById('regUser').value.trim();
  const p = document.getElementById('regPass').value;
  const p2 = document.getElementById('regPass2').value;
  const err = document.getElementById('registerError');
  if (!u || !p) { err.textContent = '⚠ Completa todos los campos'; return; }
  if (p !== p2) { err.textContent = '✕ Las claves no coinciden'; return; }
  if (u === ADMIN.user) { err.textContent = '✕ Nombre reservado del Void'; return; }
  if (state.users.find(x => x.user === u)) { err.textContent = '✕ Héroe ya existe'; return; }
  state.users.push({ user: u, pass: p, role: 'viewer' });
  saveState(state);
  showToast('✦ Visualizador forjado. ¡Ya puedes acceder!');
  switchAuthTab('login');
  document.getElementById('loginUser').value = u;
  err.textContent = '';
}

function handleLogout() {
  state.currentUser = null; state.isAdmin = false; state.isViewer = false;
  saveState(state);
  document.getElementById('mainScreen').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
  ['loginUser', 'loginPass'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('loginError').textContent = '';
}

function enterMain() {
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
    document.getElementById('btnImport').style.display = '';
  }
  renderUnits();
  if (state.isViewer && state.blobId) {
    setSyncStatus('ing', 'CARGANDO...');
    loadFromCloud(state.blobId);
  }
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
function closeModal() { document.getElementById('unitModal').classList.remove('open'); renderUnits(); }
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
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleFilesFromList(e.dataTransfer.files); });
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getFileIcon(e) {
  const m = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📋', pptx: '📋',
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', svg: '🎨', bmp: '🖼',
    mp4: '🎬', avi: '🎬', mkv: '🎬', mp3: '🎵', wav: '🎵',
    zip: '📦', rar: '📦', '7z': '📦', txt: '📃', md: '📃',
    js: '⚙', py: '🐍', html: '🌐', css: '🎨', json: '📋', xml: '📋',
    csv: '📊', c: '⚙', cpp: '⚙', java: '☕'
  };
  return m[e] || '📁';
}

// ════════════════════════════════════════════
// FILE MANAGEMENT
// ════════════════════════════════════════════
function handleFileUpload(e) { handleFilesFromList(e.target.files); }

function handleFilesFromList(fileList) {
  if (!state.isAdmin) return;
  const key = `u${currentUnit}_w${currentWeek}`;
  if (!state.files[key]) state.files[key] = [];
  const arr = Array.from(fileList);
  if (!arr.length) return;
  let done = 0;
  const pw = document.getElementById('progressWrap');
  const pf = document.getElementById('progressFill');
  const pl = document.getElementById('progressLbl');
  if (pw) pw.style.display = 'block';

  arr.forEach((file, fi) => {
    const reader = new FileReader();
    reader.onprogress = ev => {
      if (ev.lengthComputable && pf) {
        const pct = Math.round(((fi + ev.loaded / ev.total) / arr.length) * 100);
        pf.style.width = pct + '%';
      }
    };
    reader.onload = ev => {
      state.files[key].push({
        id: 'f' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: file.name, desc: '',
        data: ev.target.result,
        size: fmtSize(file.size),
        date: new Date().toLocaleDateString('es-PE')
      });
      done++;
      if (pl) pl.textContent = `INYECTANDO ${done}/${arr.length}...`;
      if (done === arr.length) {
        saveState(state);
        if (pw) pw.style.display = 'none';
        renderWeekContent();
        showToast(`✦ ${done} fragmento${done > 1 ? 's' : ''} inyectado${done > 1 ? 's' : ''}`);
      }
    };
    reader.readAsDataURL(file);
  });
}

function downloadFile(id) {
  const f = (state.files[`u${currentUnit}_w${currentWeek}`] || []).find(x => x.id === id);
  if (!f) return;
  const a = document.createElement('a');
  a.href = f.data; a.download = f.name; a.click();
  showToast('⬇ Descargando: ' + f.name);
}

function deleteFile(id) {
  if (!state.isAdmin) return;
  if (!confirm('¿Eliminar este fragmento del plano temporal?')) return;
  const key = `u${currentUnit}_w${currentWeek}`;
  state.files[key] = (state.files[key] || []).filter(x => x.id !== id);
  saveState(state); renderWeekContent();
  showToast('✕ Fragmento eliminado', 'tw');
}

function openEdit(id) {
  const f = (state.files[`u${currentUnit}_w${currentWeek}`] || []).find(x => x.id === id);
  if (!f) return;
  editingFileId = id;
  document.getElementById('editFileName').value = f.name;
  document.getElementById('editFileDesc').value = f.desc || '';
  document.getElementById('editOverlay').classList.add('open');
}

function saveEdit() {
  const key = `u${currentUnit}_w${currentWeek}`;
  const files = state.files[key] || [];
  const idx = files.findIndex(x => x.id === editingFileId);
  if (idx < 0) return;
  const n = document.getElementById('editFileName').value.trim();
  if (n) files[idx].name = n;
  files[idx].desc = document.getElementById('editFileDesc').value.trim();
  saveState(state); closeEdit(); renderWeekContent();
  showToast('💾 Fragmento actualizado');
}
function closeEdit() { document.getElementById('editOverlay').classList.remove('open'); editingFileId = null; }
function fmtSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

// ════════════════════════════════════════════
// CLOUD SYNC — JSONBlob
// ════════════════════════════════════════════
function buildPayload() {
  return { files: state.files, ts: Date.now(), admin: ADMIN.user };
}

async function pushToCloud() {
  setShareStatus('ing', '⟳ SUBIENDO DATOS...');
  const body = JSON.stringify(buildPayload());
  const kb = Math.round(body.length / 1024);
  if (body.length > 4.8 * 1024 * 1024) {
    setShareStatus('err', `⚠ Payload muy grande (${kb}KB). Reduce archivos.`); return;
  }
  try {
    let blobId;
    if (state.blobId) {
      const r = await fetch(`${BLOB_API}/${state.blobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
      if (!r.ok) throw new Error('PUT ' + r.status);
      blobId = state.blobId;
    } else {
      const r = await fetch(BLOB_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!r.ok) throw new Error('POST ' + r.status);
      const loc = r.headers.get('Location') || r.url || '';
      blobId = loc.split('/').filter(Boolean).pop() || ('local_' + Date.now());
    }
    state.blobId = blobId; saveState(state);
    document.getElementById('blobIdDisplay').value = blobId;
    document.getElementById('blobResultSection').style.display = '';
    setShareStatus('ok', `✓ SINCRONIZADO · ${kb}KB`);
    setSyncStatus('ok', 'SYNC OK');
    showToast('☁ Datos subidos a la nube');
  } catch (e) {
    setShareStatus('err', '⚠ Error de red. Usa DESCARGAR BACKUP JSON.');
    setSyncStatus('err', 'ERROR');
    exportJsonDownload(); // fallback
  }
}

function exportJsonDownload() {
  const json = JSON.stringify(buildPayload(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'arcana_backup.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('📦 Backup descargado');
}

async function doViewerSync() {
  if (!state.blobId) {
    const id = prompt('Ingresa el BLOB ID del administrador:', '');
    if (!id) return;
    state.blobId = id.trim(); saveState(state);
  }
  setSyncStatus('ing', 'CARGANDO...');
  await loadFromCloud(state.blobId);
}

async function loadFromCloud(blobId) {
  try {
    const r = await fetch(`${BLOB_API}/${blobId}`, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    if (data.files) {
      state.files = data.files; saveState(state); renderUnits();
      setSyncStatus('ok', '✓ CARGADO');
      showToast('✓ Archivos del Arcana sincronizados');
    }
  } catch (e) {
    setSyncStatus('err', 'ERROR SYNC');
    showToast('✕ No se pudo sincronizar. Usa 📂 IMPORTAR con el JSON.', 'te');
  }
}

function importJsonFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.files) {
        state.files = data.files; saveState(state); renderUnits();
        showToast('✓ Backup importado correctamente');
        setSyncStatus('ok', 'IMPORTADO');
      } else { showToast('✕ Archivo no válido', 'te'); }
    } catch { showToast('✕ JSON inválido', 'te'); }
  };
  reader.readAsText(file);
  e.target.value = '';
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
// SHARE MODAL
// ════════════════════════════════════════════
function openShareModal() {
  document.getElementById('shareOverlay').classList.add('open');
  const sl = document.getElementById('shareStatusLine'); sl.style.display = 'none';
  if (state.blobId) {
    document.getElementById('blobIdDisplay').value = state.blobId;
    document.getElementById('blobResultSection').style.display = '';
    setShareStatus('ok', '✓ DATOS EN LA NUBE — BLOB ID ACTIVO');
  } else {
    document.getElementById('blobResultSection').style.display = 'none';
  }
}
function closeShareModal() { document.getElementById('shareOverlay').classList.remove('open'); }

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
    else closeModal();
  }
  if (e.key === 'Enter' && document.getElementById('loginScreen').classList.contains('active')) handleLogin();
});
document.getElementById('unitModal').addEventListener('click', e => { if (e.target === document.getElementById('unitModal')) closeModal(); });
document.getElementById('editOverlay').addEventListener('click', e => { if (e.target === document.getElementById('editOverlay')) closeEdit(); });
document.getElementById('shareOverlay').addEventListener('click', e => { if (e.target === document.getElementById('shareOverlay')) closeShareModal(); });

// ════════════════════════════════════════════
// RESTORE SESSION
// ════════════════════════════════════════════
if (state.currentUser) {
  if (state.currentUser === ADMIN.user) { state.isAdmin = true; state.isViewer = false; }
  else { state.isAdmin = false; state.isViewer = true; }
  saveState(state); enterMain();
}
