import { MusicPlayer } from "@/src/components/MusicPlayer";
import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-data";

export function OpeningSection() {
  return (
    <section className="section opening" aria-labelledby="opening-title">
      <div className="invitation-card">
        <div className="monogram" aria-hidden="true">
          A · H
        </div>
        <p className="opening-kicker">Trân trọng báo tin lễ thành hôn</p>
        <h1 className="couple-names" id="opening-title">
          <span>{wedding.bride}</span>
          <em>&amp;</em>
          <span>{wedding.groom}</span>
        </h1>
        <Ornament />
        <p className="opening-date">{wedding.dateDisplay}</p>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        Mở thiệp
      </div>
      <MusicPlayer />
    </section>
  );
}
