let isLogin = true;
let userLogueado = null;

// CAMBIAR ENTRE LOGIN Y REGISTRO
function toggleAuth() {
    isLogin = !isLogin;
    const regFields = document.getElementById('reg-fields');
    const authTitle = document.getElementById('auth-title');
    const mainBtn = document.getElementById('main-btn');
    const toggleBtn = document.getElementById('btn-toggle');

    if (!isLogin) {
        authTitle.innerText = "Nueva Cuenta";
        mainBtn.innerText = "REGISTRARME";
        regFields.classList.remove('d-none');
        toggleBtn.innerText = "¿Ya tienes cuenta? Inicia sesión";
    } else {
        authTitle.innerText = "Portafolio Kevin";
        mainBtn.innerText = "INGRESAR";
        regFields.classList.add('d-none');
        toggleBtn.innerText = "¿No tienes cuenta? Regístrate";
    }
}

// LOGIN Y REGISTRO (CON VALIDACIÓN DE ADMIN ÚNICO)
function ejecutarAccion() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const db = JSON.parse(localStorage.getItem('kevin_users')) || [];

    if (!user || !pass) return alert("Completa los campos.");

    if (isLogin) {
        const u = db.find(x => x.user === user && x.pass === pass);
        if (u) iniciarSesion(u);
        else alert("Acceso denegado.");
    } else {
        const nombre = document.getElementById('full-name').value.trim();
        const rol = document.getElementById('reg-role').value;

        if (!nombre) return alert("Falta el nombre.");
        if (rol === "ADMIN" && db.some(x => x.rol === "ADMIN")) {
            return alert("Ya existe un administrador en el sistema.");
        }
        if (db.some(x => x.user === user)) return alert("El usuario ya existe.");

        db.push({ user, pass, nombre, rol });
        localStorage.setItem('kevin_users', JSON.stringify(db));
        alert("¡Registro exitoso!");
        toggleAuth();
    }
}

function iniciarSesion(datos) {
    userLogueado = datos;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    
    document.getElementById('nav-username').innerText = datos.nombre;
    document.getElementById('p-nombre').innerText = datos.nombre;
    document.getElementById('p-rol').innerText = datos.rol;

    if (datos.rol === "ADMIN") {
        document.getElementById('admin-panel').classList.remove('d-none');
        document.getElementById('th-admin').classList.remove('d-none');
    }

    const foto = localStorage.getItem('foto_' + datos.user);
    if (foto) {
        document.getElementById('nav-avatar').src = foto;
        document.getElementById('p-img').src = foto;
    }
    
    actualizarCards();
    cargarTabla();
}

// GUARDAR ARCHIVO DE LA PC
function guardarArchivoLocal() {
    const titulo = document.getElementById('t-titulo').value.trim();
    const unidad = document.getElementById('t-unidad').value;
    const fileInput = document.getElementById('t-file');
    const file = fileInput.files[0];

    if (!titulo || !file) return alert("Título y archivo requeridos.");

    const reader = new FileReader();
    reader.onload = function() {
        const filesDB = JSON.parse(localStorage.getItem('kevin_files')) || [];
        filesDB.push({
            id: Date.now(),
            titulo: titulo,
            unidad: unidad,
            nombreArc: file.name,
            tipo: file.type,
            binario: reader.result // Base64
        });
        localStorage.setItem('kevin_files', JSON.stringify(filesDB));
        alert("¡Guardado en Unidad " + unidad + "!");
        
        fileInput.value = "";
        document.getElementById('t-titulo').value = "";
        actualizarCards();
        cargarTabla(unidad);
    };
    reader.readAsDataURL(file);
}

// TABLA Y FILTROS
function cargarTabla(filtro = null) {
    const files = JSON.parse(localStorage.getItem('kevin_files')) || [];
    const lista = document.getElementById('lista-archivos');
    const titulo = document.getElementById('titulo-tabla');
    lista.innerHTML = "";

    titulo.innerText = filtro ? "ARCHIVOS: UNIDAD " + filtro : "TODOS LOS TRABAJOS";
    const data = filtro ? files.filter(x => x.unidad == filtro) : files;

    data.forEach(f => {
        lista.innerHTML += `
            <tr>
                <td>
                    <div class="fw-bold">${f.titulo}</div>
                    <small class="text-white-50">${f.nombreArc}</small>
                </td>
                <td>
                    <button onclick="descargar(${f.id})" class="btn btn-sm btn-success me-1"><i class="fa fa-download"></i></button>
                    <button onclick="ver(${f.id})" class="btn btn-sm btn-info"><i class="fa fa-eye"></i></button>
                </td>
                ${userLogueado.rol === 'ADMIN' ? `<td><button onclick="eliminar(${f.id})" class="btn btn-sm btn-danger">X</button></td>` : ""}
            </tr>`;
    });
}

function descargar(id) {
    const files = JSON.parse(localStorage.getItem('kevin_files'));
    const f = files.find(x => x.id === id);
    const a = document.createElement('a');
    a.href = f.binario;
    a.download = f.nombreArc;
    a.click();
}

function ver(id) {
    const files = JSON.parse(localStorage.getItem('kevin_files'));
    const f = files.find(x => x.id === id);
    const frame = `<iframe src="${f.binario}" width="100%" height="100%" style="border:none;"></iframe>`;
    const x = window.open();
    x.document.open();
    x.document.write(`<html><body style="margin:0; height:100vh;">${frame}</body></html>`);
    x.document.close();
}

function filtrarUnidad(u) { cargarTabla(u); }

function actualizarCards() {
    const files = JSON.parse(localStorage.getItem('kevin_files')) || [];
    for(let i=1; i<=4; i++) {
        const total = files.filter(x => x.unidad == i).length;
        document.getElementById('cnt-' + i).innerText = total + " Archivos";
    }
}

function eliminar(id) {
    if(!confirm("¿Eliminar archivo?")) return;
    let files = JSON.parse(localStorage.getItem('kevin_files'));
    files = files.filter(x => x.id !== id);
    localStorage.setItem('kevin_files', JSON.stringify(files));
    actualizarCards();
    cargarTabla();
}

// PERFIL
function cambiarFoto(e) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('p-img').src = reader.result;
        document.getElementById('nav-avatar').src = reader.result;
        localStorage.setItem('foto_' + userLogueado.user, reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
}

function verPerfil() { document.getElementById('modal-perfil').classList.remove('d-none'); }
function cerrarPerfil() { document.getElementById('modal-perfil').classList.add('d-none'); }
function logout() { location.reload(); }