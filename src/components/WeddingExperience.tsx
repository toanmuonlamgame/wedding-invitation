"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { wedding } from "@/src/lib/wedding-data";

gsap.registerPlugin(ScrollTrigger);

type WeddingExperienceProps = {
  children: React.ReactNode;
};

export function WeddingExperience({ children }: WeddingExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioUnavailable, setIsAudioUnavailable] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (!isOpened) {
      document.body.style.overflow = "hidden";
      openButtonRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpened]);

  useLayoutEffect(() => {
    if (!isOpened || !rootRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            "[data-hero-reveal]",
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 1.05, stagger: 0.12 },
          );

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 34 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                once: true,
              },
            },
          );
        });

        gsap.utils
          .toArray<HTMLElement>("[data-gallery-reveal]")
          .forEach((element, index) => {
            gsap.fromTo(
              element,
              { opacity: 0, clipPath: "inset(12% 12% 12% 12%)", scale: 1.05 },
              {
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                scale: 1,
                duration: 1.1,
                delay: index * 0.05,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });
      });

      return () => media.revert();
    }, rootRef);

    return () => context.revert();
  }, [isOpened]);

  async function tryPlayMusic() {
    if (!audioRef.current || isAudioUnavailable) {
      return;
    }

    try {
      await audioRef.current.play();
    } catch {
      setIsPlaying(false);
      setIsAudioUnavailable(true);
    }
  }

  function handleOpen() {
    setIsOpened(true);
    document.body.style.overflow = "";
    void tryPlayMusic();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setShowCover(false);
      return;
    }

    gsap
      .timeline({ onComplete: () => setShowCover(false) })
      .to(".cover-content", {
        autoAlpha: 0,
        y: -18,
        duration: 0.45,
        ease: "power2.in",
      })
      .to(
        ".invitation-cover",
        {
          autoAlpha: 0,
          scale: 1.025,
          duration: 0.75,
          ease: "power3.inOut",
        },
        "-=0.05",
      );
  }

  function handleMusicToggle() {
    const audio = audioRef.current;
    if (!audio || isAudioUnavailable) {
      return;
    }

    if (audio.paused) {
      void tryPlayMusic();
    } else {
      audio.pause();
    }
  }

  return (
    <div ref={rootRef}>
      {showCover ? (
        <div
          className="invitation-cover"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cover-title"
        >
          <div className="cover-flourish cover-flourish-left" aria-hidden="true" />
          <div className="cover-flourish cover-flourish-right" aria-hidden="true" />
          <div className="cover-content">
            <p className="cover-kicker">Trân trọng kính mời</p>
            <p className="cover-monogram" aria-hidden="true">
              {wedding.monogram}
            </p>
            <h1 className="cover-title" id="cover-title">
              {wedding.bride}
              <span>&amp;</span>
              {wedding.groom}
            </h1>
            <p className="cover-note">
              Có một lời mời nhỏ đang chờ bạn mở ra
            </p>
            <button
              ref={openButtonRef}
              className="cover-button"
              type="button"
              onClick={handleOpen}
            >
              Mở thiệp
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="experience-content" inert={!isOpened} aria-hidden={!isOpened}>
        {children}
      </div>

      {isOpened ? (
        <MusicPlayer
          isPlaying={isPlaying}
          isUnavailable={isAudioUnavailable}
          onToggle={handleMusicToggle}
        />
      ) : null}

      <audio
        ref={audioRef}
        src={wedding.musicSrc}
        preload="none"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setIsAudioUnavailable(true);
        }}
      />
    </div>
  );
}
