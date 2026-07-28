import { AlbumGallery } from "@/src/components/AlbumGallery";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { AlbumLayout, GalleryMoment } from "@/src/types/wedding";

type GallerySectionProps = {
  images: GalleryMoment[];
  intervalMs: number;
  layout: AlbumLayout;
};

export function GallerySection({ images, intervalMs, layout }: GallerySectionProps) {
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
          <AlbumGallery images={images} intervalMs={intervalMs} layout={layout} />
        </div>
      </div>
    </section>
  );
}
