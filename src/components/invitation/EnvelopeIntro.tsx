import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { invitation } from "@/content/invitation";

import { EASE } from "./motion";

type EnvelopeIntroProps = {
  /** La tarjeta ya cubre la pantalla: es el momento de animar la portada. */
  onReveal: () => void;
  /** El sobre terminó de desaparecer y se puede quitar. */
  onDone: () => void;
};

type Stage = "closed" | "opening" | "done";

/**
 * Pantalla de entrada: un sobre cerrado con sello de lacre.
 * Al tocarlo se levanta la solapa, sale la tarjeta y crece hasta convertirse
 * en la portada de la invitación.
 */
export const EnvelopeIntro = ({ onReveal, onDone }: EnvelopeIntroProps) => {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");
  // La solapa abierta debe quedar detrás de la tarjeta que sale del sobre.
  const [flapBehind, setFlapBehind] = useState(false);
  const { baby, event } = invitation;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (stage === "done") {
      document.body.style.overflow = "";
      onDone();
    }
  }, [stage, onDone]);

  const open = () => {
    if (stage !== "closed") return;
    setStage("opening");
    window.setTimeout(() => setFlapBehind(true), reduceMotion ? 0 : 650);
    window.setTimeout(onReveal, reduceMotion ? 100 : 1600);
    window.setTimeout(() => setStage("done"), reduceMotion ? 400 : 2900);
  };

  const opening = stage === "opening";
  const t = (delay: number, duration: number) => ({
    delay: reduceMotion ? 0 : delay,
    duration: reduceMotion ? 0.2 : duration,
    ease: EASE,
  });

  return (
    <AnimatePresence>
      {stage !== "done" ? (
        <motion.div
          key="envelope"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-paper-deep px-6 print:hidden"
        >
          {/* Fondo: se desvanece mientras la tarjeta crece */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-paper-deep"
            style={{ backgroundImage: "var(--gradient-wash)" }}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={t(1.6, 0.9)}
          />

          <motion.p
            className="eyebrow relative mb-10 text-center"
            animate={{ opacity: opening ? 0 : 1, y: opening ? -8 : 0 }}
            transition={t(0, 0.4)}
          >
            Tienes una invitación
          </motion.p>

          <button
            type="button"
            onClick={open}
            aria-label="Abrir la invitación"
            disabled={opening}
            className="group relative w-[min(86vw,440px)] cursor-pointer focus:outline-none disabled:cursor-default"
            style={{ aspectRatio: "3 / 2", perspective: "1400px" }}
          >
            {/* Interior del sobre */}
            <motion.div
              className="absolute inset-0 border border-line bg-sky shadow-[0_24px_60px_-28px_hsl(212_29%_26%/0.45)]"
              animate={{ opacity: opening ? 0 : 1 }}
              transition={t(1.45, 0.4)}
            />

            {/* Tarjeta que sale del sobre */}
            <motion.div
              className="absolute inset-x-[7%] bottom-[6%] top-[8%] z-10 flex flex-col items-center justify-center border border-line bg-paper text-center"
              initial={{ y: 0, scale: 1, opacity: 1 }}
              animate={
                opening ? { y: "-30%", scale: 7, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }
              }
              transition={{
                y: reduceMotion ? { duration: 0.2 } : { delay: 0.7, duration: 0.85, ease: EASE },
                scale: t(1.5, 1.1),
                opacity: t(2.1, 0.7),
              }}
            >
              <motion.span
                className="flex flex-col items-center"
                animate={{ opacity: opening ? 0 : 1 }}
                transition={t(1.45, 0.35)}
              >
              <span className="eyebrow text-[9px] md:text-[10px]">{event.label}</span>
              <span className="mt-2 font-display text-[34px] font-light leading-none text-navy md:text-[42px]">
                {baby.name}
              </span>
              <span className="mt-3 text-[9px] uppercase tracking-[0.24em] text-ink-soft">
                {event.dateShort}
              </span>
              </motion.span>
            </motion.div>

            {/* Bolsillo delantero del sobre */}
            <motion.div
              className="absolute inset-0 z-20"
              animate={{ opacity: opening ? 0 : 1 }}
              transition={t(1.45, 0.4)}
            >
            <div
              className="absolute inset-0 bg-[hsl(24_33%_97%)]"
              style={{ clipPath: "polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)" }}
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full text-line"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
            >
              <path d="M0 0 L50 56 L100 0" vectorEffect="non-scaling-stroke" />
              <path d="M0 100 L41 58" vectorEffect="non-scaling-stroke" />
              <path d="M100 100 L59 58" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="pointer-events-none absolute inset-0 border border-line" />
            </motion.div>

            {/* Solapa */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[60%] origin-top"
              style={{ zIndex: flapBehind ? 5 : 30, transformStyle: "preserve-3d" }}
              initial={{ rotateX: 0, opacity: 1 }}
              animate={{ rotateX: opening ? 180 : 0, opacity: opening ? 0 : 1 }}
              transition={{ rotateX: t(0.25, 0.75), opacity: t(1.45, 0.4) }}
            >
              <div
                className="absolute inset-0 bg-white"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-line"
                fill="none"
                stroke="currentColor"
              >
                <path d="M0 0 L50 100 L100 0" vectorEffect="non-scaling-stroke" strokeWidth="1" />
              </svg>
            </motion.div>

            {/* Sello de lacre */}
            <motion.span
              className="absolute left-1/2 top-[60%] z-40 flex h-16 w-16 items-center justify-center rounded-full bg-navy shadow-[inset_0_0_0_3px_hsl(212_29%_32%),inset_0_0_0_5px_hsl(199_24%_45%/0.7),0_6px_14px_-6px_hsl(212_29%_15%/0.6)] md:h-[72px] md:w-[72px]"
              style={{ x: "-50%", y: "-50%" }}
              whileHover={{ scale: 1.05 }}
              animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.7 : 1 }}
              transition={t(0, 0.35)}
            >
              <span className="flex items-center gap-px font-display font-light leading-none text-sky">
                <span className="text-[11px]">{baby.monogram.left}</span>
                <span className="text-[24px]">{baby.monogram.center}</span>
                <span className="text-[11px]">{baby.monogram.right}</span>
              </span>
            </motion.span>
          </button>

          <motion.p
            className="relative mt-10 text-[10px] uppercase tracking-[0.3em] text-ink-soft"
            animate={{ opacity: opening ? 0 : [0.45, 1, 0.45] }}
            transition={
              opening
                ? t(0, 0.3)
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            Toca el sobre para abrir
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default EnvelopeIntro;
