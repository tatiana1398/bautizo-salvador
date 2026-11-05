// URL de la "Aplicación web" de Google Apps Script que guarda las respuestas
// en la hoja de Google (ver google-sheets/Confirmaciones.gs).
const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx53LnYjHdk1YR6OxiRrf-_TSOg1HCUAViwIwwU9nRgwrS_y2sn0acm9-fHl93MppKVqQ/exec";

const MAX_COMPANIONS = 10;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Música de fondo con un botón flotante para pausarla o reanudarla ---------- */

const audio = document.getElementById("musica");
const musicButton = document.getElementById("boton-musica");

const setPlaying = (playing) => {
  musicButton.classList.toggle("sonando", playing);
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", playing ? "Pausar música" : "Poner música");
};

// Debe llamarse dentro del toque del usuario para que el celular permita el sonido.
const playMusic = () => {
  audio.volume = 0.6;
  musicButton.hidden = false;
  audio.play().catch(() => setPlaying(false));
};

audio.addEventListener("play", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));

musicButton.addEventListener("click", () => {
  if (audio.paused) playMusic();
  else audio.pause();
});

/* ---------- Portada: animación de entrada ---------- */

const hero = document.getElementById("inicio");

const playHero = () => {
  // Dos cuadros para que el navegador pinte primero el estado oculto.
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("mostrar")));
};

/* ---------- Paloma que acompaña la lectura ---------- */

// Dónde se posa la paloma en cada sección. "ancla" es la paloma fija de la portada o del pie;
// en las demás se queda a un lado (izquierda o derecha) mientras se lee.
const DOVE_STOPS = [
  { section: "inicio", anchor: "paloma-portada" },
  { section: "familia", side: "right", top: 0.3 },
  { section: "invitacion", side: "left", top: 0.34 },
  { section: "detalles", side: "right", top: 0.22 },
  { section: "vestimenta", side: "left", top: 0.38 },
  { section: "rsvp", side: "right", top: 0.26 },
  { section: "pie", anchor: "paloma-pie" },
];

const dove = document.getElementById("paloma");
let doveFrame = 0;

// Cada paloma guarda dónde está, a dónde va (target) y su vuelo actual.
const createBird = (element) => ({
  el: element,
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
  tilt: 0,
  target: null,
  flight: null,
});

const salvador = createBird(dove);

const currentStop = () => {
  const limit = window.innerHeight * 0.55;
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) return DOVE_STOPS[DOVE_STOPS.length - 1];
  let current = DOVE_STOPS[0];
  DOVE_STOPS.forEach((stop) => {
    if (document.getElementById(stop.section).getBoundingClientRect().top <= limit) current = stop;
  });
  return current;
};

const stopTarget = (stop) => {
  const width = dove.offsetWidth;
  if (stop.anchor) {
    const rect = document.getElementById(stop.anchor).getBoundingClientRect();
    return { x: rect.left, y: rect.top, scale: rect.width / width, faceRight: false };
  }
  // En pantallas anchas se posa al lado del texto; en el celular, más pequeña y pegada al borde.
  // El monograma del pico queda siempre del lado del texto.
  const wide = window.innerWidth >= 1300;
  const scale = wide ? 1.3 : window.innerWidth >= 768 ? 0.85 : 0.7;
  const size = width * scale;
  const monogram = dove.querySelector(".paloma-carga").offsetWidth * scale;
  const x =
    stop.side === "left"
      ? wide
        ? window.innerWidth / 2 - 380 - size - monogram
        : 6
      : wide
        ? window.innerWidth / 2 + 380 + monogram
        : window.innerWidth - 6 - size;
  // Mira hacia el texto.
  return { x, y: window.innerHeight * stop.top, scale, faceRight: stop.side === "left" };
};

const setFacing = (bird, faceRight) => bird.el.classList.toggle("mirando-derecha", faceRight);

// "aleteando" al despegar y frenar, "planeando" a mitad del vuelo, "posada" en reposo.
const setWings = (bird, mode) => {
  ["aleteando", "planeando", "posada"].forEach((name) =>
    bird.el.classList.toggle(name, name === mode),
  );
};

