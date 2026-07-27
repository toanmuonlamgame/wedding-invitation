import assert from "node:assert/strict";
import test from "node:test";
import {
  formatVietnameseLunarDate,
  getVietnameseLunarDate,
} from "../src/lib/lunar-date.ts";

test("converts the wedding date in Vietnam time", () => {
  assert.deepEqual(getVietnameseLunarDate("2026-09-26T16:00:00+07:00"), {
    day: 16,
    month: 8,
    year: 2026,
    leap: false,
    yearName: "Bính Ngọ",
  });
  assert.equal(
    formatVietnameseLunarDate("2026-09-26T16:00:00+07:00"),
    "Nhằm ngày 16 tháng 08 năm Bính Ngọ",
  );
  assert.doesNotMatch(
    formatVietnameseLunarDate("2026-09-26T16:00:00+07:00") || "",
    /Asia\/Ho_Chi_Minh|GMT|UTC/,
  );
});

test("uses Asia/Ho_Chi_Minh when an instant crosses a UTC date", () => {
  assert.deepEqual(
    getVietnameseLunarDate("2026-09-25T18:30:00Z"),
    getVietnameseLunarDate("2026-09-26T01:30:00+07:00"),
  );
});

test("changes with weddingDateTime and supports a leap lunar month", () => {
  assert.notDeepEqual(
    getVietnameseLunarDate("2026-09-26T16:00:00+07:00"),
    getVietnameseLunarDate("2026-09-27T16:00:00+07:00"),
  );
  const leapDate = getVietnameseLunarDate("2023-03-22T12:00:00+07:00");
  assert.equal(leapDate?.month, 2);
  assert.equal(leapDate?.leap, true);
});

test("null and invalid wedding dates do not crash", () => {
  assert.equal(getVietnameseLunarDate(null), null);
  assert.equal(getVietnameseLunarDate("not-a-date"), null);
  assert.equal(formatVietnameseLunarDate(null), null);
});
