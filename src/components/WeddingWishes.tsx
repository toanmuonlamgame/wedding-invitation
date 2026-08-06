"use client";

import { useState } from "react";
import type {
  FieldErrors,
  PublicWeddingWish,
} from "@/src/types/engagement";
import type { WishLayout } from "@/src/types/wedding";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";
import { WEDDING_TIME_ZONE } from "@/src/lib/wedding-format";

type WeddingWishesProps = {
  initialWishes: PublicWeddingWish[];
  invitationToken?: string;
  defaultSenderName?: string;
  layout: WishLayout;
  showList: boolean;
};

type ErrorPayload = {
  message?: unknown;
  fieldErrors?: unknown;
};

function formatWishDate(value: string, language: "vi" | "ko") {
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: WEDDING_TIME_ZONE,
  }).format(new Date(value));
}

export function WeddingWishes({
  initialWishes,
  invitationToken,
  defaultSenderName = "",
  layout,
  showList,
}: WeddingWishesProps) {
  const { language, messages } = useInvitationLocale();
  const copy = messages.wishes;
  const [wishes, setWishes] = useState(initialWishes);
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

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
      clientErrors.senderName = copy.nameError;
    }
    if (normalizedMessage.length < 2) {
      clientErrors.message = copy.messageError;
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus(copy.checkFields);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setStatus(copy.sendingStatus);

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
        setFieldErrors(
          language === "ko"
            ? Object.fromEntries(
                Object.keys(errors).map((field) => [
                  field,
                  field === "senderName" ? copy.nameError : copy.messageError,
                ]),
              )
            : errors,
        );
        throw new Error(
          language === "vi" && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : copy.sendFailed,
        );
      }

      const wish = payload as PublicWeddingWish;
      setWishes((current) => [wish, ...current].slice(0, 10));
      setSenderName(normalizedName);
      setMessage("");
      setStatus(copy.success);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : copy.sendFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if ((!showList || !wishes.length) && !invitationToken) return null;

  return (
    <section
      className="section wishes-section"
      aria-labelledby="wishes-title"
    >
      <div className="section-shell">
        <header className="section-heading">
          <p className="section-eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title" id="wishes-title">
            {copy.title}
          </h2>
          <p className="section-description">
            {copy.description}
          </p>
        </header>

        {showList && wishes.length > 0 ? (
          <div className={`wishes-list wishes-layout-${layout}`} data-layout={layout}>
            {wishes.slice(0, visibleCount).map((wish, index) => (
              <blockquote
                className="wish-note"
                key={`${wish.createdAt}-${wish.senderName}-${index}`}
              >
                <p>{wish.message}</p>
                <footer>
                  <strong>{wish.senderName}</strong>
                  <time dateTime={wish.createdAt}>
                    {formatWishDate(wish.createdAt, language)}
                  </time>
                </footer>
              </blockquote>
            ))}
          </div>
        ) : showList ? (
          <p className="wishes-empty">
            {copy.empty}
          </p>
        ) : null}
        {showList && wishes.length > visibleCount ? (
          <button
            className="button button-secondary wishes-load-more"
            type="button"
            onClick={() => setVisibleCount((count) => count + 6)}
          >
            {copy.showMore}
          </button>
        ) : null}

        {invitationToken ? (
          <form className="wish-form" onSubmit={handleSubmit} noValidate>
            <div>
              <p className="section-eyebrow">{copy.send}</p>
              <h3>{copy.formTitle}</h3>
            </div>
            <div className="field">
              <label htmlFor="wishSenderName">{copy.senderName}</label>
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
              <label htmlFor="wishMessage">{copy.message}</label>
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
              {isSubmitting ? copy.sending : copy.send}
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
