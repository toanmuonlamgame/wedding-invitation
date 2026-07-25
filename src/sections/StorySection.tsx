import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function StorySection() {
  return (
    <section className="section story-section" aria-labelledby="story-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Chuyện chúng mình"
          title="Từ lạ thành thương"
          description="Không phải một câu chuyện cổ tích, chỉ là hai người bình thường đã chọn nắm tay nhau qua những tháng năm."
        />

        <div className="story-grid" id="story-title">
          {wedding.story.map((milestone) => (
            <article className="story-item" key={milestone.year}>
              <span className="story-year">{milestone.year}</span>
              <h3 className="story-title">{milestone.title}</h3>
              <p className="story-text">{milestone.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
