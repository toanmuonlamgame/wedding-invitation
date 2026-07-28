"use client";

import { useEffect, useRef, useState } from "react";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import type { MusicSettings } from "@/src/types/wedding";

const SESSION_KEY = "wedding-music-enabled";

export function MusicSection({ settings }: { settings: MusicSettings }) {
  const { isOpened } = useWeddingExperience();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [status, setStatus] = useState("Nhạc sẽ được tải sau khi bạn mở thiệp.");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isOpened || !settings.enabled) return;
    audio.volume = Math.min(0.35, Math.max(0.2, settings.volume));
    audio.loop = settings.loop;
    const sessionPreference = window.sessionStorage.getItem(SESSION_KEY);
    const shouldPlay =
      sessionPreference === "on" ||
      (sessionPreference === null && settings.autoplayAfterOpen);
    if (!shouldPlay) return;
    void audio.play().catch(() => {
      setStatus("Trình duyệt đã chặn tự phát. Bấm nút nhạc để bắt đầu.");
    });
    return () => audio.pause();
  }, [isOpened, settings]);

  function handleToggle() {
    const audio = audioRef.current;
    if (!audio || isUnavailable) return;
    if (isPlaying) {
      audio.pause();
      window.sessionStorage.setItem(SESSION_KEY, "off");
    } else {
      void audio.play().then(() => {
        window.sessionStorage.setItem(SESSION_KEY, "on");
      }).catch(() => setStatus("Thiết bị chưa cho phép phát nhạc. Vui lòng thử lại."));
    }
  }

  if (!settings.enabled) return null;

  return (
    <section className="section background-music-section" aria-labelledby="music-title">
      <div className="section-shell" data-reveal>
        <SectionHeading
          eyebrow="Giai điệu ngày vui"
          title={settings.title}
          titleId="music-title"
          description="Nhạc nền nội bộ được phát nhẹ sau khi mở thiệp và có thể bật hoặc tắt bất cứ lúc nào."
        />
        <p className="youtube-status" role="status">{status}</p>
        <audio
          ref={audioRef}
          src={settings.src}
          preload="none"
          onCanPlay={() => setIsReady(true)}
          onPlay={() => {
            setIsPlaying(true);
            setStatus("Đang phát nhạc nền.");
          }}
          onPause={() => {
            setIsPlaying(false);
            setStatus("Nhạc nền đang tạm dừng.");
          }}
          onError={() => {
            setIsUnavailable(true);
            setStatus("Không thể phát tệp nhạc nền trên thiết bị này.");
          }}
        />
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
