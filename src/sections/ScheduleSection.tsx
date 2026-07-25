import { Countdown } from "@/src/components/Countdown";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";
import { formatWeddingDateTime } from "@/src/lib/wedding-format";

type ScheduleSectionProps = {
  weddingDateTime: string | null;
  expiredMessage: string;
};

export function ScheduleSection({
  weddingDateTime,
  expiredMessage,
}: ScheduleSectionProps) {
  const formattedDate = formatWeddingDateTime(weddingDateTime);
  return (
    <section
      className="section schedule-section"
      aria-labelledby="schedule-title"
    >
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
          <span>{formattedDate.time}</span>
          <small>{wedding.lunarDatePlaceholder}</small>
        </div>

        <div data-reveal>
          <Countdown
            targetDate={weddingDateTime}
            expiredMessage={expiredMessage}
          />
        </div>
      </div>
    </section>
  );
}
