import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function VenueSection() {
  return (
    <section className="section venue-section" aria-labelledby="venue-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Địa điểm"
          title="Hẹn bạn tại đây"
          description="Tiệc thân mật sẽ bắt đầu vào buổi chiều. Bạn dành thêm một chút thời gian để đến sớm và cùng chúng mình lưu lại vài tấm hình nhé."
        />

        <div className="venue-card">
          <div className="map-art" aria-hidden="true">
            <div className="map-pin">
              <span>A · H</span>
            </div>
          </div>
          <div className="venue-content">
            <span className="venue-time">{wedding.time}</span>
            <h3 className="venue-name" id="venue-title">
              {wedding.venue}
            </h3>
            <p className="venue-address">{wedding.address}</p>
            <a
              className="button"
              href={wedding.mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Mở địa điểm tiệc cưới trên Google Maps trong tab mới"
            >
              Mở Google Maps
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
