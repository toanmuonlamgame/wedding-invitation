"use client";

import { ImageFramingEditor } from "@/src/components/ImageFramingEditor";
import { MediaUploader } from "@/src/components/MediaUploader";
import type {
  CoverSettings,
  WeddingExperienceSettings,
} from "@/src/types/wedding";

export function CoverEditor({
  value,
  creatorSecret,
  onChange,
}: {
  value: CoverSettings;
  creatorSecret: string;
  onChange: (value: CoverSettings) => void;
}) {
  const update = (patch: Partial<CoverSettings>) => onChange({ ...value, ...patch });
  return (
    <div className="admin-list">
      <div className="admin-form-grid">
        <Field label="Dòng mở đầu"><input value={value.kicker} onChange={(e) => update({ kicker: e.target.value })} /></Field>
        <Field label="Tên cô dâu"><input value={value.brideName} onChange={(e) => update({ brideName: e.target.value })} /></Field>
        <Field label="Ký hiệu nối"><input value={value.connector} maxLength={12} onChange={(e) => update({ connector: e.target.value })} /></Field>
        <Field label="Tên chú rể"><input value={value.groomName} onChange={(e) => update({ groomName: e.target.value })} /></Field>
        <Field label="Ghi chú"><textarea value={value.note} onChange={(e) => update({ note: e.target.value })} /></Field>
        <Field label="Nhãn nút mở"><input value={value.buttonText} onChange={(e) => update({ buttonText: e.target.value })} /></Field>
        <Field label="Căn nội dung"><select value={value.alignment} onChange={(e) => update({ alignment: e.target.value as CoverSettings["alignment"] })}><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></Field>
        <Field label="Cỡ tên"><select value={value.nameSize} onChange={(e) => update({ nameSize: e.target.value as CoverSettings["nameSize"] })}><option value="compact">Gọn</option><option value="balanced">Cân bằng</option><option value="grand">Lớn</option></select></Field>
        <Field label="Kiểu biểu trưng"><select value={value.logoMode} onChange={(e) => update({ logoMode: e.target.value as CoverSettings["logoMode"] })}><option value="monogram">Monogram</option><option value="image">Ảnh logo</option><option value="hidden">Ẩn</option></select></Field>
        <Field label="Chữ monogram"><input value={value.monogramText} onChange={(e) => update({ monogramText: e.target.value })} /></Field>
        <Field label="Màu lớp phủ"><input type="color" value={value.overlayColor} onChange={(e) => update({ overlayColor: e.target.value })} /></Field>
        <Field label={`Độ phủ ${Math.round(value.overlayOpacity * 100)}%`}><input type="range" min={0} max={0.85} step={0.05} value={value.overlayOpacity} onChange={(e) => update({ overlayOpacity: Number(e.target.value) })} /></Field>
        <Field label={`Độ mờ ${value.blurPx}px`}><input type="range" min={0} max={12} value={value.blurPx} onChange={(e) => update({ blurPx: Number(e.target.value) })} /></Field>
        <label className="admin-toggle"><input type="checkbox" checked={value.backgroundEnabled} onChange={(e) => update({ backgroundEnabled: e.target.checked })} /> Dùng ảnh nền cover</label>
      </div>
      <MediaUploader
        category="cover"
        creatorSecret={creatorSecret}
        existingMedia={value.backgroundSrc ? { src: value.backgroundSrc, storagePath: value.backgroundStoragePath, alt: value.backgroundAlt } : undefined}
        onUploaded={(media, file) => update({ backgroundEnabled: true, backgroundSrc: media.publicUrl, backgroundStoragePath: media.storagePath, backgroundAlt: file.name })}
        onRemoveMetadata={() => update({ backgroundEnabled: false, backgroundSrc: undefined, backgroundStoragePath: undefined })}
      />
      {value.backgroundSrc ? <ImageFramingEditor src={value.backgroundSrc} alt={value.backgroundAlt} variant="cover" value={value.background} onChange={(background) => update({ background })} /> : null}
      {value.logoMode === "image" ? (
        <MediaUploader
          category="logo"
          creatorSecret={creatorSecret}
          existingMedia={value.logoSrc ? { src: value.logoSrc, storagePath: value.logoStoragePath, alt: value.logoAlt } : undefined}
          onUploaded={(media, file) => update({ logoSrc: media.publicUrl, logoStoragePath: media.storagePath, logoAlt: file.name })}
          onRemoveMetadata={() => update({ logoSrc: undefined, logoStoragePath: undefined })}
        />
      ) : null}
      <div className="cover-admin-preview" data-align={value.alignment} data-name-size={value.nameSize}>
        <small>Preview mobile cover</small>
        <p>{value.kicker}</p>
        <strong>{value.brideName} {value.connector} {value.groomName}</strong>
        <span>{value.note}</span>
        <button type="button">{value.buttonText}</button>
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
  const update = <K extends keyof WeddingExperienceSettings>(key: K, next: WeddingExperienceSettings[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="admin-list">
      <fieldset className="admin-item"><legend>Album & lời chúc</legend><div className="admin-form-grid">
        <Field label="Bố cục album"><select value={value.albumLayout} onChange={(e) => update("albumLayout", e.target.value as WeddingExperienceSettings["albumLayout"])}><option value="spotlight">Ảnh chính + ảnh phụ</option><option value="mosaic">Mosaic</option><option value="editorial">Editorial</option></select></Field>
        <Field label="Bố cục lời chúc"><select value={value.wishLayout} onChange={(e) => update("wishLayout", e.target.value as WeddingExperienceSettings["wishLayout"])}><option value="elegant">Elegant</option><option value="bubble">Bubble</option></select></Field>
      </div></fieldset>
      <fieldset className="admin-item"><legend>Nhạc nền</legend><div className="admin-form-grid">
        <label className="admin-toggle"><input type="checkbox" checked={value.music.enabled} onChange={(e) => update("music", { ...value.music, enabled: e.target.checked })} /> Bật nhạc nền</label>
        <Field label="Tệp nhạc nội bộ / URL an toàn"><input value={value.music.src} onChange={(e) => update("music", { ...value.music, src: e.target.value })} /></Field>
        <Field label="Tên bài nhạc"><input value={value.music.title} onChange={(e) => update("music", { ...value.music, title: e.target.value })} /></Field>
        <Field label={`Âm lượng ${Math.round(value.music.volume * 100)}%`}><input type="range" min={0.2} max={0.35} step={0.01} value={value.music.volume} onChange={(e) => update("music", { ...value.music, volume: Number(e.target.value) })} /></Field>
        <label className="admin-toggle"><input type="checkbox" checked={value.music.autoplayAfterOpen} onChange={(e) => update("music", { ...value.music, autoplayAfterOpen: e.target.checked })} /> Thử phát sau khi mở thiệp</label>
      </div></fieldset>
      <fieldset className="admin-item"><legend>YouTube</legend><div className="admin-form-grid">
        <label className="admin-toggle"><input type="checkbox" checked={value.youtube.enabled} onChange={(e) => update("youtube", { ...value.youtube, enabled: e.target.checked })} /> Hiện khu vực video</label>
        <Field label="URL YouTube"><input value={value.youtube.url} onChange={(e) => update("youtube", { ...value.youtube, url: e.target.value })} /></Field>
        <Field label="Tiêu đề"><input value={value.youtube.title} onChange={(e) => update("youtube", { ...value.youtube, title: e.target.value })} /></Field>
        <Field label="Mô tả"><textarea value={value.youtube.description} onChange={(e) => update("youtube", { ...value.youtube, description: e.target.value })} /></Field>
      </div></fieldset>
      <fieldset className="admin-item"><legend>Countdown & lịch</legend><div className="admin-form-grid">
        {(["showCalendar", "showLunarDate", "showTime", "showCountdown"] as const).map((key) => <label className="admin-toggle" key={key}><input type="checkbox" checked={value.countdown[key]} onChange={(e) => update("countdown", { ...value.countdown, [key]: e.target.checked })} /> {key}</label>)}
        <Field label="Đánh dấu ngày cưới"><select value={value.countdown.markerStyle} onChange={(e) => update("countdown", { ...value.countdown, markerStyle: e.target.value as "circle" | "dot" | "heart" })}><option value="heart">Trái tim</option><option value="circle">Vòng tròn</option><option value="dot">Chấm</option></select></Field>
      </div>
      <MediaUploader category="countdown" creatorSecret={creatorSecret} existingMedia={value.countdown.backgroundSrc ? { src: value.countdown.backgroundSrc, storagePath: value.countdown.backgroundStoragePath, alt: value.countdown.backgroundAlt } : undefined} onUploaded={(media, file) => update("countdown", { ...value.countdown, backgroundEnabled: true, backgroundSrc: media.publicUrl, backgroundStoragePath: media.storagePath, backgroundAlt: file.name })} onRemoveMetadata={() => update("countdown", { ...value.countdown, backgroundEnabled: false, backgroundSrc: undefined, backgroundStoragePath: undefined })} />
      {value.countdown.backgroundSrc ? <ImageFramingEditor src={value.countdown.backgroundSrc} alt={value.countdown.backgroundAlt} variant="countdown" value={value.countdown.background} onChange={(background) => update("countdown", { ...value.countdown, background })} /> : null}
      </fieldset>
      <fieldset className="admin-item"><legend>RSVP</legend><label className="admin-toggle"><input type="checkbox" checked={value.allowGuestSideSelection} onChange={(e) => update("allowGuestSideSelection", e.target.checked)} /> Cho khách tự chọn nhà trai / nhà gái</label></fieldset>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
