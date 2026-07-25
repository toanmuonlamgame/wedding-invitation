"use client";

import { useEffect, useRef, useState } from "react";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import { wedding } from "@/src/lib/wedding-data";

type YouTubePlayer = {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
};

type YouTubeStateEvent = {
  data: number;
};

type YouTubePlayerOptions = {
  width: string;
  height: string;
  videoId: string;
  host?: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubeStateEvent) => void;
    onError: () => void;
    onAutoplayBlocked: () => void;
  };
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: YouTubePlayerOptions,
  ) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      if (window.YT) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API did not initialize."));
      }
    };

    const existingScript = document.getElementById("youtube-iframe-api");
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube API failed to load."));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

export function MusicSection() {
  const { isOpened } = useWeddingExperience();
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [status, setStatus] = useState(
    "Video chỉ được tải sau khi bạn mở thiệp.",
  );

  useEffect(() => {
    if (!isOpened || !playerHostRef.current) {
      return;
    }

    let cancelled = false;
    const fallbackAudio = fallbackAudioRef.current;
    if (fallbackAudio) {
      fallbackAudio.volume = wedding.musicVolume;
    }

    const playLocalFallback = () => {
      if (cancelled || !fallbackAudio) {
        return;
      }

      setIsUsingFallback(true);
      setIsUnavailable(false);
      setStatus("Đang chuyển sang bản nhạc dự phòng nội bộ.");
      fallbackAudio.load();
      void fallbackAudio.play().catch(() => {
        setIsPlaying(false);
        setStatus("Hãy bấm nút nhạc để phát bản dự phòng nội bộ.");
      });
    };

    void loadYouTubeApi()
      .then((youtube) => {
        if (cancelled || !playerHostRef.current) {
          return;
        }

        playerRef.current = new youtube.Player(playerHostRef.current, {
          width: "100%",
          height: "100%",
          videoId: wedding.youtubeVideoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 1,
            controls: 1,
            loop: 1,
            playlist: wedding.youtubeVideoId,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(wedding.musicVolume * 100);
              setIsReady(true);
              setStatus("Trình phát đã sẵn sàng.");
              event.target.playVideo();
            },
            onStateChange: (event) => {
              const playing = event.data === youtube.PlayerState.PLAYING;
              setIsPlaying(playing);
              setStatus(
                playing
                  ? "Đang phát nhạc từ YouTube."
                  : "Nhạc YouTube đang tạm dừng.",
              );
            },
            onError: () => {
              setIsPlaying(false);
              playLocalFallback();
            },
            onAutoplayBlocked: () => {
              setIsPlaying(false);
              setStatus(
                "Trình duyệt đã chặn autoplay. Hãy bấm nút phát nhạc.",
              );
            },
          },
        });
      })
      .catch(() => {
        playLocalFallback();
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      fallbackAudio?.pause();
    };
  }, [isOpened]);

  function handleToggle() {
    if (isUnavailable) {
      return;
    }

    if (isUsingFallback && fallbackAudioRef.current) {
      if (isPlaying) {
        fallbackAudioRef.current.pause();
      } else {
        void fallbackAudioRef.current.play().catch(() => {
          setStatus("Trình duyệt chưa cho phép phát nhạc. Vui lòng thử lại.");
        });
      }
      return;
    }

    if (!playerRef.current || !isReady) {
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  return (
    <section
      className="section youtube-music-section"
      aria-labelledby="music-title"
    >
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Giai điệu ngày vui"
            title="Nhạc nền của thiệp"
            titleId="music-title"
            description="Nhạc được phát từ video YouTube bạn đã chọn sau khi mở thiệp; bản WAV nội bộ sẽ tự thay thế nếu trình phát ngoài không khả dụng."
          />
        </div>

        <div className="youtube-music-layout" data-reveal>
          <div className="youtube-player-frame">
            <div ref={playerHostRef} className="youtube-player-host">
              {!isOpened ? (
                <p>Hãy mở thiệp để tải trình phát YouTube.</p>
              ) : (
                <p>Đang kết nối với YouTube…</p>
              )}
            </div>
          </div>

          <div className="youtube-music-copy">
            <p className="section-eyebrow">Đang chọn phát</p>
            <h3>{wedding.musicTitle}</h3>
            <p>
              {isUsingFallback
                ? "Đang dùng bản nhạc dự phòng nội bộ."
                : "Nếu autoplay bị trình duyệt chặn, bạn có thể dùng nút nhạc cố định hoặc nút phát trực tiếp trên video."}
            </p>
            <a
              href={wedding.musicUrl}
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
            <audio
              ref={fallbackAudioRef}
              src={wedding.musicFallbackSrc}
              preload="none"
              onCanPlay={() => setIsReady(true)}
              onPlay={() => {
                setIsPlaying(true);
                setStatus("Đang phát bản nhạc dự phòng nội bộ.");
              }}
              onPause={() => {
                setIsPlaying(false);
                setStatus("Nhạc dự phòng nội bộ đang tạm dừng.");
              }}
              onError={() => {
                setIsPlaying(false);
                setIsUnavailable(true);
                setStatus("Không thể phát nhạc nền trên thiết bị này.");
              }}
            />
          </div>
        </div>
      </div>

      {isOpened ? (
        <MusicPlayer
          isPlaying={isPlaying}
          isLoading={!isReady && !isUnavailable}
          isUnavailable={isUnavailable}
          onToggle={handleToggle}
        />
      ) : null}
    </section>
  );
}
