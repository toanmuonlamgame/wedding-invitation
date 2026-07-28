import { Countdown } from "@/src/components/Countdown";
import { WeddingCalendar } from "@/src/components/WeddingCalendar";
import { WeddingImage } from "@/src/components/WeddingImage";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-details";
import { formatWeddingDateTime } from "@/src/lib/wedding-format";
import { formatVietnameseLunarDate } from "@/src/lib/lunar-date";
import type { CountdownSettings } from "@/src/types/wedding";

type ScheduleSectionProps = {
  weddingDateTime: string | null;
  expiredMessage: string;
  settings: CountdownSettings;
};

export function ScheduleSection({
  weddingDateTime,
  expiredMessage,
  settings,
}: ScheduleSectionProps) {
  if (!weddingDateTime) return null;

  const formattedDate = formatWeddingDateTime(weddingDateTime);
  const lunarDate = formatVietnameseLunarDate(weddingDateTime);
  return (
    <section
      className="section schedule-section"
      aria-labelledby="schedule-title"
      data-has-background={settings.backgroundEnabled && Boolean(settings.backgroundSrc)}
      style={
        {
          "--countdown-overlay": settings.overlayColor,
          "--countdown-overlay-opacity": settings.overlayOpacity,
        } as React.CSSProperties
      }
    >
      {settings.backgroundEnabled && settings.backgroundSrc ? (
        <WeddingImage
          src={settings.backgroundSrc}
          available
          alt={settings.backgroundAlt}
          sizes="100vw"
          className="schedule-background"
          framing={settings.background}
        />
      ) : null}
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Save the date"
            title="Ngày chung đôi"
            titleId="schedule-title"
            description="Gia đình sẽ cập nhật ngày giờ chính thức tại đây. Khi thông tin sẵn sàng, bộ đếm ngược sẽ tự động bắt đầu."
          />
        </div>

        <div className="date-composition" data-reveal>
          <p className="date-label">Ngày cưới</p>
          <p className="date-placeholder">{formattedDate.date}</p>
          {settings.showTime ? <span>{formattedDate.time}</span> : null}
          {settings.showLunarDate && lunarDate ? (
            <small className="lunar-date">
              <span aria-hidden="true">☾</span>
              {lunarDate}
            </small>
          ) : (
            <small>{wedding.lunarDatePlaceholder}</small>
          )}
        </div>

        {settings.showCalendar ? (
          <div data-reveal>
            <WeddingCalendar
              dateTime={weddingDateTime}
              markerStyle={settings.markerStyle}
            />
          </div>
        ) : null}

        {settings.showCountdown ? <div data-reveal>
          <Countdown
            targetDate={weddingDateTime}
            expiredMessage={expiredMessage}
          />
        </div> : null}
      </div>
    </section>
  );
}
