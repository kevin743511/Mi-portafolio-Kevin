// ════════════════════════════════════════════
// JUGGERNAUT GUIDE BOT — KVN.UPLA — MEJORADO
// ════════════════════════════════════════════

const JuggGuide = (() => {
  const LINES = {
    landing: [
      "¡Yurnero te saluda, guerrero! Este es el portal académico de Kevin.",
      "Omnislash a las dudas. Toca una unidad para ver sus archivos.",
      "Cada unidad contiene las semanas del ciclo. ¡Explóralas!",
      "¿Quieres subir archivos? Debes iniciar sesión primero.",
      "Haz clic en LOGIN para acceder con tus credenciales.",
      "Soy el Juggernaut. Nadie puede detener al Juggernaut.",
      "Kevin estudia Ingeniería de Sistemas en la UPLA. ¡Futuro crack!",
    ],
    login: [
      "Ingresa tu usuario y contraseña para acceder al sistema.",
      "Si eres nuevo, regístrate con el botón REGISTRAR.",
      "El administrador controla todo. Los viewers solo leen.",
      "Omnislash. Recuerda tu contraseña, guerrero.",
      "Sin acceso no hay poder. ¡Inicia sesión!",
    ],
    main_admin: [
      "Bienvenido, Admin! Puedes subir y gestionar archivos en cada semana.",
      "Haz clic en una unidad para abrirla y subir tus trabajos.",
      "Arrastra archivos directo a la zona de subida. Como un Omnislash!",
      "Puedes exportar un backup con el botón COMPARTIR.",
      "Edita o elimina archivos usando los botones de cada ítem.",
      "Todo el poder es tuyo, Admin! Úsalo con sabiduría.",
      "Puedes subir archivos por URL también. Muy útil!",
    ],
    main_viewer: [
      "Puedes ver y descargar los archivos del portal.",
      "Usa el botón SYNC para actualizar los archivos.",
      "Solo lectura, pero con todo el poder de Yurnero.",
      "Si ves algo interesante, descárgalo con el botón DL.",
      "Como espectador del Omnislash, disfruta la vista!",
    ],
    upload: [
      "Arrastra tu archivo o haz clic para seleccionarlo!",
      "Solo PDFs, imágenes y documentos. Nada de espadas.",
      "El archivo se sube a la semana actual. Verifica bien!",
    ],
    idle: [
      "...",
      "Omnislash...",
      "Sigues ahí, guerrero?",
      "El silencio también es poder.",
      "Yurnero espera tu próxima orden.",
      "Haz clic en mí si necesitas guía.",
      "Ningún obstáculo puede detener al Juggernaut.",
    ]
  };

  let bubbleVisible = false;
  let idleTimer = null;
  let currentContext = 'landing';
  let lineIndex = 0;
  let attackTimeout = null;
  let synthVoice = null;
  let voiceReady = false;

  function initVoice() {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      synthVoice = voices.find(v => v.lang.startsWith('es')) ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0] || null;
      voiceReady = !!synthVoice;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text) {
    if (!window.speechSynthesis || !voiceReady) return;
    const clean = text.replace(/<[^>]+>/g, '').replace(/[⚡◈♛✦]/g, '');
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.voice = synthVoice;
    utt.lang = 'es-PE';
    utt.pitch = 0.6;
    utt.rate = 0.85;
    utt.volume = 0.65;
    window.speechSynthesis.speak(utt);
  }

  const bot     = () => document.getElementById('juggBot');
  const sprite  = () => document.getElementById('juggSprite');
  const bubble  = () => document.getElementById('juggBubble');
  const bubText = () => document.getElementById('juggText');

  function detectContext() {
    const login = document.getElementById('loginScreen');
    const main  = document.getElementById('mainScreen');
    if (login && login.classList.contains('active')) return 'login';
    if (main  && main.classList.contains('active')) {
      try {
        if (window.state && window.state.isAdmin) return 'main_admin';
        if (window.state && window.state.isViewer) return 'main_viewer';
      } catch(e) {}
      return 'main_admin';
    }
    return 'landing';
  }

  function showMessage(text, speakIt = true) {
    const b = bubble();
    const t = bubText();
    if (!b || !t) return;
    t.innerHTML = text;
    b.classList.remove('hide');
    b.style.display = 'block';
    bubbleVisible = true;
    doAttackAnim();
    resetIdleTimer();
    if (speakIt) speak(text);
  }

  function hideBubble() {
    const b = bubble();
    if (!b) return;
    b.classList.add('hide');
    setTimeout(() => { b.style.display = 'none'; b.classList.remove('hide'); }, 280);
    bubbleVisible = false;
  }

  function doAttackAnim() {
    const s = sprite();
    if (!s) return;
    clearTimeout(attackTimeout);
    s.classList.remove('attacking');
    void s.offsetWidth;
    s.classList.add('attacking');
    attackTimeout = setTimeout(() => s.classList.remove('attacking'), 700);
  }

  function nextLine() {
    const ctx = detectContext();
    currentContext = ctx;
    const pool = LINES[ctx] || LINES.landing;
    const line = pool[lineIndex % pool.length];
    lineIndex++;
    showMessage(line);
  }

  function idleLine() {
    if (bubbleVisible) return;
    const pool = LINES.idle;
    const line = pool[Math.floor(Math.random() * pool.length)];
    showMessage(line, false);
    setTimeout(hideBubble, 4000);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(idleLine, 18000);
  }

  function toggle() {
    if (bubbleVisible) hideBubble();
    else nextLine();
  }

  function closeBubble() { hideBubble(); }

  function observeScreenChanges() {
    const screens = document.querySelectorAll('.screen');
    const observer = new MutationObserver(() => {
      const newCtx = detectContext();
      if (newCtx !== currentContext) {
        currentContext = newCtx;
        lineIndex = 0;
        setTimeout(() => {
          const welcomeLines = {
            login:       'Identifícate, guerrero! Ingresa tus datos.',
            main_admin:  'Omnislash! Bienvenido al panel de administración, Admin.',
            main_viewer: 'Modo observador activado! Puedes ver y descargar archivos.',
            landing:     'De vuelta al inicio! Explora las unidades académicas.',
          };
          showMessage(welcomeLines[newCtx] || 'Yurnero está listo!');
          setTimeout(hideBubble, 5500);
        }, 600);
      }
    });
    screens.forEach(s => observer.observe(s, { attributes: true, attributeFilter: ['class'] }));
  }

  function welcome() {
    setTimeout(() => {
      showMessage('¡Omnislash! Soy <span class="jugg-accent">Yurnero</span>, tu guía del portal. ¡Tócame para guiarte!');
      setTimeout(hideBubble, 6000);
    }, 1800);
  }

  function init() {
    initVoice();
    welcome();
    resetIdleTimer();
    observeScreenChanges();
    window.juggToggle      = toggle;
    window.juggCloseBubble = closeBubble;
    window.juggSay         = showMessage;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggle, closeBubble, say: showMessage };
})();
