import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_CONTAIN_IMAGE_ZOOM,
  MAX_IMAGE_ZOOM,
  imageFramingStyle,
  normalizeImageFraming,
  resetImageFraming,
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

test("contain at 100% shows the full image on an opaque white background", () => {
  const normalized = normalizeImageFraming({
    fitMode: "contain",
    positionX: 50,
    positionY: 50,
    zoom: 1,
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
    objectPosition: "50% 50%",
    transform: "scale(1)",
    transformOrigin: "50% 50%",
    backgroundColor: "#ffffff",
  });
});

test("contain preserves positioning, supports zoom and clamps its own range", () => {
  const normalized = normalizeImageFraming({
    fitMode: "contain",
    positionX: 24,
    positionY: 73,
    zoom: 2.2,
    backgroundColor: "#000000",
  });

  assert.deepEqual(normalized, {
    fitMode: "contain",
    positionX: 24,
    positionY: 73,
    zoom: MAX_CONTAIN_IMAGE_ZOOM,
    backgroundColor: "#ffffff",
  });
  assert.deepEqual(imageFramingStyle(normalized), {
    objectFit: "contain",
    objectPosition: "24% 73%",
    transform: `scale(${MAX_CONTAIN_IMAGE_ZOOM})`,
    transformOrigin: "24% 73%",
    backgroundColor: "#ffffff",
  });
});

test("switching fit modes keeps valid framing metadata", () => {
  const contain = normalizeImageFraming({
    fitMode: "contain",
    positionX: 31,
    positionY: 68,
    zoom: 1.45,
  });
  const cover = normalizeImageFraming({ ...contain, fitMode: "cover" });

  assert.equal(cover.positionX, 31);
  assert.equal(cover.positionY, 68);
  assert.equal(cover.zoom, 1.45);
});

test("reset returns the selected mode to 50/50/100% without transparency", () => {
  assert.deepEqual(resetImageFraming("contain"), {
    positionX: 50,
    positionY: 50,
    zoom: 1,
    fitMode: "contain",
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
