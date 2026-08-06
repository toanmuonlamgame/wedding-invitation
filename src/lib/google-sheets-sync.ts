import "server-only";

import {
  postClearGoogleSheets,
  postInvitationDeletionToGoogleSheets,
  postInvitationsDeletionToGoogleSheets,
  postInvitationToGoogleSheets,
  type GoogleSheetsBulkDeleteInput,
  type GoogleSheetsDeleteInput,
  type GoogleSheetsSyncInput,
  type GoogleSheetsSyncStatus,
} from "@/src/lib/google-sheets-sync-core";

export type {
  GoogleSheetsBulkDeleteInput,
  GoogleSheetsDeleteInput,
  GoogleSheetsSyncInput,
  GoogleSheetsSyncStatus,
};

async function reportSyncStatus(
  operation: () => Promise<GoogleSheetsSyncStatus>,
) {
  try {
    const status = await operation();
    if (status === "failed") {
      console.error("[google-sheets-sync] Synchronization failed.");
    }
    return status;
  } catch {
    console.error("[google-sheets-sync] Synchronization failed.");
    return "failed" as const;
  }
}

export async function syncInvitationToGoogleSheets(
  input: GoogleSheetsSyncInput,
): Promise<GoogleSheetsSyncStatus> {
  return reportSyncStatus(() =>
    postInvitationToGoogleSheets({
      input,
      webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
      secret: process.env.GOOGLE_SHEETS_SYNC_SECRET,
    }),
  );
}

export async function syncInvitationDeletionToGoogleSheets(
  input: GoogleSheetsDeleteInput,
): Promise<GoogleSheetsSyncStatus> {
  return reportSyncStatus(() =>
    postInvitationDeletionToGoogleSheets({
      input,
      webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
      secret: process.env.GOOGLE_SHEETS_SYNC_SECRET,
    }),
  );
}

export async function syncInvitationsDeletionToGoogleSheets(
  input: GoogleSheetsBulkDeleteInput,
): Promise<GoogleSheetsSyncStatus> {
  return reportSyncStatus(() =>
    postInvitationsDeletionToGoogleSheets({
      input,
      webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
      secret: process.env.GOOGLE_SHEETS_SYNC_SECRET,
    }),
  );
}

export async function clearGoogleSheetsInvitations(): Promise<GoogleSheetsSyncStatus> {
  return reportSyncStatus(() =>
    postClearGoogleSheets({
      webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
      secret: process.env.GOOGLE_SHEETS_SYNC_SECRET,
    }),
  );
}
