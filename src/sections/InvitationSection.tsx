import { Ornament } from "@/src/components/Ornament";
import { wedding } from "@/src/lib/wedding-data";

export function InvitationSection() {
  return (
    <section className="section invitation-section" aria-labelledby="invitation-title">
      <div className="section-shell invitation-copy">
        <p className="section-eyebrow">Lời mời thân tình</p>
        <h2 className="lead" id="invitation-title">
          “Tình yêu đẹp nhất là khi ta tìm thấy một người để cùng nhau gọi hai
          tiếng gia đình.”
        </h2>
        <Ornament />
        <p className="body-copy">
          Với niềm hân hoan và sự chúc phúc của hai gia đình, chúng mình trân
          trọng mời bạn đến dự lễ thành hôn. Sự hiện diện của bạn sẽ là món quà
          quý giá, làm ngày vui của chúng mình thêm trọn vẹn.
        </p>

        <div className="families">
          <div className="family-card">
            <span className="family-label">Nhà gái</span>
            <span className="family-name">{wedding.brideFamily}</span>
          </div>
          <div className="family-card">
            <span className="family-label">Nhà trai</span>
            <span className="family-name">{wedding.groomFamily}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
