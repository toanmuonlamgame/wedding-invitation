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
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

export function HeroCollage({
  images,
  intervalMs,
}: {
  images: GalleryMoment[];
  intervalMs: number;
}) {
  const { messages } = useInvitationLocale();
  const slides = useMemo(
    () =>
      images
        .filter((image) => image.visible && image.available && Boolean(image.src))
        .slice(0, 12),
    [images],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);
  const touchStartX = useRef<number | null>(null);

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
    if (paused || hovered || slides.length < 2) return;
    const timer = window.setInterval(
      () => setCurrentIndex((index) => getNextAlbumIndex(index, slides.length)),
      normalizeAlbumInterval(intervalMs),
    );
    return () => window.clearInterval(timer);
  }, [autoplayEpoch, hovered, intervalMs, paused, slides.length]);

  if (!slides.length) return null;
  const safeIndex = Math.min(currentIndex, slides.length - 1);
  const current = slides[safeIndex];

  function select(index: number) {
    setAutoplayEpoch((epoch) => epoch + 1);
    setCurrentIndex(index);
  }

  function move(direction: -1 | 1) {
    if (slides.length < 2) return;
    setAutoplayEpoch((epoch) => epoch + 1);
    setCurrentIndex((index) =>
      getNextAlbumIndex(index, slides.length, direction),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined || Math.abs(start - end) < 45) return;
    move(start > end ? 1 : -1);
  }

  return (
    <section
      className="hero-collage-section"
      aria-labelledby="album-title"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={onTouchEnd}
    >
      <div className="section-shell">
        <header className="compact-section-heading">
          <p className="section-eyebrow">{messages.album.eyebrow}</p>
          <h2 className="section-title" id="album-title">
            {messages.album.title}
          </h2>
        </header>
        <div className="hero-collage" data-count={Math.min(slides.length, 7)}>
          <figure className="hero-collage-main">
            <WeddingImage
              src={current.src}
              available
              alt={current.alt}
              sizes="(max-width: 896px) 100vw, 60vw"
              className="hero-collage-image"
              framing={current}
            />
            {current.caption ? <figcaption>{current.caption}</figcaption> : null}
          </figure>
          {slides.length > 1 ? (
            <div className="hero-collage-secondary" aria-label={messages.album.choose}>
              {slides.slice(0, 7).map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  aria-label={messages.album.select(index + 1, slide.caption || slide.alt)}
                  aria-current={index === safeIndex ? "true" : undefined}
                  onClick={() => select(index)}
                >
                  <WeddingImage
                    src={slide.src}
                    available
                    alt=""
                    sizes="10rem"
                    className="hero-collage-thumb"
                    framing={slide}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {slides.length > 1 ? (
          <div className="hero-collage-controls">
            <button type="button" onClick={() => move(-1)} aria-label={messages.album.previous}>
              ←
            </button>
            <span>{safeIndex + 1} / {slides.length}</span>
            <button type="button" onClick={() => move(1)} aria-label={messages.album.next}>
              →
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
