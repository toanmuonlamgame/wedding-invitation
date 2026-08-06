import { wedding } from "@/src/lib/wedding-data";
import {
  getInvitationMessages,
  normalizeInvitationLanguage,
  type InvitationLanguage,
} from "@/src/lib/invitation-i18n";
import {
  formatInvitationDateTime,
  getWeddingCalendarParts,
  WEDDING_TIME_ZONE,
} from "@/src/lib/invitation-date";
export { getWeddingCalendarParts, WEDDING_TIME_ZONE };

export function formatWeddingDateTime(
  value: string | null,
  language: InvitationLanguage = "vi",
) {
  const locale = normalizeInvitationLanguage(language);
  const messages = getInvitationMessages(locale);
  if (!value) {
    return { date: wedding.datePlaceholder, time: wedding.timePlaceholder };
  }

  const formatted = formatInvitationDateTime(value, locale);
  if (!formatted) {
    return { date: wedding.datePlaceholder, time: wedding.timePlaceholder };
  }

  return {
    date: formatted.date,
    time: `${formatted.time} · ${messages.schedule.vietnamTime}`,
  };
}
