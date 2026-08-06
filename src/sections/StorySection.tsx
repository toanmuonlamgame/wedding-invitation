import { SectionHeading } from "@/src/components/SectionHeading";
import { StoryExplorer } from "@/src/components/StoryExplorer";
import type { LoveStoryChapter } from "@/src/types/wedding";
import { getInvitationMessages, type InvitationLanguage } from "@/src/lib/invitation-i18n";

type StorySectionProps = {
  chapters: LoveStoryChapter[];
  language?: InvitationLanguage;
};

export function StorySection({ chapters, language = "vi" }: StorySectionProps) {
  if (!chapters.length) return null;
  const messages = getInvitationMessages(language);

  return (
    <section className="section story-section" aria-labelledby="story-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow={messages.story.eyebrow}
            title={messages.story.title}
            titleId="story-title"
            description={messages.story.description}
          />
        </div>
        <StoryExplorer chapters={chapters} />
      </div>
    </section>
  );
}
