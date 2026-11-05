import Reveal from "./Reveal";

type WelcomeSectionProps = {
  eyebrow: string;
  title: string;
  note: string;
};

export const WelcomeSection = ({ eyebrow, title, note }: WelcomeSectionProps) => (
  <section id="invitacion" className="px-6 pb-6 pt-14 md:pb-10 md:pt-20">
    <div className="mx-auto max-w-[600px] text-center">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-7 text-balance font-display text-[24px] font-light leading-[1.35] tracking-[-0.005em] text-ink md:text-[32px]">
          {title}
        </p>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mx-auto mt-5 max-w-[400px] text-pretty text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
          {note}
        </p>
      </Reveal>
    </div>
  </section>
);

export default WelcomeSection;
