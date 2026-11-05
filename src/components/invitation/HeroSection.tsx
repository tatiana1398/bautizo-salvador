import { motion, useReducedMotion, type Variants } from "framer-motion";

import { invitation } from "@/content/invitation";
import { nameVersion } from "@/content/version";

import { BotanicalSprig, DoveMonogram } from "./Ornaments";
import { EASE } from "./motion";

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const { baby, event } = invitation;

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
  };

  return (
    <section
      id="inicio"
      className="paper-surface relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 border border-line/80 md:inset-5"
      />
      <BotanicalSprig className="pointer-events-none absolute -left-8 top-10 h-56 w-24 animate-sway text-sage md:left-8 md:top-16 md:h-80 md:w-32" />
      <BotanicalSprig className="pointer-events-none absolute -right-8 bottom-12 h-56 w-24 rotate-180 animate-sway text-sage/90 md:right-10 md:bottom-20 md:h-80 md:w-32" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-24"
      >
        <motion.div variants={item}>
          <DoveMonogram letters={baby.monogram} dove={baby.doveSealArt} />
        </motion.div>

        <motion.p variants={item} className="eyebrow mt-8 pl-[0.36em] text-[15px] tracking-[0.36em] md:text-[17px]">
          {event.label}
        </motion.p>

        {nameVersion === "texto" ? (
          <>
            <motion.h1
              variants={item}
              className="mt-5 font-display text-[64px] font-light leading-none tracking-[0.01em] text-[#58382a] md:text-[80px]"
            >
              {baby.name}
            </motion.h1>
          </>
        ) : (
          <motion.img
            variants={item}
            src={baby.nameArt}
            alt={baby.name}
            width={922}
            height={315}
            className="mt-3 w-[min(72vw,380px)] max-w-full md:w-[350px]"
            loading="eager"
          />
        )}

        <motion.div variants={item} className="mt-4 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-line" />
          <span className="h-1 w-1 rotate-45 bg-clay" />
          <span className="h-px w-10 bg-line" />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-6 text-[11px] uppercase leading-relaxed tracking-[0.26em] text-ink-soft md:text-xs"
        >
          {event.dateLong}
        </motion.p>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-3 pb-9">
        <span className="text-[9px] uppercase tracking-[0.32em] text-ink-soft/70">Desliza</span>
        <span aria-hidden="true" className="h-10 w-px animate-scroll-hint bg-line" />
      </div>
    </section>
  );
};

export default HeroSection;
