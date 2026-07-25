import { InvitationForm } from "@/src/components/InvitationForm";
import { SectionHeading } from "@/src/components/SectionHeading";

export function CreatorSection() {
  return (
    <section className="section creator-section" aria-labelledby="creator-title">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Dành cho gia đình"
          title="Tạo thiệp cá nhân"
          description="Điền thông tin vị khách để xem trước trải nghiệm tạo thiệp riêng. Trong CM01, biểu mẫu chỉ minh họa giao diện và chưa lưu dữ liệu."
        />

        <div className="creator-layout" id="creator-title">
          <aside className="creator-aside">
            <div>
              <p className="creator-number">01</p>
              <h3>Một lời mời riêng, thêm phần trân quý</h3>
              <p>
                Nội dung cá nhân giúp mỗi vị khách cảm nhận rõ sự trân trọng từ
                gia đình trong ngày vui.
              </p>
            </div>
            <p className="demo-note">
              Bản demo · Chưa kết nối cơ sở dữ liệu, API hoặc tạo liên kết.
            </p>
          </aside>
          <InvitationForm />
        </div>
      </div>
    </section>
  );
}
