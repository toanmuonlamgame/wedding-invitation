"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
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
  const [isFocused, setIsFocused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const resumeTimerRef = useRef<number | undefined>(undefined);
  const touchStartXRef = useRef<number | null>(null);

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
      !isFocused &&
      !isInteractionPaused &&
      !isDocumentHidden &&
      !reducedMotion;

    if (!canAutoplay) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [
    intervalMs,
    isDocumentHidden,
    isFocused,
    isHovered,
    isInteractionPaused,
    reducedMotion,
    slides.length,
  ]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== undefined) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  function pauseAfterInteraction() {
    setIsInteractionPaused(true);

    if (resumeTimerRef.current !== undefined) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      setIsInteractionPaused(false);
      resumeTimerRef.current = undefined;
    }, 8_000);
  }

  function showPrevious() {
    if (slides.length < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => {
      const safeIndex = Math.min(index, slides.length - 1);
      return (safeIndex - 1 + slides.length) % slides.length;
    });
  }

  function showNext() {
    if (slides.length < 2) {
      return;
    }

    pauseAfterInteraction();
    setCurrentIndex((index) => {
      const safeIndex = Math.min(index, slides.length - 1);
      return (safeIndex + 1) % slides.length;
    });
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

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFocused(false);
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
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlur}
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

      <button
        className="album-arrow album-arrow-previous"
        type="button"
        aria-label="Ảnh trước"
        disabled={slides.length < 2}
        onClick={showPrevious}
      >
        ←
      </button>
      <button
        className="album-arrow album-arrow-next"
        type="button"
        aria-label="Ảnh tiếp theo"
        disabled={slides.length < 2}
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
                pauseAfterInteraction();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
