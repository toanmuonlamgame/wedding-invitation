"use client";

import Image from "next/image";
import { useState } from "react";
import { imageFramingStyle } from "@/src/lib/image-framing";
import { wedding } from "@/src/lib/wedding-data";
import type { ImageFraming } from "@/src/types/wedding";

type WeddingImageProps = {
  src?: string;
  available: boolean;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  framing?: Partial<ImageFraming>;
};

export function WeddingImage({
  src,
  available,
  alt,
  sizes,
  priority = false,
  className = "",
  framing,
}: WeddingImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = src === failedSrc;

  if (src && available && !hasError) {
    return (
      <Image
        className={className}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={imageFramingStyle(framing)}
        onError={() => setFailedSrc(src)}
      />
    );
  }

  return (
    <div
      className={`gallery-fallback ${className}`}
      role="img"
      aria-label={`${alt} — ảnh đang chờ cập nhật`}
    >
      <span>{wedding.monogram}</span>
    </div>
  );
}
