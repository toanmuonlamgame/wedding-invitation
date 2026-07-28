"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  MAX_ALBUM_INTERVAL_MS,
  MIN_ALBUM_INTERVAL_MS,
} from "@/src/lib/album-autoplay";
import { normalizeImageFraming } from "@/src/lib/image-framing";
import type { FieldErrors } from "@/src/types/engagement";
import type {
  GalleryMoment,
  LoveStoryChapter,
  WeddingContentData,
  WeddingEvent,
} from "@/src/types/wedding";

const adminLoading = () => (
  <p className="admin-local-loading" role="status">
    Đang tải công cụ…
  </p>
);

const AdminInvitationManager = dynamic(
  () =>
    import("@/src/components/AdminInvitationManager").then(
      (module) => module.AdminInvitationManager,
    ),
  { loading: adminLoading },
);
const AppearanceEditor = dynamic(
  () =>
    import("@/src/components/AppearanceEditor").then(
      (module) => module.AppearanceEditor,
    ),
  { loading: adminLoading },
);
const CoverEditor = dynamic(
  () =>
    import("@/src/components/ExperienceEditor").then(
      (module) => module.CoverEditor,
    ),
  { loading: adminLoading },
);
const ExperienceEditor = dynamic(
  () =>
    import("@/src/components/ExperienceEditor").then(
      (module) => module.ExperienceEditor,
    ),
  { loading: adminLoading },
);
const ImageFramingEditor = dynamic(
  () =>
    import("@/src/components/ImageFramingEditor").then(
      (module) => module.ImageFramingEditor,
    ),
  { loading: adminLoading },
);
const MediaUploader = dynamic(
  () =>
    import("@/src/components/MediaUploader").then(
      (module) => module.MediaUploader,
    ),
  { loading: adminLoading },
);
const AdminWishManager = dynamic(
  () =>
    import("@/src/components/AdminEngagement").then(
      (module) => module.AdminWishManager,
    ),
  { loading: adminLoading },
);
const AdminRsvpManager = dynamic(
  () =>
    import("@/src/components/AdminEngagement").then(
      (module) => module.AdminRsvpManager,
    ),
  { loading: adminLoading },
);
const AdminDataExport = dynamic(
  () =>
    import("@/src/components/AdminDataExport").then(
      (module) => module.AdminDataExport,
    ),
  { loading: adminLoading },
);

type WeddingAdminProps = {
  initialContent: WeddingContentData;
  standalone?: boolean;
};

type AdminTab =
  | "overview"
  | "invitations"
  | "appearance"
  | "cover"
  | "experience"
  | "general"
  | "venues"
  | "story"
  | "album"
  | "wishes"
  | "rsvps"
  | "export";

function cloneContent(content: WeddingContentData): WeddingContentData {
  return JSON.parse(JSON.stringify(content)) as WeddingContentData;
}

