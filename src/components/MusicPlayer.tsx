"use client";

import { useState } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="music-player">
      <span className="music-caption" aria-live="polite">
        {isPlaying ? "Đang phát · Khúc nhạc ngày cưới" : "Nhạc nền · Bản demo"}
      </span>
      <button
        className="music-button"
        type="button"
        data-playing={isPlaying}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        aria-pressed={isPlaying}
        onClick={() => setIsPlaying((current) => !current)}
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
