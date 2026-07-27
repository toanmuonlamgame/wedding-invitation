import { wedding } from "@/src/lib/wedding-data";

const weddingDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const weddingTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatWeddingDateTime(value: string | null) {
  if (!value) {
    return {
      date: wedding.datePlaceholder,
      time: wedding.timePlaceholder,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: wedding.datePlaceholder,
      time: wedding.timePlaceholder,
    };
  }

  return {
    date: weddingDateFormatter.format(date),
    time: `${weddingTimeFormatter.format(date)} · Giờ Việt Nam`,
  };
}
