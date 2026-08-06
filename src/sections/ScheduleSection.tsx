import { Countdown } from "@/src/components/Countdown";
import { WeddingCalendar } from "@/src/components/WeddingCalendar";
import { WeddingImage } from "@/src/components/WeddingImage";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-details";
import { formatWeddingDateTime } from "@/src/lib/wedding-format";
import { formatVietnameseLunarDate } from "@/src/lib/lunar-date";
import type { CountdownSettings } from "@/src/types/wedding";
import { getInvitationMessages, type InvitationLanguage } from "@/src/lib/invitation-i18n";

type ScheduleSectionProps = {
  weddingDateTime: string | null;
  expiredMessage: string;
  settings: CountdownSettings;
  language?: InvitationLanguage;
};

export function ScheduleSection({
  weddingDateTime,
  expiredMessage,
  settings,
  language = "vi",
}: ScheduleSectionProps) {
  if (!weddingDateTime) return null;

  const messages = getInvitationMessages(language);
  const formattedDate = formatWeddingDateTime(weddingDateTime, language);
  const lunarDate = language === "vi" ? formatVietnameseLunarDate(weddingDateTime) : null;
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
            eyebrow={messages.schedule.eyebrow}
            title={messages.schedule.title}
            titleId="schedule-title"
            description={messages.schedule.description}
          />
        </div>

        <div className="date-composition" data-reveal>
          <p className="date-label">{messages.schedule.weddingDate}</p>
          <p className="date-placeholder">{formattedDate.date}</p>
          {settings.showTime ? <span>{formattedDate.time}</span> : null}
          {language === "vi" && settings.showLunarDate && lunarDate ? (
            <small className="lunar-date">
              <span aria-hidden="true">☾</span>
              {lunarDate}
            </small>
          ) : language === "vi" ? (
            <small>{wedding.lunarDatePlaceholder}</small>
          ) : null}
        </div>

        {settings.showCalendar ? (
          <div data-reveal>
            <WeddingCalendar
              dateTime={weddingDateTime}
              markerStyle={settings.markerStyle}
              language={language}
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
