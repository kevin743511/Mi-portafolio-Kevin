const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let currentUser = null;
let currentUnit = null;
let activeWeeks = { 1: 1, 2: 1, 3: 1, 4: 1 };
let isLogin = true;

// ANIMACIONES INICIALES
window.onload = async () => {
    initParticles(); 
    animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.display = 'none';
};

// --- GESTIÓN DE USUARIOS ---
async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    if(!u || !p) return alert("Runas incompletas.");

    await descargarDeFirebase();
    let db = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = db.find(x => x.user === u && x.pass === p);
        if(u === "kevin" && p === "upla") {
            loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        } else if(found) {
            loginOK(found);
        } else {
            alert("Acceso Denegado.");
        }
    } else {
        const n = document.getElementById('full-name').value.trim();
        const r = document.getElementById('reg-role').value;
        if(!n || db.some(x => x.user === u)) return alert("Identidad inválida o duplicada.");

        db.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(db));
        await sincronizarConFirebase();
        alert("Identidad Forjada.");
        toggleAuth();
    }
}

function loginOK(user) {
    currentUser = user;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = user.name.toUpperCase();
    document.getElementById('nav-role').innerText = user.role;
    updateCounters();
}

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('reg-fields').classList.toggle('d-none');
    document.getElementById('main-btn').innerText = isLogin ? "INICIAR NÚCLEO" : "CREAR IDENTIDAD";
}

// --- GESTIÓN DE PORTAFOLIO ---
function abrirPortal(u) {
    currentUnit = u;
    document.querySelectorAll('.internal-interface').forEach(i => i.classList.add('d-none'));
    document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active-card'));
    
    const target = document.getElementById(`inv-1`); // Usamos el contenedor base
    target.classList.remove('d-none');
    document.getElementById(`card-${u}`).classList.add('active-card');
    
    if(currentUser.role === 'ADMIN') document.getElementById(`admin-zone-1`).classList.remove('d-none');
    renderList(u);
}

function setWeek(u, w) {
    activeWeeks[u] = w;
    document.querySelectorAll('.w-pill').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderList(u);
}

async function sincronizarConFirebase() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const users = JSON.parse(localStorage.getItem('arcana_users')) || [];
    await fetch(FIREBASE_URL, { method: 'PUT', body: JSON.stringify({ vault, users }) });
}

async function descargarDeFirebase() {
    try {
        const res = await fetch(FIREBASE_URL);
        const data = await res.json();
        if(data) {
            localStorage.setItem('arcana_vault', JSON.stringify(data.vault || []));
            localStorage.setItem('arcana_users', JSON.stringify(data.users || []));
        }
    } catch(e) { console.log("Nexus offline"); }
}

function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const count = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${count} FRAGMENTOS`;
        document.getElementById(`pb-${i}`).style.width = Math.min((count/15)*100, 100) + "%";
    }
}

function logout() { location.reload(); }

// --- MOTOR DE PARTÍCULAS (RESUMIDO) ---
function initParticles() { /* Tu código de partículas */ }
function animateParticles() { /* Tu código de animación */ }
