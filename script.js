// CONFIGURACIÓN DE PARTÍCULAS
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 2
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

// ESTADO GLOBAL
let isLogin = true;
let currentUser = null;
let currentUnit = null;
let activeWeeks = { 1: 1, 2: 1, 3: 1, 4: 1 }; // Manejo independiente de semanas por unidad

window.onload = () => {
    initParticles(); animateParticles();
    setTimeout(() => document.getElementById('loader').style.display = 'none', 1200);
};

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('reg-fields').classList.toggle('d-none');
    document.getElementById('main-btn').innerText = isLogin ? "IGNICIAR NÚCLEO" : "CREAR IDENTIDAD";
}

function ejecutarAccion() {
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value.trim();
    if(!u || !p) return alert("Ingrese sus runas de acceso");

    let db = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = db.find(x => x.user === u && x.pass === p);
        // Credenciales por defecto para Kevin
        if(u === "kevin" && p === "upla") loginOK({name: "Kevin Coñas", role: "ADMIN"});
        else if(found) loginOK(found);
        else alert("Sincronización fallida: Usuario no encontrado");
    } else {
        const n = document.getElementById('full-name').value;
        const r = document.getElementById('reg-role').value;
        db.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(db));
        alert("Identidad forjada con éxito"); toggleAuth();
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
    const target = document.getElementById(`inv-${u}`);
    const isVisible = !target.classList.contains('d-none');
    
    // Cerrar todos primero
    document.querySelectorAll('.internal-interface').forEach(i => i.classList.add('d-none'));
    
    if(!isVisible) {
        target.classList.remove('d-none');
        currentUnit = u;
        if(currentUser.role === 'ADMIN') document.getElementById(`admin-zone-${u}`).classList.remove('d-none');
        renderList(u);
    }
}

// ARREGLADO: Función para cambiar semanas sin que queden encendidas otras
function setWeek(u, w) {
    activeWeeks[u] = w; // Guardamos qué semana está activa en esta unidad específica
    
    // UI: Limpiar todas las semanas de ESTA unidad
    document.querySelectorAll(`.w-pill-${u}`).forEach(btn => btn.classList.remove('active'));
    
    // UI: Activar solo la seleccionada
    document.querySelector(`.w-btn-${u}-${w}`).classList.add('active');
    
    renderList(u);
}

function inyectarDato(u) {
    const file = document.getElementById(`file-${u}`).files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
        vault.push({
            id: Date.now(),
            unit: u,
            week: activeWeeks[u],
            name: file.name,
            data: e.target.result
        });
        localStorage.setItem('arcana_vault', JSON.stringify(vault));
        renderList(u); updateCounters();
    };
    reader.readAsDataURL(file);
}

function renderList(u) {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    const filtered = vault.filter(v => v.unit == u && v.week == activeWeeks[u]);
    const container = document.getElementById(`list-${u}`);
    
    container.innerHTML = filtered.length ? "" : "<div class='text-center p-3 opacity-25' style='font-size:9px'>SIN_FRAGMENTOS</div>";
    
    filtered.forEach(v => {
        container.innerHTML += `
            <div class="file-row">
                <span>${v.name.substring(0,18)}</span>
                <div class="d-flex gap-2">
                    <i class="fa fa-download text-info pointer" onclick="descargar('${v.data}', '${v.name}')"></i>
                    ${currentUser.role==='ADMIN' ? `<i class="fa fa-trash-alt text-danger pointer" onclick="eliminar(${v.id}, ${u})"></i>` : ''}
                </div>
            </div>`;
    });
}

function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const count = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${count} FRAGMENTOS`;
        // Actualizar barra de progreso (max 20 archivos por unidad para 100%)
        const percent = Math.min((count / 20) * 100, 100);
        document.getElementById(`pb-${i}`).style.width = percent + "%";
    }
}

function descargar(data, name) {
    const link = document.createElement('a'); link.href = data; link.download = name; link.click();
}

function eliminar(id, u) {
    let vault = JSON.parse(localStorage.getItem('arcana_vault'));
    vault = vault.filter(v => v.id !== id);
    localStorage.setItem('arcana_vault', JSON.stringify(vault));
    renderList(u); updateCounters();
}

function logout() { location.reload(); }
