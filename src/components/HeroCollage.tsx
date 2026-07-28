"use client";

import { useEffect, useMemo, useState } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import { getNextAlbumIndex, normalizeAlbumInterval } from "@/src/lib/album-autoplay";
import type { GalleryMoment } from "@/src/types/wedding";

export function HeroCollage({
  images,
  intervalMs,
}: {
  images: GalleryMoment[];
  intervalMs: number;
}) {
  const slides = useMemo(
    () => images.filter((image) => image.visible).slice(0, 7),
    [images],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(document.hidden || media.matches);
    update();
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(
      () => setCurrentIndex((index) => getNextAlbumIndex(index, slides.length)),
      normalizeAlbumInterval(intervalMs),
    );
    return () => window.clearInterval(timer);
  }, [intervalMs, paused, slides.length]);

  if (!slides.length) return null;
  const current = slides[Math.min(currentIndex, slides.length - 1)];

  return (
    <section className="hero-collage-section" aria-label="Ảnh nổi bật của Vũ Bình và Thành Long">
      <div className="section-shell hero-collage">
        <figure className="hero-collage-main">
          <WeddingImage
            src={current.src}
            available={current.available}
            alt={current.alt}
            sizes="(max-width: 896px) 100vw, 60vw"
            className="hero-collage-image"
            framing={current}
          />
          <figcaption>{current.caption}</figcaption>
        </figure>
        <div className="hero-collage-secondary">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              aria-label={`Chọn ảnh ${index + 1}: ${slide.caption}`}
              aria-current={index === currentIndex ? "true" : undefined}
              onClick={() => setCurrentIndex(index)}
            >
              <WeddingImage
                src={slide.src}
                available={slide.available}
                alt=""
                sizes="10rem"
                className="hero-collage-thumb"
                framing={slide}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
