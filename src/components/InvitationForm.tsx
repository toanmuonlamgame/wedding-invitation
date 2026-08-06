"use client";

import { type FormEvent, useRef, useState } from "react";
import type { CreatedInvitation } from "@/src/types/invitation";
import { normalizeInvitationLanguage } from "@/src/lib/invitation-i18n";

type FormState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "error"; message: string }
  | { status: "success"; message: string; result: CreatedInvitation };

function getClientError(
  recipientText: string,
  guestCount: number | undefined,
  privateMessage: string,
  creatorSecret: string,
) {
  if (recipientText.length < 2 || recipientText.length > 120) {
    return "Nội dung người được mời cần từ 2 đến 120 ký tự.";
  }

  if (
    guestCount !== undefined &&
    (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20)
  ) {
    return "Số người được mời cần là số nguyên từ 1 đến 20.";
  }

  if (privateMessage.length > 500) {
    return "Lời nhắn riêng không được quá 500 ký tự.";
  }

  if (!creatorSecret || creatorSecret.length > 256) {
    return "Vui lòng nhập mã tạo thiệp hợp lệ.";
  }

  return null;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.appendChild(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();

  if (!copied) {
    throw new Error("Clipboard is unavailable.");
  }
}

export function InvitationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const recipientRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });
  const isSubmitting = formState.status === "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const recipientText = String(form.get("recipientText") ?? "").trim();
    const guestCountValue = String(form.get("guestCount") ?? "").trim();
    const guestCount = guestCountValue
      ? Number.parseInt(guestCountValue, 10)
      : undefined;
    const privateMessage = String(form.get("privateMessage") ?? "").trim();
    const creatorSecret = String(form.get("creatorSecret") ?? "");
    const language = normalizeInvitationLanguage(form.get("language"));
    const clientError = getClientError(
      recipientText,
      guestCount,
      privateMessage,
      creatorSecret,
    );

    if (clientError) {
      setFormState({ status: "error", message: clientError });
      return;
    }

    setFormState({
      status: "submitting",
      message: "Đang tạo liên kết thiệp riêng…",
    });

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientText,
          guestCount,
          privateMessage: privateMessage || undefined,
          creatorSecret,
          language,
        }),
      });
      const payload = (await response.json()) as {
        token?: unknown;
        invitationUrl?: unknown;
        message?: unknown;
      };

      if (
        !response.ok ||
        typeof payload.token !== "string" ||
        typeof payload.invitationUrl !== "string"
      ) {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Chưa thể tạo thiệp lúc này. Vui lòng thử lại.",
        );
      }

      formRef.current?.reset();
      setFormState({
        status: "success",
        message: "Thiệp cá nhân đã được tạo thành công.",
        result: {
          token: payload.token,
          invitationUrl: payload.invitationUrl,
        },
      });
    } catch (error) {
      setFormState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Chưa thể tạo thiệp lúc này. Vui lòng thử lại.",
      });
    }
  }

  async function handleCopy() {
    if (formState.status !== "success") {
      return;
    }

    try {
      await copyText(formState.result.invitationUrl);
      setFormState({
        ...formState,
        message: "Đã sao chép liên kết thiệp.",
      });
    } catch {
      setFormState({
        ...formState,
        message:
          "Không thể tự sao chép. Liên kết vẫn ở bên dưới để bạn sao chép thủ công.",
      });
    }
  }

  function handleCreateAnother() {
    setFormState({ status: "idle", message: "" });
    window.requestAnimationFrame(() => recipientRef.current?.focus());
  }

  if (formState.status === "success") {
    return (
      <div className="creator-success" data-form-state="success">
        <p className="creator-success-mark" aria-hidden="true">
          ✓
        </p>
        <h3>Thiệp đã sẵn sàng</h3>
        <p>
          Liên kết này chỉ hiển thị nội dung dành cho khách và không có khu vực
          tạo thiệp.
        </p>
        <label htmlFor="createdInvitationUrl">Liên kết thiệp cá nhân</label>
        <input
          id="createdInvitationUrl"
          value={formState.result.invitationUrl}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
        <div className="success-actions">
          <button className="button" type="button" onClick={handleCopy}>
            Sao chép link
          </button>
          <a
            className="button button-secondary"
            href={formState.result.invitationUrl}
            target="_blank"
            rel="noreferrer"
          >
            Mở thiệp
          </a>
          <button
            className="text-button"
            type="button"
            onClick={handleCreateAnother}
          >
            Tạo thiệp khác
          </button>
        </div>
        <p className="form-status" aria-live="polite">
          {formState.message}
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="creator-form"
      data-form-state={formState.status}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="field">
        <label htmlFor="recipientText">Nội dung người được mời</label>
        <input
          ref={recipientRef}
          id="recipientText"
          name="recipientText"
          type="text"
          placeholder="Ví dụ: Anh Tuấn và gia đình"
          autoComplete="off"
          minLength={2}
          maxLength={120}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="guestCount">
          Số người được mời <span className="optional">(không bắt buộc)</span>
        </label>
        <input
          id="guestCount"
          name="guestCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          step={1}
          placeholder="Ví dụ: 2"
        />
      </div>

      <div className="field">
        <label htmlFor="privateMessage">
          Lời nhắn riêng <span className="optional">(không bắt buộc)</span>
        </label>
        <textarea
          id="privateMessage"
          name="privateMessage"
          placeholder="Rất mong gia đình tới chung vui..."
          maxLength={500}
        />
      </div>

      <div className="field">
        <fieldset className="invitation-language-fieldset">
          <legend>Ngôn ngữ thiệp</legend>
          <label>
            <input type="radio" name="language" value="vi" defaultChecked />
            Tiếng Việt
          </label>
          <label>
            <input type="radio" name="language" value="ko" />
            한국어
          </label>
        </fieldset>
      </div>

      <div className="field">
        <label htmlFor="creatorSecret">Mã tạo thiệp</label>
        <input
          id="creatorSecret"
          name="creatorSecret"
          type="password"
          autoComplete="off"
          maxLength={256}
          required
          aria-describedby="creator-secret-help"
        />
        <p className="field-help" id="creator-secret-help">
          Mã chỉ được gửi để xác thực yêu cầu, không lưu vào thiệp hoặc trình
          duyệt.
        </p>
      </div>

      <div className="form-actions">
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo thiệp…" : "Tạo thiệp"}
        </button>
        <p
          className={`form-status${formState.status === "error" ? " form-status-error" : ""}`}
          role={formState.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {formState.message}
        </p>
      </div>
    </form>
  );
}
