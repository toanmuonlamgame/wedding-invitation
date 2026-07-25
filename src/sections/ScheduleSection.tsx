import { Countdown } from "@/src/components/Countdown";
import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function ScheduleSection() {
  return (
    <section className="section schedule-section" aria-labelledby="schedule-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Save the date"
          title="Ngày chung đôi"
          description="Một ngày đặc biệt, một lời hẹn dịu dàng. Hẹn gặp bạn trong khoảnh khắc chúng mình chính thức về chung một nhà."
        />

        <div className="date-panel">
          <p className="date-weekday">Chủ Nhật</p>
          <div className="date-row" id="schedule-title">
            <span className="date-side">Tháng 12</span>
            <span className="date-day">20</span>
            <span className="date-side">2026</span>
          </div>
          <p className="date-lunar">Nhằm ngày 12 tháng 11 năm Bính Ngọ</p>
        </div>

        <Countdown targetDate={wedding.dateIso} />
      </div>
    </section>
  );
}
