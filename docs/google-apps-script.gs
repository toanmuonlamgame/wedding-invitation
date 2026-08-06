const INVITATION_SHEET_NAME = "Invitations";

function setupInvitationSheet() {
  const spreadsheet = getSetupSpreadsheet_();
  const sheet = ensureInvitationSheet_(spreadsheet);
  PropertiesService.getScriptProperties().setProperty(
    "SPREADSHEET_ID",
    spreadsheet.getId(),
  );
  spreadsheet.setActiveSheet(sheet);
  logSheetConnection_(spreadsheet, sheet, "setup");
}

function ensureInvitationSheet_(spreadsheet) {
  const headers = [
    "Invitation ID",
    "Token",
    "Tên khách",
    "Người đi cùng",
    "Số người tối đa",
    "Bên mời",
    "Ngôn ngữ",
    "Link thiệp",
    "Ngày tạo",
    "Đã gửi",
    "Trạng thái RSVP",
    "Số người xác nhận",
    "Ghi chú",
    "Cập nhật lúc",
  ];
  let sheet = spreadsheet.getSheetByName(INVITATION_SHEET_NAME);
  if (!sheet) {
    const activeSheet = spreadsheet.getActiveSheet();
    const canReuseBlankSheet =
      spreadsheet.getSheets().length === 1 &&
      activeSheet &&
      activeSheet.getLastRow() === 0 &&
      activeSheet.getLastColumn() === 0;
    sheet = canReuseBlankSheet
      ? activeSheet.setName(INVITATION_SHEET_NAME)
      : spreadsheet.insertSheet(INVITATION_SHEET_NAME);
  }
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      headers.length - sheet.getMaxColumns(),
    );
  }
  sheet
    .getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground("#667746")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 38);
  sheet.autoResizeColumns(1, headers.length);
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(8, 320);
  sheet.setColumnWidth(13, 240);
  sheet.setColumnWidth(14, 170);
  sheet.getRange("I2:I").setNumberFormat("dd/MM/yyyy HH:mm:ss");
  sheet.getRange("N2:N").setNumberFormat("dd/MM/yyyy HH:mm:ss");
  sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).setWrap(true);
  SpreadsheetApp.flush();
  return sheet;
}

function configureSheetsApi() {
  const spreadsheet = getSetupSpreadsheet_();
  PropertiesService.getScriptProperties().setProperty(
    "SPREADSHEET_ID",
    spreadsheet.getId(),
  );
  const sheet = ensureInvitationSheet_(spreadsheet);
  spreadsheet.setActiveSheet(sheet);
  logSheetConnection_(spreadsheet, sheet, "configure");
}

function diagnoseSheetsConnection() {
  const spreadsheet = getConfiguredSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(INVITATION_SHEET_NAME);
  if (!sheet) {
    throw new Error("Không tìm thấy tab Invitations trong file đã cấu hình.");
  }
  logSheetConnection_(spreadsheet, sheet, "diagnose");
}

function doGet() {
  const diagnostics = getPublicDiagnostics_();
  return createJsonResponse_({
    ok: true,
    service: "wedding-invitation-sheets",
    configured: diagnostics.configured,
    sheetReady: diagnostics.sheetReady,
    rowCount: diagnostics.rowCount,
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    lock.waitLock(10000);
    hasLock = true;
    const body = parseRequestBody_(event);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "SHEETS_SYNC_SECRET",
    );
    if (!expectedSecret || body.secret !== expectedSecret) {
      return createJsonResponse_({ ok: false, error: "UNAUTHORIZED" });
    }

    const action = cleanText_(body.action) || "upsert";
    if (!["upsert", "delete", "delete_many", "clear"].includes(action)) {
      return createJsonResponse_({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "Thao tác không hợp lệ.",
      });
    }

    const sheet = getInvitationSheet_();
    if (action === "clear") {
      const clearedRows = Math.max(0, sheet.getLastRow() - 1);
      if (clearedRows > 0) {
        sheet
          .getRange(2, 1, clearedRows, Math.max(14, sheet.getLastColumn()))
          .clearContent();
      }
      return createJsonResponse_({ ok: true, action: "cleared", clearedRows });
    }

    if (action === "delete_many") {
      const invitations = Array.isArray(body.invitations)
        ? body.invitations.slice(0, 100)
        : [];
      if (invitations.length === 0) {
        return createJsonResponse_({
          ok: false,
          error: "VALIDATION_ERROR",
          message: "Danh sách thiệp cần xóa đang trống.",
        });
      }
      const deletedRows = deleteInvitationRows_(sheet, invitations);
      return createJsonResponse_({
        ok: true,
        action: "deleted_many",
        deletedRows,
      });
    }

    const invitationId = cleanText_(body.invitationId);
    const token = cleanText_(body.token);
    if (!invitationId && !token) {
      return createJsonResponse_({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "Thiếu Invitation ID hoặc token.",
      });
    }

    const existingRow = findInvitationRow_(sheet, invitationId, token);
    if (action === "delete") {
      if (existingRow) sheet.deleteRow(existingRow);
      return createJsonResponse_({
        ok: true,
        action: existingRow ? "deleted" : "not_found",
        invitationId,
        token,
      });
    }

    const now = new Date();
    const rowValues = [
      safeCellText_(invitationId),
      safeCellText_(token),
      safeCellText_(body.recipientText || body.guestName),
      safeCellText_(body.companionText || body.companions),
      toOptionalNumber_(body.guestCount ?? body.maxGuests),
      safeCellText_(body.invitationSide || body.side),
      safeCellText_(body.language || "vi"),
      safeCellText_(body.invitationUrl || body.url),
      toDateOrText_(body.createdAt),
      toBoolean_(body.sent),
      safeCellText_(body.rsvpStatus || "Chưa phản hồi"),
      toOptionalNumber_(body.confirmedCount),
      safeCellText_(body.notes || body.message),
      now,
    ];
    let savedRow;
    if (existingRow) {
      savedRow = existingRow;
      sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
      savedRow = sheet.getLastRow();
    }
    return createJsonResponse_({
      ok: true,
      action: existingRow ? "updated" : "created",
      row: savedRow,
      invitationId,
      token,
    });
  } catch (error) {
    console.error(error);
    return createJsonResponse_({
      ok: false,
      error: "INTERNAL_ERROR",
      message: "Không thể đồng bộ dữ liệu.",
    });
  } finally {
    if (hasLock) lock.releaseLock();
  }
}

