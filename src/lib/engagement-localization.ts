import type { ZodError } from "zod";
import {
  getInvitationMessages,
  type InvitationLanguage,
} from "@/src/lib/invitation-i18n";

export function localizedEngagementValidationResponse(
  error: ZodError,
  language: InvitationLanguage,
  kind: "rsvp" | "wish",
) {
  if (language === "vi") {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return Response.json(
      { error: "VALIDATION_ERROR", message: "Dữ liệu chưa hợp lệ.", fieldErrors },
      { status: 400 },
    );
  }

  const messages = getInvitationMessages(language);
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!path || fieldErrors[path]) continue;
    fieldErrors[path] =
      kind === "wish"
        ? path === "senderName"
          ? messages.wishes.nameError
          : messages.wishes.messageError
        : path === "guestName"
          ? messages.rsvp.nameError
          : path === "attending"
            ? messages.rsvp.attendingError
            : path === "confirmedCount"
              ? messages.rsvp.countError
              : messages.rsvp.noteError;
  }
  return Response.json(
    {
      error: "VALIDATION_ERROR",
      message: kind === "wish" ? messages.wishes.checkFields : messages.rsvp.checkFields,
      fieldErrors,
    },
    { status: 400 },
  );
}
