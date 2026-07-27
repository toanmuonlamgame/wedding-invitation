import assert from "node:assert/strict";
import test from "node:test";
import {
  createCsv,
  escapeCsvCell,
  sanitizeSpreadsheetValue,
} from "../src/lib/csv.ts";

test("CSV uses UTF-8 BOM and escapes commas, quotes and line breaks", () => {
  const csv = createCsv([["Tên", 'Một, "hai"\nba']]);
  assert.equal(csv.startsWith("\uFEFF"), true);
  assert.match(csv, /"Một, ""hai""\nba"/);
});

test("spreadsheet formula prefixes are neutralized", () => {
  for (const value of ["=1+1", "+cmd", "-2+3", "@SUM(A1:A2)", "  =1"]) {
    assert.equal(sanitizeSpreadsheetValue(value).startsWith("'"), true);
  }
  assert.equal(escapeCsvCell("Bình thường"), '"Bình thường"');
});

test("HTML and script markup are not exported", () => {
  assert.equal(
    sanitizeSpreadsheetValue("<script>alert(1)</script>Lời chúc"),
    "alert(1)Lời chúc",
  );
});