function getInvitationSheet_() {
  const sheet = getConfiguredSpreadsheet_().getSheetByName(
    INVITATION_SHEET_NAME,
  );
  if (!sheet) throw new Error("Không tìm thấy sheet Invitations.");
  return sheet;
}

function getSetupSpreadsheet_() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;
  return getConfiguredSpreadsheet_();
}

function getConfiguredSpreadsheet_() {
  const spreadsheetId = cleanText_(
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID"),
  );
  if (!spreadsheetId) {
    throw new Error(
      "Chưa cấu hình SPREADSHEET_ID. Hãy mở Apps Script từ đúng Google Sheet hoặc thêm ID trong Script Properties.",
    );
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function getPublicDiagnostics_() {
  try {
    const spreadsheet = getConfiguredSpreadsheet_();
    const sheet = spreadsheet.getSheetByName(INVITATION_SHEET_NAME);
    return {
      configured: true,
      sheetReady: Boolean(sheet),
      rowCount: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0,
    };
  } catch (error) {
    return { configured: false, sheetReady: false, rowCount: 0 };
  }
}

function logSheetConnection_(spreadsheet, sheet, operation) {
  console.log(
    JSON.stringify({
      operation,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetId: spreadsheet.getId(),
      sheetName: sheet.getName(),
      sheetUrl: spreadsheet.getUrl() + "#gid=" + sheet.getSheetId(),
      rowCount: Math.max(0, sheet.getLastRow() - 1),
    }),
  );
}

function findInvitationRow_(sheet, invitationId, token) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const rows = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
  for (let index = 0; index < rows.length; index += 1) {
    const currentId = cleanText_(rows[index][0]);
    const currentToken = cleanText_(rows[index][1]);
    if (
      (invitationId && currentId === invitationId) ||
      (token && currentToken === token)
    ) {
      return index + 2;
    }
  }
  return null;
}

function deleteInvitationRows_(sheet, invitations) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const invitationIds = new Set();
  const tokens = new Set();
  invitations.forEach((invitation) => {
    const invitationId = cleanText_(invitation && invitation.invitationId);
    const token = cleanText_(invitation && invitation.token);
    if (invitationId) invitationIds.add(invitationId);
    if (token) tokens.add(token);
  });
  const rows = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
  const rowsToDelete = [];
  rows.forEach((row, index) => {
    if (
      invitationIds.has(cleanText_(row[0])) ||
      tokens.has(cleanText_(row[1]))
    ) {
      rowsToDelete.push(index + 2);
    }
  });
  rowsToDelete
    .sort((left, right) => right - left)
    .forEach((rowNumber) => sheet.deleteRow(rowNumber));
  return rowsToDelete.length;
}

function parseRequestBody_(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("Request không có dữ liệu JSON.");
  }
  return JSON.parse(event.postData.contents);
}

function createJsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function cleanText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function safeCellText_(value) {
  const text = cleanText_(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function toOptionalNumber_(value) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function toBoolean_(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toDateOrText_(value) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? safeCellText_(value) : date;
}
