// PARTÍCULAS
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, s: Math.random() * 2
    }));
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 242, 255, 0.3)";
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

// ESTADO GLOBAL Y FIREBASE
const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let isLogin = true;
let currentUser = null;
let currentUnit = null;
let activeWeeks = { 1: 1, 2: 1, 3: 1, 4: 1 };

window.onload = async () => {
    initParticles(); animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.display = 'none';
};

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('reg-fields').classList.toggle('d-none');
    document.getElementById('main-btn').innerText = isLogin ? "INICIAR NÚCLEO" : "CREAR IDENTIDAD";
}

async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    if(!u || !p) return alert("Faltan datos de acceso.");

    await descargarDeFirebase();
    let users = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = users.find(x => x.user === u && x.pass === p);
        if(u === "kevin" && p === "upla") loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        else if(found) loginOK(found);
        else alert("Identidad no reconocida.");
    } else {
        const n = document.getElementById('full-name').value.trim();
        const r = document.getElementById('reg-role').value;
        if(!n) return alert("Ingrese su nombre real.");
        if(users.some(x => x.user === u)) return alert("Usuario ya registrado.");

        users.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(users));
        await sincronizarConFirebase();
        alert("Sincronización completa. Proceda al login.");
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

function abrirPortal(u) {
    currentUnit = u;
    document.querySelectorAll('.internal-interface').forEach(i => i.classList.add('d-none'));
    document.getElementById(`inv-${u}`).classList.remove('d-none');
    if(currentUser.role === 'ADMIN') document.getElementById(`admin-zone-${u}`).classList.remove('d-none');
    renderList(u);
}

function setWeek(u, w) {
    activeWeeks[u] = w;
    document.querySelectorAll(`.w-pill-${u}`).forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.w-btn-${u}-${w}`).classList.add('active');
    renderList(u);
}

function inyectarDato(u) {
    const fileInput = document.getElementById(`file-${u}`);
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
        vault.push({ id: Date.now(), unit: u, week: activeWeeks[u], name: file.name, data: e.target.result, owner: currentUser.user });
        localStorage.setItem('arcana_vault', JSON.stringify(vault));
        renderList(u); 
        updateCounters();
        await sincronizarConFirebase();
        fileInput.value = "";
    };
    reader.readAsDataURL(file);
}

function renderList(u) {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const filtered = vault.filter(v => v.unit == u && v.week == activeWeeks[u]);
    const container = document.getElementById(`list-${u}`);
    container.innerHTML = filtered.length ? "" : "<div style='opacity:0.2; text-align:center; padding:20px;'>NO HAY ARCHIVOS EN ESTE NEXO</div>";
    filtered.forEach(v => {
        container.innerHTML += `
            <div class="file-row">
                <span>${v.name}</span>
                <div>
                    <i class="fa fa-download text-info pointer" onclick="descargar('${v.data}','${v.name}')"></i>
                    ${currentUser.role === 'ADMIN' ? `<i class="fa fa-trash-alt text-danger pointer ms-3" onclick="eliminar(${v.id}, ${u})"></i>` : ''}
                </div>
            </div>`;
    });
}

function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const count = vault.filter(v => v.unit == i).length;
        const cnt = document.getElementById(`cnt-${i}`);
        const pb = document.getElementById(`pb-${i}`);
        if(cnt) cnt.innerText = `${count} FRAGMENTOS`;
        if(pb) pb.style.width = Math.min((count / 15) * 100, 100) + "%";
    }
}

async function eliminar(id, u) {
    let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    vault = vault.filter(v => v.id !== id);
    localStorage.setItem('arcana_vault', JSON.stringify(vault));
    renderList(u); updateCounters();
    await sincronizarConFirebase();
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
    } catch(e) { console.error("Error de descarga."); }
}

function logout() { location.reload(); }
