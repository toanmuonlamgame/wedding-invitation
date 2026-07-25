"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
  targetDate: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const emptyTime: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function getTimeLeft(targetDate: string): TimeLeft {
  const difference = Math.max(
    new Date(targetDate).getTime() - new Date().getTime(),
    0,
  );

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(emptyTime);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(targetDate));
    update();
    const timer = window.setInterval(update, 1_000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const units = [
    ["Ngày", timeLeft.days],
    ["Giờ", timeLeft.hours],
    ["Phút", timeLeft.minutes],
    ["Giây", timeLeft.seconds],
  ] as const;

  return (
    <div className="countdown" aria-label="Đếm ngược đến ngày cưới">
      {units.map(([label, value]) => (
        <div className="countdown-item" key={label}>
          <span className="countdown-number">{String(value).padStart(2, "0")}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
