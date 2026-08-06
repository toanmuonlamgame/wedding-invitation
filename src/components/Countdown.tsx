"use client";

import { memo, useEffect, useState } from "react";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

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

const CountdownUnit = memo(function CountdownUnit({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="countdown-item" data-countdown-item>
      <span className="countdown-number">
        {value === undefined ? "—" : String(value).padStart(2, "0")}
      </span>
      <span className="countdown-label">{label}</span>
    </div>
  );
});

export function Countdown({
  targetDate,
  expiredMessage,
}: CountdownProps) {
  const { language, messages } = useInvitationLocale();
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!targetDate) {
      return;
    }

    const targetTime = new Date(targetDate).getTime();
    if (!Number.isFinite(targetTime)) {
      return;
    }
    let timer: number | undefined;

    const update = () => {
      if (document.hidden) return;
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
    document.addEventListener("visibilitychange", update);

    if (Date.now() < targetTime) {
      timer = window.setInterval(update, 1_000);
    }

    return () => {
      window.clearTimeout(initialTimer);
      document.removeEventListener("visibilitychange", update);
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
        {language === "ko" ? messages.schedule.expired : expiredMessage}
      </p>
    );
  }

  const units = [
    [messages.schedule.days, activeCountdown?.timeLeft.days],
    [messages.schedule.hours, activeCountdown?.timeLeft.hours],
    [messages.schedule.minutes, activeCountdown?.timeLeft.minutes],
    [messages.schedule.seconds, activeCountdown?.timeLeft.seconds],
  ] as const;

  return (
    <div className="countdown" aria-label={messages.schedule.countdown}>
      {units.map(([label, value]) => (
        <CountdownUnit key={label} label={label} value={value} />
      ))}
      {!targetDate ? (
        <p className="countdown-note">
          Countdown sẽ bắt đầu khi ngày cưới chính thức được cập nhật.
        </p>
      ) : null}
    </div>
  );
}