const renderBird = (bird, bob = 0) => {
  const { el, x, y, scale, opacity, tilt } = bird;
  // La inclinación gira alrededor del cuerpo, no de la esquina.
  const cx = el.offsetWidth / 2;
  const cy = el.offsetHeight * 0.45;
  el.style.transform =
    `translate(${x}px, ${y + bob}px) scale(${scale}) ` +
    `translate(${cx}px, ${cy}px) rotate(${tilt}deg) translate(${-cx}px, ${-cy}px)`;
  el.style.opacity = String(opacity);
};

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

// Empieza un vuelo en curva desde donde está la paloma hasta target().
const takeOff = (bird, target, options = {}) => {
  const from = options.from ?? { x: bird.x, y: bird.y, scale: bird.scale };
  const to = target();
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  bird.target = target;
  bird.flight = {
    from,
    distance,
    begin: performance.now() + (options.delay ?? 0),
    duration: options.duration ?? Math.min(Math.max(700 + distance * 0.9, 900), 1900),
    // Sube un poco al despegar y baja al posarse.
    lift: options.lift ?? Math.min(140, 30 + distance * 0.3),
    fadeIn: Boolean(options.fadeIn),
    locked: Boolean(options.locked),
    onLand: options.onLand,
  };
  // Se voltea al despegar hacia donde va, no a mitad de camino.
  if (options.faceRight !== undefined) setFacing(bird, options.faceRight);
  else if (Math.abs(to.x - from.x) > 8) setFacing(bird, to.x > from.x);
};

// Avanza un cuadro de la paloma. Devuelve true si todavía se está moviendo.
const stepBird = (bird, now) => {
  const { flight } = bird;
  if (!flight) {
    if (!bird.target) return false;
    // Posada: se queda en su lugar y endereza el cuerpo.
    const target = bird.target();
    bird.tilt *= 0.85;
    Object.assign(bird, { x: target.x, y: target.y, scale: target.scale });
    renderBird(bird);
    return Math.abs(bird.tilt) > 0.1;
  }

  const t = Math.min(Math.max((now - flight.begin) / flight.duration, 0), 1);
  const k = easeInOutSine(t);
  const to = bird.target();
  const { from } = flight;
  // Curva (Bézier cuadrática) con el punto de control por encima del trayecto.
  const cx = (from.x + to.x) / 2;
  const cy = Math.min(from.y, to.y) - flight.lift;
  const x = (1 - k) ** 2 * from.x + 2 * (1 - k) * k * cx + k ** 2 * to.x;
  const y = (1 - k) ** 2 * from.y + 2 * (1 - k) * k * cy + k ** 2 * to.y;
  const vy = y - bird.y;

  // Levanta la cabeza al subir y la baja al descender.
  const climb = Math.max(-1, Math.min(1, -vy / 5));
  const facingRight = bird.el.classList.contains("mirando-derecha");
  const tiltTarget = climb * 16 * (facingRight ? -1 : 1);
  bird.tilt += (tiltTarget - bird.tilt) * 0.12;

  Object.assign(bird, {
    x,
    y,
    scale: from.scale + (to.scale - from.scale) * k,
    opacity: flight.fadeIn ? Math.min(t / 0.12, 1) : bird.opacity,
  });

  const flapping = flight.distance < 160 || t < 0.3 || t > 0.78 || vy < -3;
  setWings(bird, flapping ? "aleteando" : "planeando");
  // El cuerpo sube y baja un poco con cada aletazo.
  const bob = flapping ? Math.sin((now / 320) * Math.PI * 2) * 2.5 * bird.scale : 0;
  renderBird(bird, bob);

  if (t >= 1) {
    // Llegó: se posa y se gira hacia donde debe mirar.
    bird.flight = null;
    setWings(bird, "posada");
    setFacing(bird, to.faceRight);
    flight.onLand?.();
  }
  return true;
};

