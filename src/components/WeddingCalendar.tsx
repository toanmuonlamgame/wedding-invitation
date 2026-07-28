const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function WeddingCalendar({
  dateTime,
  markerStyle,
}: {
  dateTime: string | null;
  markerStyle: "circle" | "dot" | "heart";
}) {
  if (!dateTime) return null;
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;
  const year = Number(
    new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric" }).format(date),
  );
  const month = Number(
    new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", month: "numeric" }).format(date),
  );
  const weddingDay = Number(
    new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", day: "numeric" }).format(date),
  );
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="wedding-calendar" data-marker={markerStyle} aria-label={`Lịch cưới tháng ${month} năm ${year}`}>
      <p>Tháng {month} · {year}</p>
      <div className="calendar-grid">
        {WEEKDAYS.map((weekday) => <strong key={weekday}>{weekday}</strong>)}
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
