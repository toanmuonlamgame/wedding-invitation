"use client";

import { useState } from "react";
import type {
  FieldErrors,
  PublicWeddingWish,
} from "@/src/types/engagement";

type WeddingWishesProps = {
  initialWishes: PublicWeddingWish[];
  invitationToken?: string;
  defaultSenderName?: string;
};

type ErrorPayload = {
  message?: unknown;
  fieldErrors?: unknown;
};

function formatWishDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function WeddingWishes({
  initialWishes,
  invitationToken,
  defaultSenderName = "",
}: WeddingWishesProps) {
  const [wishes, setWishes] = useState(initialWishes);
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitationToken || isSubmitting) {
      return;
    }

    const normalizedName = senderName.trim();
    const normalizedMessage = message.trim();
    const clientErrors: FieldErrors = {};
    if (normalizedName.length < 2) {
      clientErrors.senderName = "Tên người gửi phải có ít nhất 2 ký tự.";
    }
    if (normalizedMessage.length < 2) {
      clientErrors.message = "Lời chúc phải có ít nhất 2 ký tự.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus("Vui lòng kiểm tra các trường được đánh dấu.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setStatus("Đang gửi lời chúc…");

    try {
      const response = await fetch(
        `/api/invitations/${invitationToken}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: normalizedName,
            message: normalizedMessage,
          }),
        },
      );
      const payload = (await response.json()) as
        | PublicWeddingWish
        | ErrorPayload;

      if (!response.ok) {
        const errors =
          "fieldErrors" in payload &&
          payload.fieldErrors &&
          typeof payload.fieldErrors === "object"
            ? (payload.fieldErrors as FieldErrors)
            : {};
        setFieldErrors(errors);
        throw new Error(
          "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Chưa thể gửi lời chúc.",
        );
      }

      const wish = payload as PublicWeddingWish;
      setWishes((current) => [wish, ...current].slice(0, 10));
      setSenderName(normalizedName);
      setMessage("");
      setStatus("Cảm ơn bạn đã gửi lời chúc.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Chưa thể gửi lời chúc lúc này.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="section wishes-section"
      aria-labelledby="wishes-title"
    >
      <div className="section-shell">
        <header className="section-heading">
          <p className="section-eyebrow">Những lời thương mến</p>
          <h2 className="section-title" id="wishes-title">
            Lời chúc dành cho chúng mình
          </h2>
          <p className="section-description">
            Mỗi lời nhắn là một kỷ niệm đẹp Vũ Bình và Thành Long sẽ luôn trân
            trọng.
          </p>
        </header>

        {wishes.length > 0 ? (
          <div className="wishes-list">
            {wishes.map((wish, index) => (
              <blockquote
                className="wish-note"
                key={`${wish.createdAt}-${wish.senderName}-${index}`}
              >
                <p>{wish.message}</p>
                <footer>
                  <strong>{wish.senderName}</strong>
                  <time dateTime={wish.createdAt}>
                    {formatWishDate(wish.createdAt)}
                  </time>
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="wishes-empty">
            Hãy là người đầu tiên gửi lời chúc đến Vũ Bình & Thành Long.
          </p>
        )}

        {invitationToken ? (
          <form className="wish-form" onSubmit={handleSubmit} noValidate>
            <div>
              <p className="section-eyebrow">Gửi lời chúc</p>
              <h3>Để lại một lời nhắn cho ngày vui</h3>
            </div>
            <div className="field">
              <label htmlFor="wishSenderName">Tên người gửi</label>
              <input
                id="wishSenderName"
                value={senderName}
                minLength={2}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.senderName)}
                aria-describedby={
                  fieldErrors.senderName ? "wishSenderNameError" : undefined
                }
                onChange={(event) => {
                  setSenderName(event.target.value);
                  clearFieldError("senderName");
                }}
              />
              {fieldErrors.senderName ? (
                <p className="field-error" id="wishSenderNameError">
                  {fieldErrors.senderName}
                </p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="wishMessage">Lời chúc</label>
              <textarea
                id="wishMessage"
                value={message}
                minLength={2}
                maxLength={1_000}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={
                  fieldErrors.message ? "wishMessageError" : undefined
                }
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearFieldError("message");
                }}
              />
              {fieldErrors.message ? (
                <p className="field-error" id="wishMessageError">
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi…" : "Gửi lời chúc"}
            </button>
            <p className="form-status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        ) : null}
      </div>
    </section>
  );
}
