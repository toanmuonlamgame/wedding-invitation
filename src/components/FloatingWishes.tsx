"use client";

import { useEffect, useMemo, useState } from "react";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import type { PublicWeddingWish } from "@/src/types/engagement";
import type { WeddingExperienceSettings } from "@/src/types/wedding";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

const SESSION_KEY = "wedding-floating-wishes";

export function FloatingWishes({
  wishes,
  settings,
}: {
  wishes: PublicWeddingWish[];
  settings: WeddingExperienceSettings["wishes"];
}) {
  const { messages } = useInvitationLocale();
  const { isOpened } = useWeddingExperience();
  const [enabled, setEnabled] = useState(settings.overlayEnabled);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [documentHidden, setDocumentHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [temporarilyHidden, setTemporarilyHidden] = useState(false);
  const [protectedAreaVisible, setProtectedAreaVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.sessionStorage.getItem(SESSION_KEY);
      if (stored === "on" || stored === "off") {
        setEnabled(stored === "on");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateVisibility = () => setDocumentHidden(document.hidden);
    const updateMotion = () => setReducedMotion(media.matches);
    updateVisibility();
    updateMotion();
    document.addEventListener("visibilitychange", updateVisibility);
    media.addEventListener("change", updateMotion);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!settings.autoHideWhenTyping) return;

    const updateFromFocus = () => {
      const active = document.activeElement;
      setTemporarilyHidden(
        active instanceof HTMLElement &&
          Boolean(active.closest("form")) &&
          /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName),
      );
    };
    const updateFromDialogs = () => {
      const hasOpenDialog = Boolean(
        document.querySelector(
          'dialog[open], [role="dialog"]:not(.invitation-cover)',
        ),
      );
      if (hasOpenDialog) setTemporarilyHidden(true);
      else updateFromFocus();
    };
    const observer = new MutationObserver(updateFromDialogs);
    let focusTimer: number | undefined;
    const handleFocusOut = () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(updateFromDialogs, 0);
    };
    document.addEventListener("focusin", updateFromFocus);
    document.addEventListener("focusout", handleFocusOut);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "aria-hidden"],
    });
    return () => {
      document.removeEventListener("focusin", updateFromFocus);
      document.removeEventListener("focusout", handleFocusOut);
      if (focusTimer) window.clearTimeout(focusTimer);
      observer.disconnect();
    };
  }, [settings.autoHideWhenTyping]);

  useEffect(() => {
    let frame = 0;
    const updateCollision = () => {
      frame = 0;
      const laneTop = window.innerHeight - 280;
      const selectors = [
        ".countdown",
        ".venue-actions",
        ".hero-collage-controls",
        ".rsvp-form",
        ".wish-form",
        ".creator-form",
      ];
      const collides = selectors.some((selector) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)).some(
          (element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.bottom > laneTop && bounds.top < window.innerHeight;
          },
        ),
      );
      setProtectedAreaVisible(collides);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(updateCollision);
    };
    updateCollision();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      reducedMotion ||
      documentHidden ||
      temporarilyHidden ||
      protectedAreaVisible ||
      wishes.length < 2
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setCurrentIndex((index) => (index + 1) % wishes.length),
      settings.intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [
    documentHidden,
    enabled,
    reducedMotion,
    settings.intervalMs,
    temporarilyHidden,
    protectedAreaVisible,
    wishes.length,
  ]);

  const visibleWishes = useMemo(() => {
    if (!wishes.length) return [];
    const count = reducedMotion
      ? 1
      : Math.min(settings.visibleCount, wishes.length);
    return Array.from({ length: count }, (_, offset) => {
      const index =
        (currentIndex - (count - 1 - offset) + wishes.length) % wishes.length;
      return wishes[index];
    });
  }, [currentIndex, reducedMotion, settings.visibleCount, wishes]);

  if (!isOpened || !settings.overlayEnabled || !wishes.length) return null;

  return (
    <>
      <div
        className="floating-wishes-lane"
        data-hidden={!enabled || temporarilyHidden || protectedAreaVisible}
        data-preset={settings.preset}
        data-reduced-motion={reducedMotion}
        style={{ "--wish-overlay-opacity": settings.opacity } as React.CSSProperties}
        aria-hidden="true"
      >
        {visibleWishes.map((wish, index) => (
          <div
            className="floating-wish-bubble"
            key={`${currentIndex}-${wish.createdAt}-${index}`}
          >
            <strong>{wish.senderName}</strong>
            <span>{wish.message}</span>
          </div>
        ))}
      </div>
      <button
        className="floating-wishes-toggle"
        type="button"
        aria-pressed={enabled}
        data-hidden={temporarilyHidden || protectedAreaVisible}
        onClick={() => {
          const next = !enabled;
          setEnabled(next);
          window.sessionStorage.setItem(SESSION_KEY, next ? "on" : "off");
        }}
      >
        {enabled ? messages.wishes.hideOverlay : messages.wishes.showOverlay}
      </button>
    </>
  );
}