/* La familia: al llegar al final, los papás se posan junto a Salvador
   y los padrinos un poco más afuera, todos mirando hacia él. */

const FAMILY_SIZE = { parents: 0.8, godparents: 0.62 };

const family = Array.from({ length: 4 }, () => {
  const element = document.createElement("div");
  element.className = "paloma paloma-familia";
  element.setAttribute("aria-hidden", "true");
  element.hidden = true;
  element.innerHTML = dove.querySelector(".paloma-ave").outerHTML;
  document.body.append(element);
  return createBird(element);
});

// Lugares de la familia alrededor del monograma y la paloma del pie:
// [papá izquierda, papá derecha, padrino izquierda, padrino derecha].
const familySpots = () => {
  const width = dove.offsetWidth;
  const monogram = document.querySelector("#pie .monograma-ancla").getBoundingClientRect();
  const footerDove = document.getElementById("paloma-pie").getBoundingClientRect();
  const base = footerDove.width / width;
  const parentScale = base * FAMILY_SIZE.parents;
  const godScale = base * FAMILY_SIZE.godparents;
  const parentWidth = width * parentScale;
  const godWidth = width * godScale;
  const gap = 8;
  const edge = 6;
  const y = footerDove.top + footerDove.height * 0.2;

  const parents = [
    { x: monogram.left - gap - parentWidth, y, scale: parentScale, faceRight: true },
    {
      x: Math.min(footerDove.right + gap, window.innerWidth - edge - parentWidth),
      y,
      scale: parentScale,
      faceRight: false,
    },
  ];

  // En pantallas anchas van en fila; en el celular, los padrinos se posan más arriba.
  const room = Math.min(parents[0].x, window.innerWidth - parents[1].x - parentWidth) - edge;
  const godHeight = godWidth * 0.75;
  const godparents =
    room >= godWidth + gap
      ? [
          { x: parents[0].x - gap - godWidth, y: y - godHeight * 0.45, faceRight: true },
          { x: parents[1].x + parentWidth + gap, y: y - godHeight * 0.45, faceRight: false },
        ]
      : [
          { x: parents[0].x, y: y - godHeight - 14, faceRight: true },
          { x: parents[1].x + parentWidth - godWidth, y: y - godHeight - 14, faceRight: false },
        ];
  godparents.forEach((spot) => (spot.scale = godScale));
  return [...parents, ...godparents];
};

// Fuera de la pantalla, del lado de cada paloma.
const offscreenSpot = (index) => {
  const fromLeft = index % 2 === 0;
  const width = dove.offsetWidth;
  return {
    x: fromLeft ? -width - 30 : window.innerWidth + 30,
    y: window.innerHeight * (0.25 + 0.12 * index),
    scale: 0.6,
    faceRight: !fromLeft,
  };
};

const familyArrives = (duration) => {
  family.forEach((bird, index) => {
    const start = bird.el.hidden ? offscreenSpot(index) : { x: bird.x, y: bird.y, scale: bird.scale };
    bird.el.hidden = false;
    Object.assign(bird, start, { opacity: 1 });
    takeOff(bird, () => familySpots()[index], {
      from: start,
      // Llegan casi al mismo tiempo que Salvador, una tras otra.
      delay: index * 140,
      duration: duration + 250 + index * 60,
      lift: 70 + index * 25,
    });
  });
};

const familyLeaves = () => {
  family.forEach((bird, index) => {
    if (bird.el.hidden) return;
    takeOff(bird, () => ({ ...offscreenSpot(index), y: -150 }), {
      delay: index * 90,
      duration: 1300,
      onLand: () => {
        bird.el.hidden = true;
        bird.target = null;
      },
    });
  });
};

const flyDoves = (now) => {
  doveFrame = 0;

  if (!salvador.flight?.locked) {
    const stop = currentStop();
    if (stop !== salvador.stop) {
      const leavingFooter = salvador.stop?.section === "pie";
      salvador.stop = stop;
      takeOff(salvador, () => stopTarget(stop));
      if (stop.section === "pie") familyArrives(salvador.flight.duration);
      else if (leavingFooter) familyLeaves();
    }
  }

  let moving = stepBird(salvador, now);
  family.forEach((bird) => {
    if (!bird.el.hidden) moving = stepBird(bird, now) || moving;
  });
  if (moving) doveFrame = requestAnimationFrame(flyDoves);
};

