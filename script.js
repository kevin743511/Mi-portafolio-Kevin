// --- CONFIGURACIÓN FIREBASE ---
const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';

// --- ESTADO GLOBAL ---
let currentUser = null;
let currentUnit = null;
let activeWeek = 1;
let isLogin = true;

// --- MOTOR DE PARTÍCULAS ---
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({length: 100}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2
    }));
}

function animateParticles() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 242, 255, 0.4)";
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

// --- LÓGICA DE INICIO ---
window.onload = async () => {
    initParticles();
    animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').classList.add('d-none'), 500);
};

async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    if(!u || !p) return alert("Ingrese credenciales.");

    await descargarDeFirebase();
    let db = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = db.find(x => x.user === u && x.pass === p);
        if(u === "kevin" && p === "upla") loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        else if(found) loginOK(found);
        else alert("Identidad no encontrada.");
    } else {
        const n = document.getElementById('full-name').value.trim();
        const r = document.getElementById('reg-role').value;
        if(!n || db.some(x => x.user === u)) return alert("Error en registro.");
        db.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(db));
        await sincronizarConFirebase();
        alert("Sincronización Exitosa.");
        toggleAuth();
    }
}

function loginOK(user) {
    currentUser = user;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = user.name;
    document.getElementById('nav-role').innerText = user.role;
    updateCounters();
}

// --- GESTIÓN DE UNIDADES ---
function abrirPortal(u) {
    currentUnit = u;
    activeWeek = 1;
    document.getElementById('portal-overlay').classList.remove('d-none');
    document.getElementById('portal-title').innerText = `UNIDAD ${u}`;
    if(currentUser.role === 'ADMIN') document.getElementById('admin-controls').classList.remove('d-none');
    renderFiles();
}

function cerrarPortal() {
    document.getElementById('portal-overlay').classList.add('d-none');
}

function setWeek(w) {
    activeWeek = w;
    document.querySelectorAll('.w-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`w${w}-btn`).classList.add('active');
    renderFiles();
}

function inyectarDato() {
    const file = document.getElementById('file-input').files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
        vault.push({ id: Date.now(), unit: currentUnit, week: activeWeek, name: file.name, data: e.target.result });
        localStorage.setItem('arcana_vault', JSON.stringify(vault));
        await sincronizarConFirebase();
        renderFiles();
        updateCounters();
    };
    reader.readAsDataURL(file);
}

function renderFiles() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const filtered = vault.filter(v => v.unit == currentUnit && v.week == activeWeek);
    const list = document.getElementById('file-list');
    list.innerHTML = filtered.map(v => `
        <div class="file-row">
            <span>${v.name}</span>
            <div>
                <i class="fa fa-download pointer" onclick="descargar('${v.data}', '${v.name}')"></i>
                ${currentUser.role === 'ADMIN' ? `<i class="fa fa-trash pointer text-danger ms-3" onclick="eliminar(${v.id})"></i>` : ''}
            </div>
        </div>
    `).join('') || '<p class="opacity-20 text-center">BÓVEDA VACÍA</p>';
}

async function sincronizarConFirebase() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const users = JSON.parse(localStorage.getItem('arcana_users')) || [];
    await fetch(FIREBASE_URL, { method: 'PUT', body: JSON.stringify({ vault, users }) });
}

async function descargarDeFirebase() {
    const res = await fetch(FIREBASE_URL);
    const data = await res.json();
    if(data) {
        localStorage.setItem('arcana_vault', JSON.stringify(data.vault || []));
        localStorage.setItem('arcana_users', JSON.stringify(data.users || []));
    }
}

function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const count = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${count} FRAGMENTOS`;
        document.getElementById(`pb-${i}`).style.width = Math.min((count/15)*100, 100) + "%";
    }
}

function descargar(d, n) { const a = document.createElement('a'); a.href = d; a.download = n; a.click(); }
function logout() { location.reload(); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('reg-fields').classList.toggle('d-none'); }
