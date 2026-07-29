"use client";

import { CoverRenderer } from "@/src/components/CoverRenderer";
import { ImageFramingEditor } from "@/src/components/ImageFramingEditor";
import { MediaUploader } from "@/src/components/MediaUploader";
import { defaultExperienceSettings } from "@/src/lib/experience-settings";
import type { FieldErrors } from "@/src/types/engagement";
import type {
  CoverSettings,
  InvitationContentSettings,
  WeddingExperienceSettings,
  WishOverlayPreset,
} from "@/src/types/wedding";
import { InvitationCopy } from "@/src/sections/InvitationSection";

type CoverEditorProps = {
  value: CoverSettings;
  creatorSecret: string;
  errors: FieldErrors;
  onClearError: (path: string) => void;
  onChange: (value: CoverSettings) => void;
};

export function CoverEditor({
  value,
  creatorSecret,
  errors,
  onClearError,
  onChange,
}: CoverEditorProps) {
  const update = (patch: Partial<CoverSettings>, path?: string) => {
    if (path) onClearError(`experience.cover.${path}`);
    onChange({ ...value, ...patch });
  };
  const inputProps = (path: string) => {
    const fullPath = `experience.cover.${path}`;
    const hasError = Boolean(errors[fullPath]);
    return {
      "aria-invalid": hasError,
      "aria-describedby": hasError
        ? `cover-error-${path.replaceAll(".", "-")}`
        : undefined,
      "data-field-path": fullPath,
    } as const;
  };

  const coverErrors = Object.entries(errors).filter(([path]) =>
    path.startsWith("experience.cover."),
  );
  const clearFramingErrors = (prefix: string) => {
    ["fitMode", "positionX", "positionY", "zoom", "backgroundColor"].forEach(
      (field) => onClearError(`${prefix}.${field}`),
    );
  };

  return (
    <div className="admin-list">
      {coverErrors.length ? (
        <div className="admin-validation-summary" role="alert">
          <strong>Cover còn dữ liệu chưa hợp lệ:</strong>
          <ul>
            {coverErrors.map(([path, message]) => (
              <li key={path}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-form-grid">
        <Field label="Dòng mở đầu" error={errors["experience.cover.kicker"]} path="kicker">
          <input
            {...inputProps("kicker")}
            value={value.kicker}
            maxLength={100}
            onChange={(event) => update({ kicker: event.target.value }, "kicker")}
          />
        </Field>
        <Field label="Tên cô dâu" error={errors["experience.cover.brideName"]} path="brideName">
          <input
            {...inputProps("brideName")}
            value={value.brideName}
            maxLength={80}
            onChange={(event) =>
              update({ brideName: event.target.value }, "brideName")
            }
          />
        </Field>
        <Field label="Ký hiệu nối" error={errors["experience.cover.connector"]} path="connector">
          <input
            {...inputProps("connector")}
            value={value.connector}
            maxLength={12}
            onChange={(event) =>
              update({ connector: event.target.value }, "connector")
            }
          />
        </Field>
        <Field label="Tên chú rể" error={errors["experience.cover.groomName"]} path="groomName">
          <input
            {...inputProps("groomName")}
            value={value.groomName}
            maxLength={80}
            onChange={(event) =>
              update({ groomName: event.target.value }, "groomName")
            }
          />
        </Field>
        <Field label="Dòng mô tả" error={errors["experience.cover.note"]} path="note">
          <textarea
            {...inputProps("note")}
            value={value.note}
            maxLength={240}
            onChange={(event) => update({ note: event.target.value }, "note")}
          />
        </Field>
        <Field label="Nhãn nút mở" error={errors["experience.cover.buttonText"]} path="buttonText">
          <input
            {...inputProps("buttonText")}
            value={value.buttonText}
            maxLength={60}
            onChange={(event) =>
              update({ buttonText: event.target.value }, "buttonText")
            }
          />
        </Field>
        <Field
          label="Căn nội dung"
          error={errors["experience.cover.alignment"]}
          path="alignment"
        >
          <select
            {...inputProps("alignment")}
            value={value.alignment}
            onChange={(event) =>
              update({
                alignment: event.target.value as CoverSettings["alignment"],
              }, "alignment")
            }
          >
            <option value="left">Trái</option>
            <option value="center">Giữa</option>
            <option value="right">Phải</option>
          </select>
        </Field>
        <Field
          label="Cỡ tên"
          error={errors["experience.cover.nameSize"]}
          path="nameSize"
        >
          <select
            {...inputProps("nameSize")}
            value={value.nameSize}
            onChange={(event) =>
              update({
                nameSize: event.target.value as CoverSettings["nameSize"],
              }, "nameSize")
            }
          >
            <option value="compact">Gọn</option>
            <option value="balanced">Cân bằng</option>
            <option value="grand">Lớn</option>
          </select>
        </Field>
        <Field
          label="Kiểu biểu trưng"
          error={errors["experience.cover.logoMode"]}
          path="logoMode"
        >
          <select
            {...inputProps("logoMode")}
            value={value.logoMode}
            onChange={(event) =>
              update({
                logoMode: event.target.value as CoverSettings["logoMode"],
              }, "logoMode")
            }
          >
            <option value="monogram">Monogram</option>
            <option value="image">Ảnh logo</option>
            <option value="hidden">Ẩn</option>
          </select>
        </Field>
        <Field label="Chữ monogram" error={errors["experience.cover.monogramText"]} path="monogramText">
          <input
            {...inputProps("monogramText")}
            value={value.monogramText}
            maxLength={20}
            onChange={(event) =>
              update({ monogramText: event.target.value }, "monogramText")
            }
          />
        </Field>
        <Field
          label="Kích thước logo"
          error={errors["experience.cover.logoSize"]}
          path="logoSize"
        >
          <select
            {...inputProps("logoSize")}
            value={value.logoSize}
            onChange={(event) =>
              update({
                logoSize: event.target.value as CoverSettings["logoSize"],
              }, "logoSize")
            }
          >
            <option value="small">Nhỏ</option>
            <option value="medium">Vừa</option>
            <option value="large">Lớn</option>
          </select>
        </Field>
        <Field
          label="Màu chữ cover"
          error={errors["experience.cover.textColor"]}
          path="textColor"
        >
          <input
            {...inputProps("textColor")}
            type="color"
            value={value.textColor}
            onChange={(event) =>
              update({ textColor: event.target.value }, "textColor")
            }
          />
        </Field>
        <Field
          label="Màu lớp phủ"
          error={errors["experience.cover.overlayColor"]}
          path="overlayColor"
        >
          <input
            {...inputProps("overlayColor")}
            type="color"
            value={value.overlayColor}
            onChange={(event) =>
              update({ overlayColor: event.target.value }, "overlayColor")
            }
          />
        </Field>
        <Field
          label={`Độ phủ ${Math.round(value.overlayOpacity * 100)}%`}
          error={errors["experience.cover.overlayOpacity"]}
          path="overlayOpacity"
        >
          <input
            {...inputProps("overlayOpacity")}
            type="range"
            min={0}
            max={0.85}
            step={0.05}
            value={value.overlayOpacity}
            onChange={(event) =>
              update(
                { overlayOpacity: Number(event.target.value) },
                "overlayOpacity",
              )
            }
          />
        </Field>
        <Field
          label={`Độ mờ ${value.blurPx}px`}
          error={errors["experience.cover.blurPx"]}
          path="blurPx"
        >
          <input
            {...inputProps("blurPx")}
            type="range"
            min={0}
            max={12}
            value={value.blurPx}
            onChange={(event) =>
              update({ blurPx: Number(event.target.value) }, "blurPx")
            }
          />
        </Field>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={value.backgroundEnabled}
            onChange={(event) =>
              update({ backgroundEnabled: event.target.checked })
            }
          />
          Dùng ảnh nền cover
        </label>
      </div>

      <MediaUploader
        category="cover"
        creatorSecret={creatorSecret}
        existingMedia={
          value.backgroundSrc
            ? {
                src: value.backgroundSrc,
                storagePath: value.backgroundStoragePath,
                alt: value.backgroundAlt,
              }
            : undefined
        }
        onUploaded={(media, file) =>
          update({
            backgroundEnabled: true,
            backgroundSrc: media.publicUrl,
            backgroundStoragePath: media.storagePath,
            backgroundAlt: file.name,
          })
        }
        onRemoveMetadata={() =>
          update({
            backgroundEnabled: false,
            backgroundSrc: undefined,
            backgroundStoragePath: undefined,
          })
        }
      />
      {value.backgroundSrc ? (
        <ImageFramingEditor
          src={value.backgroundSrc}
          alt={value.backgroundAlt}
          variant="cover"
          fieldPathPrefix="experience.cover.background"
          value={value.background}
          onChange={(background) => {
            clearFramingErrors("experience.cover.background");
            update({ background });
          }}
        />
      ) : null}

      {value.logoMode === "image" ? (
        <>
          <MediaUploader
            category="logo"
            creatorSecret={creatorSecret}
            existingMedia={
              value.logoSrc
                ? {
                    src: value.logoSrc,
                    storagePath: value.logoStoragePath,
                    alt: value.logoAlt,
                  }
                : undefined
            }
            onUploaded={(media, file) =>
              update({
                logoSrc: media.publicUrl,
                logoStoragePath: media.storagePath,
                logoAlt: file.name,
              })
            }
            onRemoveMetadata={() =>
              update({ logoSrc: undefined, logoStoragePath: undefined })
            }
          />
          {value.logoSrc ? (
            <ImageFramingEditor
              src={value.logoSrc}
              alt={value.logoAlt}
              variant="logo"
              fieldPathPrefix="experience.cover.logoFrame"
              value={value.logoFrame}
              onChange={(logoFrame) => {
                clearFramingErrors("experience.cover.logoFrame");
                update({ logoFrame });
              }}
            />
          ) : null}
        </>
      ) : null}

      <div className="cover-admin-preview" aria-label="Preview cover">
        <CoverRenderer cover={value} preview />
      </div>
      <button
        className="button button-secondary"
        type="button"
        onClick={() => {
          coverErrors.forEach(([path]) => onClearError(path));
          onChange(structuredClone(defaultExperienceSettings.cover));
        }}
      >
        Khôi phục cover mặc định
      </button>
    </div>
  );
}

export function InvitationEditor({
  value,
  enabled,
  errors,
  onClearError,
  onChange,
  onEnabledChange,
}: {
  value: InvitationContentSettings;
  enabled: boolean;
  errors: FieldErrors;
  onClearError: (path: string) => void;
  onChange: (value: InvitationContentSettings) => void;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const update = (
    key: keyof InvitationContentSettings,
    nextValue: string,
  ) => {
    onClearError(`experience.invitation.${key}`);
    onChange({ ...value, [key]: nextValue });
  };
  const inputProps = (key: keyof InvitationContentSettings) => {
    const path = `experience.invitation.${key}`;
    const hasError = Boolean(errors[path]);
    return {
      "aria-invalid": hasError,
      "aria-describedby": hasError
        ? `cover-error-invitation-${key}`
        : undefined,
      "data-field-path": path,
    } as const;
  };

  return (
    <div className="admin-list">
      <fieldset className="admin-item">
        <legend>Lời mời thân tình</legend>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
          />
          Hiển thị lời mời trên thiệp
        </label>
        <div className="admin-form-grid">
          <Field
            label="Dòng giới thiệu"
            error={errors["experience.invitation.eyebrow"]}
            path="invitation-eyebrow"
          >
            <input
              {...inputProps("eyebrow")}
              value={value.eyebrow}
              maxLength={80}
              onChange={(event) => update("eyebrow", event.target.value)}
            />
          </Field>
          <Field
            label="Tiêu đề"
            error={errors["experience.invitation.title"]}
            path="invitation-title"
          >
            <textarea
              {...inputProps("title")}
              value={value.title}
              maxLength={300}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>
          <Field
            label="Nội dung lời mời"
            error={errors["experience.invitation.body"]}
            path="invitation-body"
          >
            <textarea
              {...inputProps("body")}
              value={value.body}
              maxLength={1200}
              onChange={(event) => update("body", event.target.value)}
            />
          </Field>
          <Field
            label="Dòng bổ sung (không bắt buộc)"
            error={errors["experience.invitation.supportingText"]}
            path="invitation-supportingText"
          >
            <textarea
              {...inputProps("supportingText")}
              value={value.supportingText}
              maxLength={400}
              onChange={(event) =>
                update("supportingText", event.target.value)
              }
            />
          </Field>
          <Field
            label="Thông tin nhà gái"
            error={errors["experience.invitation.brideFamily"]}
            path="invitation-brideFamily"
          >
            <input
              {...inputProps("brideFamily")}
              value={value.brideFamily}
              maxLength={160}
              onChange={(event) =>
                update("brideFamily", event.target.value)
              }
            />
          </Field>
          <Field
            label="Thông tin nhà trai"
            error={errors["experience.invitation.groomFamily"]}
            path="invitation-groomFamily"
          >
            <input
              {...inputProps("groomFamily")}
              value={value.groomFamily}
              maxLength={160}
              onChange={(event) =>
                update("groomFamily", event.target.value)
              }
            />
          </Field>
        </div>
      </fieldset>
      <div className="admin-preview" aria-label="Xem trước lời mời">
        <InvitationCopy settings={value} preview />
      </div>
    </div>
  );
}

export function ExperienceEditor({
  value,
  creatorSecret,
  onChange,
}: {
  value: WeddingExperienceSettings;
  creatorSecret: string;
  onChange: (value: WeddingExperienceSettings) => void;
}) {
  const update = <K extends keyof WeddingExperienceSettings>(
    key: K,
    next: WeddingExperienceSettings[K],
  ) => onChange({ ...value, [key]: next });

  function applyWishPreset(preset: WishOverlayPreset) {
    const values = {
      soft: { intervalMs: 7_500, opacity: 0.56, visibleCount: 2 },
      balanced: { intervalMs: 5_500, opacity: 0.66, visibleCount: 3 },
      prominent: { intervalMs: 4_000, opacity: 0.75, visibleCount: 4 },
    }[preset];
    update("wishes", { ...value.wishes, preset, ...values });
  }

  return (
    <div className="admin-list">
      <fieldset className="admin-item">
        <legend>Hiển thị section</legend>
        <div className="admin-form-grid">
          {(
            [
              ["heroCollage", "Hiện album collage"],
              ["story", "Hiện chuyện chúng mình"],
              ["rsvp", "Hiện RSVP trên thiệp khách"],
            ] as const
          ).map(([key, label]) => (
            <label className="admin-toggle" key={key}>
              <input
                type="checkbox"
                checked={value.sections[key]}
                onChange={(event) =>
                  update("sections", {
                    ...value.sections,
                    [key]: event.target.checked,
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="admin-item">
        <legend>Lời chúc</legend>
        <div className="admin-form-grid">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.wishes.overlayEnabled}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  overlayEnabled: event.target.checked,
                })
              }
            />
            Hiển thị lời chúc chạy
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.wishes.showList}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  showList: event.target.checked,
                })
              }
            />
            Hiển thị danh sách lời chúc
          </label>
          <Field label="Preset lời chúc chạy">
            <select
              value={value.wishes.preset}
              onChange={(event) =>
                applyWishPreset(event.target.value as WishOverlayPreset)
              }
            >
              <option value="soft">Nhẹ</option>
              <option value="balanced">Vừa</option>
              <option value="prominent">Nổi bật</option>
            </select>
          </Field>
          <Field label={`Tốc độ ${value.wishes.intervalMs / 1000}s`}>
            <input
              type="range"
              min={3_500}
              max={15_000}
              step={500}
              value={value.wishes.intervalMs}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  intervalMs: Number(event.target.value),
                })
              }
            />
          </Field>
          <Field label={`Độ mờ ${Math.round(value.wishes.opacity * 100)}%`}>
            <input
              type="range"
              min={0.55}
              max={0.75}
              step={0.01}
              value={value.wishes.opacity}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  opacity: Number(event.target.value),
                })
              }
            />
          </Field>
          <Field label="Số lời chúc cùng lúc">
            <select
              value={value.wishes.visibleCount}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  visibleCount: Number(event.target.value),
                })
              }
            >
              {[2, 3, 4].map((count) => (
                <option value={count} key={count}>
                  {count}
                </option>
              ))}
            </select>
          </Field>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.wishes.autoHideWhenTyping}
              onChange={(event) =>
                update("wishes", {
                  ...value.wishes,
                  autoHideWhenTyping: event.target.checked,
                })
              }
            />
            Tự ẩn khi đang nhập form hoặc mở modal
          </label>
          <Field label="Bố cục danh sách tĩnh">
            <select
              value={value.wishLayout}
              onChange={(event) =>
                update(
                  "wishLayout",
                  event.target.value as WeddingExperienceSettings["wishLayout"],
                )
              }
            >
              <option value="elegant">Elegant</option>
              <option value="bubble">Bubble</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="admin-item">
        <legend>Nhạc nền</legend>
        <div className="admin-form-grid">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.music.enabled}
              onChange={(event) =>
                update("music", {
                  ...value.music,
                  enabled: event.target.checked,
                })
              }
            />
            Bật nhạc nền
          </label>
          <Field label="Tệp nhạc nội bộ / URL an toàn">
            <input
              value={value.music.src}
              onChange={(event) =>
                update("music", { ...value.music, src: event.target.value })
              }
            />
          </Field>
          <Field label="Tên bài nhạc">
            <input
              value={value.music.title}
              onChange={(event) =>
                update("music", { ...value.music, title: event.target.value })
              }
            />
          </Field>
          <Field label={`Âm lượng ${Math.round(value.music.volume * 100)}%`}>
            <input
              type="range"
              min={0.2}
              max={0.35}
              step={0.01}
              value={value.music.volume}
              onChange={(event) =>
                update("music", {
                  ...value.music,
                  volume: Number(event.target.value),
                })
              }
            />
          </Field>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.music.autoplayAfterOpen}
              onChange={(event) =>
                update("music", {
                  ...value.music,
                  autoplayAfterOpen: event.target.checked,
                })
              }
            />
            Thử phát sau khi mở thiệp
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-item">
        <legend>YouTube</legend>
        <div className="admin-form-grid">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={value.youtube.enabled}
              onChange={(event) =>
                update("youtube", {
                  ...value.youtube,
                  enabled: event.target.checked,
                })
              }
            />
            Hiện khu vực video YouTube
          </label>
          <Field label="URL YouTube">
            <input
              value={value.youtube.url}
              onChange={(event) =>
                update("youtube", {
                  ...value.youtube,
                  url: event.target.value,
                })
              }
            />
          </Field>
          <Field label="Tiêu đề">
            <input
              value={value.youtube.title}
              onChange={(event) =>
                update("youtube", {
                  ...value.youtube,
                  title: event.target.value,
                })
              }
            />
          </Field>
          <Field label="Mô tả">
            <textarea
              value={value.youtube.description}
              onChange={(event) =>
                update("youtube", {
                  ...value.youtube,
                  description: event.target.value,
                })
              }
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="admin-item">
        <legend>Countdown & lịch</legend>
        <div className="admin-form-grid">
          {(
            [
              ["showCalendar", "Hiện lịch tháng"],
              ["showLunarDate", "Hiện ngày âm"],
              ["showTime", "Hiện giờ cưới"],
              ["showCountdown", "Hiện bộ đếm ngược"],
            ] as const
          ).map(([key, label]) => (
            <label className="admin-toggle" key={key}>
              <input
                type="checkbox"
                checked={value.countdown[key]}
                onChange={(event) =>
                  update("countdown", {
                    ...value.countdown,
                    [key]: event.target.checked,
                  })
                }
              />
              {label}
            </label>
          ))}
          <Field label="Đánh dấu ngày cưới">
            <select
              value={value.countdown.markerStyle}
              onChange={(event) =>
                update("countdown", {
                  ...value.countdown,
                  markerStyle: event.target.value as
                    | "circle"
                    | "dot"
                    | "heart",
                })
              }
            >
              <option value="heart">Trái tim</option>
              <option value="circle">Vòng tròn</option>
              <option value="dot">Chấm</option>
            </select>
          </Field>
        </div>
        <MediaUploader
          category="countdown"
          creatorSecret={creatorSecret}
          existingMedia={
            value.countdown.backgroundSrc
              ? {
                  src: value.countdown.backgroundSrc,
                  storagePath: value.countdown.backgroundStoragePath,
                  alt: value.countdown.backgroundAlt,
                }
              : undefined
          }
          onUploaded={(media, file) =>
            update("countdown", {
              ...value.countdown,
              backgroundEnabled: true,
              backgroundSrc: media.publicUrl,
              backgroundStoragePath: media.storagePath,
              backgroundAlt: file.name,
            })
          }
          onRemoveMetadata={() =>
            update("countdown", {
              ...value.countdown,
              backgroundEnabled: false,
              backgroundSrc: undefined,
              backgroundStoragePath: undefined,
            })
          }
        />
        {value.countdown.backgroundSrc ? (
          <ImageFramingEditor
            src={value.countdown.backgroundSrc}
            alt={value.countdown.backgroundAlt}
            variant="countdown"
            value={value.countdown.background}
            onChange={(background) =>
              update("countdown", { ...value.countdown, background })
            }
          />
        ) : null}
      </fieldset>

      <fieldset className="admin-item">
        <legend>RSVP</legend>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={value.allowGuestSideSelection}
            onChange={(event) =>
              update("allowGuestSideSelection", event.target.checked)
            }
          />
          Cho khách tự chọn nhà trai / nhà gái
        </label>
      </fieldset>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  path,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  path?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && path ? (
        <span className="field-error" id={`cover-error-${path.replaceAll(".", "-")}`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
