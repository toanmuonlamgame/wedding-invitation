"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryMoment } from "@/src/types/wedding";

type GalleryVisualProps = {
  moment: GalleryMoment;
  index: number;
};

export function GalleryVisual({ moment, index }: GalleryVisualProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = moment.available && !hasError;

  return (
    <figure
      className={`gallery-item gallery-item-${index + 1}`}
      data-gallery-reveal
    >
      {showImage ? (
        <Image
          className="gallery-image"
          src={moment.src}
          alt={moment.alt}
          fill
          sizes={
            index === 0
              ? "(max-width: 640px) 100vw, 42vw"
              : "(max-width: 640px) 50vw, 29vw"
          }
          priority={index === 0}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="gallery-fallback"
          role="img"
          aria-label={`${moment.alt} — ảnh đang chờ cập nhật`}
        >
          <span>{weddingMonogram}</span>
        </div>
      )}
      <figcaption>{moment.caption}</figcaption>
    </figure>
  );
}

const weddingMonogram = "B · L";
