"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import type { YouTubeSettings } from "@/src/types/wedding";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

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
      width?: string;
      height?: string;
      videoId?: string;
      playerVars?: Record<string, string | number>;
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
  const { language, messages } = useInvitationLocale();
  const { isOpened } = useWeddingExperience();
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [status, setStatus] = useState(
    messages.youtube.willLoad,
  );
  const videoId = useMemo(() => getYouTubeId(settings.url), [settings.url]);

  useEffect(() => {
    if (
      !settings.enabled ||
      !isOpened ||
      !videoId ||
      !playerHostRef.current
    ) {
      return;
    }

    let cancelled = false;
    setIsReady(false);
    setIsPlaying(false);
    setIsUnavailable(false);
    void loadYouTubeApi()
      .then((youtube) => {
        if (cancelled || !playerHostRef.current) return;
        playerRef.current = new youtube.Player(playerHostRef.current, {
          videoId,
          playerVars: {
            origin: window.location.origin,
            autoplay: 1,
            controls: 1,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            rel: 0,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(28);
              setIsReady(true);
              setIsUnavailable(false);
              setStatus(messages.youtube.ready);
              event.target.playVideo();
            },
            onStateChange: (event) => {
              const playing = event.data === youtube.PlayerState.PLAYING;
              setIsPlaying(playing);
              setStatus(
                playing
                  ? messages.youtube.playing
                  : messages.youtube.paused,
              );
            },
            onError: () => {
              setIsPlaying(false);
              setIsUnavailable(true);
              setStatus(messages.youtube.unavailable);
            },
            onAutoplayBlocked: () => {
              setIsPlaying(false);
              setIsReady(true);
              setStatus(
                messages.youtube.blocked,
              );
            },
          },
        });
      })
      .catch(() => {
        setIsPlaying(false);
        setIsUnavailable(true);
        setStatus(messages.youtube.connectionFailed);
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [
    isOpened,
    messages.youtube.blocked,
    messages.youtube.connectionFailed,
    messages.youtube.paused,
    messages.youtube.playing,
    messages.youtube.ready,
    messages.youtube.unavailable,
    settings.enabled,
    videoId,
  ]);

  function handleToggle() {
    if (!playerRef.current || !isReady || isUnavailable) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      return;
    }
    playerRef.current.playVideo();
  }

  if (!settings.enabled || !videoId) return null;

  return (
    <section className="section youtube-music-section" aria-labelledby="youtube-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow={messages.youtube.eyebrow}
            title={language === "ko" ? messages.youtube.title : settings.title}
            titleId="youtube-title"
            description={language === "ko" ? messages.youtube.description : settings.description}
          />
        </div>
        <div className="youtube-music-layout" data-reveal>
          <div className="youtube-player-frame">
            <div className="youtube-player-host" data-loaded={isOpened}>
              {isOpened ? (
                <div ref={playerHostRef} />
              ) : (
                <p>{messages.youtube.openFirst}</p>
              )}
            </div>
          </div>
          <div className="youtube-music-copy">
            <p className="section-eyebrow">{messages.youtube.selected}</p>
            <h3>{language === "ko" ? messages.youtube.title : settings.title}</h3>
            <p>
              {messages.youtube.autoplayHelp}
            </p>
            <a
              href={settings.url}
              target="_blank"
              rel="noreferrer"
              className="youtube-source-link"
            >
              {messages.youtube.openOriginal}
              <span aria-hidden="true">↗</span>
            </a>
            <p className="youtube-status" role="status">
              {status}
            </p>
          </div>
        </div>
      </div>
      {isOpened ? (
        <MusicPlayer
          isPlaying={isPlaying}
          isLoading={!isReady && !isUnavailable}
          isUnavailable={isUnavailable}
          onToggle={handleToggle}
          sourceLabel="nhạc YouTube"
        />
      ) : null}
    </section>
  );
}
