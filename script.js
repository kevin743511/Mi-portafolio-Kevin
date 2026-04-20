const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let currentUser = null;
let currentUnit = null;
let activeWeek = 1;
let isLogin = true;

// Descarga inicial desde Firebase
window.onload = async () => {
    initParticles();
    animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.display = 'none';
};

async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    
    await descargarDeFirebase();
    let users = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const adminSecret = (u === "kevin" && p === "upla");
        const found = users.find(x => x.user === u && x.pass === p);
        
        if(adminSecret) loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        else if(found) loginOK(found);
        else alert("Vínculo fallido. Revisa tus runas (credenciales).");
    } else {
        const n = document.getElementById('full-name').value;
        const r = document.getElementById('reg-role').value;
        if(users.some(x => x.user === u)) return alert("Esa identidad ya existe.");
        users.push({user: u, pass: p, name: n, role: r});
        localStorage.setItem('arcana_users', JSON.stringify(users));
        await sincronizarConFirebase();
        alert("Identidad forjada. Ahora inicia sesión.");
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

function abrirPortal(u) {
    currentUnit = u;
    activeWeek = 1;
    document.getElementById('vault-modal').classList.remove('d-none');
    document.getElementById('modal-title').innerText = `BÓVEDA - UNIDAD ${u}`;
    if(currentUser.role === 'ADMIN') document.getElementById('admin-actions').classList.remove('d-none');
    renderFiles();
}

function inyectarDato() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        let vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
        vault.push({
            id: Date.now(),
            unit: currentUnit,
            week: activeWeek,
            name: file.name,
            data: e.target.result,
            owner: currentUser.user
        });
        localStorage.setItem('arcana_vault', JSON.stringify(vault));
        await sincronizarConFirebase();
        renderFiles();
        updateCounters();
    };
    reader.readAsDataURL(file);
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
        const total = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${total} FRAGMENTOS`;
        document.getElementById(`pb-${i}`).style.width = Math.min((total/10)*100, 100) + "%";
    }
}

function cerrarPortal() { document.getElementById('vault-modal').classList.add('d-none'); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('reg-fields').classList.toggle('d-none'); }
function logout() { location.reload(); }

// ... (Aquí pones tu función initParticles y animateParticles que ya tenías)
