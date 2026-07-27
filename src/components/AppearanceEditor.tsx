"use client";

import { WeddingImage } from "@/src/components/WeddingImage";
import {
  DEFAULT_FONT_PRESET,
  DEFAULT_THEME_PRESET,
  FONT_IDS,
  FONT_PRESETS,
  THEME_IDS,
  THEME_PRESETS,
  getAppearanceStyle,
} from "@/src/lib/appearance";
import type {
  FontPresetId,
  GalleryMoment,
  ThemePresetId,
} from "@/src/types/wedding";

type AppearanceEditorProps = {
  themePreset: ThemePresetId;
  fontPreset: FontPresetId;
  previewImage?: GalleryMoment;
  isSaving: boolean;
  onChange: (value: {
    themePreset: ThemePresetId;
    fontPreset: FontPresetId;
  }) => void;
  onSave: () => void;
};

export function AppearanceEditor({
  themePreset,
  fontPreset,
  previewImage,
  isSaving,
  onChange,
  onSave,
}: AppearanceEditorProps) {
  return (
    <section className="appearance-editor" aria-labelledby="appearance-title">
      <header>
        <p className="section-eyebrow">Preset có kiểm soát</p>
        <h3 id="appearance-title">Giao diện thiệp</h3>
        <p>
          Thay đổi chỉ nằm trong bản nháp cho đến khi bạn bấm Lưu giao diện
          hoặc Lưu nội dung.
        </p>
      </header>

      <div className="appearance-editor-layout">
        <div className="appearance-options">
          <fieldset>
            <legend>Theme</legend>
            <div className="preset-grid">
              {THEME_IDS.map((id) => {
                const preset = THEME_PRESETS[id];
                return (
                  <label className="preset-option" key={id}>
                    <input
                      type="radio"
                      name="theme-preset"
                      value={id}
                      checked={themePreset === id}
                      onChange={() =>
                        onChange({ themePreset: id, fontPreset })
                      }
                    />
                    <span
                      className="preset-swatches"
                      style={
                        {
                          "--swatch-one": preset.tokens.paper,
                          "--swatch-two": preset.tokens.forest,
                          "--swatch-three": preset.tokens.gold,
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                    <strong>{preset.label}</strong>
                    <small>{preset.description}</small>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Bộ font</legend>
            <div className="preset-grid preset-font-grid">
              {FONT_IDS.map((id) => {
                const preset = FONT_PRESETS[id];
                return (
                  <label
                    className={`preset-option ${preset.className}`}
                    key={id}
                  >
                    <input
                      type="radio"
                      name="font-preset"
                      value={id}
                      checked={fontPreset === id}
                      onChange={() =>
                        onChange({ themePreset, fontPreset: id })
                      }
                    />
                    <strong className="preset-font-sample">
                      Vũ Bình & Thành Long
                    </strong>
                    <small>{preset.description}</small>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="appearance-actions">
            <button
              className="button button-secondary"
              type="button"
              disabled={isSaving}
              onClick={() =>
                onChange({
                  themePreset: DEFAULT_THEME_PRESET,
                  fontPreset: DEFAULT_FONT_PRESET,
                })
              }
            >
              Khôi phục mặc định
            </button>
            <button
              className="button"
              type="button"
              disabled={isSaving}
              onClick={onSave}
            >
              {isSaving ? "Đang lưu…" : "Lưu giao diện"}
            </button>
          </div>
        </div>

        <div className="appearance-phone-shell">
          <p className="section-eyebrow">Preview trực tiếp</p>
          <div
            className={`appearance-phone ${FONT_PRESETS[fontPreset].className}`}
            style={getAppearanceStyle(themePreset) as React.CSSProperties}
          >
            <div className="appearance-phone-image">
              {previewImage ? (
                <WeddingImage
                  src={previewImage.src}
                  available={previewImage.available}
                  alt={previewImage.alt}
                  sizes="19rem"
                  className="appearance-phone-media"
                  framing={previewImage}
                />
              ) : (
                <span aria-hidden="true">B · L</span>
              )}
            </div>
            <p className="section-eyebrow">Lễ thành hôn</p>
            <h4>Vũ Bình & Thành Long</h4>
            <h5>Ngày chung đôi</h5>
            <p>
              Trân trọng kính mời bạn đến chung vui cùng hai gia đình trong
              ngày hạnh phúc.
            </p>
            <button type="button">Mở bản đồ</button>
            <article>
              <strong>Một lời chúc nhỏ</strong>
              <p>Chúc hai bạn luôn bình yên và đồng hành thật lâu.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
