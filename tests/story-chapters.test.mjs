import assert from "node:assert/strict";
import test from "node:test";
import {
  getStoryImageLayout,
  hasDuplicateStoryImage,
  moveStoryImage,
  normalizeLegacyStoryChapterInput,
} from "../src/lib/story-chapters.ts";
import {
  defaultExperienceSettings,
  mergeExperienceSettings,
} from "../src/lib/experience-settings.ts";

test("normalizes a legacy one-image chapter without losing its URL or framing", () => {
  const result = normalizeLegacyStoryChapterInput({
    id: "chapter-01",
    imageSrc: "/images/couple-01.jpg",
    imageStoragePath: "story/couple-01.jpg",
    imageAlt: "Vũ Bình và Thành Long",
    positionX: 42,
    positionY: 61,
    zoom: 1.3,
    fitMode: "contain",
    backgroundColor: "#ffffff",
    available: true,
  });

  assert.deepEqual(result.images, [
    {
      id: "chapter-01-image-1",
      src: "/images/couple-01.jpg",
      storagePath: "story/couple-01.jpg",
      alt: "Vũ Bình và Thành Long",
      positionX: 42,
      positionY: 61,
      zoom: 1.3,
      fitMode: "contain",
      backgroundColor: "#ffffff",
      available: true,
    },
  ]);
  assert.equal("imageSrc" in result, false);
});

test("normalizes a legacy chapter without an image to an empty list", () => {
  const result = normalizeLegacyStoryChapterInput({ id: "chapter-empty" });
  assert.deepEqual(result.images, []);
});

test("keeps an existing multi-image list intact", () => {
  const images = [
    { id: "one", src: "/images/one.jpg" },
    { id: "two", src: "/images/two.jpg" },
  ];
  const result = normalizeLegacyStoryChapterInput({ id: "chapter", images });
  assert.deepEqual(result.images, images);
});

test("selects the intended responsive layout for every image count", () => {
  assert.equal(getStoryImageLayout(0), "empty");
  assert.equal(getStoryImageLayout(1), "single");
  assert.equal(getStoryImageLayout(2), "split");
  assert.equal(getStoryImageLayout(3), "feature");
  assert.equal(getStoryImageLayout(4), "mosaic");
  assert.equal(getStoryImageLayout(10), "mosaic");
});

test("reorders images and preserves boundary order", () => {
  assert.deepEqual(moveStoryImage(["a", "b", "c"], 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveStoryImage(["a", "b", "c"], 1, 1), ["a", "c", "b"]);
  assert.deepEqual(moveStoryImage(["a", "b"], 0, -1), ["a", "b"]);
});

test("detects duplicate image URLs", () => {
  const images = [{ src: "/images/one.jpg" }, { src: "/images/two.jpg" }];
  assert.equal(hasDuplicateStoryImage(images, "/images/one.jpg"), true);
  assert.equal(hasDuplicateStoryImage(images, "/images/three.jpg"), false);
  assert.equal(hasDuplicateStoryImage(images, " /images/one.jpg "), true);
});

test("backfills editable invitation content for old experience records", () => {
  const merged = mergeExperienceSettings({
    sections: { story: false },
    invitation: { supportingText: "Hẹn gặp bạn trong ngày vui." },
  });

  assert.equal(merged.invitation.eyebrow, "Lời mời thân tình");
  assert.equal(
    merged.invitation.supportingText,
    "Hẹn gặp bạn trong ngày vui.",
  );
  assert.equal(merged.sections.invitation, true);
  assert.equal(merged.sections.story, false);
  assert.deepEqual(
    mergeExperienceSettings(undefined).invitation,
    defaultExperienceSettings.invitation,
  );
});
