import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-details";
import { formatWeddingDateTime } from "@/src/lib/wedding-format";

type OpeningSectionProps = {
  weddingDateTime: string | null;
};

export function OpeningSection({ weddingDateTime }: OpeningSectionProps) {
  const formattedDate = formatWeddingDateTime(weddingDateTime);
  return (
    <section className="section hero-section" aria-labelledby="opening-title">
      <div
        className="hero-botanical hero-botanical-left"
        data-parallax
        aria-hidden="true"
      />
      <div
        className="hero-botanical hero-botanical-right"
        data-parallax
        aria-hidden="true"
      />
      <div className="hero-content">
        <p className="hero-kicker" data-hero-reveal>
          Lễ thành hôn
        </p>
        <p className="hero-monogram" data-hero-reveal aria-hidden="true">
          {wedding.monogram}
        </p>
        <h1 className="couple-names" id="opening-title">
          <span data-hero-reveal>{wedding.bride}</span>
          <em data-hero-reveal>&amp;</em>
          <span data-hero-reveal>{wedding.groom}</span>
        </h1>
        <div data-hero-reveal>
          <Ornament />
        </div>
        <p className="hero-date" data-hero-reveal>
          {formattedDate.date}
        </p>
        <p className="hero-scroll" data-hero-reveal>
          Cuộn xuống để cùng xem câu chuyện của chúng mình
        </p>
      </div>
    </section>
  );
}
