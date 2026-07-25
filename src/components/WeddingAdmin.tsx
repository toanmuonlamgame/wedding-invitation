"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type {
  GalleryMoment,
  LoveStoryChapter,
  WeddingContentData,
  WeddingEvent,
} from "@/src/types/wedding";

type WeddingAdminProps = {
  initialContent: WeddingContentData;
  standalone?: boolean;
};

type AdminTab =
  | "overview"
  | "general"
  | "venues"
  | "story"
  | "album";

function cloneContent(content: WeddingContentData): WeddingContentData {
  return JSON.parse(JSON.stringify(content)) as WeddingContentData;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function newVenue(): WeddingEvent {
  return {
    id: `venue-${crypto.randomUUID()}`,
    title: "Điểm hẹn mới",
    eventType: "Lễ thành hôn",
    dateTime: null,
    venueName: "Tên địa điểm",
    address: "Địa chỉ",
    mapsUrl: null,
    note: "",
    available: false,
  };
}

function newChapter(): LoveStoryChapter {
  return {
    id: `chapter-${crypto.randomUUID()}`,
    chapterNumber: "Chương mới",
    period: "Mốc thời gian",
    title: "Tiêu đề chương",
    summary: "Tóm tắt chương",
    fullStory: "Nội dung đầy đủ",
    imageAlt: "Ảnh minh họa câu chuyện",
    available: false,
    visible: true,
  };
}

function newGalleryImage(): GalleryMoment {
  return {
    id: `image-${crypto.randomUUID()}`,
    src: "/images/couple-05.jpg",
    available: false,
    alt: "Ảnh cưới của Vũ Bình và Thành Long",
    caption: "Khoảnh khắc mới",
    featured: false,
    carousel: true,
    visible: true,
  };
}

export function WeddingAdmin({
  initialContent,
  standalone = false,
}: WeddingAdminProps) {
  const router = useRouter();
  const [isUnlockOpen, setIsUnlockOpen] = useState(standalone);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [creatorSecret, setCreatorSecret] = useState("");
  const [savedContent, setSavedContent] = useState(() =>
    cloneContent(initialContent),
  );
  const [draft, setDraft] = useState(() => cloneContent(initialContent));
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const secretInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isUnlockOpen) {
      window.requestAnimationFrame(() => secretInputRef.current?.focus());
    }
  }, [isUnlockOpen]);

  useEffect(() => {
    if (!isUnlockOpen && !isUnlocked) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isUnlockOpen && !standalone) {
        setIsUnlockOpen(false);
        setCreatorSecret("");
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUnlockOpen, isUnlocked, standalone]);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang xác thực…");

    try {
      const response = await fetch("/api/wedding-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorSecret }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: unknown };
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Không thể xác thực quyền quản trị.",
        );
      }

      setIsUnlocked(true);
      setIsUnlockOpen(false);
      setStatus("Đã mở chế độ chỉnh sửa.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể xác thực lúc này.",
      );
    }
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setStatus("Đang lưu nội dung chung…");

    try {
      const response = await fetch("/api/wedding-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, creatorSecret }),
      });
      const payload = (await response.json()) as
        | WeddingContentData
        | { message?: unknown };

      if (!response.ok) {
        const message =
          "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Chưa thể lưu nội dung lúc này.";
        throw new Error(message);
      }

      const saved = payload as WeddingContentData;
      setSavedContent(cloneContent(saved));
      setDraft(cloneContent(saved));
      setStatus("Đã lưu. Các link thiệp sẽ dùng nội dung mới khi tải lại.");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu. Bản nháp vẫn được giữ.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setDraft(cloneContent(savedContent));
    setStatus("Đã khôi phục nội dung từ lần lưu gần nhất.");
  }

  function closeAdmin() {
    setIsUnlocked(false);
    setIsUnlockOpen(standalone);
    setCreatorSecret("");
    setStatus("");
  }

  function updateVenue(index: number, patch: Partial<WeddingEvent>) {
    setDraft((current) => ({
      ...current,
      venues: current.venues.map((venue, venueIndex) =>
        venueIndex === index ? { ...venue, ...patch } : venue,
      ),
    }));
  }

  function updateChapter(index: number, patch: Partial<LoveStoryChapter>) {
    setDraft((current) => ({
      ...current,
      storyChapters: current.storyChapters.map((chapter, chapterIndex) =>
        chapterIndex === index ? { ...chapter, ...patch } : chapter,
      ),
    }));
  }

  function updateImage(index: number, patch: Partial<GalleryMoment>) {
    setDraft((current) => ({
      ...current,
      galleryImages: current.galleryImages.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    }));
  }

  return (
    <aside className="wedding-admin" aria-label="Quản trị nội dung thiệp">
      {!isUnlocked ? (
        standalone ? null : (
          <button
            className="admin-entry-button"
            type="button"
            onClick={() => {
              setStatus("");
              setIsUnlockOpen(true);
            }}
          >
            Chỉnh sửa nội dung
          </button>
        )
      ) : (
        <div className="admin-panel">
          <header className="admin-panel-header">
            <div>
              <p className="section-eyebrow">Quản trị nhẹ</p>
              <h2>Nội dung chung của mọi thiệp</h2>
            </div>
            <div className="admin-header-actions">
              <a
                className="text-button"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                Xem trang thiệp
              </a>
              <button className="text-button" type="button" onClick={closeAdmin}>
                Khóa quản trị
              </button>
            </div>
          </header>

          <nav className="admin-tabs" aria-label="Nhóm nội dung chỉnh sửa">
            {(
              [
                ["overview", "Tổng quan & preview"],
                ["general", "Countdown"],
                ["venues", "Địa điểm"],
                ["story", "Quản lý câu chuyện"],
                ["album", "Quản lý album"],
              ] as const
            ).map(([tab, label]) => (
              <button
                type="button"
                key={tab}
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="admin-editor">
            {activeTab === "overview" ? (
              <section className="admin-overview" aria-labelledby="admin-preview-title">
                <div className="admin-overview-copy">
                  <p className="section-eyebrow">Bản xem trước công khai</p>
                  <h3 id="admin-preview-title">Thiệp của Vũ Bình & Thành Long</h3>
                  <p>
                    Preview luôn dùng nội dung đã lưu gần nhất. Sau khi lưu thay
                    đổi, tải lại khung xem trước để kiểm tra.
                  </p>
                </div>
                <iframe
                  className="admin-preview-frame"
                  src="/"
                  title="Xem trước trang thiệp công khai"
                />
              </section>
            ) : null}

            {activeTab === "general" ? (
              <div className="admin-form-grid">
                <div className="field">
                  <label htmlFor="adminWeddingDateTime">
                    Ngày giờ ISO có timezone
                  </label>
                  <input
                    id="adminWeddingDateTime"
                    value={draft.weddingDateTime ?? ""}
                    placeholder="2027-01-20T10:30:00+07:00"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        weddingDateTime: event.target.value || null,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="adminExpiredMessage">
                    Thông điệp khi countdown kết thúc
                  </label>
                  <input
                    id="adminExpiredMessage"
                    value={draft.expiredCountdownMessage}
                    maxLength={200}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        expiredCountdownMessage: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="adminAlbumInterval">
                    Chu kỳ carousel (mili giây)
                  </label>
                  <input
                    id="adminAlbumInterval"
                    type="number"
                    min={4000}
                    max={10000}
                    step={500}
                    value={draft.albumIntervalMs}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        albumIntervalMs: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            {activeTab === "venues" ? (
              <div className="admin-list">
                {draft.venues.map((venue, index) => (
                  <fieldset className="admin-item" key={venue.id}>
                    <legend>
                      Địa điểm {index + 1}: {venue.venueName}
                    </legend>
                    <div className="admin-form-grid">
                      <label>
                        Tiêu đề
                        <input
                          value={venue.title}
                          onChange={(event) =>
                            updateVenue(index, { title: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Loại sự kiện
                        <input
                          value={venue.eventType}
                          onChange={(event) =>
                            updateVenue(index, { eventType: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Ngày giờ ISO
                        <input
                          value={venue.dateTime ?? ""}
                          onChange={(event) =>
                            updateVenue(index, {
                              dateTime: event.target.value || null,
                            })
                          }
                        />
                      </label>
                      <label>
                        Tên địa điểm
                        <input
                          value={venue.venueName}
                          onChange={(event) =>
                            updateVenue(index, { venueName: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Địa chỉ
                        <textarea
                          value={venue.address}
                          onChange={(event) =>
                            updateVenue(index, { address: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Google Maps HTTPS
                        <input
                          value={venue.mapsUrl ?? ""}
                          onChange={(event) =>
                            updateVenue(index, {
                              mapsUrl: event.target.value || null,
                            })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Ghi chú
                        <textarea
                          value={venue.note ?? ""}
                          onChange={(event) =>
                            updateVenue(index, { note: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={venue.available}
                          onChange={(event) =>
                            updateVenue(index, {
                              available: event.target.checked,
                            })
                          }
                        />
                        Đã có thông tin thật
                      </label>
                    </div>
                    <AdminItemActions
                      index={index}
                      count={draft.venues.length}
                      onMove={(direction) =>
                        setDraft((current) => ({
                          ...current,
                          venues: moveItem(current.venues, index, direction),
                        }))
                      }
                      onDelete={() => {
                        if (
                          draft.venues.length > 1 &&
                          window.confirm("Xóa địa điểm này khỏi cấu hình?")
                        ) {
                          setDraft((current) => ({
                            ...current,
                            venues: current.venues.filter(
                              (_, venueIndex) => venueIndex !== index,
                            ),
                          }));
                        }
                      }}
                      canDelete={draft.venues.length > 1}
                    />
                  </fieldset>
                ))}
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      venues: [...current.venues, newVenue()],
                    }))
                  }
                >
                  Thêm địa điểm
                </button>
              </div>
            ) : null}

            {activeTab === "story" ? (
              <div className="admin-list">
                {draft.storyChapters.map((chapter, index) => (
                  <fieldset className="admin-item" key={chapter.id}>
                    <legend>
                      {chapter.chapterNumber}: {chapter.title}
                    </legend>
                    <div className="admin-form-grid">
                      <label>
                        Số chương
                        <input
                          value={chapter.chapterNumber}
                          onChange={(event) =>
                            updateChapter(index, {
                              chapterNumber: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Mốc thời gian
                        <input
                          value={chapter.period}
                          onChange={(event) =>
                            updateChapter(index, { period: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Tiêu đề
                        <input
                          value={chapter.title}
                          onChange={(event) =>
                            updateChapter(index, { title: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Tóm tắt
                        <textarea
                          value={chapter.summary}
                          onChange={(event) =>
                            updateChapter(index, { summary: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-wide-field">
                        Nội dung đầy đủ
                        <textarea
                          className="admin-story-textarea"
                          value={chapter.fullStory}
                          onChange={(event) =>
                            updateChapter(index, {
                              fullStory: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Ảnh từ album
                        <select
                          value={chapter.imageSrc ?? ""}
                          onChange={(event) =>
                            updateChapter(index, {
                              imageSrc: event.target.value || undefined,
                            })
                          }
                        >
                          <option value="">Không chọn ảnh</option>
                          {draft.galleryImages.map((image) => (
                            <option value={image.src} key={image.id}>
                              {image.src}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Alt text
                        <input
                          value={chapter.imageAlt}
                          onChange={(event) =>
                            updateChapter(index, {
                              imageAlt: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={chapter.available}
                          onChange={(event) =>
                            updateChapter(index, {
                              available: event.target.checked,
                            })
                          }
                        />
                        Hiển thị như nội dung chính thức
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={chapter.visible}
                          onChange={(event) =>
                            updateChapter(index, {
                              visible: event.target.checked,
                            })
                          }
                        />
                        Hiển thị chương trên thiệp
                      </label>
                    </div>
                    <div className="admin-preview">
                      <span>Xem trước</span>
                      <strong>{chapter.title}</strong>
                      <p>{chapter.summary}</p>
                    </div>
                    <AdminItemActions
                      index={index}
                      count={draft.storyChapters.length}
                      onMove={(direction) =>
                        setDraft((current) => ({
                          ...current,
                          storyChapters: moveItem(
                            current.storyChapters,
                            index,
                            direction,
                          ),
                        }))
                      }
                      onDelete={() => {
                        if (window.confirm("Xóa chương này khỏi câu chuyện?")) {
                          setDraft((current) => ({
                            ...current,
                            storyChapters: current.storyChapters.filter(
                              (_, chapterIndex) => chapterIndex !== index,
                            ),
                          }));
                        }
                      }}
                    />
                  </fieldset>
                ))}
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      storyChapters: [
                        ...current.storyChapters,
                        newChapter(),
                      ],
                    }))
                  }
                >
                  Thêm chương
                </button>
              </div>
            ) : null}

            {activeTab === "album" ? (
              <div className="admin-list">
                {draft.galleryImages.map((image, index) => (
                  <fieldset className="admin-item" key={image.id}>
                    <legend>
                      Ảnh {index + 1}: {image.caption}
                    </legend>
                    <div className="admin-form-grid">
                      <label className="admin-wide-field">
                        Đường dẫn trong public/images
                        <input
                          value={image.src}
                          onChange={(event) =>
                            updateImage(index, { src: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Chú thích
                        <input
                          value={image.caption}
                          onChange={(event) =>
                            updateImage(index, { caption: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Alt text
                        <input
                          value={image.alt}
                          onChange={(event) =>
                            updateImage(index, { alt: event.target.value })
                          }
                        />
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={image.available}
                          onChange={(event) =>
                            updateImage(index, {
                              available: event.target.checked,
                            })
                          }
                        />
                        File ảnh đã tồn tại
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={image.featured}
                          onChange={(event) =>
                            updateImage(index, {
                              featured: event.target.checked,
                            })
                          }
                        />
                        Ảnh nổi bật
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={image.carousel}
                          onChange={(event) =>
                            updateImage(index, {
                              carousel: event.target.checked,
                            })
                          }
                        />
                        Hiển thị trong carousel
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={image.visible}
                          onChange={(event) =>
                            updateImage(index, {
                              visible: event.target.checked,
                            })
                          }
                        />
                        Hiển thị ảnh trong album
                      </label>
                    </div>
                    <div className="admin-preview">
                      <span>Xem trước cấu hình</span>
                      <strong>{image.caption}</strong>
                      <p>{image.src}</p>
                    </div>
                    <AdminItemActions
                      index={index}
                      count={draft.galleryImages.length}
                      onMove={(direction) =>
                        setDraft((current) => ({
                          ...current,
                          galleryImages: moveItem(
                            current.galleryImages,
                            index,
                            direction,
                          ),
                        }))
                      }
                      onDelete={() => {
                        if (window.confirm("Xóa ảnh này khỏi cấu hình album?")) {
                          setDraft((current) => ({
                            ...current,
                            galleryImages: current.galleryImages.filter(
                              (_, imageIndex) => imageIndex !== index,
                            ),
                          }));
                        }
                      }}
                    />
                  </fieldset>
                ))}
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      galleryImages: [
                        ...current.galleryImages,
                        newGalleryImage(),
                      ],
                    }))
                  }
                >
                  Thêm ảnh
                </button>
              </div>
            ) : null}
          </div>

          <footer className="admin-panel-footer">
            <p aria-live="polite">{status}</p>
            <div>
              <button
                className="button button-secondary"
                type="button"
                disabled={isSaving}
                onClick={handleCancel}
              >
                Hủy thay đổi
              </button>
              <button
                className="button"
                type="button"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? "Đang lưu…" : "Lưu nội dung"}
              </button>
            </div>
          </footer>
        </div>
      )}

      {isUnlockOpen ? (
        <div
          className={`admin-unlock-backdrop${standalone ? " admin-unlock-page" : ""}`}
          role="presentation"
          onMouseDown={(event) => {
            if (!standalone && event.currentTarget === event.target) {
              setIsUnlockOpen(false);
              setCreatorSecret("");
            }
          }}
        >
          <form
            className="admin-unlock-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-unlock-title"
            onSubmit={handleUnlock}
          >
            {!standalone ? (
              <button
                className="dialog-close"
                type="button"
                aria-label="Đóng yêu cầu mã quản trị"
                onClick={() => {
                  setIsUnlockOpen(false);
                  setCreatorSecret("");
                }}
              >
                ×
              </button>
            ) : null}
            <p className="section-eyebrow">Dành cho gia đình</p>
            <h2 id="admin-unlock-title">Mở chế độ chỉnh sửa</h2>
            <div className="field">
              <label htmlFor="adminCreatorSecret">Mã quản trị</label>
              <input
                ref={secretInputRef}
                id="adminCreatorSecret"
                type="password"
                autoComplete="off"
                value={creatorSecret}
                maxLength={256}
                required
                onChange={(event) => setCreatorSecret(event.target.value)}
              />
            </div>
            <button className="button" type="submit">
              Xác thực
            </button>
            <p className="form-status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>
      ) : null}
    </aside>
  );
}

type AdminItemActionsProps = {
  index: number;
  count: number;
  canDelete?: boolean;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
};

function AdminItemActions({
  index,
  count,
  canDelete = true,
  onMove,
  onDelete,
}: AdminItemActionsProps) {
  return (
    <div className="admin-item-actions">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        Chuyển lên
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        Chuyển xuống
      </button>
      <button type="button" disabled={!canDelete} onClick={onDelete}>
        Xóa
      </button>
    </div>
  );
}
