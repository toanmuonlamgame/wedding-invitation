import type { StoryImage } from "@/src/types/wedding";

const LEGACY_IMAGE_FIELDS = [
  "imageSrc",
  "imageStoragePath",
  "imageAlt",
  "positionX",
  "positionY",
  "zoom",
  "fitMode",
  "backgroundColor",
] as const;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeLegacyStoryChapterInput(input: unknown): unknown {
  const source = record(input);
  const normalized = { ...source };
  LEGACY_IMAGE_FIELDS.forEach((field) => delete normalized[field]);

  if (Array.isArray(source.images)) {
    return { ...normalized, images: source.images };
  }

  const imageSrc =
    typeof source.imageSrc === "string" ? source.imageSrc.trim() : "";
  if (!imageSrc) return { ...normalized, images: [] };

  const chapterId =
    typeof source.id === "string" && source.id.trim()
      ? source.id.trim()
      : "chapter";

  return {
    ...normalized,
    images: [
      {
        id: `${chapterId}-image-1`,
        src: imageSrc,
        storagePath:
          typeof source.imageStoragePath === "string"
            ? source.imageStoragePath
            : undefined,
        alt: typeof source.imageAlt === "string" ? source.imageAlt : "",
        positionX: source.positionX,
        positionY: source.positionY,
        zoom: source.zoom,
        fitMode: source.fitMode,
        backgroundColor: source.backgroundColor,
        available:
          typeof source.available === "boolean" ? source.available : true,
      },
    ],
  };
}

export function moveStoryImage<T>(
  images: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  if (
    index < 0 ||
    index >= images.length ||
    target < 0 ||
    target >= images.length
  ) {
    return [...images];
  }
  const next = [...images];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export type StoryImageLayout = "empty" | "single" | "split" | "feature" | "mosaic";

export function getStoryImageLayout(count: number): StoryImageLayout {
  if (count <= 0) return "empty";
  if (count === 1) return "single";
  if (count === 2) return "split";
  if (count === 3) return "feature";
  return "mosaic";
}

export function hasDuplicateStoryImage(
  images: readonly Pick<StoryImage, "src">[],
  src: string,
): boolean {
  const normalizedSrc = src.trim();
  return images.some((image) => image.src.trim() === normalizedSrc);
}
