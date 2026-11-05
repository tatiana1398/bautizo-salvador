import { invitation } from "@/content/invitation";

import PlaceCard from "./PlaceCard";
import Reveal from "./Reveal";

export const DetailsSection = () => (
  <section id="detalles" className="px-6 py-16 md:py-24">
    <div className="mx-auto max-w-[680px]">
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {invitation.places.map((place, index) => (
          <Reveal key={place.label} delay={index * 0.1} className="h-full">
            <PlaceCard place={place} />
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default DetailsSection;
