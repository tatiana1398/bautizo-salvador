import DetailsSection from "@/components/invitation/DetailsSection";
import DressCodeSection from "@/components/invitation/DressCodeSection";
import FamilySection from "@/components/invitation/FamilySection";
import HeroSection from "@/components/invitation/HeroSection";
import RsvpSection from "@/components/invitation/RsvpSection";
import SiteFooter from "@/components/invitation/SiteFooter";
import WelcomeSection from "@/components/invitation/WelcomeSection";
import { invitation } from "@/content/invitation";

const Index = () => (
  <div className="min-h-screen w-full overflow-x-hidden bg-background">
    <main>
      <HeroSection />
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

export default Index;
