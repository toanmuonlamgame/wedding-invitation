import assert from "node:assert/strict";
import test from "node:test";
import {
  getInvitationMessages,
  invitationMessages,
  normalizeInvitationLanguage,
} from "../src/lib/invitation-i18n.ts";
import {
  formatInvitationDateTime,
  getWeddingCalendarParts,
  WEDDING_TIME_ZONE,
} from "../src/lib/invitation-date.ts";

test("normalizes old and invalid invitation languages to Vietnamese", () => {
  assert.equal(normalizeInvitationLanguage(undefined), "vi");
  assert.equal(normalizeInvitationLanguage("invalid"), "vi");
  assert.equal(normalizeInvitationLanguage("vi"), "vi");
  assert.equal(normalizeInvitationLanguage("ko"), "ko");
});

function collectDictionaryPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      return [path, ...collectDictionaryPaths(child, path)];
    }
    return [path];
  });
}

test("Vietnamese and Korean dictionaries expose the same nested keys", () => {
  assert.deepEqual(
    collectDictionaryPaths(invitationMessages.vi).sort(),
    collectDictionaryPaths(invitationMessages.ko).sort(),
  );
  assert.equal(getInvitationMessages("invalid").languageName, "Tiếng Việt");
  assert.equal(getInvitationMessages("ko").languageName, "한국어");
});

test("formats Vietnamese and Korean dates at the same Vietnam instant", () => {
  const value = "2026-09-26T18:30:00Z";
  const vi = formatInvitationDateTime(value, "vi");
  const ko = formatInvitationDateTime(value, "ko");
  assert.ok(vi?.date.includes("27"));
  assert.ok(ko?.date.includes("2026년"));
  assert.ok(ko?.date.includes("9월"));
  assert.match(ko?.time ?? "", /오전|오후/);
  assert.deepEqual(getWeddingCalendarParts(value), {
    year: 2026,
    month: 9,
    day: 27,
  });
  assert.equal(WEDDING_TIME_ZONE, "Asia/Ho_Chi_Minh");
  assert.equal(`${vi?.date}${ko?.date}`.includes(WEDDING_TIME_ZONE), false);
});

test("invalid and null dates do not throw", () => {
  assert.equal(formatInvitationDateTime(null, "vi"), null);
  assert.equal(formatInvitationDateTime("not-a-date", "ko"), null);
  assert.equal(getWeddingCalendarParts("invalid"), null);
});
