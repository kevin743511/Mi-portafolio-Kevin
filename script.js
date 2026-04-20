const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let currentUser = null;
let activeWeeks = { 1: 1, 2: 1, 3: 1, 4: 1 };
let isLogin = true;

// Partículas y Loader (Se mantienen igual)
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
    if(!u || !p) return alert("Faltan credenciales");

    await descargarDeFirebase();
    let users = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = users.find(x => x.user === u && x.pass === p);
        if(u === "kevin" && p === "upla") loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        else if(found) loginOK(found);
        else alert("Identidad no encontrada.");
    } else {
        const n = document.getElementById('full-name').value.trim();
        const r = document.getElementById('reg-role').value;
        if(users.some(x => x.user === u)) return alert("Usuario ya existe");
        users.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(users));
        await sincronizarConFirebase();
        alert("Sincronizado. Inicie sesión.");
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
    document.querySelectorAll('.internal-interface').forEach(i => i.classList.add('d-none'));
    document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active-card'));
    
    document.getElementById(`inv-${u}`).classList.remove('d-none');
    document.getElementById(`card-${u}`).classList.add('active-card');
    
    if(currentUser.role === 'ADMIN') {
        const az = document.getElementById(`admin-zone-${u}`);
        if(az) az.classList.remove('d-none');
    }
    renderList(u);
}

// ... (Resto de funciones de renderList, updateCounters y sincronizarConFirebase)
