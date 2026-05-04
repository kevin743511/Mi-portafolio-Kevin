// ════════════════════════════════════════════
// JUGGERNAUT GUIDE BOT — KVN.UPLA v2.0
// ════════════════════════════════════════════
const JuggGuide = (() => {
  const LINES = {
    landing: [
      "¡Yurnero te saluda, guerrero! Bienvenido al portal de Kevin.",
      "Toca una unidad para explorar los archivos académicos.",
      "¿Ves esas esferas? Cada una es una unidad. ¡Haz clic!",
      "¿Quieres subir archivos? Inicia sesión primero. ⚡",
      "Soy el Juggernaut. Nadie puede detener al Juggernaut.",
      "¡Omnislash! Recorre el portal y descarga lo que necesitas.",
    ],
    login: [
      "Ingresa tu usuario y contraseña para acceder.",
      "Si eres nuevo, regístrate con REGISTRAR.",
      "El administrador controla todo. Los viewers solo ven.",
      "¡Omnislash! Recuerda tu contraseña, guerrero.",
      "Sin acceso no hay poder. ¡Identifícate!",
    ],
    main_admin: [
      "¡Bienvenido, Admin! Puedes subir y gestionar archivos.",
      "Haz clic en una unidad para abrirla y subir trabajos.",
      "Arrastra archivos a la zona de subida. ¡Como un Omnislash!",
      "Puedes exportar un backup con COMPARTIR.",
      "¡Todo el poder es tuyo, Admin!",
    ],
    main_viewer: [
      "Puedes ver y descargar los archivos del portal.",
      "Usa SYNC para actualizar los archivos.",
      "Solo lectura, pero con todo el poder de Yurnero.",
      "¡Como espectador del Omnislash, disfruta la vista!",
    ],
    upload: [
      "¡Arrastra tu archivo o haz clic para seleccionarlo!",
      "El archivo se sube a la semana actual. ¡Verifica bien!",
      "¡Omnislash de archivos! Subida iniciada.",
    ],
    idle: [
      "...",
      "Omnislash...",
      "¿Sigues ahí, guerrero?",
      "El silencio también es poder.",
      "Yurnero espera tu próxima orden.",
      "Ningún obstáculo puede detener al Juggernaut.",
    ]
  };

  let bubbleVisible = false;
  let idleTimer = null;
  let currentContext = 'landing';
  let lineIndex = 0;
  let attackTimeout = null;
  let voiceEnabled = false;
  const speechSynth = window.speechSynthesis || null;

  const $ = id => document.getElementById(id);

  function detectContext() {
    const login = $('loginScreen');
    const main  = $('mainScreen');
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

  function speak(text) {
    if (!voiceEnabled || !speechSynth) return;
    try {
      speechSynth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-ES';
      utter.rate = 0.82;
      utter.pitch = 0.55;
      utter.volume = 0.75;
      const voices = speechSynth.getVoices();
      const v = voices.find(v => v.lang.startsWith('es') && /male/i.test(v.name))
             || voices.find(v => v.lang.startsWith('es'))
             || voices[0];
      if (v) utter.voice = v;
      speechSynth.speak(utter);
    } catch(e) {}
  }

  function showMessage(text, doSpeak) {
    const b = $('juggBubble'), t = $('juggText');
    if (!b || !t) return;
    t.innerHTML = text;
    b.classList.remove('hide');
    b.style.display = 'block';
    bubbleVisible = true;
    doAttackAnim();
    resetIdleTimer();
    if (doSpeak) speak(text.replace(/<[^>]+>/g, ''));
  }

  function hideBubble() {
    const b = $('juggBubble');
    if (!b) return;
    b.classList.add('hide');
    setTimeout(() => { b.style.display = 'none'; b.classList.remove('hide'); }, 300);
    bubbleVisible = false;
  }

  function doAttackAnim() {
    const s = $('juggSprite');
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
    showMessage(line, true);
  }

  function idleLine() {
    if (bubbleVisible) return;
    const pool = LINES.idle;
    const line = pool[Math.floor(Math.random() * pool.length)];
    showMessage(line, false);
    setTimeout(hideBubble, 4500);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(idleLine, 22000);
  }

  function toggle() {
    bubbleVisible ? hideBubble() : nextLine();
  }

  function closeBubble() { hideBubble(); }

  function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = $('juggVoiceBtn');
    if (btn) {
      btn.textContent = voiceEnabled ? '🔊' : '🔇';
      btn.title = voiceEnabled ? 'Desactivar voz' : 'Activar voz';
      btn.classList.toggle('voice-on', voiceEnabled);
    }
    if (voiceEnabled) {
      showMessage('¡Voz activada! El Juggernaut hablará, guerrero.', true);
    } else {
      showMessage('Voz desactivada. El silencio también es poder.', false);
      if (speechSynth) speechSynth.cancel();
    }
  }

  function observeScreenChanges() {
    const observer = new MutationObserver(() => {
      const newCtx = detectContext();
      if (newCtx !== currentContext) {
        currentContext = newCtx;
        lineIndex = 0;
        setTimeout(() => {
          const msgs = {
            login:       '¡Identifícate, guerrero! Ingresa tus datos.',
            main_admin:  '¡Omnislash! Bienvenido al panel, Administrador.',
            main_viewer: '¡Modo observador activado! Descarga lo que necesitas.',
            landing:     '¡De vuelta al inicio! Explora las unidades académicas.',
          };
          showMessage(msgs[newCtx] || '¡Yurnero está listo!', true);
          setTimeout(hideBubble, 6000);
        }, 600);
      }
    });
    document.querySelectorAll('.screen').forEach(s =>
      observer.observe(s, { attributes: true, attributeFilter: ['class'] })
    );
  }

  function welcome() {
    setTimeout(() => {
      showMessage('¡<span class="jugg-accent">Omnislash!</span> Soy Yurnero, tu guía del portal. ¡Tócame!', false);
      setTimeout(hideBubble, 6500);
    }, 1800);
  }

  function createBotDOM() {
    if ($('juggBot')) return;
    const bot = document.createElement('div');
    bot.id = 'juggBot';
    bot.className = 'jugg-bot';
    bot.innerHTML = `
      <div id="juggBubble" class="jugg-bubble" style="display:none;">
        <div class="jugg-bubble-inner">
          <div class="jugg-bubble-header">
            <span class="jugg-bubble-name">⚔ YURNERO</span>
            <button class="jugg-close-btn" onclick="window.juggCloseBubble()">✕</button>
          </div>
          <span id="juggText"></span>
        </div>
        <div class="jugg-bubble-arrow"></div>
      </div>

      <div id="juggSprite" class="jugg-sprite" onclick="window.juggToggle()" title="¡Haz clic para guía!">
        <div class="jugg-glow-ring"></div>
        <div class="jugg-aura-outer"></div>
        <svg class="jugg-svg" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="swordGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#888"/>
              <stop offset="40%" stop-color="#dde8ff"/>
              <stop offset="60%" stop-color="#fff"/>
              <stop offset="100%" stop-color="#aaa"/>
            </linearGradient>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ff8800" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#ff3300" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <circle cx="55" cy="68" r="42" fill="none" stroke="#ff4400" stroke-width="0.8" opacity="0.2" class="jugg-spin-aura"/>
          <ellipse cx="55" cy="122" rx="22" ry="5" fill="#000" opacity="0.3"/>

          <!-- Piernas -->
          <rect x="43" y="93" width="9" height="22" rx="4" fill="#6b2c00"/>
          <rect x="57" y="93" width="9" height="22" rx="4" fill="#6b2c00"/>
          <ellipse cx="47" cy="115" rx="7.5" ry="5" fill="#3a1500"/>
          <ellipse cx="61" cy="115" rx="7.5" ry="5" fill="#3a1500"/>
          <rect x="41" y="111" width="13" height="3" rx="1.5" fill="#4a1f00" opacity="0.8"/>
          <rect x="55" y="111" width="13" height="3" rx="1.5" fill="#4a1f00" opacity="0.8"/>

          <!-- Cuerpo -->
          <ellipse cx="55" cy="74" rx="22" ry="24" fill="#7a3000"/>
          <path d="M38 63 Q55 57 72 63 L72 83 Q55 89 38 83 Z" fill="#cd7030" stroke="#8b4513" stroke-width="1.5"/>
          <path d="M55 63 L55 84" stroke="#ff6600" stroke-width="0.8" opacity="0.5"/>
          <path d="M44 72 L66 72" stroke="#ff6600" stroke-width="0.6" opacity="0.4"/>
          <circle cx="47" cy="70" r="3.5" fill="#ffd700" stroke="#ff9900" stroke-width="0.8"/>
          <circle cx="47" cy="70" r="1.8" fill="#fff" opacity="0.6"/>
          <circle cx="63" cy="70" r="3.5" fill="#ffd700" stroke="#ff9900" stroke-width="0.8"/>
          <circle cx="63" cy="70" r="1.8" fill="#fff" opacity="0.6"/>
          <polygon points="55,65 58,71 55,77 52,71" fill="#ff4400" stroke="#ff8800" stroke-width="0.8"/>

          <!-- Brazos -->
          <ellipse cx="33" cy="68" rx="7" ry="14" fill="#cd7030" transform="rotate(-15 33 68)"/>
          <ellipse cx="27" cy="80" rx="5" ry="6" fill="#8b4513"/>
          <ellipse cx="77" cy="66" rx="7" ry="14" fill="#cd7030" transform="rotate(15 77 66)"/>
          <ellipse cx="83" cy="78" rx="5" ry="6" fill="#8b4513"/>

          <!-- Espada / katana -->
          <rect x="85" y="30" width="3.5" height="50" rx="1.5" fill="url(#swordGrad2)" class="jugg-sword"/>
          <rect x="81" y="52" width="12" height="4" rx="2" fill="#8b4513"/>
          <rect x="84" y="56" width="5.5" height="10" rx="2" fill="#6b2c00"/>
          <rect x="86" y="32" width="1" height="42" rx="0.5" fill="#fff" opacity="0.35" class="jugg-sword-glow"/>
          <path d="M85 30 L88.5 30 L86.5 18 Z" fill="#e0e8ff"/>

          <!-- Cabeza -->
          <ellipse cx="55" cy="42" rx="20" ry="22" fill="#7a0000"/>
          <path d="M43 37 Q55 30 67 37 L66 47 Q55 52 44 47 Z" fill="#a00000" stroke="#cc0000" stroke-width="1"/>
          <rect x="44" y="41" width="22" height="14" rx="3" fill="#2a0000" opacity="0.9"/>

          <!-- Ojos brillantes -->
          <circle cx="49" cy="48" r="5" fill="url(#eyeGlow)" opacity="0.6" class="jugg-eye-pulse"/>
          <circle cx="61" cy="48" r="5" fill="url(#eyeGlow)" opacity="0.6" class="jugg-eye-pulse"/>
          <circle cx="49" cy="48" r="3" fill="#ff4400"/>
          <circle cx="49" cy="48" r="1.5" fill="#ff8800"/>
          <circle cx="49.7" cy="47.3" r="0.7" fill="#ffeeaa" opacity="0.9"/>
          <circle cx="61" cy="48" r="3" fill="#ff4400"/>
          <circle cx="61" cy="48" r="1.5" fill="#ff8800"/>
          <circle cx="61.7" cy="47.3" r="0.7" fill="#ffeeaa" opacity="0.9"/>

          <!-- Cuernos -->
          <path d="M38 38 L27 19 L37 34" fill="#7a0000" stroke="#aa0000" stroke-width="1.2"/>
          <path d="M72 38 L83 19 L73 34" fill="#7a0000" stroke="#aa0000" stroke-width="1.2"/>
          <line x1="29" y1="21" x2="28" y2="26" stroke="#ff4400" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
          <line x1="81" y1="21" x2="82" y2="26" stroke="#ff4400" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>

          <!-- Cresta -->
          <path d="M42 32 Q55 24 68 32" stroke="#ff6600" stroke-width="2" fill="none" stroke-linecap="round"/>

          <!-- Fuego katana -->
          <ellipse cx="86.5" cy="25" rx="5" ry="8" fill="#ff6600" opacity="0.55" class="jugg-fire-1"/>
          <ellipse cx="86.5" cy="23" rx="3" ry="6" fill="#ffaa00" opacity="0.45" class="jugg-fire-2"/>
          <ellipse cx="86.5" cy="21" rx="2" ry="4" fill="#fffde7" opacity="0.25" class="jugg-fire-3"/>
        </svg>
        <div class="jugg-name-tag">YURNERO</div>
      </div>

      <button id="juggVoiceBtn" class="jugg-voice-btn" onclick="window.juggToggleVoice()" title="Activar voz">🔇</button>
    `;
    document.body.appendChild(bot);
  }

  function init() {
    createBotDOM();
    welcome();
    resetIdleTimer();
    observeScreenChanges();

    window.juggToggle      = toggle;
    window.juggCloseBubble = closeBubble;
    window.juggSay         = showMessage;
    window.juggToggleVoice = toggleVoice;

    if (speechSynth) {
      speechSynth.getVoices();
      if ('onvoiceschanged' in speechSynth) {
        speechSynth.onvoiceschanged = () => speechSynth.getVoices();
      }
    }

    document.addEventListener('click', e => {
      if (e.target && e.target.classList.contains('btn-inject')) {
        setTimeout(() => {
          const line = LINES.upload[Math.floor(Math.random() * LINES.upload.length)];
          showMessage(line, voiceEnabled);
          setTimeout(hideBubble, 4000);
        }, 200);
      }
    });

    console.log('🗡️ Juggernaut Guide Bot v2.0 — Omnislash!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggle, closeBubble, say: showMessage, toggleVoice };
})();
