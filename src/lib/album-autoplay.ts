export const DEFAULT_ALBUM_INTERVAL_MS = 5_000;
export const MIN_ALBUM_INTERVAL_MS = 2_000;
export const MAX_ALBUM_INTERVAL_MS = 30_000;

export function normalizeAlbumInterval(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_ALBUM_INTERVAL_MS ||
    parsed > MAX_ALBUM_INTERVAL_MS
  ) {
    return DEFAULT_ALBUM_INTERVAL_MS;
  }

  return Math.round(parsed);
}

export function getNextAlbumIndex(
  currentIndex: number,
  slideCount: number,
  direction: 1 | -1 = 1,
) {
  if (slideCount <= 1) return 0;
  const safeIndex = Math.min(
    Math.max(Math.trunc(currentIndex), 0),
    slideCount - 1,
  );
  return (safeIndex + direction + slideCount) % slideCount;
}
