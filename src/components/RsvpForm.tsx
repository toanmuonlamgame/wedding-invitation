"use client";

import { useEffect, useState } from "react";
import type { FieldErrors, InvitationRsvp } from "@/src/types/engagement";
import type { InvitationSide } from "@/src/types/wedding";
import { useInvitationLocale } from "@/src/components/InvitationLocaleProvider";

type RsvpFormProps = {
  token: string;
  recipientText: string;
  suggestedCount: number;
  maximumGuests: number;
  defaultSide: InvitationSide;
  allowSideSelection: boolean;
};

type RsvpLoadPayload = {
  rsvp: InvitationRsvp | null;
};

export function RsvpForm({
  token,
  recipientText,
  suggestedCount,
  maximumGuests,
  defaultSide,
  allowSideSelection,
}: RsvpFormProps) {
  const { language, messages } = useInvitationLocale();
  const copy = messages.rsvp;
  const safeMaximumGuests = Math.max(1, maximumGuests);
  const [guestName, setGuestName] = useState(recipientText);
  const [invitationSide, setInvitationSide] =
    useState<InvitationSide>(defaultSide);
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
        setGuestName(payload.rsvp.guestName ?? recipientText);
        setInvitationSide(payload.rsvp.invitationSide ?? defaultSide);
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
          setStatus(copy.loadFailed);
        }
      });

    return () => {
      active = false;
    };
  }, [copy.loadFailed, defaultSide, recipientText, suggestedCount, token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const errors: FieldErrors = {};
    if (guestName.trim().length < 2) {
      errors.guestName = copy.nameError;
    }
    if (attending === null) {
      errors.attending = copy.attendingError;
    }
    const count = Number(confirmedCount);
    if (
      attending === true &&
      (!Number.isInteger(count) || count < 1 || count > safeMaximumGuests)
    ) {
      errors.confirmedCount = copy.countError;
    }
    if (note.trim().length > 500) {
      errors.note = copy.noteError;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus(copy.checkFields);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setStatus(copy.saving);

    try {
      const response = await fetch(`/api/invitations/${token}/rsvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestName.trim(),
          attending,
          confirmedCount: attending ? count : null,
          note: note.trim() || null,
          invitationSide,
        }),
      });
      const payload = (await response.json()) as {
        message?: unknown;
        fieldErrors?: unknown;
      };

      if (!response.ok) {
        if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
          const serverErrors = payload.fieldErrors as FieldErrors;
          setFieldErrors(
            language === "ko"
              ? Object.fromEntries(
                  Object.keys(serverErrors).map((field) => [
                    field,
                    field === "guestName"
                      ? copy.nameError
                      : field === "attending"
                        ? copy.attendingError
                        : field === "confirmedCount"
                          ? copy.countError
                          : copy.noteError,
                  ]),
                )
              : serverErrors,
          );
        }
        throw new Error(
          language === "vi" && typeof payload.message === "string"
            ? payload.message
            : copy.saveFailed,
        );
      }

      setHasExistingRsvp(true);
      setStatus(copy.success);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : copy.saveFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section rsvp-section" aria-labelledby="rsvp-title">
      <div className="section-shell rsvp-shell">
        <header>
          <p className="section-eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title" id="rsvp-title">
            {copy.title}
          </h2>
          <p className="rsvp-recipient">
            {copy.invitationFor} <strong>{recipientText}</strong>
          </p>
        </header>

        <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="rsvpGuestName">{copy.guestName}</label>
            <input
              id="rsvpGuestName"
              value={guestName}
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.guestName)}
              aria-describedby={
                fieldErrors.guestName ? "rsvpGuestNameError" : undefined
              }
              onChange={(event) => {
                setGuestName(event.target.value);
                setFieldErrors((current) => ({ ...current, guestName: "" }));
              }}
            />
            {fieldErrors.guestName ? (
              <p className="field-error" id="rsvpGuestNameError">
                {fieldErrors.guestName}
              </p>
            ) : null}
          </div>
          <fieldset
            className="rsvp-options"
            aria-invalid={Boolean(fieldErrors.attending)}
            aria-describedby={
              fieldErrors.attending ? "rsvpAttendingError" : undefined
            }
          >
            <legend>{copy.attendingQuestion}</legend>
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
              {copy.attendingYes}
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
              {copy.attendingNo}
            </label>
          </fieldset>
          {fieldErrors.attending ? (
            <p className="field-error" id="rsvpAttendingError">
              {fieldErrors.attending}
            </p>
          ) : null}

          {attending ? (
            <div className="field">
              <label htmlFor="confirmedCount">{copy.confirmedCount}</label>
              <input
                id="confirmedCount"
                type="number"
                min={1}
                max={safeMaximumGuests}
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
              <small>{copy.maximum(safeMaximumGuests)}</small>
              {fieldErrors.confirmedCount ? (
                <p className="field-error" id="confirmedCountError">
                  {fieldErrors.confirmedCount}
                </p>
              ) : null}
            </div>
          ) : null}

          {allowSideSelection ? (
            <div className="field">
              <label htmlFor="rsvpInvitationSide">{copy.sideQuestion}</label>
              <select
                id="rsvpInvitationSide"
                value={invitationSide}
                onChange={(event) =>
                  setInvitationSide(event.target.value as InvitationSide)
                }
              >
                <option value="unspecified">{copy.unspecified}</option>
                <option value="groom">{copy.groomSide}</option>
                <option value="bride">{copy.brideSide}</option>
              </select>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="rsvpNote">{copy.note}</label>
            <textarea
              id="rsvpNote"
              value={note}
              maxLength={500}
              placeholder={copy.notePlaceholder}
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
              ? copy.submitting
              : hasExistingRsvp
                ? copy.update
                : copy.submit}
          </button>
          <p className="form-status" role="status" aria-live="polite">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}
