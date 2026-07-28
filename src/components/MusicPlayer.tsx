"use client";

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
  const label = isUnavailable
    ? `Không thể phát ${sourceLabel}`
    : isLoading
      ? `Đang tải trình phát ${sourceLabel}`
      : isPlaying
        ? `Tạm dừng ${sourceLabel}`
        : `Phát ${sourceLabel}`;

  return (
    <div
      className="music-player"
      data-stacked={stacked || undefined}
      data-source={sourceLabel === "nhạc YouTube" ? "youtube" : "background"}
    >
      <span className="music-caption" aria-live="polite">
        {isUnavailable
          ? `${sourceLabel} không khả dụng`
          : isLoading
            ? `Đang tải ${sourceLabel}`
            : isPlaying
              ? `Đang phát ${sourceLabel}`
              : `${sourceLabel} · Đang tạm dừng`}
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