const wakeDove = () => {
  if (!doveFrame) doveFrame = requestAnimationFrame(flyDoves);
};

const startDove = () => {
  document.documentElement.classList.add("paloma-activa");
  setWings(salvador, "posada");
  window.addEventListener("scroll", wakeDove, { passive: true });
  window.addEventListener("resize", wakeDove);
  // La portada todavía se está acomodando (animación de entrada).
  window.setInterval(() => {
    if (salvador.stop?.anchor) wakeDove();
  }, 200);
};

// Sale del sobre con el monograma en el pico y vuela hasta la portada.
const doveLeavesEnvelope = (envelopeRect) => {
  startDove();
  const width = dove.offsetWidth;
  const from = {
    x: envelopeRect.left + envelopeRect.width / 2 - width * 0.2,
    y: envelopeRect.top + envelopeRect.height / 2 - width * 0.25,
    scale: 0.4,
  };
  Object.assign(salvador, from, { opacity: 0 });
  salvador.stop = DOVE_STOPS[0];
  takeOff(salvador, () => stopTarget(DOVE_STOPS[0]), {
    from,
    duration: 1700,
    lift: window.innerHeight * 0.12,
    fadeIn: true,
    locked: true,
    faceRight: false,
  });
  wakeDove();
};

/* ---------- Sobre de entrada ---------- */

const envelope = document.getElementById("sobre");
const envelopeButton = document.getElementById("abrir-sobre");
const flap = envelope.querySelector(".sobre-solapa");

if (document.documentElement.classList.contains("sin-sobre")) {
  envelope.remove();
  playHero();
  if (!reduceMotion) {
    // Sin sobre: aparece directamente posada en la sección del link.
    salvador.stop = currentStop();
    salvador.target = () => stopTarget(salvador.stop);
    startDove();
    if (salvador.stop.section === "pie") familyArrives(0);
    wakeDove();
  }
} else {
  window.scrollTo(0, 0);
  document.body.style.overflow = "hidden";

  envelopeButton.addEventListener(
    "click",
    () => {
      playMusic();
      envelopeButton.disabled = true;
      envelope.classList.add("abriendo");
      const envelopeRect = envelopeButton.getBoundingClientRect();
      if (!reduceMotion) window.setTimeout(() => doveLeavesEnvelope(envelopeRect), 350);
      window.setTimeout(() => flap.classList.add("detras"), reduceMotion ? 0 : 650);
      window.setTimeout(playHero, reduceMotion ? 100 : 950);
      window.setTimeout(() => {
        document.body.style.overflow = "";
        envelope.remove();
      }, reduceMotion ? 400 : 1900);
    },
    { once: true },
  );
}

/* ---------- Secciones que aparecen al entrar en pantalla ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "-8% 0px -8% 0px" },
);

document.querySelectorAll(".aparecer").forEach((element) => revealObserver.observe(element));

/* ---------- Confirmación de asistencia ---------- */

const form = document.getElementById("rsvp-formulario");
const nameInput = document.getElementById("rsvp-name");
const attendanceButtons = form.querySelectorAll(".rsvp-opcion");
const noMessage = document.getElementById("rsvp-no");
const countBlock = document.getElementById("rsvp-cantidad");
const guestsBlock = document.getElementById("rsvp-asistentes");
const guestInputs = document.getElementById("rsvp-nombres");
const minusButton = document.getElementById("rsvp-menos");
const plusButton = document.getElementById("rsvp-mas");
const countLabel = document.getElementById("rsvp-numero");
const peopleLabel = document.getElementById("rsvp-personas");
const submitButton = document.getElementById("rsvp-boton");
const submitText = submitButton.querySelector(".boton-texto");
const errorMessage = document.getElementById("rsvp-error");
const thanks = document.getElementById("rsvp-gracias");

