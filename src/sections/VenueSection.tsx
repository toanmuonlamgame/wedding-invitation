import { SectionHeading } from "@/src/components/SectionHeading";
import { wedding } from "@/src/lib/wedding-data";

export function VenueSection() {
  return (
    <section className="section venue-section" aria-labelledby="venue-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Địa điểm"
            title="Hẹn bạn tại đây"
            titleId="venue-title"
            description="Thông tin chính thức sẽ được gia đình cập nhật trong một tệp dữ liệu duy nhất."
          />
        </div>

        <div className="venue-layout">
          <div
            className="map-illustration"
            aria-hidden="true"
            data-parallax
          >
            <div className="map-line map-line-one" />
            <div className="map-line map-line-two" />
            <div className="map-point">
              <span>{wedding.monogram}</span>
            </div>
          </div>
          <div className="venue-content" data-reveal>
            <span className="venue-time">{wedding.timeDisplay}</span>
            <h3 className="venue-name">
              {wedding.venue}
            </h3>
            <p className="venue-address">{wedding.address}</p>
            {wedding.mapUrl ? (
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
            ) : (
              <button
                className="button button-disabled"
                type="button"
                disabled
                aria-label="Google Maps chưa sẵn sàng vì địa điểm chưa được cập nhật"
              >
                Google Maps · Chờ cập nhật
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
