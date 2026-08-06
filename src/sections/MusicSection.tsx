"use client";

import { useEffect, useRef, useState } from "react";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { SectionHeading } from "@/src/components/SectionHeading";
import { useWeddingExperience } from "@/src/components/WeddingExperience";
import type { MusicSettings } from "@/src/types/wedding";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

const SESSION_KEY = "wedding-music-enabled";

export function MusicSection({ settings }: { settings: MusicSettings }) {
  const { language, messages } = useInvitationLocale();
  const { isOpened } = useWeddingExperience();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [status, setStatus] = useState(messages.music.willLoad);

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
      setStatus(messages.music.blocked);
    });
    return () => audio.pause();
  }, [isOpened, messages.music.blocked, settings]);

  useEffect(() => {
    const pauseForYouTube = () => audioRef.current?.pause();
    window.addEventListener("wedding-youtube-playing", pauseForYouTube);
    return () =>
      window.removeEventListener("wedding-youtube-playing", pauseForYouTube);
  }, []);

  function handleToggle() {
    const audio = audioRef.current;
    if (!audio || isUnavailable) return;
    if (isPlaying) {
      audio.pause();
      window.sessionStorage.setItem(SESSION_KEY, "off");
    } else {
      void audio.play().then(() => {
        window.sessionStorage.setItem(SESSION_KEY, "on");
        window.dispatchEvent(new Event("wedding-background-audio-playing"));
      }).catch(() => setStatus(messages.music.deviceDenied));
    }
  }

  if (!settings.enabled) return null;

  return (
    <section className="section background-music-section" aria-labelledby="music-title">
      <div className="section-shell" data-reveal>
        <SectionHeading
          eyebrow={messages.music.eyebrow}
          title={language === "ko" ? messages.music.title : settings.title}
          titleId="music-title"
          description={messages.music.description}
        />
        <p className="youtube-status" role="status">{status}</p>
        <audio
          ref={audioRef}
          src={settings.src}
          preload="none"
          onCanPlay={() => setIsReady(true)}
          onPlay={() => {
            setIsPlaying(true);
            setStatus(messages.music.playingStatus);
            window.dispatchEvent(new Event("wedding-background-audio-playing"));
          }}
          onPause={() => {
            setIsPlaying(false);
            setStatus(messages.music.pausedStatus);
          }}
          onError={() => {
            setIsUnavailable(true);
            setStatus(messages.music.fileUnavailable);
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
