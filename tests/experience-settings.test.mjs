import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultExperienceSettings,
  mergeExperienceSettings,
} from "../src/lib/experience-settings.ts";

test("legacy settings only contribute text fields to localized copy", () => {
  const merged = mergeExperienceSettings({
    cover: {
      ...defaultExperienceSettings.cover,
      backgroundEnabled: true,
      backgroundSrc: "https://example.supabase.co/storage/v1/object/public/wedding-media/cover.jpg",
      kicker: "Kính mời",
    },
    youtube: {
      ...defaultExperienceSettings.youtube,
      enabled: true,
      url: "https://www.youtube.com/watch?v=t-uuZb5PrUs",
      title: "Nhạc ngày vui",
    },
  });

  assert.deepEqual(Object.keys(merged.localizedCopy.vi.cover).sort(), [
    "brideName",
    "buttonText",
    "connector",
    "groomName",
    "kicker",
    "note",
  ]);
  assert.deepEqual(Object.keys(merged.localizedCopy.vi.youtube).sort(), [
    "description",
    "title",
  ]);
  assert.equal(merged.localizedCopy.vi.cover.kicker, "Kính mời");
  assert.equal(merged.cover.backgroundEnabled, true);
  assert.equal(merged.youtube.enabled, true);
});
