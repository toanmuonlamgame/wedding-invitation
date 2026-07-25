import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-data";

export function FooterSection() {
  return (
    <footer className="footer-section">
      <div className="section-shell" data-reveal>
        <div className="footer-mark" aria-hidden="true">
          ♡
        </div>
        <h2 className="footer-title">Cảm ơn bạn đã mở lời mời</h2>
        <Ornament />
        <p className="footer-copy">
          Cảm ơn bạn đã yêu thương, đồng hành và dành thời gian chung vui cùng
          gia đình. Hẹn gặp bạn trong ngày hạnh phúc của Vũ Bình và Thành Long.
        </p>
        <p className="footer-signature">
          {wedding.bride} &amp; {wedding.groom}
        </p>
      </div>
    </footer>
  );
}
