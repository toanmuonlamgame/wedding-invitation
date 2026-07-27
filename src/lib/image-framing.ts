import type { ImageFraming } from "@/src/types/wedding";

export const DEFAULT_IMAGE_FRAMING: ImageFraming = {
  positionX: 50,
  positionY: 50,
  zoom: 1,
};

export const MIN_IMAGE_ZOOM = 1;
export const MAX_IMAGE_ZOOM = 2.5;

export function clampNumber(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

export function normalizeImageFraming(
  framing: Partial<ImageFraming> | null | undefined,
): ImageFraming {
  return {
    positionX: clampNumber(framing?.positionX ?? 50, 0, 100),
    positionY: clampNumber(framing?.positionY ?? 50, 0, 100),
    zoom: clampNumber(framing?.zoom ?? 1, MIN_IMAGE_ZOOM, MAX_IMAGE_ZOOM),
  };
}

export function imageFramingStyle(
  framing: Partial<ImageFraming> | null | undefined,
) {
  const normalized = normalizeImageFraming(framing);
  return {
    objectPosition: `${normalized.positionX}% ${normalized.positionY}%`,
    transform: `scale(${normalized.zoom})`,
    transformOrigin: `${normalized.positionX}% ${normalized.positionY}%`,
  };
}
