"use client";

import { useEffect, useState } from "react";
import type { FieldErrors, InvitationRsvp } from "@/src/types/engagement";

type RsvpFormProps = {
  token: string;
  recipientText: string;
  suggestedCount: number;
};

type RsvpLoadPayload = {
  rsvp: InvitationRsvp | null;
};

export function RsvpForm({
  token,
  recipientText,
  suggestedCount,
}: RsvpFormProps) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(
    String(suggestedCount || 1),
  );
  const [note, setNote] = useState("");
  const [hasExistingRsvp, setHasExistingRsvp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    void fetch(`/api/invitations/${token}/rsvp`)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as RsvpLoadPayload;
      })
      .then((payload) => {
        if (!active || !payload?.rsvp) {
          return;
        }
        setAttending(payload.rsvp.attending);
        setConfirmedCount(
          payload.rsvp.confirmedCount === null
            ? String(suggestedCount || 1)
            : String(payload.rsvp.confirmedCount),
        );
        setNote(payload.rsvp.note ?? "");
        setHasExistingRsvp(true);
      })
      .catch(() => {
        if (active) {
          setStatus("Chưa thể tải xác nhận trước đó.");
        }
      });

    return () => {
      active = false;
    };
  }, [suggestedCount, token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const errors: FieldErrors = {};
    if (attending === null) {
      errors.attending = "Vui lòng chọn trạng thái tham dự.";
    }
    const count = Number(confirmedCount);
    if (
      attending === true &&
      (!Number.isInteger(count) || count < 1 || count > 20)
    ) {
      errors.confirmedCount = "Số người phải là số nguyên từ 1 đến 20.";
    }
    if (note.trim().length > 500) {
      errors.note = "Ghi chú không được quá 500 ký tự.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("Vui lòng kiểm tra các trường được đánh dấu.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setStatus("Đang lưu xác nhận…");

    try {
      const response = await fetch(`/api/invitations/${token}/rsvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attending,
          confirmedCount: attending ? count : null,
          note: note.trim() || null,
        }),
      });
      const payload = (await response.json()) as {
        message?: unknown;
        fieldErrors?: unknown;
      };

      if (!response.ok) {
        if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
          setFieldErrors(payload.fieldErrors as FieldErrors);
        }
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Chưa thể lưu xác nhận.",
        );
      }

      setHasExistingRsvp(true);
      setStatus("Cảm ơn bạn đã xác nhận tham dự.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu xác nhận lúc này.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section rsvp-section" aria-labelledby="rsvp-title">
      <div className="section-shell rsvp-shell">
        <header>
          <p className="section-eyebrow">Hẹn gặp bạn trong ngày vui</p>
          <h2 className="section-title" id="rsvp-title">
            Xác nhận tham dự
          </h2>
          <p className="rsvp-recipient">
            Thiệp dành cho: <strong>{recipientText}</strong>
          </p>
        </header>

        <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
          <fieldset
            className="rsvp-options"
            aria-invalid={Boolean(fieldErrors.attending)}
            aria-describedby={
              fieldErrors.attending ? "rsvpAttendingError" : undefined
            }
          >
            <legend>Bạn có thể tham dự không?</legend>
            <label data-selected={attending === true}>
              <input
                type="radio"
                name="attending"
                checked={attending === true}
                onChange={() => {
                  setAttending(true);
                  setFieldErrors((current) => ({
                    ...current,
                    attending: "",
                  }));
                }}
              />
              Tôi/chúng tôi sẽ tham dự
            </label>
            <label data-selected={attending === false}>
              <input
                type="radio"
                name="attending"
                checked={attending === false}
                onChange={() => {
                  setAttending(false);
                  setFieldErrors((current) => ({
                    ...current,
                    attending: "",
                    confirmedCount: "",
                  }));
                }}
              />
              Rất tiếc, tôi/chúng tôi không thể tham dự
            </label>
          </fieldset>
          {fieldErrors.attending ? (
            <p className="field-error" id="rsvpAttendingError">
              {fieldErrors.attending}
            </p>
          ) : null}

          {attending ? (
            <div className="field">
              <label htmlFor="confirmedCount">Số người xác nhận</label>
              <input
                id="confirmedCount"
                type="number"
                min={1}
                max={20}
                step={1}
                value={confirmedCount}
                aria-invalid={Boolean(fieldErrors.confirmedCount)}
                aria-describedby={
                  fieldErrors.confirmedCount
                    ? "confirmedCountError"
                    : undefined
                }
                onChange={(event) => {
                  setConfirmedCount(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    confirmedCount: "",
                  }));
                }}
              />
              {fieldErrors.confirmedCount ? (
                <p className="field-error" id="confirmedCountError">
                  {fieldErrors.confirmedCount}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="rsvpNote">Ghi chú (không bắt buộc)</label>
            <textarea
              id="rsvpNote"
              value={note}
              maxLength={500}
              placeholder="Ăn chay, trẻ nhỏ hoặc lời nhắn thêm…"
              aria-invalid={Boolean(fieldErrors.note)}
              aria-describedby={fieldErrors.note ? "rsvpNoteError" : undefined}
              onChange={(event) => {
                setNote(event.target.value);
                setFieldErrors((current) => ({ ...current, note: "" }));
              }}
            />
            {fieldErrors.note ? (
              <p className="field-error" id="rsvpNoteError">
                {fieldErrors.note}
              </p>
            ) : null}
          </div>

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu…"
              : hasExistingRsvp
                ? "Cập nhật xác nhận"
                : "Xác nhận tham dự"}
          </button>
          <p className="form-status" role="status" aria-live="polite">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}
