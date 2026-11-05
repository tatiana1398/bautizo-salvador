// URL de la "Aplicación web" de Google Apps Script que guarda las respuestas
// en la hoja de Google (ver google-sheets/Confirmaciones.gs).
const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx53LnYjHdk1YR6OxiRrf-_TSOg1HCUAViwIwwU9nRgwrS_y2sn0acm9-fHl93MppKVqQ/exec";

const MAX_COMPANIONS = 10;


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

// Dónde está Salvador en cada sección. "anchor" es la paloma fija de la portada o del pie.
// Mientras se leen las demás secciones (y se llena la confirmación) se va ("away");
// vuelve al final y se reúne con todas.
const DOVE_STOPS = [
  { section: "inicio", anchor: "paloma-portada" },
  { section: "familia", away: true },
  { section: "invitacion", away: true },
  { section: "detalles", away: true },
  { section: "vestimenta", away: true },
  { section: "rsvp", away: true },
  { section: "pie", anchor: "paloma-pie" },
];

const dove = document.getElementById("paloma");

// Todas las palomas vuelan dentro de un "cielo" del tamaño de la pantalla que recorta lo que
// queda afuera: así una paloma esperando fuera de la pantalla nunca ensancha la página
// (en iPhone eso descuadraba todo).
const sky = document.createElement("div");
sky.className = "cielo";
sky.setAttribute("aria-hidden", "true");
document.body.append(sky);
sky.append(dove);
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
  // El final (pie) solo existe después de enviar la confirmación.
  const stops = confirmed ? DOVE_STOPS : DOVE_STOPS.filter((stop) => stop.section !== "pie");
  const limit = window.innerHeight * 0.55;
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) return stops[stops.length - 1];
  let current = stops[0];
  stops.forEach((stop) => {
    if (document.getElementById(stop.section).getBoundingClientRect().top <= limit) current = stop;
  });
  return current;
};

const stopTarget = (stop) => {
  const width = dove.offsetWidth;
  // Fuera de la pantalla, arriba a la derecha.
  if (stop.away) return { x: window.innerWidth + 40, y: -width, scale: 0.8, faceRight: true };
  const rect = document.getElementById(stop.anchor).getBoundingClientRect();
  return { x: rect.left, y: rect.top, scale: rect.width / width, faceRight: false };
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
  if (bird.cargo) placeCargo(bird, t, bob);

  if (t >= 1) {
    // Llegó: se posa y se gira hacia donde debe mirar.
    bird.flight = null;
    setWings(bird, "posada");
    setFacing(bird, to.faceRight);
    flight.onLand?.();
  }
  return true;
};

/* ---------- Las palomas que traen el contenido ---------- */

// Las dos primeras traen un bloque marcado con data-paloma en el HTML: 0 los papás, 1 los padrinos.
// Las cuatro (papás, padrinos y las otras dos) se reúnen al final. Llegan por este lado de la pantalla.
const COMES_FROM_LEFT = [false, true, true, false];
const FAMILY_SIZE = { parents: 0.75, godparents: 0.62 };

const family = COMES_FROM_LEFT.map((_, index) => {
  const element = document.createElement("div");
  element.className = "paloma paloma-familia";
  // Cada una aletea a su propio ritmo al final.
  element.style.setProperty("--desfase", `${0.15 + index * 0.13}s`);
  element.setAttribute("aria-hidden", "true");
  element.hidden = true;
  element.innerHTML = dove.querySelector(".paloma-ave").outerHTML;
  sky.append(element);
  return createBird(element);
});

const isWide = () => window.innerWidth >= 768;

// De dónde cuelga lo que trae: bajo el pico (con la rama de olivo), por debajo del cuerpo
// para que al posarse no tape el bloque. Depende de hacia dónde mira.
const BEAK = { x: 0.07, y: 0.88 };

const beakPoint = (bird, bob = 0) => {
  const width = dove.offsetWidth * bird.scale;
  const facingRight = bird.el.classList.contains("mirando-derecha");
  return {
    x: bird.x + width * (facingRight ? 1 - BEAK.x : BEAK.x),
    y: bird.y + bob + width * 0.75 * BEAK.y,
  };
};

