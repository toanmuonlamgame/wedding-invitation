import { GalleryVisual } from "@/src/components/GalleryVisual";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function GallerySection() {
  return (
    <section
      className="section gallery-section"
      aria-labelledby="gallery-title"
    >
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Album của chúng mình"
            title="Những khoảnh khắc"
            description="Ảnh cưới chính thức sẽ được đặt vào đúng vị trí này. Fallback nội bộ giúp thiệp luôn trọn vẹn khi media chưa sẵn sàng."
          />
        </div>

        <div className="gallery-grid" id="gallery-title">
          {wedding.gallery.map((moment, index) => (
            <GalleryVisual moment={moment} index={index} key={moment.src} />
          ))}
        </div>
      </div>
    </section>
  );
}
