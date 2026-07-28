import { SectionHeading } from "@/src/components/SectionHeading";
import { VenueActions } from "@/src/components/VenueActions";
import { WeddingImage } from "@/src/components/WeddingImage";
import { wedding } from "@/src/lib/wedding-details";
import { formatWeddingDateTime } from "@/src/lib/wedding-format";
import type { WeddingEvent } from "@/src/types/wedding";

type VenueSectionProps = {
  venues: WeddingEvent[];
};

export function VenueSection({ venues }: VenueSectionProps) {
  const visibleVenues = venues.filter((venue) => venue.available);
  if (!visibleVenues.length) return null;

  return (
    <section className="section venue-section" aria-labelledby="venue-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Địa điểm"
            title="Hẹn bạn tại đây"
            titleId="venue-title"
            description="Thông tin điểm hẹn và chỉ đường."
          />
        </div>

        <div className="venue-list">
          {visibleVenues.map((venue, index) => {
            const dateTime = formatWeddingDateTime(venue.dateTime);

            return (
              <article className="venue-layout" key={venue.id} data-reveal>
                {venue.showImage && venue.imageSrc ? (
                  <div
                    className="venue-image"
                    data-parallax={index === 0 ? "" : undefined}
                    data-fit-mode={
                      venue.fitMode === "contain" ? "contain" : "cover"
                    }
                  >
                    <WeddingImage
                      src={venue.imageSrc}
                      available
                      alt={
                        venue.imageAlt ||
                        `Ảnh địa điểm ${venue.venueName}`
                      }
                      sizes="(max-width: 896px) 100vw, 48vw"
                      className="venue-image-media"
                      framing={venue}
                    />
                  </div>
                ) : (
                  <div
                    className="map-illustration"
                    aria-hidden="true"
                    data-parallax={index === 0 ? "" : undefined}
                  >
                    <div className="map-line map-line-one" />
                    <div className="map-line map-line-two" />
                    <div className="map-point">
                      <span>{wedding.monogram}</span>
                    </div>
                  </div>
                )}
                <div className="venue-content">
                  <p className="venue-event-type">{venue.eventType}</p>
                  <span className="venue-time">
                    {dateTime.date} · {dateTime.time}
                  </span>
                  <h3 className="venue-name">{venue.venueName}</h3>
                  <p className="venue-address">{venue.address}</p>
                  {venue.note ? <p className="venue-note">{venue.note}</p> : null}
                  <VenueActions
                    address={venue.address}
                    mapsUrl={venue.mapsUrl}
                    available
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
