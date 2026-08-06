import { WeddingExperience } from "@/src/components/WeddingExperience";
import { FloatingWishes } from "@/src/components/FloatingWishes";
import { HeroCollage } from "@/src/components/HeroCollage";
import { RsvpForm } from "@/src/components/RsvpForm";
import { WeddingWishes } from "@/src/components/WeddingWishes";
import { CreatorSection } from "@/src/sections/CreatorSection";
import { FooterSection } from "@/src/sections/FooterSection";
import { InvitationSection } from "@/src/sections/InvitationSection";
import { YouTubeSection } from "@/src/sections/YouTubeSection";
import { OpeningSection } from "@/src/sections/OpeningSection";
import { ScheduleSection } from "@/src/sections/ScheduleSection";
import { StorySection } from "@/src/sections/StorySection";
import { VenueSection } from "@/src/sections/VenueSection";
import type { InvitationPersonalization } from "@/src/types/invitation";
import type { PublicWeddingWish } from "@/src/types/engagement";
import type { WeddingContentData } from "@/src/types/wedding";
import { InvitationLocaleProvider } from "@/src/components/InvitationLocaleProvider";
import type { InvitationLanguage } from "@/src/lib/invitation-i18n";
import {
  getLocalizedWeddingContent,
  getMissingKoreanContent,
  weddingMessageOverrides,
} from "@/src/lib/localized-wedding-content";

type WeddingInvitationProps = {
  content: WeddingContentData;
  invitation?: InvitationPersonalization;
  invitationToken?: string;
  wishes?: PublicWeddingWish[];
  showCreator?: boolean;
  language?: InvitationLanguage;
};

export function WeddingInvitation({
  content,
  invitation,
  invitationToken,
  wishes = [],
  showCreator = false,
  language = invitation?.language ?? "vi",
}: WeddingInvitationProps) {
  const localized = getLocalizedWeddingContent(content, language);
  const missingKoreanCount = getMissingKoreanContent(content).length;
  return (
    <InvitationLocaleProvider
      language={language}
      overrides={weddingMessageOverrides(localized.copy)}
    >
    <WeddingExperience
      recipientText={invitation?.recipientText}
      themePreset={content.themePreset}
      fontPreset={content.fontPreset}
      cover={localized.cover}
      adminUrl={
        showCreator
          ? "https://wedding-invitation-eight-lac.vercel.app/admin"
          : undefined
      }
      language={language}
    >
      <main className="invitation-main">
        <OpeningSection weddingDateTime={content.weddingDateTime} language={language} />
        {content.experience.sections.invitation ? (
          <InvitationSection
            invitation={invitation}
            settings={localized.invitation}
            language={language}
          />
        ) : null}
        {content.experience.sections.heroCollage ? (
          <HeroCollage
            images={content.galleryImages}
            intervalMs={content.albumIntervalMs}
          />
        ) : null}
        {content.experience.sections.story ? (
          <StorySection
            chapters={localized.storyChapters.filter(
              (chapter) => chapter.visible && chapter.available,
            )}
            language={language}
          />
        ) : null}
        <ScheduleSection
          weddingDateTime={content.weddingDateTime}
          expiredMessage={localized.expiredCountdownMessage}
          settings={content.experience.countdown}
          language={language}
        />
        <VenueSection venues={localized.venues} language={language} />
        {content.experience.sections.rsvp && invitation && invitationToken ? (
          <RsvpForm
            token={invitationToken}
            recipientText={invitation.recipientText}
            suggestedCount={invitation.guestCount ?? 1}
            maximumGuests={invitation.guestCount ?? 1}
            defaultSide={invitation.invitationSide}
            allowSideSelection={content.experience.allowGuestSideSelection}
          />
        ) : null}
        <WeddingWishes
          initialWishes={wishes}
          invitationToken={invitationToken}
          defaultSenderName={invitation?.recipientText}
          layout={content.experience.wishLayout}
          showList={content.experience.wishes.showList}
        />
        {showCreator ? <CreatorSection missingKoreanCount={missingKoreanCount} /> : null}
        <YouTubeSection settings={localized.youtube} />
        <FooterSection language={language} />
      </main>
      <FloatingWishes
        wishes={wishes}
        settings={content.experience.wishes}
      />
    </WeddingExperience>
    </InvitationLocaleProvider>
  );
}
