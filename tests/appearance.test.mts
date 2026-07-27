import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FONT_PRESET,
  DEFAULT_THEME_PRESET,
  FONT_IDS,
  FONT_PRESETS,
  THEME_IDS,
  THEME_PRESETS,
  getAppearanceStyle,
  getFontPresetStyle,
  isFontPreset,
  isThemePreset,
  normalizeFontPreset,
  normalizeThemePreset,
} from "../src/lib/appearance.ts";

test("appearance exposes exactly ten themes and twenty fonts", () => {
  assert.equal(isThemePreset(DEFAULT_THEME_PRESET), true);
  assert.equal(isFontPreset(DEFAULT_FONT_PRESET), true);
  assert.equal(THEME_IDS.length, 10);
  assert.equal(FONT_IDS.length, 20);
  assert.equal(new Set(THEME_IDS).size, 10);
  assert.equal(new Set(FONT_IDS).size, 20);
});

test("font catalogue has five presets in each category and usable variables", () => {
  for (const category of ["elegant", "modern", "romantic", "classic"]) {
    assert.equal(
      Object.values(FONT_PRESETS).filter(
        (preset) => preset.category === category,
      ).length,
      5,
    );
  }

  for (const id of FONT_IDS) {
    const style = getFontPresetStyle(id);
    assert.match(style["--theme-couple-font"], /^var\(--font-/);
    assert.match(style["--theme-heading-font"], /^var\(--font-/);
    assert.match(style["--theme-body-font"], /^var\(--font-/);
    assert.notEqual(
      style["--theme-body-font"],
      "var(--font-script)",
      `${id} must keep long body copy readable`,
    );
  }
});

function hexLuminance(value: string) {
  const hex = value.replace("#", "");
  assert.match(hex, /^[\da-f]{6}$/i);
  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const first = hexLuminance(foreground);
  const second = hexLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("every theme provides all centralized tokens and CSS variables", () => {
  const requiredTokens = [
    "paper",
    "paperDeep",
    "ink",
    "muted",
    "accentSoft",
    "accent",
    "button",
    "buttonHover",
    "buttonText",
    "focus",
    "card",
    "border",
    "overlay",
    "ornament",
    "icon",
    "countdown",
    "form",
    "placeholder",
    "venue",
    "story",
    "wish",
    "rsvp",
    "album",
  ];

  for (const id of THEME_IDS) {
    const theme = THEME_PRESETS[id];
    assert.deepEqual(Object.keys(theme.tokens), requiredTokens);
    assert.equal(getAppearanceStyle(id)["--paper"], theme.tokens.paper);
    assert.notEqual(theme.tokens.paper, theme.tokens.ink);
    assert.notEqual(theme.tokens.button, theme.tokens.buttonText);
    assert.ok(
      contrastRatio(theme.tokens.ink, theme.tokens.paper) >= 4.5,
      `${id} must keep primary text readable`,
    );
    assert.ok(
      contrastRatio(theme.tokens.buttonText, theme.tokens.button) >= 4.5,
      `${id} must keep button text readable`,
    );
  }
});

test("legacy appearance codes normalize without allowing arbitrary CSS", () => {
  assert.equal(normalizeThemePreset("light-elegant"), "ivory-sage");
  assert.equal(normalizeThemePreset("dark-elegant"), "forest-noir");
  assert.equal(normalizeFontPreset("romantic"), "romantic-script");
  assert.equal(normalizeFontPreset("classic"), "classic-wedding");
  assert.equal(isThemePreset("body { display: none }"), false);
  assert.equal(isFontPreset("https://fonts.example/font.css"), false);
});
