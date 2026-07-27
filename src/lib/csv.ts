function stripMarkup(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

export function sanitizeSpreadsheetValue(value: unknown) {
  const plain = stripMarkup(value == null ? "" : String(value));
  return /^\s*[=+\-@]/.test(plain) ? `'${plain}` : plain;
}

export function escapeCsvCell(value: unknown) {
  const safe = sanitizeSpreadsheetValue(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function createCsv(rows: unknown[][]) {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}\r\n`;
}
