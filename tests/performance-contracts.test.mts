import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) => readFile(path, "utf8");

test("public entry does not import admin-only modules", async () => {
  const source = await readSource("app/page.tsx");
  assert.doesNotMatch(source, /WeddingAdmin|AdminInvitation|admin-auth|csv/);
});

test("GSAP is lazy-loaded only after the invitation opens", async () => {
  const source = await readSource("src/components/WeddingExperience.tsx");
  assert.doesNotMatch(source, /^import .* from "gsap/m);
  assert.match(source, /import\("gsap"\)/);
  assert.match(source, /context\.revert\(\)/);
  assert.match(source, /media\.revert\(\)/);
});

test("below-fold wedding images are lazy by default", async () => {
  const imageSource = await readSource("src/components/WeddingImage.tsx");
  const albumSource = await readSource("src/components/AlbumGallery.tsx");
  const storySource = await readSource("src/components/StoryExplorer.tsx");
  assert.doesNotMatch(imageSource, /priority=/);
  assert.doesNotMatch(albumSource, /priority=/);
  assert.doesNotMatch(storySource, /priority=/);
  assert.equal((albumSource.match(/<WeddingImage/g) || []).length, 1);
});

test("slideshow and particles clean up or pause background work", async () => {
  const albumSource = await readSource("src/components/AlbumGallery.tsx");
  const experienceSource = await readSource(
    "src/components/WeddingExperience.tsx",
  );
  assert.match(albumSource, /clearInterval/);
  assert.match(albumSource, /clearTimeout/);
  assert.match(albumSource, /visibilitychange/);
  assert.match(experienceSource, /data-paused=\{isDocumentHidden\}/);
});

test("reduced motion keeps content visible and disables continuous decoration", async () => {
  const css = await readSource("app/globals.css");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.petal-field\s*\{\s*display: none;/);
  assert.match(css, /\[data-hero-reveal\]/);
});
