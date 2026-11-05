import { invitation } from "@/content/invitation";

import { Monogram } from "./Ornaments";

export const SiteFooter = () => (
  <footer className="border-t border-line px-6 py-14 md:py-16">
    <div className="mx-auto flex max-w-[680px] flex-col items-center text-center">
      <img
        src={invitation.baby.doveSealArt}
        alt=""
        width={360}
        height={270}
        className="mb-2 ml-6 w-[88px] md:w-[96px]"
        loading="lazy"
      />
      <Monogram letters={invitation.baby.monogram} />

      <p className="mt-7 font-display text-[22px] font-light italic text-ink-soft md:text-[24px]">
        Gracias por acompañarnos
      </p>
    </div>
  </footer>
);

export default SiteFooter;
