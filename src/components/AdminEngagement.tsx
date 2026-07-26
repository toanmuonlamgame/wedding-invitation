"use client";

import { useEffect, useState } from "react";
import type {
  AdminRsvp,
  AdminWeddingWish,
  FieldErrors,
  RsvpSummary,
} from "@/src/types/engagement";

type AdminManagerProps = {
  creatorSecret: string;
};

type ErrorPayload = {
  message?: unknown;
  fieldErrors?: unknown;
};

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

async function getResponseError(response: Response) {
  const payload = (await response.json()) as ErrorPayload;
  return {
    message:
      typeof payload.message === "string"
        ? payload.message
        : "Chưa thể hoàn tất thao tác.",
    fieldErrors:
      payload.fieldErrors && typeof payload.fieldErrors === "object"
        ? (payload.fieldErrors as FieldErrors)
        : {},
  };
}

export function AdminWishManager({ creatorSecret }: AdminManagerProps) {
  const [wishes, setWishes] = useState<AdminWeddingWish[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftVisible, setDraftVisible] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("Đang tải lời chúc…");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorSecret }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await getResponseError(response)).message);
        }
        return (await response.json()) as AdminWeddingWish[];
      })
      .then((data) => {
        if (active) {
          setWishes(data);
          setStatus(data.length ? "" : "Chưa có lời chúc nào.");
        }
      })
      .catch((error) => {
        if (active) {
          setStatus(
            error instanceof Error ? error.message : "Chưa thể tải lời chúc.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [creatorSecret]);

  function beginEdit(wish: AdminWeddingWish) {
    setEditingId(wish.id);
    setDraftName(wish.senderName);
    setDraftMessage(wish.message);
    setDraftVisible(wish.isVisible);
    setFieldErrors({});
    setStatus("");
  }

  async function saveWish() {
    if (!editingId || isWorking) {
      return;
    }
    setIsWorking(true);
    setFieldErrors({});

    try {
      const response = await fetch(`/api/admin/wishes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSecret,
          senderName: draftName.trim(),
          message: draftMessage.trim(),
          isVisible: draftVisible,
        }),
      });
      if (!response.ok) {
        const error = await getResponseError(response);
        setFieldErrors(error.fieldErrors);
        throw new Error(error.message);
      }
      setWishes((current) =>
        current.map((wish) =>
          wish.id === editingId
            ? {
                ...wish,
                senderName: draftName.trim(),
                message: draftMessage.trim(),
                isVisible: draftVisible,
                updatedAt: new Date().toISOString(),
              }
            : wish,
        ),
      );
      setEditingId(null);
      setStatus("Đã cập nhật lời chúc.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Chưa thể cập nhật lời chúc.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function deleteWish(id: string) {
    if (
      isWorking ||
      !window.confirm("Xóa vĩnh viễn lời chúc này? Thao tác không thể hoàn tác.")
    ) {
      return;
    }
    setIsWorking(true);
    try {
      const response = await fetch(`/api/admin/wishes/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorSecret }),
      });
      if (!response.ok) {
        throw new Error((await getResponseError(response)).message);
      }
      setWishes((current) => current.filter((wish) => wish.id !== id));
      setStatus("Đã xóa lời chúc.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Chưa thể xóa lời chúc.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="admin-engagement" aria-labelledby="admin-wishes-title">
      <header>
        <p className="section-eyebrow">Tương tác từ khách mời</p>
        <h3 id="admin-wishes-title">Quản lý lời chúc</h3>
      </header>
      <p className="form-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="admin-engagement-list">
        {wishes.map((wish) => (
          <article className="admin-engagement-item" key={wish.id}>
            {editingId === wish.id ? (
              <>
                <div className="field">
                  <label htmlFor={`wish-name-${wish.id}`}>Tên người gửi</label>
                  <input
                    id={`wish-name-${wish.id}`}
                    value={draftName}
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors.senderName)}
                    aria-describedby={
                      fieldErrors.senderName
                        ? `wish-name-error-${wish.id}`
                        : undefined
                    }
                    onChange={(event) => {
                      setDraftName(event.target.value);
                      setFieldErrors((current) => ({
                        ...current,
                        senderName: "",
                      }));
                    }}
                  />
                  {fieldErrors.senderName ? (
                    <p
                      className="field-error"
                      id={`wish-name-error-${wish.id}`}
                    >
                      {fieldErrors.senderName}
                    </p>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor={`wish-message-${wish.id}`}>Nội dung</label>
                  <textarea
                    id={`wish-message-${wish.id}`}
                    value={draftMessage}
                    maxLength={1_000}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={
                      fieldErrors.message
                        ? `wish-message-error-${wish.id}`
                        : undefined
                    }
                    onChange={(event) => {
                      setDraftMessage(event.target.value);
                      setFieldErrors((current) => ({
                        ...current,
                        message: "",
                      }));
                    }}
                  />
                  {fieldErrors.message ? (
                    <p
                      className="field-error"
                      id={`wish-message-error-${wish.id}`}
                    >
                      {fieldErrors.message}
                    </p>
                  ) : null}
                </div>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={draftVisible}
                    onChange={(event) => setDraftVisible(event.target.checked)}
                  />
                  Hiển thị công khai
                </label>
                <div className="admin-item-actions">
                  <button type="button" disabled={isWorking} onClick={saveWish}>
                    Lưu
                  </button>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => {
                      setEditingId(null);
                      setFieldErrors({});
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="admin-engagement-meta">
                  <strong>{wish.senderName}</strong>
                  <time dateTime={wish.createdAt}>
                    {formatAdminDate(wish.createdAt)}
                  </time>
                </div>
                <p>{wish.message}</p>
                <small>
                  {wish.recipientText
                    ? `Từ thiệp: ${wish.recipientText}`
                    : "Không gắn với thiệp"}
                  {" · "}
                  {wish.isVisible ? "Đang hiển thị" : "Đang ẩn"}
                </small>
                <div className="admin-item-actions">
                  <button type="button" onClick={() => beginEdit(wish)}>
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => deleteWish(wish.id)}
                  >
                    Xóa
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminRsvpManager({ creatorSecret }: AdminManagerProps) {
  const [entries, setEntries] = useState<AdminRsvp[]>([]);
  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [status, setStatus] = useState("Đang tải RSVP…");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/rsvps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorSecret }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await getResponseError(response)).message);
        }
        return (await response.json()) as {
          entries: AdminRsvp[];
          summary: RsvpSummary;
        };
      })
      .then((data) => {
        if (active) {
          setEntries(data.entries);
          setSummary(data.summary);
          setStatus(data.entries.length ? "" : "Chưa có khách nào phản hồi.");
        }
      })
      .catch((error) => {
        if (active) {
          setStatus(
            error instanceof Error ? error.message : "Chưa thể tải RSVP.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [creatorSecret]);

  return (
    <section className="admin-engagement" aria-labelledby="admin-rsvp-title">
      <header>
        <p className="section-eyebrow">Phản hồi tham dự</p>
        <h3 id="admin-rsvp-title">Khách đã xác nhận</h3>
      </header>
      {summary ? (
        <div className="rsvp-summary">
          <div>
            <strong>{summary.respondedInvitations}</strong>
            <span>Thiệp đã phản hồi</span>
          </div>
          <div>
            <strong>{summary.attendingInvitations}</strong>
            <span>Thiệp tham dự</span>
          </div>
          <div>
            <strong>{summary.attendingGuests}</strong>
            <span>Khách dự kiến</span>
          </div>
          <div>
            <strong>{summary.declinedInvitations}</strong>
            <span>Thiệp từ chối</span>
          </div>
          <div>
            <strong>{summary.pendingInvitations}</strong>
            <span>Chưa phản hồi</span>
          </div>
        </div>
      ) : null}
      <p className="form-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="admin-engagement-list">
        {entries.map((entry) => (
          <article
            className="admin-engagement-item"
            key={`${entry.recipientText}-${entry.updatedAt}`}
          >
            <div className="admin-engagement-meta">
              <strong>{entry.recipientText}</strong>
              <time dateTime={entry.updatedAt}>
                {formatAdminDate(entry.updatedAt)}
              </time>
            </div>
            <p>
              {entry.attending ? "Tham dự" : "Không tham dự"}
              {entry.attending
                ? ` · ${entry.confirmedCount ?? 0} người`
                : ""}
            </p>
            {entry.note ? <small>{entry.note}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
