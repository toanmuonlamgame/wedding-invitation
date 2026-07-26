import { AlbumGallery } from "@/src/components/AlbumGallery";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { GalleryMoment } from "@/src/types/wedding";

type GallerySectionProps = {
  images: GalleryMoment[];
  intervalMs: number;
};

export function GallerySection({ images, intervalMs }: GallerySectionProps) {
  return (
    <section className="section gallery-section" aria-labelledby="gallery-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Album của chúng mình"
            title="Những khoảnh khắc"
            titleId="gallery-title"
            description="Một lát cắt dịu dàng từ album cưới, tự chuyển qua từng khoảnh khắc theo nhịp nhẹ nhàng."
          />
        </div>
        <div data-gallery-reveal>
          <AlbumGallery images={images} intervalMs={intervalMs} />
        </div>
      </div>
    </section>
  );
}
