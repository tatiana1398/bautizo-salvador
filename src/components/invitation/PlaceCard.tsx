import { ArrowUpRight } from "lucide-react";

import type { PlaceDetail } from "@/content/invitation";

type PlaceCardProps = {
  place: PlaceDetail;
};

export const PlaceCard = ({ place }: PlaceCardProps) => (
  <article className="group relative flex h-full flex-col border border-line bg-card/50 p-7 transition-colors duration-500 hover:border-moss/45 md:p-9">
    <div className="flex items-center justify-between gap-4">
      <p className="eyebrow">{place.label}</p>
      <span className="font-display text-[15px] italic leading-none text-ink-soft">
        {place.time}
      </span>
    </div>

    <h3 className="mt-7 text-balance font-display text-[26px] font-normal leading-[1.15] text-ink md:text-[30px]">
      {place.place}
    </h3>

    <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
      {place.address}
      <br />
      {place.city}
    </p>

    <div className="mt-auto pt-8">
      <div className="rule" />
      <a
        href={place.mapUrl}
        target="_blank"
        rel="noreferrer"
        className="eyebrow mt-5 inline-flex items-center gap-2 transition-colors duration-300 hover:text-moss-deep"
      >
        Cómo llegar
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </a>
    </div>
  </article>
);

export default PlaceCard;
