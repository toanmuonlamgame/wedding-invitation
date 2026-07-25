import Link from "next/link";

export default function InvitationNotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="section-eyebrow">Thiệp cưới</p>
        <h1>Không tìm thấy lời mời</h1>
        <p>
          Liên kết này không hợp lệ hoặc thiệp chưa tồn tại. Bạn vui lòng kiểm
          tra lại đường dẫn đã nhận.
        </p>
        <Link className="button" href="/">
          Xem thiệp mẫu
        </Link>
      </div>
    </main>
  );
}
