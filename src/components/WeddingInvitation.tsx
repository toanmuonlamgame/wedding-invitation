import { WeddingExperience } from "@/src/components/WeddingExperience";
import { FooterSection } from "@/src/sections/FooterSection";
import { GallerySection } from "@/src/sections/GallerySection";
import { InvitationSection } from "@/src/sections/InvitationSection";
import { MusicSection } from "@/src/sections/MusicSection";
import { OpeningSection } from "@/src/sections/OpeningSection";
import { ScheduleSection } from "@/src/sections/ScheduleSection";
import { StorySection } from "@/src/sections/StorySection";
import { VenueSection } from "@/src/sections/VenueSection";
import type { InvitationPersonalization } from "@/src/types/invitation";
import type { WeddingContentData } from "@/src/types/wedding";

type WeddingInvitationProps = {
  content: WeddingContentData;
  invitation?: InvitationPersonalization;
};

export function WeddingInvitation({
  content,
  invitation,
}: WeddingInvitationProps) {
  return (
    <WeddingExperience recipientText={invitation?.recipientText}>
      <main className="invitation-main">
        <OpeningSection weddingDateTime={content.weddingDateTime} />
        <InvitationSection invitation={invitation} />
        <ScheduleSection
          weddingDateTime={content.weddingDateTime}
          expiredMessage={content.expiredCountdownMessage}
        />
        <StorySection
          chapters={content.storyChapters.filter((chapter) => chapter.visible)}
        />
        <GallerySection
          images={content.galleryImages.filter((image) => image.visible)}
          intervalMs={content.albumIntervalMs}
        />
        <VenueSection venues={content.venues} />
        <MusicSection />
        <FooterSection />
      </main>
    </WeddingExperience>
  );
}
