import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FONT_PRESET,
  DEFAULT_THEME_PRESET,
  FONT_IDS,
  THEME_IDS,
  isFontPreset,
  isThemePreset,
} from "../src/lib/appearance.ts";

test("appearance defaults are valid preset codes", () => {
  assert.equal(isThemePreset(DEFAULT_THEME_PRESET), true);
  assert.equal(isFontPreset(DEFAULT_FONT_PRESET), true);
  assert.equal(THEME_IDS.length, 5);
  assert.equal(FONT_IDS.length, 4);
});

test("appearance validation rejects arbitrary CSS values", () => {
  assert.equal(isThemePreset("body { display: none }"), false);
  assert.equal(isFontPreset("https://fonts.example/font.css"), false);
});
