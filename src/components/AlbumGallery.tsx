"use client";

import {
  type KeyboardEvent,
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import {
  getNextAlbumIndex,
  normalizeAlbumInterval,
} from "@/src/lib/album-autoplay";
import type { GalleryMoment } from "@/src/types/wedding";

type AlbumGalleryProps = {
  images: GalleryMoment[];
  intervalMs: number;
};

export function AlbumGallery({ images, intervalMs }: AlbumGalleryProps) {
  const slides = useMemo(() => {
    const carouselImages = images.filter((image) => image.carousel);
    return carouselImages.length > 0 ? carouselImages : images;
  }, [images]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const safeIntervalMs = normalizeAlbumInterval(intervalMs);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setIsDocumentHidden(document.hidden);

    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const canAutoplay =
      slides.length > 1 &&
      !isHovered &&
      !isDocumentHidden &&
      !reducedMotion;

    if (!canAutoplay) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => getNextAlbumIndex(index, slides.length));
    }, safeIntervalMs);

    return () => window.clearInterval(timer);
  }, [
    autoplayEpoch,
    isDocumentHidden,
    isHovered,
    reducedMotion,
    safeIntervalMs,
    slides.length,
  ]);

  function resetAutoplayTimer() {
    setAutoplayEpoch((epoch) => epoch + 1);
  }

  function showPrevious() {
    if (slides.length < 2) {
      return;
    }

    resetAutoplayTimer();
    setCurrentIndex((index) => getNextAlbumIndex(index, slides.length, -1));
  }

  function showNext() {
    if (slides.length < 2) {
      return;
    }

    resetAutoplayTimer();
    setCurrentIndex((index) => getNextAlbumIndex(index, slides.length));
  }

  function handleCarouselKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || endX === undefined || Math.abs(startX - endX) < 45) {
      return;
    }

    if (startX > endX) {
      showNext();
    } else {
      showPrevious();
    }
  }

  if (slides.length === 0) {
    return <p className="album-empty">Album đang chờ ảnh được bổ sung.</p>;
  }

  const safeCurrentIndex = Math.min(currentIndex, slides.length - 1);
  const currentSlide = slides[safeCurrentIndex];

  return (
    <div
      className="album-carousel"
      tabIndex={0}
      aria-label="Album ảnh tự động"
      onKeyDown={handleCarouselKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <figure
        className="album-slide"
        key={currentSlide.id}
        data-fit-mode={currentSlide.fitMode === "contain" ? "contain" : "cover"}
      >
        <WeddingImage
          src={currentSlide.src}
          available={currentSlide.available}
          alt={currentSlide.alt}
          sizes="(max-width: 896px) 100vw, 70vw"
          className="album-slide-image"
          framing={currentSlide}
        />
        <figcaption>
          <span>{currentSlide.caption}</span>
          {!currentSlide.available ? (
            <small>Ảnh mẫu chờ cập nhật</small>
          ) : null}
        </figcaption>
      </figure>

      {slides.length > 1 ? (
        <>
          <button
            className="album-arrow album-arrow-previous"
            type="button"
            aria-label="Ảnh trước"
            onClick={showPrevious}
          >
            ←
          </button>
          <button
            className="album-arrow album-arrow-next"
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={showNext}
          >
            →
          </button>

          <div className="album-pagination">
            <span>
              {safeCurrentIndex + 1} / {slides.length}
            </span>
            <div className="album-indicators" aria-label="Chọn ảnh">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-current={index === safeCurrentIndex ? "true" : undefined}
                  onClick={() => {
                    resetAutoplayTimer();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
