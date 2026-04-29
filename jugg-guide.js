// ════════════════════════════════════════════
// JUGGERNAUT GUIDE BOT — KVN.UPLA
// Mini guía interactiva estilo Dota 2
// ════════════════════════════════════════════

const JuggGuide = (() => {

  // ── Líneas por contexto ──────────────────
  const LINES = {
    landing: [
      "¡Yurnero te saluda, guerrero! Este es el portal académico de Kevin.",
      "Omnislash a las dudas. Toca una unidad para ver sus archivos.",
      "Cada unidad contiene las semanas del ciclo. ¡Explóralas!",
      "¿Quieres subir archivos? Debes iniciar sesión primero. ⚡",
      "Las unidades brillan de diferentes colores según su poder... digo, materia.",
      "Haz clic en LOGIN para acceder con tus credenciales.",
      "Soy el Juggernaut. Nadie puede detener al Juggernaut.",
    ],
    login: [
      "Ingresa tu usuario y contraseña para acceder al sistema.",
      "Si eres nuevo, regístrate con el botón REGISTRAR.",
      "El administrador controla todo. Los viewers solo leen.",
      "¡Omnislash! Recuerda tu contraseña, guerrero.",
      "Sin acceso no hay poder. ¡Inicia sesión!",
    ],
    main_admin: [
      "¡Bienvenido, Admin! Puedes subir y gestionar archivos en cada semana.",
      "Haz clic en una unidad para abrirla y subir tus trabajos.",
      "Arrastra archivos directo a la zona de subida. ¡Como un Omnislash!",
      "Puedes exportar un backup con el botón COMPARTIR.",
      "Edita o elimina archivos usando los botones de cada ítem.",
      "¡Todo el poder es tuyo, Admin! Úsalo con sabiduría.",
    ],
    main_viewer: [
      "Puedes ver y descargar los archivos del portal.",
      "Usa el botón SYNC para actualizar los archivos.",
      "Solo lectura, pero con todo el poder de Yurnero.",
      "Si ves algo interesante, descárgalo con el botón DL.",
      "¡Como espectador del Omnislash, disfruta la vista!",
    ],
    upload: [
      "¡Arrastra tu archivo o haz clic para seleccionarlo!",
      "Solo PDFs, imágenes y documentos. Nada de espadas.",
      "El archivo se sube a la semana actual. ¡Verifica bien!",
    ],
    idle: [
      "...",
      "Omnislash...",
      "¿Sigues ahí, guerrero?",
      "El silencio también es poder.",
      "Yurnero espera tu próxima orden.",
      "Haz clic en mí si necesitas guía.",
      "Ningún obstáculo puede detener al Juggernaut.",
    ]
  };

  let bubbleVisible = false;
  let menuVisible = false;
  let idleTimer = null;
  let currentContext = 'landing';
  let lineIndex = 0;
  let attackTimeout = null;

  // ── DOM refs ─────────────────────────────
  const bot     = () => document.getElementById('juggBot');
  const sprite  = () => document.getElementById('juggSprite');
  const bubble  = () => document.getElementById('juggBubble');
  const bubText = () => document.getElementById('juggText');

  // ── Detectar contexto actual ─────────────
  function detectContext() {
    const landing = document.getElementById('landingScreen');
    const login   = document.getElementById('loginScreen');
    const main    = document.getElementById('mainScreen');

    if (login && login.classList.contains('active')) return 'login';
    if (main  && main.classList.contains('active')) {
      // leer role del state global si existe
      try {
        if (window.state && window.state.isAdmin) return 'main_admin';
        if (window.state && window.state.isViewer) return 'main_viewer';
      } catch(e) {}
      return 'main_admin';
    }
    return 'landing';
  }

  // ── Mostrar mensaje ──────────────────────
  function showMessage(text, ctx) {
    const b = bubble();
    const t = bubText();
    if (!b || !t) return;

    t.innerHTML = text;
    b.classList.remove('hide');
    b.style.display = 'block';
    bubbleVisible = true;
    doAttackAnim();
    resetIdleTimer();
  }

  function hideBubble() {
    const b = bubble();
    if (!b) return;
    b.classList.add('hide');
    setTimeout(() => {
      b.style.display = 'none';
      b.classList.remove('hide');
    }, 280);
    bubbleVisible = false;
  }

  // ── Animación de ataque ──────────────────
  function doAttackAnim() {
    const s = sprite();
    if (!s) return;
    clearTimeout(attackTimeout);
    s.classList.remove('attacking');
    void s.offsetWidth; // reflow
    s.classList.add('attacking');
    attackTimeout = setTimeout(() => s.classList.remove('attacking'), 700);
  }

  // ── Siguiente línea del contexto ─────────
  function nextLine() {
    const ctx = detectContext();
    currentContext = ctx;
    const pool = LINES[ctx] || LINES.landing;
    const line = pool[lineIndex % pool.length];
    lineIndex++;
    showMessage(line);
  }

  // ── Línea idle aleatoria ─────────────────
  function idleLine() {
    if (bubbleVisible) return;
    const pool = LINES.idle;
    const line = pool[Math.floor(Math.random() * pool.length)];
    showMessage(line);
    // ocultar sola a los 4s
    setTimeout(hideBubble, 4000);
  }

  // ── Timer idle ───────────────────────────
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(idleLine, 18000);
  }

  // ── Toggle click principal ───────────────
  function toggle() {
    if (bubbleVisible) {
      hideBubble();
    } else {
      nextLine();
    }
  }

  // ── Cerrar bubble ────────────────────────
  function closeBubble() {
    hideBubble();
  }

  // ── Observar cambios de pantalla ─────────
  function observeScreenChanges() {
    const screens = document.querySelectorAll('.screen');
    const observer = new MutationObserver(() => {
      const newCtx = detectContext();
      if (newCtx !== currentContext) {
        currentContext = newCtx;
        lineIndex = 0;
        // Dar mensaje de bienvenida al cambio
        setTimeout(() => {
          const welcomeLines = {
            login:       '¡Identifícate, guerrero! Ingresa tus datos.',
            main_admin:  '¡Omnislash! Bienvenido al panel de administración, Admin.',
            main_viewer: '¡Modo observador activado! Puedes ver y descargar archivos.',
            landing:     '¡De vuelta al inicio! Explora las unidades académicas.',
          };
          showMessage(welcomeLines[newCtx] || '¡Yurnero está listo!');
          setTimeout(hideBubble, 5000);
        }, 600);
      }
    });
    screens.forEach(s => observer.observe(s, { attributes: true, attributeFilter: ['class'] }));
  }

  // ── Mensaje de bienvenida inicial ────────
  function welcome() {
    setTimeout(() => {
      showMessage('¡Omnislash! Soy <span class="jugg-accent">Yurnero</span>, tu guía del portal. ¡Tócame!');
      setTimeout(hideBubble, 5500);
    }, 1800);
  }

  // ── Init ─────────────────────────────────
  function init() {
    welcome();
    resetIdleTimer();
    observeScreenChanges();

    // Exponer globalmente
    window.juggToggle      = toggle;
    window.juggCloseBubble = closeBubble;
    window.juggSay         = showMessage;

    // Detectar subida de archivos
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('btn-inject')) {
        setTimeout(() => {
          const uploadLines = LINES.upload;
          showMessage(uploadLines[Math.floor(Math.random() * uploadLines.length)]);
          setTimeout(hideBubble, 4000);
        }, 200);
      }
    });

    console.log('🗡️ Juggernaut Guide Bot iniciado — Omnislash!');
  }

  // ── Arrancar cuando el DOM esté listo ────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggle, closeBubble, say: showMessage };
})();
