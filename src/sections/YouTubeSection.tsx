"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import type { YouTubeSettings } from "@/src/types/wedding";

type YouTubePlayer = {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      videoId: string;
      host: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: () => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("YouTube API did not initialize."));
    };
    if (document.getElementById("youtube-iframe-api")) return;
    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube API failed to load."));
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return (
      parsed.searchParams.get("v") ??
      parsed.pathname.split("/").filter(Boolean).at(-1) ??
      ""
    );
  } catch {
    return "";
  }
}

export function YouTubeSection({ settings }: { settings: YouTubeSettings }) {
  const { isOpened } = useWeddingExperience();
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [status, setStatus] = useState(
    "Video chỉ được tải sau khi bạn mở thiệp.",
  );
  const videoId = useMemo(() => getYouTubeId(settings.url), [settings.url]);

  useEffect(() => {
    if (!settings.enabled || !isOpened || !videoId || !playerHostRef.current) {
      return;
    }

    let cancelled = false;
    void loadYouTubeApi()
      .then((youtube) => {
        if (cancelled || !playerHostRef.current) return;
        playerRef.current = new youtube.Player(playerHostRef.current, {
          width: "100%",
          height: "100%",
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 1,
            controls: 1,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(28);
              setStatus("Trình phát đã sẵn sàng.");
              event.target.playVideo();
            },
            onStateChange: (event) => {
              const playing = event.data === youtube.PlayerState.PLAYING;
              setStatus(
                playing
                  ? "Đang phát nhạc từ YouTube."
                  : "Nhạc YouTube đang tạm dừng.",
              );
              if (playing) {
                window.dispatchEvent(new Event("wedding-youtube-playing"));
              }
            },
            onError: () =>
              setStatus("Không thể phát video YouTube trên thiết bị này."),
            onAutoplayBlocked: () =>
              setStatus(
                "Trình duyệt đã chặn autoplay. Hãy bấm phát trực tiếp trên video.",
              ),
          },
        });
      })
      .catch(() => setStatus("Chưa thể kết nối với YouTube."));

    const pauseForBackgroundAudio = () => playerRef.current?.pauseVideo();
    window.addEventListener(
      "wedding-background-audio-playing",
      pauseForBackgroundAudio,
    );
    return () => {
      cancelled = true;
      window.removeEventListener(
        "wedding-background-audio-playing",
        pauseForBackgroundAudio,
      );
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [isOpened, settings.enabled, videoId]);

  if (!settings.enabled || !videoId) return null;

  return (
    <section className="section youtube-music-section" aria-labelledby="youtube-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Giai điệu ngày vui"
            title={settings.title}
            titleId="youtube-title"
            description={settings.description}
          />
        </div>
        <div className="youtube-music-layout" data-reveal>
          <div className="youtube-player-frame">
            <div ref={playerHostRef} className="youtube-player-host">
              <p>
                {isOpened
                  ? "Đang kết nối với YouTube…"
                  : "Hãy mở thiệp để tải trình phát YouTube."}
              </p>
            </div>
          </div>
          <div className="youtube-music-copy">
            <p className="section-eyebrow">Đang chọn phát</p>
            <h3>{settings.title}</h3>
            <p>
              Nếu autoplay bị chặn, bạn có thể dùng nút phát trực tiếp trên
              video.
            </p>
            <a
              href={settings.url}
              target="_blank"
              rel="noreferrer"
              className="youtube-source-link"
            >
              Xem video gốc trên YouTube
              <span aria-hidden="true">↗</span>
            </a>
            <p className="youtube-status" role="status">
              {status}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
