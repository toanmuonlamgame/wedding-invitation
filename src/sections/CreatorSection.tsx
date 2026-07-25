import { InvitationForm } from "@/src/components/InvitationForm";
import { SectionHeading } from "@/src/components/SectionHeading";

export function CreatorSection() {
  return (
    <section className="section creator-section" aria-labelledby="creator-title">
      <div className="section-shell">
        <div data-reveal>
          <SectionHeading
            eyebrow="Dành cho gia đình"
            title="Tạo thiệp cá nhân"
            titleId="creator-title"
            description="Điền thông tin vị khách và mã tạo thiệp để sinh một liên kết riêng, chỉ đọc và sẵn sàng gửi đi."
          />
        </div>

        <div className="creator-layout" data-reveal>
          <aside className="creator-aside">
            <div>
              <p className="creator-number">Gửi lời mời</p>
              <h3>Một lời mời riêng, thêm phần trân quý.</h3>
              <p>
                Nội dung cá nhân giúp mỗi vị khách cảm nhận rõ sự trân trọng
                của gia đình trong ngày vui.
              </p>
            </div>
            <p className="demo-note">
              Dữ liệu chỉ được lưu khi máy chủ đã được kết nối PostgreSQL và mã
              tạo thiệp hợp lệ.
            </p>
          </aside>
          <InvitationForm />
        </div>
      </div>
    </section>
  );
}
