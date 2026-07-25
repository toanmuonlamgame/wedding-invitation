"use client";

import { useState } from "react";

type VenueActionsProps = {
  address: string;
  mapsUrl: string | null;
  available: boolean;
};

async function copyAddress(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.appendChild(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();

  if (!copied) {
    throw new Error("Clipboard is unavailable.");
  }
}

export function VenueActions({
  address,
  mapsUrl,
  available,
}: VenueActionsProps) {
  const [status, setStatus] = useState("");

  async function handleCopy() {
    try {
      await copyAddress(address);
      setStatus("Đã sao chép địa chỉ.");
    } catch {
      setStatus("Không thể tự sao chép. Địa chỉ vẫn hiển thị ở phía trên.");
    }
  }

  return (
    <div className="venue-actions">
      {mapsUrl ? (
        <a
          className="button"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Mở Google Maps
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <button className="button button-disabled" type="button" disabled>
          Google Maps · Chờ cập nhật
        </button>
      )}
      <button
        className="button button-secondary"
        type="button"
        disabled={!available}
        onClick={handleCopy}
      >
        Sao chép địa chỉ
      </button>
      <p className="venue-copy-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