function normalizeDateTime(value: string | null) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  const vietnameseDateTime = normalized.match(
    /^(\d{2})\/(\d{2})\/(\d{4})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (vietnameseDateTime) {
    const [, day, month, year, hour, minute, second = "00"] =
      vietnameseDateTime;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00+07:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}+07:00`;
  }

  return normalized;
}

function toVietnamDateTimeInput(value: string | null) {
  const normalized = value?.trim();
  if (!normalized) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return normalized;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function normalizeContent(content: WeddingContentData): WeddingContentData {
  return {
    themePreset: content.themePreset,
    fontPreset: content.fontPreset,
    experience: content.experience,
    weddingDateTime: normalizeDateTime(content.weddingDateTime),
    expiredCountdownMessage: content.expiredCountdownMessage.trim(),
    albumIntervalMs: Number(content.albumIntervalMs),
    venues: content.venues.map((venue) => ({
      ...venue,
      ...normalizeImageFraming(venue),
      id: venue.id.trim(),
      title: venue.title.trim(),
      eventType: venue.eventType.trim(),
      dateTime: normalizeDateTime(venue.dateTime),
      venueName: venue.venueName.trim(),
      address: venue.address.trim(),
      mapsUrl: venue.mapsUrl?.trim() || null,
      note: venue.note?.trim() || undefined,
      imageSrc: venue.imageSrc?.trim() || undefined,
      imageStoragePath: venue.imageStoragePath?.trim() || undefined,
      imageAlt: venue.imageAlt?.trim() || undefined,
      showImage: Boolean(venue.showImage),
    })),
    storyChapters: content.storyChapters.map((chapter) => ({
      ...chapter,
      ...normalizeImageFraming(chapter),
      id: chapter.id.trim(),
      chapterNumber: chapter.chapterNumber.trim(),
      period: chapter.period.trim(),
      title: chapter.title.trim(),
      summary: chapter.summary.trim(),
      fullStory: chapter.fullStory.trim(),
      imageSrc: chapter.imageSrc?.trim() || undefined,
      imageStoragePath: chapter.imageStoragePath?.trim() || undefined,
      imageAlt: chapter.imageAlt.trim(),
    })),
    galleryImages: content.galleryImages.map((image) => ({
      ...image,
      ...normalizeImageFraming(image),
      id: image.id.trim(),
      src: image.src.trim(),
      storagePath: image.storagePath?.trim() || undefined,
      alt: image.alt.trim(),
      caption: image.caption.trim(),
    })),
  };
}

function tabForField(path: string): AdminTab {
  if (path === "themePreset" || path === "fontPreset") return "appearance";
  if (path.startsWith("experience.cover.")) return "cover";
  if (path.startsWith("experience.")) return "experience";
  if (path.startsWith("venues.")) return "venues";
  if (path.startsWith("storyChapters.")) return "story";
  if (path.startsWith("galleryImages.")) return "album";
  return "general";
}

function AdminFieldError({
  errors,
  path,
}: {
  errors: FieldErrors;
  path: string;
}) {
  const message = errors[path];
  return message ? (
    <span className="field-error" id={`admin-error-${path.replaceAll(".", "-")}`}>
      {message}
    </span>
  ) : null;
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
    positionX: 50,
    positionY: 50,
    zoom: 1,
    fitMode: "cover",
    backgroundColor: "#ffffff",
    showImage: false,
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
    positionX: 50,
    positionY: 50,
    zoom: 1,
    fitMode: "cover",
    backgroundColor: "#ffffff",
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
    positionX: 50,
    positionY: 50,
    zoom: 1,
    fitMode: "cover",
    backgroundColor: "#ffffff",
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const secretInputRef = useRef<HTMLInputElement>(null);

  function clearFieldError(path: string) {
    setFieldErrors((current) => {
      if (!current[path]) return current;
      const next = { ...current };
      delete next[path];
      return next;
    });
  }

  function fieldProps(path: string) {
    const hasError = Boolean(fieldErrors[path]?.length);
    return {
      "aria-describedby": hasError
        ? `admin-error-${path.replaceAll(".", "-")}`
        : undefined,
      "aria-invalid": hasError,
      "data-field-path": path,
    } as const;
  }

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
    setFieldErrors({});
    setStatus("Đang lưu nội dung chung…");

    try {
      const normalized = normalizeContent(draft);
      const response = await fetch("/api/wedding-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...normalized, creatorSecret }),
      });
      const payload = (await response.json()) as
        | WeddingContentData
        | { fieldErrors?: FieldErrors; message?: unknown };

      if (!response.ok) {
        if ("fieldErrors" in payload && payload.fieldErrors) {
          const nextErrors = payload.fieldErrors;
          setFieldErrors(nextErrors);
          const firstPath = Object.keys(nextErrors)[0];
          if (firstPath) {
            setActiveTab(tabForField(firstPath));
            window.requestAnimationFrame(() => {
              document
                .querySelector<HTMLElement>(
                  `[data-field-path="${CSS.escape(firstPath)}"]`,
                )
                ?.focus();
            });
          }
        }
        const message =
          "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Chưa thể lưu nội dung lúc này.";
        throw new Error(message);
      }

      const saved = payload as WeddingContentData;
      setSavedContent(cloneContent(saved));
      setDraft(cloneContent(saved));
      setFieldErrors({});
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
    setFieldErrors({});
    setStatus("Đã khôi phục nội dung từ lần lưu gần nhất.");
  }

  function closeAdmin() {
    setIsUnlocked(false);
    setIsUnlockOpen(standalone);
    setCreatorSecret("");
    setStatus("");
  }

  function updateVenue(index: number, patch: Partial<WeddingEvent>) {
    Object.keys(patch).forEach((key) =>
      clearFieldError(`venues.${index}.${key}`),
    );
    setDraft((current) => ({
      ...current,
      venues: current.venues.map((venue, venueIndex) =>
        venueIndex === index ? { ...venue, ...patch } : venue,
      ),
    }));
  }

  function updateChapter(index: number, patch: Partial<LoveStoryChapter>) {
    Object.keys(patch).forEach((key) =>
      clearFieldError(`storyChapters.${index}.${key}`),
    );
    setDraft((current) => ({
      ...current,
      storyChapters: current.storyChapters.map((chapter, chapterIndex) =>
        chapterIndex === index ? { ...chapter, ...patch } : chapter,
      ),
    }));
  }

  function updateImage(index: number, patch: Partial<GalleryMoment>) {
    Object.keys(patch).forEach((key) =>
      clearFieldError(`galleryImages.${index}.${key}`),
    );
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
                ["invitations", "Quản lý thiệp mời"],
                ["appearance", "Giao diện thiệp"],
                ["cover", "Cover / Mở thiệp"],
                ["experience", "Trải nghiệm"],
                ["general", "Countdown"],
                ["venues", "Địa điểm"],
                ["story", "Quản lý câu chuyện"],
                ["album", "Quản lý album"],
                ["wishes", "Lời chúc"],
                ["rsvps", "RSVP"],
                ["export", "Xuất dữ liệu"],
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
                    Ngày cưới (Giờ Việt Nam)
                  </label>
                  <input
                    id="adminWeddingDateTime"
                    {...fieldProps("weddingDateTime")}
                    type="datetime-local"
                    value={toVietnamDateTimeInput(draft.weddingDateTime)}
                    onChange={(event) => {
                      clearFieldError("weddingDateTime");
                      setDraft((current) => ({
                        ...current,
                        weddingDateTime: event.target.value || null,
                      }));
                    }}
                  />
                  <AdminFieldError errors={fieldErrors} path="weddingDateTime" />
                </div>
                <div className="field">
                  <label htmlFor="adminExpiredMessage">
                    Thông điệp khi countdown kết thúc
                  </label>
                  <input
                    id="adminExpiredMessage"
                    {...fieldProps("expiredCountdownMessage")}
                    value={draft.expiredCountdownMessage}
                    maxLength={200}
                    onChange={(event) => {
                      clearFieldError("expiredCountdownMessage");
                      setDraft((current) => ({
                        ...current,
                        expiredCountdownMessage: event.target.value,
                      }));
                    }}
                  />
                  <AdminFieldError
                    errors={fieldErrors}
                    path="expiredCountdownMessage"
                  />
                </div>
                <div className="field">
                  <label htmlFor="adminAlbumInterval">
                    Chu kỳ carousel (mili giây)
                  </label>
                  <input
                    id="adminAlbumInterval"
                    {...fieldProps("albumIntervalMs")}
                    type="number"
                    min={MIN_ALBUM_INTERVAL_MS}
                    max={MAX_ALBUM_INTERVAL_MS}
                    step={500}
                    value={draft.albumIntervalMs}
                    onChange={(event) => {
                      clearFieldError("albumIntervalMs");
                      setDraft((current) => ({
                        ...current,
                        albumIntervalMs: Number(event.target.value),
                      }));
                    }}
                  />
                  <AdminFieldError errors={fieldErrors} path="albumIntervalMs" />
                </div>
              </div>
            ) : null}

            {activeTab === "invitations" ? (
              <AdminInvitationManager creatorSecret={creatorSecret} />
            ) : null}

            {activeTab === "appearance" ? (
              <AppearanceEditor
                themePreset={draft.themePreset}
                fontPreset={draft.fontPreset}
                previewImage={
                  draft.galleryImages.find(
                    (image) => image.visible && image.available,
                  ) ?? draft.galleryImages.find((image) => image.visible)
                }
                isSaving={isSaving}
                onChange={(appearance) => {
                  clearFieldError("themePreset");
                  clearFieldError("fontPreset");
                  setDraft((current) => ({ ...current, ...appearance }));
                }}
                onSave={() => void handleSave()}
              />
            ) : null}

            {activeTab === "cover" ? (
              <CoverEditor
                value={draft.experience.cover}
                creatorSecret={creatorSecret}
                onChange={(cover) =>
                  setDraft((current) => ({
                    ...current,
                    experience: { ...current.experience, cover },
                  }))
                }
              />
            ) : null}

            {activeTab === "experience" ? (
              <ExperienceEditor
                value={draft.experience}
                creatorSecret={creatorSecret}
                onChange={(experience) =>
                  setDraft((current) => ({ ...current, experience }))
                }
              />
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
                          {...fieldProps(`venues.${index}.title`)}
                          value={venue.title}
                          onChange={(event) =>
                            updateVenue(index, { title: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.title`}
                        />
                      </label>
                      <label>
                        Loại sự kiện
                        <input
                          {...fieldProps(`venues.${index}.eventType`)}
                          value={venue.eventType}
                          onChange={(event) =>
                            updateVenue(index, { eventType: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.eventType`}
                        />
                      </label>
                      <label>
                        Ngày giờ sự kiện (Giờ Việt Nam)
                        <input
                          {...fieldProps(`venues.${index}.dateTime`)}
                          type="datetime-local"
                          value={toVietnamDateTimeInput(venue.dateTime)}
                          onChange={(event) =>
                            updateVenue(index, {
                              dateTime: event.target.value || null,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.dateTime`}
                        />
                      </label>
                      <label>
                        Tên địa điểm
                        <input
                          {...fieldProps(`venues.${index}.venueName`)}
                          value={venue.venueName}
                          onChange={(event) =>
                            updateVenue(index, { venueName: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.venueName`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Địa chỉ
                        <textarea
                          {...fieldProps(`venues.${index}.address`)}
                          value={venue.address}
                          onChange={(event) =>
                            updateVenue(index, { address: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.address`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Google Maps HTTPS
                        <input
                          {...fieldProps(`venues.${index}.mapsUrl`)}
                          value={venue.mapsUrl ?? ""}
                          onChange={(event) =>
                            updateVenue(index, {
                              mapsUrl: event.target.value || null,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.mapsUrl`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Ghi chú
                        <textarea
                          {...fieldProps(`venues.${index}.note`)}
                          value={venue.note ?? ""}
                          onChange={(event) =>
                            updateVenue(index, { note: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.note`}
                        />
                      </label>
                      <div className="admin-wide-field">
                        <MediaUploader
                          category="venues"
                          creatorSecret={creatorSecret}
                          existingMedia={
                            venue.imageSrc
                              ? {
                                  src: venue.imageSrc,
                                  storagePath: venue.imageStoragePath,
                                  alt:
                                    venue.imageAlt ||
                                    `Ảnh địa điểm ${venue.venueName}`,
                                }
                              : undefined
                          }
                          onUploaded={(media, file) =>
                            updateVenue(index, {
                              imageSrc: media.publicUrl,
                              imageStoragePath: media.storagePath,
                              imageAlt:
                                venue.imageAlt ||
                                `Ảnh địa điểm ${venue.venueName || file.name}`,
                              showImage: true,
                            })
                          }
                          onRemoveMetadata={() =>
                            updateVenue(index, {
                              imageSrc: undefined,
                              imageStoragePath: undefined,
                              showImage: false,
                            })
                          }
                        />
                        {venue.imageSrc ? (
                          <ImageFramingEditor
                            src={venue.imageSrc}
                            alt={
                              venue.imageAlt ||
                              `Ảnh địa điểm ${venue.venueName}`
                            }
                            value={venue}
                            variant="venue"
                            onChange={(framing) =>
                              updateVenue(index, framing)
                            }
                          />
                        ) : null}
                      </div>
                      <label>
                        Alt text ảnh địa điểm
                        <input
                          {...fieldProps(`venues.${index}.imageAlt`)}
                          value={venue.imageAlt ?? ""}
                          onChange={(event) =>
                            updateVenue(index, {
                              imageAlt: event.target.value || undefined,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`venues.${index}.imageAlt`}
                        />
                      </label>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={venue.showImage}
                          disabled={!venue.imageSrc}
                          onChange={(event) =>
                            updateVenue(index, {
                              showImage: event.target.checked,
                            })
                          }
                        />
                        Hiển thị ảnh địa điểm
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
                          {...fieldProps(`storyChapters.${index}.chapterNumber`)}
                          value={chapter.chapterNumber}
                          onChange={(event) =>
                            updateChapter(index, {
                              chapterNumber: event.target.value,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.chapterNumber`}
                        />
                      </label>
                      <label>
                        Mốc thời gian
                        <input
                          {...fieldProps(`storyChapters.${index}.period`)}
                          value={chapter.period}
                          onChange={(event) =>
                            updateChapter(index, { period: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.period`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Tiêu đề
                        <input
                          {...fieldProps(`storyChapters.${index}.title`)}
                          value={chapter.title}
                          onChange={(event) =>
                            updateChapter(index, { title: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.title`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Tóm tắt
                        <textarea
                          {...fieldProps(`storyChapters.${index}.summary`)}
                          value={chapter.summary}
                          onChange={(event) =>
                            updateChapter(index, { summary: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.summary`}
                        />
                      </label>
                      <label className="admin-wide-field">
                        Nội dung đầy đủ
                        <textarea
                          className="admin-story-textarea"
                          {...fieldProps(`storyChapters.${index}.fullStory`)}
                          value={chapter.fullStory}
                          onChange={(event) =>
                            updateChapter(index, {
                              fullStory: event.target.value,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.fullStory`}
                        />
                      </label>
                      <label>
                        Ảnh từ album
                        <select
                          {...fieldProps(`storyChapters.${index}.imageSrc`)}
                          value={chapter.imageSrc ?? ""}
                          onChange={(event) => {
                            const selectedImage = draft.galleryImages.find(
                              (image) => image.src === event.target.value,
                            );
                            updateChapter(index, {
                              imageSrc: event.target.value || undefined,
                              imageStoragePath:
                                selectedImage?.storagePath || undefined,
                              ...(selectedImage
                                ? normalizeImageFraming(selectedImage)
                                : normalizeImageFraming(undefined)),
                            });
                          }}
                        >
                          <option value="">Không chọn ảnh</option>
                          {draft.galleryImages.map((image) => (
                            <option value={image.src} key={image.id}>
                              {image.src}
                            </option>
                          ))}
                        </select>
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.imageSrc`}
                        />
                      </label>
                      <div className="admin-wide-field">
                        <MediaUploader
                          category="story"
                          creatorSecret={creatorSecret}
                          existingMedia={
                            chapter.imageSrc
                              ? {
                                  src: chapter.imageSrc,
                                  storagePath: chapter.imageStoragePath,
                                  alt: chapter.imageAlt,
                                }
                              : undefined
                          }
                          onUploaded={(media) =>
                            updateChapter(index, {
                              imageSrc: media.publicUrl,
                              imageStoragePath: media.storagePath,
                            })
                          }
                          onRemoveMetadata={() =>
                            updateChapter(index, {
                              imageSrc: undefined,
                              imageStoragePath: undefined,
                            })
                          }
                        />
                        {chapter.imageSrc ? (
                          <ImageFramingEditor
                            src={chapter.imageSrc}
                            alt={chapter.imageAlt}
                            value={chapter}
                            variant="story"
                            onChange={(framing) =>
                              updateChapter(index, framing)
                            }
                          />
                        ) : null}
                      </div>
                      <label>
                        Alt text
                        <input
                          {...fieldProps(`storyChapters.${index}.imageAlt`)}
                          value={chapter.imageAlt}
                          onChange={(event) =>
                            updateChapter(index, {
                              imageAlt: event.target.value,
                            })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`storyChapters.${index}.imageAlt`}
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
                <MediaUploader
                  category="album"
                  creatorSecret={creatorSecret}
                  multiple
                  onUploaded={(media, file) =>
                    setDraft((current) => ({
                      ...current,
                      galleryImages: [
                        ...current.galleryImages,
                        {
                          id: `image-${crypto.randomUUID()}`,
                          src: media.publicUrl,
                          storagePath: media.storagePath,
                          available: true,
                          alt: file.name.replace(/\.[^.]+$/, "").slice(0, 200),
                          caption: file.name
                            .replace(/\.[^.]+$/, "")
                            .slice(0, 120),
                          positionX: 50,
                          positionY: 50,
                          zoom: 1,
                          fitMode: "cover",
                          backgroundColor: "#ffffff",
                          featured: false,
                          carousel: true,
                          visible: true,
                        },
                      ],
                    }))
                  }
                />
                {draft.galleryImages.map((image, index) => (
                  <fieldset className="admin-item" key={image.id}>
                    <legend>
                      Ảnh {index + 1}: {image.caption}
                    </legend>
                    <div className="admin-form-grid">
                      <div className="admin-wide-field">
                        <MediaUploader
                          category="album"
                          creatorSecret={creatorSecret}
                          existingMedia={{
                            src: image.src,
                            storagePath: image.storagePath,
                            alt: image.alt,
                          }}
                          onUploaded={(media) =>
                            updateImage(index, {
                              src: media.publicUrl,
                              storagePath: media.storagePath,
                              available: true,
                            })
                          }
                          onRemoveMetadata={() =>
                            setDraft((current) => ({
                              ...current,
                              galleryImages: current.galleryImages.filter(
                                (_, imageIndex) => imageIndex !== index,
                              ),
                            }))
                          }
                        />
                        <ImageFramingEditor
                          src={image.src}
                          alt={image.alt}
                          value={image}
                          variant="album"
                          onChange={(framing) =>
                            updateImage(index, framing)
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`galleryImages.${index}.src`}
                        />
                      </div>
                      <label>
                        Chú thích
                        <input
                          {...fieldProps(`galleryImages.${index}.caption`)}
                          value={image.caption}
                          onChange={(event) =>
                            updateImage(index, { caption: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`galleryImages.${index}.caption`}
                        />
                      </label>
                      <label>
                        Alt text
                        <input
                          {...fieldProps(`galleryImages.${index}.alt`)}
                          value={image.alt}
                          onChange={(event) =>
                            updateImage(index, { alt: event.target.value })
                          }
                        />
                        <AdminFieldError
                          errors={fieldErrors}
                          path={`galleryImages.${index}.alt`}
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

            {activeTab === "wishes" ? (
              <AdminWishManager creatorSecret={creatorSecret} />
            ) : null}

            {activeTab === "rsvps" ? (
              <AdminRsvpManager creatorSecret={creatorSecret} />
            ) : null}

            {activeTab === "export" ? (
              <AdminDataExport creatorSecret={creatorSecret} />
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
