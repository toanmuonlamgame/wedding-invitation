import { Countdown } from "@/src/components/Countdown";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function ScheduleSection() {
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
            description="Gia đình sẽ cập nhật ngày giờ chính thức tại đây. Khi thông tin sẵn sàng, bộ đếm ngược sẽ tự động bắt đầu."
          />
        </div>

        <div className="date-composition" id="schedule-title" data-reveal>
          <p className="date-label">Ngày cưới</p>
          <p className="date-placeholder">{wedding.dateDisplay}</p>
          <span>{wedding.timeDisplay}</span>
          <small>{wedding.lunarDate}</small>
        </div>

        <div data-reveal>
          <Countdown targetDate={wedding.dateIso} />
        </div>
      </div>
    </section>
  );
}
