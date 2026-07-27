import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_IMAGE_ZOOM,
  imageFramingStyle,
  normalizeImageFraming,
} from "../src/lib/image-framing.ts";

test("normalizeImageFraming supplies backward-compatible defaults", () => {
  assert.deepEqual(normalizeImageFraming(undefined), {
    positionX: 50,
    positionY: 50,
    zoom: 1,
    fitMode: "cover",
    backgroundColor: "#ffffff",
  });
});

test("normalizeImageFraming clamps position and zoom", () => {
  assert.deepEqual(
    normalizeImageFraming({ positionX: -20, positionY: 140, zoom: 9 }),
    {
      positionX: 0,
      positionY: 100,
      zoom: MAX_IMAGE_ZOOM,
      fitMode: "cover",
      backgroundColor: "#ffffff",
    },
  );
});

test("contain always centers the full image on an opaque white background", () => {
  const normalized = normalizeImageFraming({
    fitMode: "contain",
    positionX: 10,
    positionY: 90,
    zoom: 2,
    backgroundColor: "#123456",
  });
  assert.deepEqual(normalized, {
    fitMode: "contain",
    positionX: 50,
    positionY: 50,
    zoom: 1,
    backgroundColor: "#ffffff",
  });
  assert.deepEqual(imageFramingStyle(normalized), {
    objectFit: "contain",
    objectPosition: "center",
    transform: "none",
    transformOrigin: "center",
    backgroundColor: "#ffffff",
  });
});

test("cover preserves crop controls and a valid background color", () => {
  const normalized = normalizeImageFraming({
    fitMode: "cover",
    positionX: 42,
    positionY: 61,
    zoom: 1.4,
    backgroundColor: "#F0F0F0",
  });
  assert.equal(normalized.positionX, 42);
  assert.equal(normalized.positionY, 61);
  assert.equal(normalized.zoom, 1.4);
  assert.equal(normalized.backgroundColor, "#f0f0f0");
  assert.equal(imageFramingStyle(normalized).objectFit, "cover");
});
