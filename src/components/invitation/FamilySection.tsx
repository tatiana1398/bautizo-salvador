import { invitation } from "@/content/invitation";

import Reveal from "./Reveal";

type NameListProps = {
  label: string;
  names: string[];
  delay?: number;
};

const NameList = ({ label, names, delay = 0 }: NameListProps) => (
  <Reveal delay={delay} className="text-center">
    <p className="eyebrow">{label}</p>
    <div className="mt-5 space-y-1.5">
      {names.map((name) => (
        <p
          key={name}
          className="text-balance font-display text-[19px] font-light leading-snug text-ink md:text-[22px]"
        >
          {name}
        </p>
      ))}
    </div>
  </Reveal>
);

export const FamilySection = () => (
  <section id="familia" className="px-6 pt-16 md:pt-24">
    <div className="mx-auto max-w-[560px]">
      <NameList label="Padres" names={invitation.parents} />
      <div className="my-9 rule-fade md:my-11" />
      <NameList label="Padrinos" names={invitation.godparents} delay={0.08} />
    </div>
  </section>
);

export default FamilySection;