// Lo que trae cuelga del pico, pequeño; al llegar crece hasta su tamaño y queda en su lugar.
const placeCargo = (bird, t, bob) => {
  const { element, width, small } = bird.cargo;
  const grow = easeInOutSine(Math.min(Math.max((t - 0.62) / 0.38, 0), 1));
  const scale = small + (1 - small) * grow;
  const beak = beakPoint(bird, bob);
  element.style.transform =
    `translate(${beak.x - (width * scale) / 2}px, ${beak.y}px) scale(${scale})`;
};

// Dónde se posa para dejar el bloque: con el pico justo en el centro de su borde de arriba.
const deliverySpot = (block, faceRight, scale) => () => {
  const rect = block.getBoundingClientRect();
  const width = dove.offsetWidth * scale;
  return {
    x: rect.left + rect.width / 2 - width * (faceRight ? 1 - BEAK.x : BEAK.x),
    y: rect.top - width * 0.75 * BEAK.y,
    scale,
    faceRight,
  };
};

const deliver = (bird, block, { faceRight, scale, then }) => {
  bird.delivering = true;
  const cargo = block.cloneNode(true);
  cargo.removeAttribute("id");
  cargo.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  cargo.classList.remove("por-entregar", "aparecer", "visible");
  cargo.classList.add("carga-entrega");
  cargo.setAttribute("aria-hidden", "true");
  const width = block.offsetWidth;
  Object.assign(cargo.style, {
    width: `${width}px`,
    height: `${block.offsetHeight}px`,
    textAlign: getComputedStyle(block).textAlign,
  });
  sky.append(cargo);
  bird.cargo = { element: cargo, width, small: Math.min(1, (dove.offsetWidth * scale * 2.3) / width) };

  takeOff(bird, deliverySpot(block, faceRight, scale), {
    faceRight,
    duration: 1700,
    lift: 60,
    locked: true,
    onLand: () => {
      // Lo deja en su lugar y le da el turno a la siguiente.
      block.classList.remove("por-entregar");
      cargo.remove();
      bird.cargo = null;
      if (bird !== salvador) {
        deliveryBusy = false;
        window.setTimeout(nextDelivery, 250);
      }
      window.setTimeout(() => {
        bird.delivering = false;
        then();
        wakeDove();
      }, 450);
    },
  });
  wakeDove();
};

// Después de confirmar, en la fila de abajo junto a Salvador (que está en el centro):
// los papás a su lado y los padrinos afuera, todos mirando hacia él.
const familySpots = () => {
  const width = dove.offsetWidth;
  const center = document.getElementById("paloma-pie").getBoundingClientRect();
  const base = center.width / width;
  const gap = 10;
  const edge = 10;
  // En pantallas angostas se achican lo necesario para caber.
  const room = (window.innerWidth - center.width) / 2 - edge;
  const need = width * base * (FAMILY_SIZE.parents + FAMILY_SIZE.godparents) + gap * 2;
  const fit = Math.min(1, room / need);
  const parentScale = base * FAMILY_SIZE.parents * fit;
  const godScale = base * FAMILY_SIZE.godparents * fit;
  const parentWidth = width * parentScale;
  const godWidth = width * godScale;
  const y = center.top + center.height * 0.15;
  // Los padrinos un poco más arriba que los papás, como en un arco.
  const godY = y - godWidth * 0.75 * 0.15;
  const parentLeft = center.left - gap * fit - parentWidth;
  const parentRight = center.right + gap * fit;
  // Los papás traen a los papás; los padrinos, a los padrinos.
  return [
    { x: parentRight, y, scale: parentScale, faceRight: false },
    { x: parentLeft - gap * fit - godWidth, y: godY, scale: godScale, faceRight: true },
    { x: parentLeft, y, scale: parentScale, faceRight: true },
    { x: parentRight + parentWidth + gap * fit, y: godY, scale: godScale, faceRight: false },
  ];
};

