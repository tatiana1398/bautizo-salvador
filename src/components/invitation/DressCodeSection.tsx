import { invitation } from "@/content/invitation";

import Reveal from "./Reveal";

export const DressCodeSection = () => (
  <section id="vestimenta" className="border-t border-line px-6 py-16 md:py-20">
    <Reveal className="mx-auto max-w-[560px] text-center">
      <p className="eyebrow">{invitation.dressCode.label}</p>
      <p className="mt-5 font-display text-[23px] font-light leading-tight text-ink md:text-[27px]">
        {invitation.dressCode.value}
      </p>
      {invitation.dressCode.note ? (
        <p className="mx-auto mt-3 max-w-[340px] text-pretty text-[13px] leading-relaxed text-ink-soft">
          {invitation.dressCode.note}
        </p>
      ) : null}
    </Reveal>
  </section>
);

export default DressCodeSection;
