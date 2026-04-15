let isLogin = true;
let currentUser = null;
let activeUnit = null;
let activeWeek = null;

// ACCESO
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('reg-fields').classList.toggle('d-none');
    document.getElementById('auth-title').innerText = isLogin ? "Kevin System" : "Registro";
    document.getElementById('main-btn').innerText = isLogin ? "ACCEDER AL NÚCLEO" : "CREAR CUENTA";
    document.getElementById('btn-toggle').innerText = isLogin ? "¿No tienes cuenta? Crea una aquí" : "Ya tengo cuenta";
}

function ejecutarAccion() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const db = JSON.parse(localStorage.getItem('kevin_db_v6')) || [];

    if (!user || !pass) return alert("Completa los datos.");

    if (isLogin) {
        const found = db.find(u => u.user === user && u.pass === pass);
        if (found) loginExitoso(found);
        else alert("Acceso Incorrecto.");
    } else {
        const nombre = document.getElementById('full-name').value.trim();
        const rol = document.getElementById('reg-role').value;
        if (rol === "ADMIN" && db.some(u => u.rol === "ADMIN")) return alert("Solo un Administrador permitido.");
        db.push({ user, pass, nombre, rol });
        localStorage.setItem('kevin_db_v6', JSON.stringify(db));
        alert("¡Registrado!"); toggleAuth();
    }
}

function loginExitoso(u) {
    currentUser = u;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = "BIENVENIDO: " + u.nombre.toUpperCase();
    actualizarContadores();
}

// GESTIÓN
function abrirUnidad(u) {
    activeUnit = u;
    activeWeek = null;
    document.getElementById('modal-unit-title').innerText = "GESTIÓN DE UNIDAD " + u;
    document.getElementById('unit-modal').classList.remove('d-none');
    document.getElementById('week-content').classList.add('d-none');
    document.getElementById('select-prompt').classList.remove('d-none');
    document.querySelectorAll('.btn-week').forEach(b => b.classList.remove('active'));
}

function seleccionarSemana(s) {
    activeWeek = s;
    document.getElementById('week-content').classList.remove('d-none');
    document.getElementById('select-prompt').classList.add('d-none');
    document.querySelectorAll('.btn-week').forEach((b, i) => b.classList.toggle('active', (i+1) === s));

    const adminZone = document.getElementById('admin-zone');
    if (currentUser.rol === "ADMIN") adminZone.classList.remove('d-none');
    else adminZone.classList.add('d-none');

    actualizarLista();
}

// CRUD: GUARDAR
function guardarArchivo() {
    const title = document.getElementById('file-title').value.trim();
    const input = document.getElementById('file-input');
    const file = input.files[0];

    if (!title || !file) return alert("Faltan datos.");

    const reader = new FileReader();
    reader.onload = function() {
        const files = JSON.parse(localStorage.getItem('kevin_files_v6')) || [];
        files.push({
            id: Date.now(),
            unidad: activeUnit,
            semana: activeWeek,
            titulo: title,
            nombreArc: file.name,
            data: reader.result
        });
        localStorage.setItem('kevin_files_v6', JSON.stringify(files));
        document.getElementById('file-title').value = "";
        input.value = "";
        actualizarLista();
        actualizarContadores();
    };
    reader.readAsDataURL(file);
}

// CRUD: LEER (LISTAR)
function actualizarLista() {
    const files = JSON.parse(localStorage.getItem('kevin_files_v6')) || [];
    const filtrados = files.filter(f => f.unidad == activeUnit && f.semana == activeWeek);
    const body = document.getElementById('unit-files-body');
    body.innerHTML = "";

    filtrados.forEach((f, index) => {
        body.innerHTML += `
            <tr class="file-row align-middle" style="animation-delay: ${index * 0.1}s">
                <td>
                    <div class="fw-bold text-info">${f.titulo}</div>
                    <small class="text-white-50">${f.nombreArc}</small>
                </td>
                <td class="text-end">
                    <button onclick="descargar(${f.id})" class="btn btn-sm btn-outline-success" title="Descargar"><i class="fa fa-download"></i></button>
                    ${currentUser.rol === 'ADMIN' ? `
                        <button onclick="editar(${f.id})" class="btn btn-sm btn-outline-warning ms-1" title="Editar"><i class="fa fa-edit"></i></button>
                        <button onclick="eliminar(${f.id})" class="btn btn-sm btn-outline-danger ms-1" title="Borrar"><i class="fa fa-trash"></i></button>
                    ` : ""}
                </td>
            </tr>`;
    });
}

// CRUD: DESCARGAR
function descargar(id) {
    const files = JSON.parse(localStorage.getItem('kevin_files_v6'));
    const f = files.find(x => x.id === id);
    const a = document.createElement('a');
    a.href = f.data; a.download = f.nombreArc;
    a.click();
}

// CRUD: EDITAR (SOLO TÍTULO)
function editar(id) {
    const files = JSON.parse(localStorage.getItem('kevin_files_v6'));
    const index = files.findIndex(x => x.id === id);
    const nuevoTitulo = prompt("Nuevo título para el trabajo:", files[index].titulo);
    
    if (nuevoTitulo && nuevoTitulo.trim() !== "") {
        files[index].titulo = nuevoTitulo.trim();
        localStorage.setItem('kevin_files_v6', JSON.stringify(files));
        actualizarLista();
    }
}

// CRUD: ELIMINAR
function eliminar(id) {
    if(!confirm("¿Estás seguro de borrar este archivo?")) return;
    let files = JSON.parse(localStorage.getItem('kevin_files_v6'));
    files = files.filter(x => x.id !== id);
    localStorage.setItem('kevin_files_v6', JSON.stringify(files));
    actualizarLista();
    actualizarContadores();
}

function actualizarContadores() {
    const files = JSON.parse(localStorage.getItem('kevin_files_v6')) || [];
    for(let i=1; i<=4; i++) {
        const total = files.filter(x => x.unidad == i).length;
        document.getElementById('cnt-' + i).innerText = total + " Archivos";
    }
}

function cerrarUnidad() { document.getElementById('unit-modal').classList.add('d-none'); }
function logout() { location.reload(); }
