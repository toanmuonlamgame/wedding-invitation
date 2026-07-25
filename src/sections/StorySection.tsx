import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function StorySection() {
  return (
    <section className="section story-section" aria-labelledby="story-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Chuyện chúng mình"
            title="Từ lạ thành thương"
            titleId="story-title"
            description="Ba dấu mốc nhỏ sẽ kể lại hành trình của Vũ Bình và Thành Long khi những kỷ niệm chính thức được bổ sung."
          />
        </div>

        <div className="story-timeline">
          <div className="story-line" data-story-line aria-hidden="true" />
          {wedding.story.map((milestone) => (
            <article
              className="story-item"
              key={milestone.marker}
              data-story-item
            >
              <div className="story-marker" aria-hidden="true" />
              <span className="story-year">{milestone.marker}</span>
              <h3 className="story-title">{milestone.title}</h3>
              <p className="story-text">{milestone.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
