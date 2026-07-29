"use client";

import { useEffect, useRef, useState } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import { getNextStoryImageIndex } from "@/src/lib/story-chapters";
import type { StoryImage } from "@/src/types/wedding";

const STORY_AUTOPLAY_MS = 5_000;
const SWIPE_THRESHOLD_PX = 42;

export function StoryImageCollection({
  images,
  context,
}: {
  images: StoryImage[];
  context: "card" | "dialog";
}) {
  const availableImages = images.filter(
    (image) => image.available && image.src.trim(),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (
      availableImages.length <= 1 ||
      isPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        getNextStoryImageIndex(availableImages.length, current, 1),
      );
    }, STORY_AUTOPLAY_MS);
    return () => window.clearInterval(interval);
  }, [availableImages.length, isPaused]);

  if (!availableImages.length) return null;

  const currentIndex =
    activeIndex < availableImages.length ? activeIndex : 0;
  const activeImage = availableImages[currentIndex];
  const hasMultipleImages = availableImages.length > 1;

  function move(direction: -1 | 1) {
    setActiveIndex((current) =>
      getNextStoryImageIndex(availableImages.length, current, direction),
    );
  }

  return (
    <div
      className={`story-image-carousel story-image-carousel-${context}`}
      aria-label={`${availableImages.length} ảnh trong chương`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
        setIsPaused(true);
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        setIsPaused(false);
        if (startX === null || endX === undefined) return;
        const distance = endX - startX;
        if (Math.abs(distance) >= SWIPE_THRESHOLD_PX) {
          move(distance < 0 ? 1 : -1);
        }
      }}
    >
      <div
        className="story-image-frame"
        data-fit-mode={activeImage.fitMode}
        key={activeImage.id}
      >
        <WeddingImage
          src={activeImage.src}
          available={activeImage.available}
          alt={activeImage.alt}
          sizes={
            context === "dialog"
              ? "(max-width: 896px) 100vw, 46vw"
              : "(max-width: 896px) 100vw, 33vw"
          }
          className="story-image"
          framing={activeImage}
        />
      </div>

      {hasMultipleImages ? (
        <>
          <button
            className="story-carousel-button story-carousel-previous"
            type="button"
            aria-label="Ảnh trước"
            onClick={() => move(-1)}
          >
            ←
          </button>
          <button
            className="story-carousel-button story-carousel-next"
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={() => move(1)}
          >
            →
          </button>
          <div
            className="story-carousel-dots"
            role="group"
            aria-label="Chọn ảnh trong chương"
          >
            {availableImages.map((image, index) => (
              <button
                type="button"
                key={image.id}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <span className="story-carousel-counter" aria-live="polite">
            {currentIndex + 1} / {availableImages.length}
          </span>
        </>
      ) : null}
    </div>
  );
}
