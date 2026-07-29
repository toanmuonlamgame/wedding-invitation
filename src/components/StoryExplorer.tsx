"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { StoryImageCollection } from "@/src/components/StoryImageCollection";
import type { LoveStoryChapter } from "@/src/types/wedding";

type StoryExplorerProps = {
  chapters: LoveStoryChapter[];
};

export function StoryExplorer({ chapters }: StoryExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedChapter =
    selectedIndex === null ? null : chapters[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const selectedAtOpen = selectedIndex;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>("[data-dialog-close]")
        ?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedIndex(null);
        window.requestAnimationFrame(() =>
          openerRefs.current[selectedAtOpen]?.focus(),
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedIndex((index) =>
          index === null ? null : (index - 1 + chapters.length) % chapters.length,
        );
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedIndex((index) =>
          index === null ? null : (index + 1) % chapters.length,
        );
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chapters.length, selectedIndex]);

  function openDialog(index: number) {
    setSelectedIndex(index);
  }

  function closeDialog() {
    const openerIndex = selectedIndex;
    setSelectedIndex(null);

    if (openerIndex !== null) {
      window.requestAnimationFrame(() => openerRefs.current[openerIndex]?.focus());
    }
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
    }
  }

  if (chapters.length === 0) {
    return null;
  }

  return (
    <>
      <div className="story-chapter-grid">
        {chapters.map((chapter, index) => (
          <article className="story-chapter-card" key={chapter.id} data-story-item>
            <StoryImageCollection images={chapter.images} context="card" />
            <div className="story-chapter-copy">
              <div className="story-chapter-meta">
                <span>{chapter.chapterNumber}</span>
                <span>{chapter.period}</span>
              </div>
              <h3>{chapter.title}</h3>
              <p>{chapter.summary}</p>
              <button
                ref={(element) => {
                  openerRefs.current[index] = element;
                }}
                className="text-button story-open-button"
                type="button"
                onClick={() => openDialog(index)}
              >
                Đọc chương
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedChapter ? (
        <div
          className="editorial-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeDialog();
            }
          }}
        >
          <div
            ref={dialogRef}
            className="editorial-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-dialog-title"
            onKeyDown={handleDialogKeyDown}
          >
            <button
              className="dialog-close"
              type="button"
              data-dialog-close
              aria-label="Đóng câu chuyện"
              onClick={closeDialog}
            >
              ×
            </button>
            <div className="editorial-dialog-media">
              <StoryImageCollection
                images={selectedChapter.images}
                context="dialog"
              />
            </div>
            <article className="editorial-dialog-copy">
              <p className="section-eyebrow">
                {selectedChapter.chapterNumber} · {selectedChapter.period}
              </p>
              <h2 id="story-dialog-title">{selectedChapter.title}</h2>
              <p className="story-full-text">{selectedChapter.fullStory}</p>
              <nav className="story-reader-nav" aria-label="Điều hướng chương">
                <button
                  className="text-button"
                  type="button"
                  onClick={() =>
                    setSelectedIndex((index) =>
                      index === null
                        ? 0
                        : (index - 1 + chapters.length) % chapters.length,
                    )
                  }
                >
                  ← Chương trước
                </button>
                <span aria-live="polite">
                  {(selectedIndex ?? 0) + 1} / {chapters.length}
                </span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() =>
                    setSelectedIndex((index) =>
                      index === null ? 0 : (index + 1) % chapters.length,
                    )
                  }
                >
                  Chương sau →
                </button>
              </nav>
            </article>
          </div>
        </div>
      ) : null}
    </>
  );
}
