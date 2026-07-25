import { WeddingExperience } from "@/src/components/WeddingExperience";
import { CreatorSection } from "@/src/sections/CreatorSection";
import { FooterSection } from "@/src/sections/FooterSection";
import { GallerySection } from "@/src/sections/GallerySection";
import { InvitationSection } from "@/src/sections/InvitationSection";
import { MusicSection } from "@/src/sections/MusicSection";
import { OpeningSection } from "@/src/sections/OpeningSection";
import { ScheduleSection } from "@/src/sections/ScheduleSection";
import { StorySection } from "@/src/sections/StorySection";
import { VenueSection } from "@/src/sections/VenueSection";
import type { InvitationPersonalization } from "@/src/types/invitation";

type WeddingInvitationProps = {
  invitation?: InvitationPersonalization;
  showCreator?: boolean;
};

export function WeddingInvitation({
  invitation,
  showCreator = false,
}: WeddingInvitationProps) {
  return (
    <WeddingExperience recipientText={invitation?.recipientText}>
      <main className="invitation-main">
        <OpeningSection />
        <InvitationSection invitation={invitation} />
        <ScheduleSection />
        <StorySection />
        <GallerySection />
        <VenueSection />
        <MusicSection />
        {showCreator ? <CreatorSection /> : null}
        <FooterSection />
      </main>
    </WeddingExperience>
  );
}
