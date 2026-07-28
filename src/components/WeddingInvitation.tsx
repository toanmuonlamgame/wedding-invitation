import { WeddingExperience } from "@/src/components/WeddingExperience";
import { HeroCollage } from "@/src/components/HeroCollage";
import { RsvpForm } from "@/src/components/RsvpForm";
import { WeddingWishes } from "@/src/components/WeddingWishes";
import { CreatorSection } from "@/src/sections/CreatorSection";
import { FooterSection } from "@/src/sections/FooterSection";
import { GallerySection } from "@/src/sections/GallerySection";
import { InvitationSection } from "@/src/sections/InvitationSection";
import { MusicSection } from "@/src/sections/MusicSection";
import { YouTubeSection } from "@/src/sections/YouTubeSection";
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
      cover={content.experience.cover}
      adminUrl={
        showCreator
          ? "https://wedding-invitation-eight-lac.vercel.app/admin"
          : undefined
      }
    >
      <main className="invitation-main">
        <OpeningSection weddingDateTime={content.weddingDateTime} />
        <HeroCollage
          images={content.galleryImages}
          intervalMs={content.albumIntervalMs}
        />
        <InvitationSection invitation={invitation} />
        <ScheduleSection
          weddingDateTime={content.weddingDateTime}
          expiredMessage={content.expiredCountdownMessage}
          settings={content.experience.countdown}
        />
        <StorySection
          chapters={content.storyChapters.filter((chapter) => chapter.visible)}
        />
        <GallerySection
          images={content.galleryImages.filter((image) => image.visible)}
          intervalMs={content.albumIntervalMs}
          layout={content.experience.albumLayout}
        />
        <WeddingWishes
          initialWishes={wishes}
          invitationToken={invitationToken}
          defaultSenderName={invitation?.recipientText}
          layout={content.experience.wishLayout}
        />
        <VenueSection venues={content.venues} />
        {invitation && invitationToken ? (
          <RsvpForm
            token={invitationToken}
            recipientText={invitation.recipientText}
            suggestedCount={invitation.guestCount ?? 1}
            maximumGuests={invitation.guestCount ?? 1}
            defaultSide={invitation.invitationSide}
            allowSideSelection={content.experience.allowGuestSideSelection}
          />
        ) : null}
        <MusicSection settings={content.experience.music} />
        <YouTubeSection settings={content.experience.youtube} />
        {showCreator ? <CreatorSection /> : null}
        <FooterSection />
      </main>
    </WeddingExperience>
  );
}
