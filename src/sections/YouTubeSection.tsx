"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import type { YouTubeSettings } from "@/src/types/wedding";

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).at(-1) ?? "";
  } catch {
    return "";
  }
}

export function YouTubeSection({ settings }: { settings: YouTubeSettings }) {
  const [loaded, setLoaded] = useState(false);
  const videoId = useMemo(() => getYouTubeId(settings.url), [settings.url]);
  if (!settings.enabled || !videoId) return null;

  return (
    <section className="section youtube-section" aria-labelledby="youtube-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Video kỷ niệm"
          title={settings.title}
          titleId="youtube-title"
          description={settings.description}
        />
        <div className="youtube-lazy-player" data-reveal>
          {loaded ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`}
              title={settings.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setLoaded(true)}>
              <span aria-hidden="true">▶</span>
              Xem video
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
