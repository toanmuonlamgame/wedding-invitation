"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CoverRenderer } from "@/src/components/CoverRenderer";
import {
  FONT_PRESETS,
  getAppearanceStyle,
  getFontPresetStyle,
} from "@/src/lib/appearance";
import type {
  FontPresetId,
  ThemePresetId,
  CoverSettings,
} from "@/src/types/wedding";
import type { InvitationLanguage } from "@/src/lib/invitation-i18n";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

type WeddingExperienceProps = {
  children: React.ReactNode;
  recipientText?: string;
  themePreset: ThemePresetId;
  fontPreset: FontPresetId;
  cover: CoverSettings;
  adminUrl?: string;
  language?: InvitationLanguage;
};

type WeddingExperienceContextValue = {
  isOpened: boolean;
};

const WeddingExperienceContext =
  createContext<WeddingExperienceContextValue | null>(null);

export function useWeddingExperience() {
  const context = useContext(WeddingExperienceContext);

  if (!context) {
    throw new Error(
      "useWeddingExperience must be used inside WeddingExperience",
    );
  }

  return context;
}

const petals = [
  { left: "7%", delay: "-2.1s", duration: "11.8s", drift: "38px" },
  { left: "18%", delay: "-7.4s", duration: "14.2s", drift: "-24px" },
  { left: "31%", delay: "-4.8s", duration: "12.6s", drift: "46px" },
  { left: "43%", delay: "-9.2s", duration: "15.4s", drift: "-34px" },
  { left: "55%", delay: "-1.5s", duration: "13.7s", drift: "28px" },
  { left: "66%", delay: "-6.3s", duration: "11.4s", drift: "-42px" },
  { left: "77%", delay: "-10.1s", duration: "15.8s", drift: "35px" },
  { left: "88%", delay: "-3.7s", duration: "13.1s", drift: "-27px" },
] as const;

export function WeddingExperience({
  children,
  recipientText,
  themePreset,
  fontPreset,
  cover,
  adminUrl,
  language = "vi",
}: WeddingExperienceProps) {
  const { messages } = useInvitationLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

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

  useEffect(() => {
    const updateVisibility = () => setIsDocumentHidden(document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useLayoutEffect(() => {
    if (!isOpened || !rootRef.current) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (disposed || !rootRef.current) return;
        const { gsap } = gsapModule;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const heroTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        heroTimeline.fromTo(
          "[data-hero-reveal]",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.95, stagger: 0.1 },
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

        gsap.fromTo(
          "[data-invitation-reveal]",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.11,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".invitation-section",
              start: "top 72%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          "[data-ornament-reveal] .ornament",
          { opacity: 0, scaleX: 0.45 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".invitation-section",
              start: "top 72%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          "[data-countdown-item]",
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".countdown",
              start: "top 88%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          "[data-story-item]",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".story-chapter-grid",
              start: "top 78%",
              once: true,
            },
          },
        );

      });

      media.add(
        "(min-width: 56rem) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>("[data-parallax]")
            .forEach((element, index) => {
              gsap.to(element, {
                yPercent: index % 2 === 0 ? 8 : -8,
                ease: "none",
                scrollTrigger: {
                  trigger: element.closest("section") ?? element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              });
            });
        },
      );
        }, rootRef);

        ScrollTrigger.refresh();
        cleanup = () => {
          media.revert();
          context.revert();
        };
      },
    );

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [isOpened]);

  function handleOpen() {
    setIsOpened(true);
    document.body.style.overflow = "";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setShowCover(false);
      window.requestAnimationFrame(() => contentRef.current?.focus());
      return;
    }

    void import("gsap").then(({ gsap }) => {
      gsap
        .timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          setShowCover(false);
          window.requestAnimationFrame(() => contentRef.current?.focus());
        },
      })
      .to(".cover-content", {
        autoAlpha: 0,
        y: -16,
        scale: 0.98,
        duration: 0.38,
        ease: "power2.in",
      })
      .to(
        ".cover-panel-left",
        {
          xPercent: -103,
          rotate: -1.5,
          duration: 0.82,
        },
        "-=0.04",
      )
      .to(
        ".cover-panel-right",
        {
          xPercent: 103,
          rotate: 1.5,
          duration: 0.82,
        },
        "<",
      )
      .to(
        ".invitation-cover",
        {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.18",
        );
    });
  }

  return (
    <WeddingExperienceContext.Provider value={{ isOpened }}>
      <div
        ref={rootRef}
        className={`wedding-theme-root ${FONT_PRESETS[fontPreset].className}`}
        style={
          {
            ...getAppearanceStyle(themePreset),
            ...getFontPresetStyle(fontPreset),
          } as React.CSSProperties
        }
        data-theme={themePreset}
        data-font={fontPreset}
        data-language={language}
        lang={language}
      >
        {adminUrl && !showCover ? (
          <a className="admin-shortcut" href={adminUrl} aria-label={messages.cover.admin} title={messages.cover.admin}>
            <WrenchIcon />
          </a>
        ) : null}
        {showCover ? (
          <div
            className="invitation-cover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-title"
          >
            <div className="cover-panel cover-panel-left" aria-hidden="true" />
            <div className="cover-panel cover-panel-right" aria-hidden="true" />
            <div
              className="cover-flourish cover-flourish-left"
              aria-hidden="true"
            />
            <div
              className="cover-flourish cover-flourish-right"
              aria-hidden="true"
            />
            {adminUrl ? (
              <a className="admin-shortcut admin-shortcut-cover" href={adminUrl} aria-label={messages.cover.admin} title={messages.cover.admin}>
                <WrenchIcon />
              </a>
            ) : null}
            <CoverRenderer
              cover={cover}
              recipientText={recipientText}
              onOpen={handleOpen}
              openButtonRef={openButtonRef}
            />
          </div>
        ) : null}

        {isOpened ? (
          <div
            className="petal-field"
            data-paused={isDocumentHidden}
            aria-hidden="true"
          >
            {petals.map((petal, index) => (
              <span
                className="petal"
                key={`${petal.left}-${petal.delay}`}
                style={
                  {
                    "--petal-left": petal.left,
                    "--petal-delay": petal.delay,
                    "--petal-duration": petal.duration,
                    "--petal-drift": petal.drift,
                    "--petal-scale": 0.72 + (index % 4) * 0.11,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ) : null}

        <div
          ref={contentRef}
          className="experience-content"
          inert={!isOpened}
          aria-hidden={!isOpened}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </WeddingExperienceContext.Provider>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 6.3a4.5 4.5 0 0 0-5.9 5.9L3 18l3 3 5.8-5.8a4.5 4.5 0 0 0 5.9-5.9l-2.6 2.6-3-3 2.6-2.6Z" />
    </svg>
  );
}
