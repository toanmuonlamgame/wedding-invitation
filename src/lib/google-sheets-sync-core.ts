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

export type GoogleSheetsDeleteInput = {
  invitationId: string;
  token: string;
};

export type GoogleSheetsBulkDeleteInput = {
  invitations: GoogleSheetsDeleteInput[];
};

export type GoogleSheetsPayload = {
  secret: string;
  action: "upsert";
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

export type GoogleSheetsDeletePayload = {
  secret: string;
  action: "delete";
  invitationId: string;
  token: string;
};

export type GoogleSheetsBulkDeletePayload = {
  secret: string;
  action: "delete_many";
  invitations: Array<{ invitationId: string; token: string }>;
};

export type GoogleSheetsClearPayload = {
  secret: string;
  action: "clear";
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
    action: "upsert",
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

export function normalizeGoogleSheetsDeletePayload(
  input: GoogleSheetsDeleteInput,
  secret: string,
): GoogleSheetsDeletePayload {
  return {
    secret,
    action: "delete",
    invitationId: input.invitationId.trim(),
    token: input.token.trim(),
  };
}

export function normalizeGoogleSheetsBulkDeletePayload(
  input: GoogleSheetsBulkDeleteInput,
  secret: string,
): GoogleSheetsBulkDeletePayload {
  return {
    secret,
    action: "delete_many",
    invitations: input.invitations.map((invitation) => ({
      invitationId: invitation.invitationId.trim(),
      token: invitation.token.trim(),
    })),
  };
}

export function normalizeGoogleSheetsClearPayload(
  secret: string,
): GoogleSheetsClearPayload {
  return { secret, action: "clear" };
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

async function postGoogleSheetsPayload({
  buildPayload,
  webAppUrl,
  secret,
  timeoutMs = 6_500,
  fetchImpl = fetch,
}: {
  buildPayload: (secret: string) =>
    | GoogleSheetsPayload
    | GoogleSheetsDeletePayload
    | GoogleSheetsBulkDeletePayload
    | GoogleSheetsClearPayload;
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
      body: JSON.stringify(buildPayload(normalizedSecret)),
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

export function postInvitationToGoogleSheets({
  input,
  ...options
}: {
  input: GoogleSheetsSyncInput;
  webAppUrl?: string;
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GoogleSheetsSyncStatus> {
  return postGoogleSheetsPayload({
    ...options,
    buildPayload: (secret) => normalizeGoogleSheetsPayload(input, secret),
  });
}

export function postInvitationDeletionToGoogleSheets({
  input,
  ...options
}: {
  input: GoogleSheetsDeleteInput;
  webAppUrl?: string;
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GoogleSheetsSyncStatus> {
  return postGoogleSheetsPayload({
    ...options,
    buildPayload: (secret) =>
      normalizeGoogleSheetsDeletePayload(input, secret),
  });
}

export function postInvitationsDeletionToGoogleSheets({
  input,
  ...options
}: {
  input: GoogleSheetsBulkDeleteInput;
  webAppUrl?: string;
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GoogleSheetsSyncStatus> {
  return postGoogleSheetsPayload({
    ...options,
    buildPayload: (secret) =>
      normalizeGoogleSheetsBulkDeletePayload(input, secret),
  });
}

export function postClearGoogleSheets({
  ...options
}: {
  webAppUrl?: string;
  secret?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GoogleSheetsSyncStatus> {
  return postGoogleSheetsPayload({
    ...options,
    buildPayload: normalizeGoogleSheetsClearPayload,
  });
}
