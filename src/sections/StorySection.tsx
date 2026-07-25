import { SectionHeading } from "@/src/components/SectionHeading";
import { StoryExplorer } from "@/src/components/StoryExplorer";
import type { LoveStoryChapter } from "@/src/types/wedding";

type StorySectionProps = {
  chapters: LoveStoryChapter[];
};

export function StorySection({ chapters }: StorySectionProps) {
  return (
    <section className="section story-section" aria-labelledby="story-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Chuyện chúng mình"
            title="Từ lạ thành thương"
            titleId="story-title"
            description="Từng chương nhỏ được mở ra như những trang nhật ký trong hành trình của Vũ Bình và Thành Long."
          />
        </div>
        <StoryExplorer chapters={chapters} />
      </div>
    </section>
  );
}