// Fuera de la pantalla, del lado por donde llega cada una.
const offscreenSpot = (index) => {
  const fromLeft = COMES_FROM_LEFT[index];
  return {
    x: fromLeft ? -dove.offsetWidth - 30 : window.innerWidth + 30,
    y: window.innerHeight * (0.2 + 0.12 * index),
    scale: 0.6,
    faceRight: !fromLeft,
  };
};

// Las demás solo llegan al final, y solo después de enviar la confirmación.
let confirmed = false;
let familyGathered = false;
const groupSpot = (section, index) => (section === "pie" && confirmed ? familySpots()[index] : null);

const onScreen = (bird) => bird.y > -dove.offsetWidth && bird.y < window.innerHeight;

// Después de enviar, primero aparece Salvador en el centro; luego las cuatro llegan
// una por una desde los lados y se posan a su lado.
const gatherAtFooter = (bird, index) => {
  familyGathered = true;
  const wait = 2600 + index * 380;
  window.setTimeout(() => {
    if (salvador.stop?.section !== "pie" || bird.delivering) return;
    const start =
      !bird.el.hidden && onScreen(bird)
        ? null
        : { ...offscreenSpot(index), y: familySpots()[index].y - 30 - index * 12 };
    bird.el.hidden = false;
    if (start) Object.assign(bird, start, { opacity: 1 });
    takeOff(bird, () => familySpots()[index], {
      duration: 1500 + index * 120,
      lift: 40 + index * 10,
    });
    wakeDove();
  }, wait);
};

// Las que ya entregaron se reúnen al final; en las demás secciones se van.
const regroupBird = (bird, index, delay = 0) => {
  if (bird.delivering) return;
  const section = salvador.stop?.section;
  if (section === "pie" && confirmed) {
    gatherAtFooter(bird, index);
    return;
  }
  if (groupSpot(section, index)) {
    if (bird.el.hidden) {
      bird.el.hidden = false;
      Object.assign(bird, offscreenSpot(index), { opacity: 1 });
    }
    takeOff(bird, () => groupSpot(section, index) ?? offscreenSpot(index), { delay });
  } else if (!bird.el.hidden) {
    takeOff(bird, () => ({ ...offscreenSpot(index), y: -150 }), {
      delay,
      onLand: () => {
        bird.el.hidden = true;
        bird.target = null;
      },
    });
  }
};

// Las entregas van por turnos: primero los papás y luego los padrinos.
const deliveryQueue = [];
const queuedBlocks = new Set();
let deliveryBusy = false;

const nextDelivery = () => {
  if (deliveryBusy || deliveryQueue.length === 0) return;
  deliveryBusy = true;
  deliveryQueue.shift()();
};

// Cuando un bloque marcado entra en pantalla, su paloma llega volando y lo deja.
const deliveryObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      deliveryObserver.unobserve(entry.target);
      if (queuedBlocks.has(entry.target)) return;
      queuedBlocks.add(entry.target);
      deliveryQueue.push(() => startDelivery(entry.target));
      nextDelivery();
    });
  },
  { threshold: 0.5, rootMargin: "0px 0px -12% 0px" },
);

const startDelivery = (block) => {
  const index = Number(block.dataset.paloma);
  const bird = family[index];
  const fromLeft = COMES_FROM_LEFT[index];
  const scale = isWide() ? 0.8 : 0.6;
  if (bird.el.hidden) {
    const rect = block.getBoundingClientRect();
    bird.el.hidden = false;
    Object.assign(bird, {
      x: fromLeft ? -dove.offsetWidth * scale - 30 : window.innerWidth + 30,
      y: rect.top - 160,
      scale,
      opacity: 1,
    });
  }
  deliver(bird, block, {
    faceRight: fromLeft,
    scale,
    then: () => regroupBird(bird, index),
  });
};

