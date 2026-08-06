import type { InvitationLanguage } from "@/src/lib/invitation-i18n";

export const WEDDING_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function formatInvitationDateTime(
  value: string | null,
  language: InvitationLanguage,
) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const locale = language === "ko" ? "ko-KR" : "vi-VN";
  return {
    date: new Intl.DateTimeFormat(locale, {
      timeZone: WEDDING_TIME_ZONE,
      weekday: "long",
      day: "2-digit",
      month: language === "ko" ? "long" : "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(locale, {
      timeZone: WEDDING_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: language === "ko",
    }).format(date),
  };
}

export function getWeddingCalendarParts(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: WEDDING_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}
