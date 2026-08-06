"use client";

import { useCallback, useEffect, useState } from "react";
import { buildInvitationUrl } from "@/src/lib/invitation-links";
import type {
  AdminInvitationFilter,
  AdminInvitationItem,
  AdminInvitationPage,
  AdminInvitationSort,
} from "@/src/types/admin-invitation";
import { normalizeInvitationLanguage } from "@/src/lib/invitation-i18n";
import type { FieldErrors } from "@/src/types/engagement";

type AdminInvitationManagerProps = {
  creatorSecret: string;
};

type PendingAction =
  | { kind: "disable"; invitation: AdminInvitationItem }
  | { kind: "regenerate"; invitation: AdminInvitationItem }
  | { kind: "delete"; invitation: AdminInvitationItem }
  | null;

const EMPTY_PAGE: AdminInvitationPage = {
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
};

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value: string | null) {
  return value ? DATE_FORMAT.format(new Date(value)) : "Chưa có";
}

function responseLabel(invitation: AdminInvitationItem) {
  if (!invitation.rsvp) return "Chưa phản hồi";
  return invitation.rsvp.attending ? "Có tham dự" : "Không tham dự";
}

function matchesFilter(
  invitation: AdminInvitationItem,
  filter: AdminInvitationFilter,
) {
  if (filter === "pending") return !invitation.rsvp;
  if (filter === "attending") return invitation.rsvp?.attending === true;
  if (filter === "declined") return invitation.rsvp?.attending === false;
  if (filter === "wished") return invitation.wishCount > 0;
  if (filter === "unwished") return invitation.wishCount === 0;
  if (filter === "active") return invitation.isActive;
  if (filter === "inactive") return !invitation.isActive;
  return true;
}

