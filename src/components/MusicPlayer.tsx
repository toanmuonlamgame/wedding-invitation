"use client";

type MusicPlayerProps = {
  isPlaying: boolean;
  isUnavailable: boolean;
  onToggle: () => void;
};

export function MusicPlayer({
  isPlaying,
  isUnavailable,
  onToggle,
}: MusicPlayerProps) {
  const label = isUnavailable
    ? "Không thể phát nhạc nền"
    : isPlaying
      ? "Tạm dừng nhạc nền"
      : "Phát nhạc nền";

  return (
    <div className="music-player">
      <span className="music-caption" aria-live="polite">
        {isUnavailable
          ? "Nhạc chưa sẵn sàng"
          : isPlaying
            ? "Đang phát · Khúc nhạc ngày cưới"
            : "Nhạc nền · Đang tạm dừng"}
      </span>
      <button
        className="music-button"
        type="button"
        data-playing={isPlaying}
        aria-label={label}
        aria-pressed={isPlaying}
        disabled={isUnavailable}
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
