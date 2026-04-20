const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let currentUser = null, currentUnit = null, activeWeek = 1, isLogin = true;

// --- MOTOR DE PARTÍCULAS (LA CRONOSFERA) ---
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2
    }));
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 242, 255, 0.4)";
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

// --- ARRANQUE DEL SISTEMA ---
window.onload = async () => {
    initParticles(); animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
};

// --- GESTIÓN DE ACCESO ---
async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    if(!u || !p) return alert("Runas incompletas.");

    await descargarDeFirebase();
    let db = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        if(u === "kevin" && p === "upla") {
            loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        } else {
            const found = db.find(x => x.user === u && x.pass === p);
            if(found) loginOK(found); else alert("Identidad no encontrada en el nexo.");
        }
    } else {
        const n = document.getElementById('full-name').value;
        const r = document.getElementById('reg-role').value;
        if(db.some(x => x.user === u)) return alert("El héroe ya existe.");
        db.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(db));
        await sincronizarConFirebase();
        alert("Identidad Forjada."); toggleAuth();
    }
}

function loginOK(u) {
    currentUser = u;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = u.name.toUpperCase();
    document.getElementById('nav-role').innerText = u.role;
    updateCounters();
}

// --- GESTIÓN DE BÓVEDA ---
function abrirPortal(u) {
    currentUnit = u; activeWeek = 1;
    document.getElementById('vault-modal').classList.remove('d-none');
    document.getElementById('modal-title').innerText = `UNIDAD ${u} - SEMANA 1`;
    if(currentUser.role === 'ADMIN') document.getElementById('admin-tools').classList.remove('d-none');
    renderFiles();
}

function setWeek(w) {
    activeWeek = w;
    document.querySelectorAll('.w-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`w${w}`).classList.add('active');
    document.getElementById('modal-title').innerText = `UNIDAD ${currentUnit} - SEMANA ${w}`;
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
        renderFiles(); updateCounters();
    };
    reader.readAsDataURL(file);
}

function renderFiles() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const filtered = vault.filter(v => v.unit == currentUnit && v.week == activeWeek);
    document.getElementById('file-list').innerHTML = filtered.map(v => `
        <div class="file-row" style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid rgba(0,242,255,0.1)">
            <span><i class="fa fa-file-code"></i> ${v.name}</span>
            <div>
                <i class="fa fa-download" style="cursor:pointer; color:var(--void)" onclick="descargar('${v.data}', '${v.name}')"></i>
                ${currentUser.role === 'ADMIN' ? `<i class="fa fa-trash" style="cursor:pointer; color:var(--fire); margin-left:20px" onclick="eliminar(${v.id})"></i>` : ''}
            </div>
        </div>
    `).join('') || '<p style="opacity:0.2; text-align:center; margin-top:50px">CRONOSFERA VACÍA</p>';
}

function eliminar(id) {
    let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    vault = vault.filter(v => v.id !== id);
    localStorage.setItem('arcana_vault', JSON.stringify(vault));
    sincronizarConFirebase(); renderFiles(); updateCounters();
}

function descargar(d, n) { const a = document.createElement('a'); a.href = d; a.download = n; a.click(); }

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
    } catch(e) { console.log("Firebase Offline"); }
}

function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const c = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${c} FRAGMENTOS`;
        document.getElementById(`pb-${i}`).style.width = Math.min(c * 10, 100) + "%";
    }
}

function cerrarPortal() { document.getElementById('vault-modal').classList.add('d-none'); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('reg-fields').classList.toggle('d-none'); }
function logout() { location.reload(); }
