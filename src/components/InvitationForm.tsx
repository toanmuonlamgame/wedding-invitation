"use client";

import { FormEvent, useState } from "react";

export function InvitationForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Thiệp mẫu đã sẵn sàng về giao diện. Tính năng tạo liên kết sẽ được kết nối ở phiên bản sau.",
    );
  }

  return (
    <form className="creator-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="guestName">Nội dung người được mời</label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          placeholder="Ví dụ: Gia đình anh chị Hoàng Nam"
          autoComplete="name"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="guestCount">
          Số người được mời <span className="optional">(không bắt buộc)</span>
        </label>
        <select id="guestCount" name="guestCount" defaultValue="">
          <option value="">Chưa xác định</option>
          <option value="1">1 người</option>
          <option value="2">2 người</option>
          <option value="3">3 người</option>
          <option value="4">4 người</option>
          <option value="5">5 người trở lên</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="personalMessage">
          Lời nhắn riêng <span className="optional">(không bắt buộc)</span>
        </label>
        <textarea
          id="personalMessage"
          name="personalMessage"
          placeholder="Viết một lời nhắn thân tình dành riêng cho vị khách này..."
          maxLength={280}
        />
      </div>

      <div className="form-actions">
        <button className="button" type="submit">
          Tạo thiệp
        </button>
        <p className="form-status" role="status">
          {message}
        </p>
      </div>
    </form>
  );
}
