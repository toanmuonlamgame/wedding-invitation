import type { Ref } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import type { CoverSettings } from "@/src/types/wedding";

type CoverRendererProps = {
  cover: CoverSettings;
  recipientText?: string;
  onOpen?: () => void;
  openButtonRef?: Ref<HTMLButtonElement>;
  preview?: boolean;
};

export function CoverRenderer({
  cover,
  recipientText,
  onOpen,
  openButtonRef,
  preview = false,
}: CoverRendererProps) {
  return (
    <div
      className="cover-renderer"
      data-align={cover.alignment}
      data-name-size={cover.nameSize}
      data-preview={preview || undefined}
      data-has-background={
        cover.backgroundEnabled && Boolean(cover.backgroundSrc)
      }
    >
      {cover.backgroundEnabled && cover.backgroundSrc ? (
        <WeddingImage
          src={cover.backgroundSrc}
          available
          alt={cover.backgroundAlt}
          sizes={preview ? "(max-width: 640px) 100vw, 24rem" : "100vw"}
          className="cover-background"
          framing={cover.background}
        />
      ) : null}
      <div
        className="cover-overlay"
        aria-hidden="true"
        style={{
          backgroundColor: cover.overlayColor,
          opacity: cover.overlayOpacity,
          backdropFilter: `blur(${cover.blurPx}px)`,
        }}
      />
      {cover.backgroundEnabled && cover.backgroundSrc ? (
        <div className="cover-text-halo" aria-hidden="true" />
      ) : null}
      <div className="cover-content">
        <p className="cover-kicker">{cover.kicker}</p>
        {recipientText ? <p className="cover-recipient">{recipientText}</p> : null}
        {cover.logoMode === "monogram" ? (
          <p className="cover-monogram" aria-hidden="true">
            {cover.monogramText}
          </p>
        ) : null}
        {cover.logoMode === "image" && cover.logoSrc ? (
          <span className="cover-logo" data-size={cover.logoSize}>
            <WeddingImage
              src={cover.logoSrc}
              available
              alt={cover.logoAlt}
              sizes="10rem"
              className="cover-logo-image"
              framing={cover.logoFrame}
            />
          </span>
        ) : null}
        <h1 className="cover-title" id={preview ? undefined : "cover-title"}>
          {cover.brideName}
          <span>{cover.connector}</span>
          {cover.groomName}
        </h1>
        {cover.note ? <p className="cover-note">{cover.note}</p> : null}
        <button
          ref={openButtonRef}
          className="cover-button"
          type="button"
          onClick={onOpen}
          disabled={preview}
          aria-hidden={preview || undefined}
          tabIndex={preview ? -1 : undefined}
        >
          {cover.buttonText}
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </div>
  );
}
