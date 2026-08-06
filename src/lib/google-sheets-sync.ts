import "server-only";

import {
  postInvitationToGoogleSheets,
  type GoogleSheetsSyncInput,
  type GoogleSheetsSyncStatus,
} from "@/src/lib/google-sheets-sync-core";

export type { GoogleSheetsSyncInput, GoogleSheetsSyncStatus };

export async function syncInvitationToGoogleSheets(
  input: GoogleSheetsSyncInput,
): Promise<GoogleSheetsSyncStatus> {
  try {
    const status = await postInvitationToGoogleSheets({
      input,
      webAppUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
      secret: process.env.GOOGLE_SHEETS_SYNC_SECRET,
    });

    if (status === "failed") {
      console.error("[google-sheets-sync] Synchronization failed.");
    }

    return status;
  } catch {
    console.error("[google-sheets-sync] Synchronization failed.");
    return "failed";
  }
}