const flyDoves = (now) => {
  doveFrame = 0;

  if (!salvador.flight?.locked && !salvador.delivering) {
    const stop = currentStop();
    if (stop !== salvador.stop) {
      const wasAtFooter = salvador.stop?.section === "pie";
      salvador.stop = stop;
      document.documentElement.classList.toggle("en-el-final", stop.section === "pie");
      dove.classList.toggle("sin-monograma", stop.section === "pie");
      if (stop.section === "pie" || wasAtFooter) {
        // En el pie Salvador no entra ni sale volando: aparece en su lugar, en el centro.
        salvador.flight = null;
        salvador.target = () => stopTarget(stop);
        setWings(salvador, "posada");
        setFacing(salvador, false);
        if (stop.section === "pie") {
          salvador.opacity = 0;
          window.setTimeout(() => {
            salvador.opacity = 1;
            wakeDove();
          }, 1800);
        } else {
          salvador.opacity = 1;
        }
      } else {
        takeOff(salvador, () => stopTarget(stop));
      }
      if (stop.section !== "pie") familyGathered = false;
      family.forEach((bird, index) => regroupBird(bird, index, index * 130));
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
  // Los bloques que traen las palomas esperan ocultos hasta que llegan.
  document.querySelectorAll("[data-paloma]").forEach((block) => {
    block.classList.remove("aparecer");
    block.classList.add("por-entregar");
    deliveryObserver.observe(block);
  });
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
  // Sin sobre: Salvador aparece directamente posado en la sección del link.
  salvador.stop = currentStop();
  salvador.target = () => stopTarget(salvador.stop);
  document.documentElement.classList.toggle("en-el-final", salvador.stop.section === "pie");
  startDove();
  family.forEach((bird, index) => regroupBird(bird, index));
  wakeDove();
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
      window.setTimeout(() => doveLeavesEnvelope(envelopeRect), 350);
      window.setTimeout(() => flap.classList.add("detras"), 650);
      window.setTimeout(playHero, 950);
      window.setTimeout(() => {
        document.body.style.overflow = "";
        envelope.remove();
      }, 1900);
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

// Después de confirmar, el mensaje y las palomas del final llenan la pantalla, centrados,
// para que no se vea lo de arriba (como el código de vestimenta).
const fitFinalScene = () => {
  const section = document.getElementById("rsvp");
  const footer = document.getElementById("pie");
  section.style.paddingTop = "";
  footer.style.paddingBottom = "";
  const free = window.innerHeight - section.offsetHeight - footer.offsetHeight;
  if (free <= 0) return;
  const top = parseFloat(getComputedStyle(section).paddingTop);
  const bottom = parseFloat(getComputedStyle(footer).paddingBottom);
  section.style.paddingTop = `${top + free / 2}px`;
  footer.style.paddingBottom = `${bottom + free / 2}px`;
};

const showThanks = () => {
  const familyName = getFamily();
  const guestCount = getGuestNames().length;
  thanks.querySelector(".rsvp-gracias-titulo").textContent = `¡Familia ${familyName}!`;
  thanks.querySelector(".rsvp-gracias-texto").textContent =
    attendance === "yes"
      ? `Recibimos su confirmación para ${guestCount} ${guestCount === 1 ? "persona" : "personas"}. ¡Los esperamos!`
      : // Si no pueden asistir, el mismo mensaje que se les mostró al elegir "No podremos".
        noMessage.textContent.trim().replace(/\s+/g, " ");
  // Después de enviar queda solo el mensaje, sin la tarjeta, justo encima de las palomas del final.
  document.getElementById("rsvp").classList.add("confirmada");
  document.getElementById("pie").classList.add("confirmada");
  form.hidden = true;
  thanks.hidden = false;
  confirmed = true;
  // Cierra el teclado del celular antes de acomodar el final (cambia el alto de la pantalla).
  document.activeElement?.blur();
  window.addEventListener("resize", fitFinalScene);
  window.setTimeout(() => {
    fitFinalScene();
    // Baja al final, donde está Salvador; las otras cuatro llegan volando desde los lados.
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    window.setTimeout(() => {
      if (salvador.stop?.section === "pie" && !familyGathered) {
        family.forEach((bird, index) => regroupBird(bird, index));
      }
    }, 1000);
  }, 350);
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
