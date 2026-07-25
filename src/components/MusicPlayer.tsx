"use client";

type MusicPlayerProps = {
  isPlaying: boolean;
  isLoading: boolean;
  isUnavailable: boolean;
  onToggle: () => void;
};

export function MusicPlayer({
  isPlaying,
  isLoading,
  isUnavailable,
  onToggle,
}: MusicPlayerProps) {
  const label = isUnavailable
    ? "Không thể phát nhạc nền"
    : isLoading
      ? "Đang tải trình phát nhạc"
      : isPlaying
        ? "Tạm dừng nhạc nền"
        : "Phát nhạc nền";

  return (
    <div className="music-player">
      <span className="music-caption" aria-live="polite">
        {isUnavailable
          ? "Nhạc nền không khả dụng"
          : isLoading
            ? "Đang tải nhạc"
            : isPlaying
              ? "Đang phát nhạc"
              : "Nhạc nền · Đang tạm dừng"}
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
