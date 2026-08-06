import { getInvitationMessages, type InvitationLanguage } from "@/src/lib/invitation-i18n";
import { getWeddingCalendarParts } from "@/src/lib/wedding-format";

export function WeddingCalendar({
  dateTime,
  markerStyle,
  language = "vi",
}: {
  dateTime: string | null;
  markerStyle: "circle" | "dot" | "heart";
  language?: InvitationLanguage;
}) {
  const dateParts = getWeddingCalendarParts(dateTime);
  if (!dateParts) return null;
  const { year, month, day: weddingDay } = dateParts;
  const messages = getInvitationMessages(language);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="wedding-calendar" data-marker={markerStyle} aria-label={messages.schedule.calendar(month, year)}>
      <p>{messages.schedule.monthYear(month, year)}</p>
      <div className="calendar-grid">
        {messages.schedule.weekdays.map((weekday) => <strong key={weekday}>{weekday}</strong>)}
        {cells.map((day, index) => (
          <span
            key={`${day ?? "empty"}-${index}`}
            aria-current={day === weddingDay ? "date" : undefined}
          >
            {day}
            {day === weddingDay && markerStyle === "heart" ? <i aria-hidden="true">♥</i> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
