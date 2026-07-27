import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ALBUM_INTERVAL_MS,
  MAX_ALBUM_INTERVAL_MS,
  MIN_ALBUM_INTERVAL_MS,
  getNextAlbumIndex,
  normalizeAlbumInterval,
} from "../src/lib/album-autoplay.ts";

test("album interval keeps valid content values and defaults invalid values", () => {
  assert.equal(normalizeAlbumInterval(MIN_ALBUM_INTERVAL_MS), 2_000);
  assert.equal(normalizeAlbumInterval(MAX_ALBUM_INTERVAL_MS), 30_000);
  assert.equal(normalizeAlbumInterval(Number.NaN), DEFAULT_ALBUM_INTERVAL_MS);
  assert.equal(normalizeAlbumInterval(1_000), DEFAULT_ALBUM_INTERVAL_MS);
  assert.equal(normalizeAlbumInterval(60_000), DEFAULT_ALBUM_INTERVAL_MS);
});

test("album does not advance with zero or one slide", () => {
  assert.equal(getNextAlbumIndex(0, 0), 0);
  assert.equal(getNextAlbumIndex(0, 1), 0);
});

test("album advances and loops from the last slide to the first", () => {
  assert.equal(getNextAlbumIndex(0, 4), 1);
  assert.equal(getNextAlbumIndex(3, 4), 0);
  assert.equal(getNextAlbumIndex(0, 4, -1), 3);
});
