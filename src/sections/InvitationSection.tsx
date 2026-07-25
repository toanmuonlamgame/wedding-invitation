import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-data";

export function InvitationSection() {
  return (
    <section
      className="section invitation-section"
      aria-labelledby="invitation-title"
    >
      <div className="section-shell invitation-copy">
        <p className="section-eyebrow" data-reveal>
          Lời mời thân tình
        </p>
        <h2 className="invitation-lead" id="invitation-title" data-reveal>
          “Có những hành trình đẹp hơn khi được sẻ chia cùng những người mình
          thương.”
        </h2>
        <div data-reveal>
          <Ornament />
        </div>
        <p className="invitation-body" data-reveal>
          Với niềm hân hoan của hai gia đình, Vũ Bình và Thành Long trân trọng
          kính mời bạn đến chung vui trong ngày hai chúng mình bắt đầu một
          chương mới. Sự hiện diện của bạn là món quà ấm áp và quý giá.
        </p>

        <div className="families" data-reveal>
          <div className="family">
            <span>Nhà gái</span>
            <strong>{wedding.brideFamily}</strong>
          </div>
          <div className="family-separator" aria-hidden="true">
            &amp;
          </div>
          <div className="family">
            <span>Nhà trai</span>
            <strong>{wedding.groomFamily}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
