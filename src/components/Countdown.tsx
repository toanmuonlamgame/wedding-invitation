"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
  targetDate: string | null;
  expiredMessage: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownState = {
  targetDate: string;
  timeLeft: TimeLeft;
  expired: boolean;
};

function getTimeLeft(targetDate: string): TimeLeft {
  const difference = Math.max(new Date(targetDate).getTime() - Date.now(), 0);

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown({
  targetDate,
  expiredMessage,
}: CountdownProps) {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!targetDate) {
      return;
    }

    const targetTime = new Date(targetDate).getTime();
    let timer: number | undefined;

    const update = () => {
      const expired = Date.now() >= targetTime;
      setCountdown({
        targetDate,
        timeLeft: getTimeLeft(targetDate),
        expired,
      });

      if (expired && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const initialTimer = window.setTimeout(update, 0);

    if (Date.now() < targetTime) {
      timer = window.setInterval(update, 1_000);
    }

    return () => {
      window.clearTimeout(initialTimer);
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
    };
  }, [targetDate]);

  const activeCountdown =
    targetDate && countdown?.targetDate === targetDate ? countdown : null;

  if (activeCountdown?.expired) {
    return (
      <p className="countdown-celebration" role="status">
        {expiredMessage}
      </p>
    );
  }

  const units = [
    ["Ngày", activeCountdown?.timeLeft.days],
    ["Giờ", activeCountdown?.timeLeft.hours],
    ["Phút", activeCountdown?.timeLeft.minutes],
    ["Giây", activeCountdown?.timeLeft.seconds],
  ] as const;

  return (
    <div className="countdown" aria-label="Đếm ngược đến ngày cưới">
      {units.map(([label, value]) => (
        <div className="countdown-item" key={label} data-countdown-item>
          <span className="countdown-number">
            {value === undefined ? "—" : String(value).padStart(2, "0")}
          </span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
      {!targetDate ? (
        <p className="countdown-note">
          Countdown sẽ bắt đầu khi ngày cưới chính thức được cập nhật.
        </p>
      ) : null}
    </div>
  );
}
