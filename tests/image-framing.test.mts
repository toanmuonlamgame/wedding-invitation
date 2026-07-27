import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_IMAGE_ZOOM,
  normalizeImageFraming,
} from "../src/lib/image-framing.ts";

test("normalizeImageFraming supplies backward-compatible defaults", () => {
  assert.deepEqual(normalizeImageFraming(undefined), {
    positionX: 50,
    positionY: 50,
    zoom: 1,
  });
});

test("normalizeImageFraming clamps position and zoom", () => {
  assert.deepEqual(
    normalizeImageFraming({ positionX: -20, positionY: 140, zoom: 9 }),
    {
      positionX: 0,
      positionY: 100,
      zoom: MAX_IMAGE_ZOOM,
    },
  );
});
