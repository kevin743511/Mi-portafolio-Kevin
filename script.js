let isLogin = true;
let currentUser = null;
let activeUnit = null;

// --- GESTIÓN DE ACCESO ---
function toggleAuth() {
    isLogin = !isLogin;
    const regFields = document.getElementById('reg-fields');
    const authTitle = document.getElementById('auth-title');
    const mainBtn = document.getElementById('main-btn');
    const toggleBtn = document.getElementById('btn-toggle');

    if (!isLogin) {
        authTitle.innerText = "NUEVO REGISTRO";
        mainBtn.innerText = "CREAR MI CUENTA";
        regFields.classList.remove('d-none');
        toggleBtn.innerText = "¿Ya tienes cuenta? Ingresa aquí";
    } else {
        authTitle.innerText = "Kevin Portfolio";
        mainBtn.innerText = "INGRESAR AL SISTEMA";
        regFields.classList.add('d-none');
        toggleBtn.innerText = "¿No tienes cuenta? Regístrate aquí";
    }
}

function ejecutarAccion() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const db = JSON.parse(localStorage.getItem('kevin_final_users')) || [];

    if (!user || !pass) return alert("Por favor, llena los campos.");

    if (isLogin) {
        // LOGIN
        const found = db.find(u => u.user === user && u.pass === pass);
        if (found) {
            loginExitoso(found);
        } else {
            alert("Usuario o clave incorrectos.");
        }
    } else {
        // REGISTRO
        const nombre = document.getElementById('full-name').value.trim();
        const rol = document.getElementById('reg-role').value;

        if (!nombre) return alert("Ingresa tu nombre completo.");
        
        // Validación ADMIN Único
        if (rol === "ADMIN" && db.some(u => u.rol === "ADMIN")) {
            return alert("Ya existe un Administrador. Registrate como Visualizador.");
        }

        // Evitar duplicados
        if (db.some(u => u.user === user)) return alert("Este usuario ya existe.");

        db.push({ user, pass, nombre, rol });
        localStorage.setItem('kevin_final_users', JSON.stringify(db));
        alert("¡Cuenta creada! Ahora inicia sesión.");
        toggleAuth();
    }
}

function loginExitoso(u) {
    currentUser = u;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = u.nombre;
    actualizarContadores();
}

// --- GESTIÓN DE ARCHIVOS ---
function abrirUnidad(u) {
    activeUnit = u;
    document.getElementById('modal-unit-title').innerText = "ARCHIVOS UNIDAD " + u;
    document.getElementById('unit-modal').classList.remove('d-none');
    
    const adminZone = document.getElementById('admin-zone');
    if (currentUser.rol === "ADMIN") adminZone.classList.remove('d-none');
    else adminZone.classList.add('d-none');

    actualizarLista();
}

function guardarArchivo() {
    const title = document.getElementById('file-title').value.trim();
    const input = document.getElementById('file-input');
    const file = input.files[0];

    if (!title || !file) return alert("Selecciona un archivo y dale un título.");

    const reader = new FileReader();
    reader.onload = function() {
        const db = JSON.parse(localStorage.getItem('kevin_final_files')) || [];
        db.push({
            id: Date.now(),
            unidad: activeUnit,
            titulo: title,
            nombreArc: file.name,
            data: reader.result
        });
        localStorage.setItem('kevin_final_files', JSON.stringify(db));
        
        document.getElementById('file-title').value = "";
        input.value = "";
        actualizarLista();
        actualizarContadores();
    };
    reader.readAsDataURL(file);
}

function actualizarLista() {
    const db = JSON.parse(localStorage.getItem('kevin_final_files')) || [];
    const filtrados = db.filter(f => f.unidad == activeUnit);
    const body = document.getElementById('unit-files-body');
    body.innerHTML = "";

    if (filtrados.length === 0) {
        body.innerHTML = '<tr><td class="text-center text-white-50">Carpeta vacía</td></tr>';
        return;
    }

    filtrados.forEach(f => {
        body.innerHTML += `
            <tr>
                <td><span class="text-info">●</span> ${f.titulo} <br><small class="opacity-50">${f.nombreArc}</small></td>
                <td class="text-end">
                    <button onclick="descargar(${f.id})" class="btn btn-sm btn-success"><i class="fa fa-download"></i></button>
                    ${currentUser.rol === 'ADMIN' ? `<button onclick="eliminar(${f.id})" class="btn btn-sm btn-danger ms-1"><i class="fa fa-trash"></i></button>` : ""}
                </td>
            </tr>`;
    });
}

function descargar(id) {
    const db = JSON.parse(localStorage.getItem('kevin_final_files'));
    const f = db.find(x => x.id === id);
    const a = document.createElement('a');
    a.href = f.data; a.download = f.nombreArc;
    a.click();
}

function eliminar(id) {
    if(!confirm("¿Eliminar archivo?")) return;
    let db = JSON.parse(localStorage.getItem('kevin_final_files'));
    db = db.filter(x => x.id !== id);
    localStorage.setItem('kevin_final_files', JSON.stringify(db));
    actualizarLista();
    actualizarContadores();
}

function actualizarContadores() {
    const files = JSON.parse(localStorage.getItem('kevin_final_files')) || [];
    for(let i=1; i<=4; i++) {
        const total = files.filter(x => x.unidad == i).length;
        document.getElementById('cnt-' + i).innerText = total + " Archivos";
    }
}

function cerrarUnidad() { document.getElementById('unit-modal').classList.add('d-none'); }
function logout() { location.reload(); }
