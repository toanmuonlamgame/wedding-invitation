"use client";

import { useState } from "react";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

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
  const { messages } = useInvitationLocale();
  const [status, setStatus] = useState("");

  async function handleCopy() {
    try {
      await copyAddress(address);
      setStatus(messages.venue.copied);
    } catch {
      setStatus(messages.venue.copyFailed);
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
          {messages.venue.openMaps}
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <button className="button button-disabled" type="button" disabled>
          {messages.venue.mapsPending}
        </button>
      )}
      <button
        className="button button-secondary"
        type="button"
        disabled={!available}
        onClick={handleCopy}
      >
        {messages.venue.copyAddress}
      </button>
      <p className="venue-copy-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
