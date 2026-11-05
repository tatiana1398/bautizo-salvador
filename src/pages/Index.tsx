import { useCallback, useState } from "react";

import DetailsSection from "@/components/invitation/DetailsSection";
import DressCodeSection from "@/components/invitation/DressCodeSection";
import EnvelopeIntro from "@/components/invitation/EnvelopeIntro";
import FamilySection from "@/components/invitation/FamilySection";
import HeroSection from "@/components/invitation/HeroSection";
import RsvpSection from "@/components/invitation/RsvpSection";
import SiteFooter from "@/components/invitation/SiteFooter";
import WelcomeSection from "@/components/invitation/WelcomeSection";
import { invitation } from "@/content/invitation";

const Index = () => {
  // Si el link apunta a una sección (#rsvp, por ejemplo), se salta el sobre.
  const skipEnvelope = window.location.hash.length > 1;
  const [revealed, setRevealed] = useState(skipEnvelope);
  const [envelopeGone, setEnvelopeGone] = useState(skipEnvelope);
  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setEnvelopeGone(true), []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {envelopeGone ? null : <EnvelopeIntro onReveal={handleReveal} onDone={handleDone} />}
      <main>
        <HeroSection play={revealed} />
        <FamilySection />
        <WelcomeSection
          eyebrow={invitation.welcome.eyebrow}
          title={invitation.welcome.title}
          note={invitation.welcome.note}
        />
        <DetailsSection />
        <DressCodeSection />
        <RsvpSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
