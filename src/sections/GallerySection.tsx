import { SectionHeading } from "@/src/components/SectionHeading";

const moments = ["Ngày bên nhau", "Một chút bình yên", "Nụ cười của em", "Mình và những chuyến đi"];

export function GallerySection() {
  return (
    <section className="section gallery-section" aria-labelledby="gallery-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Album của chúng mình"
          title="Những khoảnh khắc"
          description="Mỗi tấm hình là một mảnh nhỏ của hành trình mà chúng mình luôn muốn gìn giữ."
        />

        <div className="gallery-grid" id="gallery-title">
          {moments.map((moment) => (
            <div
              className="gallery-item"
              role="img"
              aria-label={`Ảnh placeholder: ${moment}`}
              key={moment}
            >
              <p className="gallery-label">{moment}</p>
            </div>
          ))}
        </div>
        <p className="gallery-note">
          Hình ảnh minh họa nội bộ · Sẽ được thay bằng ảnh cưới chính thức
        </p>
      </div>
    </section>
  );
}