let attendance = null; // "yes" | "no"
let companions = [""];
let sending = false;

const getFamily = () => nameInput.value.trim().replace(/^familia\s+/i, "");
const getGuestNames = () => companions.map((companion) => companion.trim()).filter(Boolean);

const canSend = () =>
  getFamily().length > 1 &&
  attendance !== null &&
  (attendance === "no" || getGuestNames().length > 0) &&
  !sending;

const updateSubmit = () => {
  submitButton.disabled = !canSend();
};

const renderGuests = () => {
  guestInputs.replaceChildren(
    ...companions.map((companion, index) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = companion;
      input.placeholder = `Nombre de la persona ${index + 1}`;
      input.setAttribute("aria-label", `Persona ${index + 1}`);
      input.className = "field";
      input.addEventListener("input", () => {
        companions[index] = input.value;
        updateSubmit();
      });
      return input;
    }),
  );

  countLabel.textContent = String(companions.length);
  peopleLabel.textContent = companions.length === 1 ? "persona" : "personas";
  minusButton.disabled = companions.length <= 1;
  plusButton.disabled = companions.length >= MAX_COMPANIONS;
  updateSubmit();
};

const setGuestCount = (count) => {
  const next = Math.min(Math.max(count, 1), MAX_COMPANIONS);
  companions =
    next > companions.length
      ? [...companions, ...Array(next - companions.length).fill("")]
      : companions.slice(0, next);
  renderGuests();
};

const setAttendance = (value) => {
  attendance = value;
  attendanceButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.asiste === value));
  });
  noMessage.hidden = value !== "no";
  countBlock.hidden = value !== "yes";
  guestsBlock.hidden = value !== "yes";
  updateSubmit();
};

const setSending = (value) => {
  sending = value;
  submitButton.classList.toggle("enviando", value);
  submitText.textContent = value ? "Enviando…" : "Enviar";
  updateSubmit();
};

const showThanks = () => {
  const family = getFamily();
  const guestCount = getGuestNames().length;
  thanks.querySelector(".rsvp-gracias-titulo").textContent = `¡Gracias, familia ${family}!`;
  thanks.querySelector(".rsvp-gracias-texto").textContent =
    attendance === "yes"
      ? `Recibimos su confirmación para ${guestCount} ${guestCount === 1 ? "persona" : "personas"}. ¡Los esperamos!`
      : "Recibimos su respuesta. Gracias por acompañarnos con el corazón.";
  form.hidden = true;
  thanks.hidden = false;
};

nameInput.addEventListener("input", updateSubmit);
attendanceButtons.forEach((button) => {
  button.addEventListener("click", () => setAttendance(button.dataset.asiste));
});
minusButton.addEventListener("click", () => setGuestCount(companions.length - 1));
plusButton.addEventListener("click", () => setGuestCount(companions.length + 1));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canSend()) return;
  if (!SHEET_ENDPOINT) {
    errorMessage.hidden = false;
    return;
  }

  const guestNames = getGuestNames();
  errorMessage.hidden = true;
  setSending(true);
  try {
    // Apps Script no devuelve cabeceras CORS: se envía en modo no-cors y,
    // si la petición sale sin error de red, se da por recibida.
    await fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        familia: getFamily(),
        asiste: attendance === "yes" ? "Sí" : "No",
        personas: attendance === "yes" ? String(guestNames.length) : "0",
        nombres: attendance === "yes" ? guestNames.join(", ") : "",
      }),
    });
    showThanks();
  } catch {
    errorMessage.hidden = false;
  }
  setSending(false);
});

renderGuests();

// Si el navegador muestra la página guardada (botón "atrás" o al volver a la pestaña),
// se recarga para empezar otra vez desde el sobre.
window.addEventListener("pageshow", (event) => {
  if (event.persisted && !document.documentElement.classList.contains("sin-sobre")) {
    window.location.reload();
  }
});
