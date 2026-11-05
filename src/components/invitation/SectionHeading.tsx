import type { ReactNode } from "react";

import Reveal from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
};

export const SectionHeading = ({ eyebrow, title, description, className }: SectionHeadingProps) => (
  <Reveal className={`text-center ${className ?? ""}`}>
    {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
    <h2 className="text-balance font-display text-[28px] font-light leading-[1.15] tracking-[-0.01em] text-ink md:text-[38px]">
      {title}
    </h2>
    {description ? (
      <p className="mx-auto mt-4 max-w-[420px] text-pretty text-[13px] leading-relaxed text-ink-soft">
        {description}
      </p>
    ) : null}
  </Reveal>
);

export default SectionHeading;
