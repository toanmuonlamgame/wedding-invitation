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
            description="Điền thông tin vị khách để kiểm tra giao diện. Commit 2 không lưu dữ liệu và chưa tạo liên kết."
          />
        </div>

        <div className="creator-layout" id="creator-title" data-reveal>
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
              Bản demo · Chức năng tạo liên kết sẽ được kết nối ở Commit 3.
            </p>
          </aside>
          <InvitationForm />
        </div>
      </div>
    </section>
  );
}
