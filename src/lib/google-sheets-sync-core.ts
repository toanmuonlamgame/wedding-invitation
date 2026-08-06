export type GoogleSheetsSyncStatus = "success" | "failed" | "skipped";

export type StoredInvitationForSheets = {
  id: string;
  token: string;
  recipientText: string;
  privateMessage: string | null;
  adminNotes: string | null;
  guestCount: number | null;
  invitationSide: string;
  language: string;
  createdAt: Date;
};

export type StoredRsvpForSheets = {
  attending: boolean;
  confirmedCount: number | null;
  note: string | null;
} | null;

export type GoogleSheetsSyncInput = {
  invitation: StoredInvitationForSheets;
  invitationUrl: string;
  rsvp?: StoredRsvpForSheets;
};

export type GoogleSheetsPayload = {
  secret: string;
  invitationId: string;
  token: string;
  recipientText: string;
  companionText: string;
  guestCount: number | null;
  invitationSide: string;
  language: "vi" | "ko";
  invitationUrl: string;
  createdAt: string;
  sent: false;
  rsvpStatus: "Chưa phản hồi" | "Tham dự" | "Không tham dự";
  confirmedCount: number;
  notes: string;
};

function normalizeLanguage(value: string): "vi" | "ko" {
  return value === "ko" ? "ko" : "vi";
}

function rsvpStatus(rsvp: StoredRsvpForSheets) {
  if (!rsvp) return "Chưa phản hồi" as const;
  return rsvp.attending ? ("Tham dự" as const) : ("Không tham dự" as const);
}

export function normalizeGoogleSheetsPayload(
  input: GoogleSheetsSyncInput,
  secret: string,
): GoogleSheetsPayload {
  const { invitation, rsvp = null } = input;
  return {
    secret,
    invitationId: invitation.id,
    token: invitation.token,
    recipientText: invitation.recipientText.trim(),
    companionText: "",
    guestCount: invitation.guestCount,
    invitationSide: invitation.invitationSide,
    language: normalizeLanguage(invitation.language),
    invitationUrl: input.invitationUrl,
    createdAt: invitation.createdAt.toISOString(),
    sent: false,
    rsvpStatus: rsvpStatus(rsvp),
    confirmedCount: rsvp?.confirmedCount ?? 0,
    notes:
      rsvp?.note?.trim() ||
      invitation.adminNotes?.trim() ||
      invitation.privateMessage?.trim() ||
      "",
  };
}

function isAllowedWebAppUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "script.google.com" &&
      url.pathname.startsWith("/macros/s/") &&
      url.pathname.endsWith("/exec")
    );
  } catch {
    return false;
  }
}

export async function postInvitationToGoogleSheets({
  input,
  webAppUrl,
  secret,
  timeoutMs = 6_500,
  fetchImpl = fetch,
}: {
  input: GoogleSheetsSyncInput;
  webAppUrl?: string;
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GoogleSheetsSyncStatus> {
  const normalizedUrl = webAppUrl?.trim();
  const normalizedSecret = secret?.trim();
  if (!normalizedUrl || !normalizedSecret) return "skipped";
  if (!isAllowedWebAppUrl(normalizedUrl)) return "failed";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(normalizedUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        normalizeGoogleSheetsPayload(input, normalizedSecret),
      ),
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: unknown }
      | null;
    return response.ok && payload?.ok === true ? "success" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
