const FIREBASE_URL = 'https://portafolioupla-default-rtdb.firebaseio.com/.json';
let currentUser = null, currentUnit = null, activeWeek = 1, isLogin = true;

window.onload = async () => {
    initParticles(); animateParticles();
    await descargarDeFirebase();
    document.getElementById('loader').style.display = 'none';
};

async function ejecutarAccion() {
    const u = document.getElementById('user').value.trim().toLowerCase();
    const p = document.getElementById('pass').value.trim();
    await descargarDeFirebase();
    let users = JSON.parse(localStorage.getItem('arcana_users')) || [];

    if(isLogin) {
        const found = users.find(x => x.user === u && x.pass === p);
        if(u === "kevin" && p === "upla") loginOK({name: "Kevin Yeison Ccoñas Gomez", role: "ADMIN", user: "kevin"});
        else if(found) loginOK(found);
        else alert("Acceso Denegado.");
    } else {
        const n = document.getElementById('full-name').value;
        if(users.some(x => x.user === u)) return alert("Usuario existe.");
        users.push({user: u, pass: p, name: n, role: document.getElementById('reg-role').value});
        localStorage.setItem('arcana_users', JSON.stringify(users));
        await sincronizarConFirebase();
        alert("Sincronizado."); toggleAuth();
    }
}

function loginOK(u) {
    currentUser = u;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = u.name;
    document.getElementById('nav-role').innerText = u.role;
    updateCounters();
}

function abrirPortal(u) {
    currentUnit = u; activeWeek = 1;
    document.getElementById('vault-modal').classList.remove('d-none');
    document.getElementById('modal-title').innerText = `UNIDAD ${u}`;
    if(currentUser.role === 'ADMIN') document.getElementById('admin-actions').classList.remove('d-none');
    renderFiles();
}

function setWeek(w) {
    activeWeek = w;
    document.querySelectorAll('.w-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`w${w}`).classList.add('active');
    renderFiles();
}

function inyectarDato() {
    const file = document.getElementById('file-upload').files[0];
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
        <div class="file-row">
            <span>${v.name}</span>
            <div>
                <i class="fa fa-download" style="cursor:pointer" onclick="descargar('${v.data}', '${v.name}')"></i>
                ${currentUser.role === 'ADMIN' ? `<i class="fa fa-trash" style="cursor:pointer;color:red;margin-left:15px" onclick="eliminar(${v.id})"></i>` : ''}
            </div>
        </div>
    `).join('') || '<p style="opacity:0.3;text-align:center">VACÍO</p>';
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
    const res = await fetch(FIREBASE_URL); const data = await res.json();
    if(data) { localStorage.setItem('arcana_vault', JSON.stringify(data.vault || [])); localStorage.setItem('arcana_users', JSON.stringify(data.users || [])); }
}
function updateCounters() {
    const vault = JSON.parse(localStorage.getItem('arcana_vault')) || [];
    for(let i=1; i<=4; i++) {
        const c = vault.filter(v => v.unit == i).length;
        document.getElementById(`cnt-${i}`).innerText = `${c} FRAGMENTOS`;
        document.getElementById(`pb-${i}`).style.width = (c*10) + "%";
    }
}
function logout() { location.reload(); }
function cerrarPortal() { document.getElementById('vault-modal').classList.add('d-none'); }
function toggleAuth() { isLogin = !isLogin; document.getElementById('reg-fields').classList.toggle('d-none'); }
function initParticles() { /* Tu código de partículas aquí */ }
function animateParticles() { /* Tu animación aquí */ }
