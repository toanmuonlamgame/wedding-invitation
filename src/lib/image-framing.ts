import type { ImageFraming } from "@/src/types/wedding";

export const DEFAULT_IMAGE_FRAMING: ImageFraming = {
  positionX: 50,
  positionY: 50,
  zoom: 1,
  fitMode: "cover",
  backgroundColor: "#ffffff",
};

export const MIN_IMAGE_ZOOM = 1;
export const MAX_IMAGE_ZOOM = 2.5;
export const MAX_CONTAIN_IMAGE_ZOOM = 1.8;

export function clampNumber(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

export function normalizeImageFraming(
  framing: Partial<ImageFraming> | null | undefined,
): ImageFraming {
  const fitMode = framing?.fitMode === "contain" ? "contain" : "cover";
  const backgroundColor =
    typeof framing?.backgroundColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(framing.backgroundColor.trim())
      ? framing.backgroundColor.trim().toLowerCase()
      : "#ffffff";

  return {
    positionX: clampNumber(framing?.positionX ?? 50, 0, 100),
    positionY: clampNumber(framing?.positionY ?? 50, 0, 100),
    zoom: clampNumber(
      framing?.zoom ?? 1,
      MIN_IMAGE_ZOOM,
      fitMode === "contain" ? MAX_CONTAIN_IMAGE_ZOOM : MAX_IMAGE_ZOOM,
    ),
    fitMode,
    backgroundColor: fitMode === "contain" ? "#ffffff" : backgroundColor,
  };
}

export function resetImageFraming(
  fitMode: ImageFraming["fitMode"] = DEFAULT_IMAGE_FRAMING.fitMode,
) {
  return normalizeImageFraming({ ...DEFAULT_IMAGE_FRAMING, fitMode });
}

export function imageFramingStyle(
  framing: Partial<ImageFraming> | null | undefined,
) {
  const normalized = normalizeImageFraming(framing);
  if (normalized.fitMode === "contain") {
    return {
      objectFit: "contain" as const,
      objectPosition: `${normalized.positionX}% ${normalized.positionY}%`,
      transform: `scale(${normalized.zoom})`,
      transformOrigin: `${normalized.positionX}% ${normalized.positionY}%`,
      backgroundColor: normalized.backgroundColor,
    };
  }

  return {
    objectFit: "cover" as const,
    objectPosition: `${normalized.positionX}% ${normalized.positionY}%`,
    transform: `scale(${normalized.zoom})`,
    transformOrigin: `${normalized.positionX}% ${normalized.positionY}%`,
    backgroundColor: normalized.backgroundColor,
  };
}
