import { WeddingExperience } from "@/src/components/WeddingExperience";
import { RsvpForm } from "@/src/components/RsvpForm";
import { WeddingWishes } from "@/src/components/WeddingWishes";
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
import type { PublicWeddingWish } from "@/src/types/engagement";
import type { WeddingContentData } from "@/src/types/wedding";

type WeddingInvitationProps = {
  content: WeddingContentData;
  invitation?: InvitationPersonalization;
  invitationToken?: string;
  wishes?: PublicWeddingWish[];
  showCreator?: boolean;
};

export function WeddingInvitation({
  content,
  invitation,
  invitationToken,
  wishes = [],
  showCreator = false,
}: WeddingInvitationProps) {
  return (
    <WeddingExperience
      recipientText={invitation?.recipientText}
      themePreset={content.themePreset}
      fontPreset={content.fontPreset}
    >
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
        <WeddingWishes
          initialWishes={wishes}
          invitationToken={invitationToken}
          defaultSenderName={invitation?.recipientText}
        />
        <VenueSection venues={content.venues} />
        {invitation && invitationToken ? (
          <RsvpForm
            token={invitationToken}
            recipientText={invitation.recipientText}
            suggestedCount={invitation.guestCount ?? 1}
          />
        ) : null}
        <MusicSection />
        {showCreator ? <CreatorSection /> : null}
        <FooterSection />
      </main>
    </WeddingExperience>
  );
}
