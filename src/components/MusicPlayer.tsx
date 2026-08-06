"use client";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

type MusicPlayerProps = {
  isPlaying: boolean;
  isLoading: boolean;
  isUnavailable: boolean;
  onToggle: () => void;
  sourceLabel?: string;
  stacked?: boolean;
};

export function MusicPlayer({
  isPlaying,
  isLoading,
  isUnavailable,
  onToggle,
  sourceLabel = "nhạc nền",
  stacked = false,
}: MusicPlayerProps) {
  const { messages } = useInvitationLocale();
  const translatedSource =
    sourceLabel === "nhạc YouTube"
      ? messages.music.youtube
      : messages.music.background;
  const label = isUnavailable
    ? messages.music.unavailable(translatedSource)
    : isLoading
      ? messages.music.loading(translatedSource)
      : isPlaying
        ? messages.music.pause(translatedSource)
        : messages.music.play(translatedSource);

  return (
    <div
      className="music-player"
      data-stacked={stacked || undefined}
      data-source={sourceLabel === "nhạc YouTube" ? "youtube" : "background"}
    >
      <span className="music-caption" aria-live="polite">
        {isUnavailable
          ? messages.music.captionUnavailable(translatedSource)
          : isLoading
            ? messages.music.captionLoading(translatedSource)
            : isPlaying
              ? messages.music.captionPlaying(translatedSource)
              : messages.music.captionPaused(translatedSource)}
      </span>
      <button
        className="music-button"
        type="button"
        data-playing={isPlaying}
        aria-label={label}
        aria-pressed={isPlaying}
        disabled={isLoading || isUnavailable}
        onClick={onToggle}
      >
        <span className="music-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