export function AdminInvitationManager({
  creatorSecret,
}: AdminInvitationManagerProps) {
  const [data, setData] = useState(EMPTY_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AdminInvitationFilter>("all");
  const [sort, setSort] = useState<AdminInvitationSort>("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<AdminInvitationItem | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const loadInvitations = useCallback(async (preserveMessage = false) => {
    setLoading(true);
    if (!preserveMessage) setMessage("");
    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSecret,
          search,
          filter,
          sort,
          page,
          pageSize: 20,
        }),
      });
      const payload = (await response.json()) as
        | AdminInvitationPage
        | { message?: string };
      if (!response.ok || !("items" in payload)) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Không thể tải danh sách thiệp.",
        );
      }
      setData(payload);
      if (page > payload.totalPages) setPage(payload.totalPages);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách thiệp.",
      );
    } finally {
      setLoading(false);
    }
  }, [creatorSecret, filter, page, search, sort]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadInvitations(), 0);
    return () => window.clearTimeout(timer);
  }, [loadInvitations]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  async function copyLink(invitation: AdminInvitationItem) {
    try {
      await navigator.clipboard.writeText(
        buildInvitationUrl(window.location.origin, invitation.token),
      );
      setMessage(`Đã sao chép link dành cho ${invitation.recipientText}.`);
    } catch {
      setMessage("Không thể sao chép tự động. Hãy mở thiệp và sao chép từ trình duyệt.");
    }
  }

  async function runSimpleAction(
    invitation: AdminInvitationItem,
    action: "enable" | "disable" | "regenerate",
  ) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorSecret, action }),
      });
      const payload = (await response.json()) as {
        message?: string;
        token?: string;
      };
      if (!response.ok) {
        throw new Error(payload.message || "Không thể cập nhật thiệp.");
      }
      if (action === "regenerate" && payload.token) {
        setMessage(
          `Đã tạo link mới cho ${invitation.recipientText}. Link cũ không còn hoạt động.`,
        );
      } else {
        setMessage(
          action === "enable"
            ? `Đã bật lại thiệp của ${invitation.recipientText}.`
            : `Đã vô hiệu hóa thiệp của ${invitation.recipientText}.`,
        );
      }
      setPendingAction(null);
      setData((current) => {
        const updatedItems = current.items
          .map((item) =>
            item.id === invitation.id
              ? {
                  ...item,
                  token:
                    action === "regenerate" && payload.token
                      ? payload.token
                      : item.token,
                  isActive: action !== "disable",
                  disabledAt:
                    action === "disable" ? new Date().toISOString() : null,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          )
          .filter((item) => matchesFilter(item, filter));
        const removed = current.items.length - updatedItems.length;
        return {
          ...current,
          items: updatedItems,
          total: Math.max(0, current.total - removed),
        };
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteInvitation(invitation: AdminInvitationItem) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/invitations/${invitation.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorSecret }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Không thể xóa thiệp.");
      }
      setPendingAction(null);
      setMessage(`Đã xóa thiệp của ${invitation.recipientText}.`);
      setData((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== invitation.id),
        total: Math.max(0, current.total - 1),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa thiệp.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const guestCountValue = String(form.get("guestCount") || "").trim();
    const sideValue = String(form.get("invitationSide") || "unspecified");
    const updatedValues: Pick<
      AdminInvitationItem,
      | "recipientText"
      | "guestCount"
      | "invitationSide"
      | "privateMessage"
      | "label"
      | "adminNotes"
      | "language"
    > = {
      recipientText: String(form.get("recipientText") || "").trim(),
      guestCount: guestCountValue ? Number(guestCountValue) : null,
      invitationSide:
        sideValue === "groom" || sideValue === "bride"
          ? sideValue
          : ("unspecified" as const),
      privateMessage: String(form.get("privateMessage") || "").trim() || null,
      label: String(form.get("label") || "").trim() || null,
      adminNotes: String(form.get("adminNotes") || "").trim() || null,
      language: normalizeInvitationLanguage(form.get("language")),
    };
    setBusy(true);
    setEditErrors({});
    try {
      const response = await fetch(`/api/admin/invitations/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSecret,
          action: "update",
          ...updatedValues,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok) {
        setEditErrors(payload.fieldErrors || {});
        throw new Error(payload.message || "Dữ liệu thiệp chưa hợp lệ.");
      }
      setEditing(null);
      setMessage(`Đã cập nhật thiệp của ${editing.recipientText}.`);
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                ...updatedValues,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật thiệp.");
    } finally {
      setBusy(false);
    }
  }

  const filters: Array<[AdminInvitationFilter, string]> = [
    ["all", "Tất cả"],
    ["pending", "Chưa RSVP"],
    ["attending", "Có tham dự"],
    ["declined", "Không tham dự"],
    ["wished", "Đã gửi lời chúc"],
    ["unwished", "Chưa gửi lời chúc"],
    ["active", "Đang hoạt động"],
    ["inactive", "Đã vô hiệu hóa"],
  ];

  return (
    <section className="invitation-manager" aria-labelledby="invitation-manager-title">
      <div className="invitation-manager-heading">
        <div>
          <p className="section-eyebrow">Danh sách khách mời</p>
          <h3 id="invitation-manager-title">Quản lý thiệp mời</h3>
          <p>{data.total} thiệp phù hợp với bộ lọc hiện tại.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={() => void loadInvitations()}>
          Làm mới
        </button>
      </div>

      <div className="invitation-manager-tools">
        <label className="field invitation-search">
          <span>Tìm khách, token, nhãn hoặc ghi chú</span>
          <input
            type="search"
            value={searchInput}
            maxLength={200}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nhập từ khóa…"
          />
        </label>
        <label className="field">
          <span>Sắp xếp</span>
          <select
            value={sort}
            onChange={(event) => {
              setPage(1);
              setSort(event.target.value as AdminInvitationSort);
            }}
          >
            <option value="newest">Mới tạo trước</option>
            <option value="oldest">Cũ nhất trước</option>
            <option value="name-asc">Tên A–Z</option>
            <option value="name-desc">Tên Z–A</option>
            <option value="response-newest">Phản hồi mới nhất</option>
          </select>
        </label>
      </div>

      <div className="invitation-filter-list" aria-label="Lọc danh sách thiệp">
        {filters.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => {
              setPage(1);
              setFilter(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="admin-manager-message" role="status" aria-live="polite">
        {loading ? "Đang tải danh sách…" : message}
      </p>

      {!loading && data.items.length === 0 ? (
        <div className="admin-empty-state">
          <h4>Không tìm thấy thiệp phù hợp</h4>
          <p>Thử đổi từ khóa hoặc bộ lọc để xem các thiệp khác.</p>
        </div>
      ) : null}

      <div className="invitation-card-list">
        {data.items.map((invitation) => (
          <article className="invitation-admin-card" key={invitation.id}>
            <div className="invitation-card-primary">
              <div>
                <div className="invitation-badges">
                  <span className={invitation.isActive ? "status-active" : "status-inactive"}>
                    {invitation.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                  </span>
                  <span>{responseLabel(invitation)}</span>
                  <span className="invitation-language-badge">
                    {invitation.language === "ko" ? "한국어" : "Tiếng Việt"}
                  </span>
                  <span>
                    {invitation.wishCount > 0
                      ? "Đã gửi lời chúc"
                      : "Chưa gửi lời chúc"}
                  </span>
                  {invitation.label ? <span>{invitation.label}</span> : null}
                </div>
                <h4>{invitation.recipientText}</h4>
                <p className="invitation-token" title={invitation.token}>
                  Token: {invitation.token.slice(0, 10)}…
                </p>
              </div>
              <div className="invitation-card-actions">
                <button type="button" onClick={() => void copyLink(invitation)}>
                  Sao chép link
                </button>
                <a href={`/thiep/${invitation.token}`} target="_blank" rel="noreferrer">
                  Mở thiệp
                </a>
                <button type="button" onClick={() => setEditing(invitation)}>
                  Chỉnh sửa
                </button>
              </div>
            </div>

            <dl className="invitation-card-details">
              <div><dt>Số khách mời</dt><dd>{invitation.guestCount ?? "Không giới hạn"}</dd></div>
              <div><dt>Nhóm khách</dt><dd>{invitation.invitationSide === "groom" ? "Nhà trai" : invitation.invitationSide === "bride" ? "Nhà gái" : "Không phân loại"}</dd></div>
              <div><dt>RSVP xác nhận</dt><dd>{invitation.rsvp?.confirmedCount ?? "—"}</dd></div>
              <div><dt>Lời chúc</dt><dd>{invitation.wishCount}</dd></div>
              <div><dt>Tạo lúc</dt><dd>{formatDate(invitation.createdAt)}</dd></div>
              <div><dt>Cập nhật</dt><dd>{formatDate(invitation.updatedAt)}</dd></div>
              <div><dt>Phản hồi gần nhất</dt><dd>{formatDate(invitation.latestResponseAt)}</dd></div>
            </dl>
            {invitation.privateMessage ? (
              <p className="invitation-admin-note"><strong>Lời nhắn:</strong> {invitation.privateMessage}</p>
            ) : null}
            {invitation.adminNotes ? (
              <p className="invitation-admin-note"><strong>Ghi chú nội bộ:</strong> {invitation.adminNotes}</p>
            ) : null}

            <div className="invitation-danger-actions">
              {invitation.isActive ? (
                <button type="button" onClick={() => setPendingAction({ kind: "disable", invitation })}>
                  Vô hiệu hóa
                </button>
              ) : (
                <button type="button" onClick={() => void runSimpleAction(invitation, "enable")}>
                  Bật lại
                </button>
              )}
              <button type="button" onClick={() => setPendingAction({ kind: "regenerate", invitation })}>
                Tạo lại token
              </button>
              <button className="danger-text" type="button" onClick={() => setPendingAction({ kind: "delete", invitation })}>
                Xóa thiệp
              </button>
            </div>
          </article>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav className="admin-pagination" aria-label="Phân trang danh sách thiệp">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Trang trước
          </button>
          <span>Trang {data.page}/{data.totalPages}</span>
          <button type="button" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>
            Trang sau
          </button>
        </nav>
      ) : null}

      {editing ? (
        <div className="admin-dialog-backdrop" role="presentation">
          <form className="admin-action-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-invitation-title" onSubmit={saveEdit}>
            <h3 id="edit-invitation-title">Chỉnh sửa thiệp mời</h3>
            <label className="field">
              <span>Người được mời</span>
              <input name="recipientText" defaultValue={editing.recipientText} aria-invalid={Boolean(editErrors.recipientText)} />
              {editErrors.recipientText ? <span className="field-error">{editErrors.recipientText}</span> : null}
            </label>
            <label className="field">
              <span>Số người được mời</span>
              <input name="guestCount" type="number" min={1} max={20} defaultValue={editing.guestCount ?? ""} aria-invalid={Boolean(editErrors.guestCount)} />
              {editErrors.guestCount ? <span className="field-error">{editErrors.guestCount}</span> : null}
            </label>
            <label className="field">
              <span>Ngôn ngữ thiệp</span>
              <select name="language" defaultValue={editing.language}>
                <option value="vi">Tiếng Việt</option>
                <option value="ko">한국어</option>
              </select>
              {editErrors.language ? <span className="field-error">{editErrors.language}</span> : null}
            </label>
            <label className="field">
              <span>Nhóm khách mặc định</span>
              <select name="invitationSide" defaultValue={editing.invitationSide}>
                <option value="unspecified">Không phân loại</option>
                <option value="groom">Nhà trai</option>
                <option value="bride">Nhà gái</option>
              </select>
            </label>
            <label className="field">
              <span>Lời nhắn riêng</span>
              <textarea name="privateMessage" maxLength={500} defaultValue={editing.privateMessage ?? ""} aria-invalid={Boolean(editErrors.privateMessage)} />
              {editErrors.privateMessage ? <span className="field-error">{editErrors.privateMessage}</span> : null}
            </label>
            <label className="field">
              <span>Nhãn nội bộ</span>
              <input name="label" maxLength={80} defaultValue={editing.label ?? ""} aria-invalid={Boolean(editErrors.label)} />
              {editErrors.label ? <span className="field-error">{editErrors.label}</span> : null}
            </label>
            <label className="field">
              <span>Ghi chú nội bộ</span>
              <textarea name="adminNotes" maxLength={1000} defaultValue={editing.adminNotes ?? ""} aria-invalid={Boolean(editErrors.adminNotes)} />
              {editErrors.adminNotes ? <span className="field-error">{editErrors.adminNotes}</span> : null}
            </label>
            <div className="admin-dialog-actions">
              <button className="button button-secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Hủy</button>
              <button className="button" type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu thay đổi"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {pendingAction ? (
        <div className="admin-dialog-backdrop" role="presentation">
          <div className="admin-action-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-action-title">
            <h3 id="confirm-action-title">
              {pendingAction.kind === "delete"
                ? "Xóa vĩnh viễn thiệp?"
                : pendingAction.kind === "regenerate"
                  ? "Tạo lại token?"
                  : "Vô hiệu hóa thiệp?"}
            </h3>
            <p>
              {pendingAction.kind === "delete"
                ? "Thao tác này xóa thiệp và RSVP liên quan; lời chúc công khai được giữ nhưng không còn gắn với thiệp. Không thể hoàn tác."
                : pendingAction.kind === "regenerate"
                  ? "Link hiện tại sẽ ngừng hoạt động ngay. RSVP và lời chúc vẫn được giữ trên cùng thiệp."
                  : "Khách sẽ thấy thông báo thiệp không còn khả dụng và không thể gửi RSVP hoặc lời chúc."}
            </p>
            <p><strong>{pendingAction.invitation.recipientText}</strong></p>
            <div className="admin-dialog-actions">
              <button className="button button-secondary" type="button" disabled={busy} onClick={() => setPendingAction(null)}>Hủy</button>
              <button
                className={pendingAction.kind === "delete" ? "button button-danger" : "button"}
                type="button"
                disabled={busy}
                onClick={() => {
                  if (pendingAction.kind === "delete") {
                    void deleteInvitation(pendingAction.invitation);
                  } else {
                    void runSimpleAction(pendingAction.invitation, pendingAction.kind);
                  }
                }}
              >
                {busy ? "Đang xử lý…" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
