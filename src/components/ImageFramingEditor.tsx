"use client";

import { useId, useRef, useState } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import {
  MAX_CONTAIN_IMAGE_ZOOM,
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ZOOM,
  clampNumber,
  normalizeImageFraming,
  resetImageFraming,
} from "@/src/lib/image-framing";
import type { ImageFraming } from "@/src/types/wedding";

type ImageFramingEditorProps = {
  src: string;
  alt: string;
  value: Partial<ImageFraming>;
  variant:
    | "album"
    | "story"
    | "venue"
    | "cover"
    | "countdown"
    | "logo";
  fieldPathPrefix?: string;
  onChange: (value: ImageFraming) => void;
};

type DragState = {
  pointerId: number;
  clientX: number;
  clientY: number;
  positionX: number;
  positionY: number;
};

export function ImageFramingEditor({
  src,
  alt,
  value,
  variant,
  fieldPathPrefix,
  onChange,
}: ImageFramingEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const fitGroupName = useId();
  const [isDragging, setIsDragging] = useState(false);
  const framing = normalizeImageFraming(value);
  const canDrag = framing.fitMode === "cover" || framing.zoom > 1;
  const maxZoom =
    framing.fitMode === "contain"
      ? MAX_CONTAIN_IMAGE_ZOOM
      : MAX_IMAGE_ZOOM;

  function update(patch: Partial<ImageFraming>) {
    onChange(normalizeImageFraming({ ...framing, ...patch }));
  }

  return (
    <section className="image-framing-editor" aria-label="Căn chỉnh khung ảnh">
      <fieldset className="image-fit-options">
        <legend>Chế độ hiển thị</legend>
        <label>
          <input
            type="radio"
            data-field-path={
              fieldPathPrefix ? `${fieldPathPrefix}.fitMode` : undefined
            }
            name={fitGroupName}
            checked={framing.fitMode === "cover"}
            onChange={() => update({ fitMode: "cover" })}
          />
          <span>
            <strong>Phủ kín khung</strong>
            <small>
              Ảnh lấp đầy khung nhưng có thể bị cắt.
            </small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            data-field-path={
              fieldPathPrefix ? `${fieldPathPrefix}.fitMode` : undefined
            }
            name={fitGroupName}
            checked={framing.fitMode === "contain"}
            onChange={() => update({ fitMode: "contain" })}
          />
          <span>
            <strong>Hiển thị toàn ảnh</strong>
            <small>
              Giữ trọn ảnh, phần trống được lấp bằng nền trắng.
            </small>
          </span>
        </label>
      </fieldset>
      <p className="image-framing-help">
        {framing.fitMode === "cover"
          ? "Kéo ảnh để căn phần quan trọng vào giữa khung."
          : "Zoom 100%: hiển thị toàn bộ ảnh. Zoom lớn hơn 100%: ảnh có thể bị cắt; khi đó bạn có thể kéo để căn phần quan trọng."}
      </p>
      <div
        ref={frameRef}
        className="image-framing-frame"
        data-variant={variant}
        data-dragging={isDragging}
        data-fit-mode={framing.fitMode}
        data-can-drag={canDrag}
        onPointerDown={(event) => {
          if (!frameRef.current || !canDrag) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            positionX: framing.positionX,
            positionY: framing.positionY,
          };
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          if (!canDrag) return;
          const drag = dragRef.current;
          const frame = frameRef.current;
          if (!drag || drag.pointerId !== event.pointerId || !frame) return;
          const bounds = frame.getBoundingClientRect();
          const deltaX =
            ((event.clientX - drag.clientX) / Math.max(bounds.width, 1)) * 100;
          const deltaY =
            ((event.clientY - drag.clientY) / Math.max(bounds.height, 1)) * 100;
          update({
            positionX: clampNumber(
              drag.positionX - deltaX / framing.zoom,
              0,
              100,
            ),
            positionY: clampNumber(
              drag.positionY - deltaY / framing.zoom,
              0,
              100,
            ),
          });
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null;
            setIsDragging(false);
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setIsDragging(false);
        }}
      >
        <WeddingImage
          src={src}
          available
          alt={alt}
          sizes="(max-width: 640px) 100vw, 32rem"
          className="image-framing-media"
          framing={framing}
        />
        <span className="image-framing-crosshair" aria-hidden="true" />
      </div>

      <div className="image-framing-controls">
        <label>
          Zoom
          <input
            type="range"
            data-field-path={
              fieldPathPrefix ? `${fieldPathPrefix}.zoom` : undefined
            }
            min={MIN_IMAGE_ZOOM}
            max={maxZoom}
            step={0.05}
            value={framing.zoom}
            aria-valuetext={`${Math.round(framing.zoom * 100)}%`}
            onChange={(event) => update({ zoom: Number(event.target.value) })}
          />
        </label>
        <label>
          Ngang
          <input
            type="range"
            data-field-path={
              fieldPathPrefix ? `${fieldPathPrefix}.positionX` : undefined
            }
            min={0}
            max={100}
            step={1}
            value={framing.positionX}
            disabled={!canDrag}
            onChange={(event) =>
              update({ positionX: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Dọc
          <input
            type="range"
            data-field-path={
              fieldPathPrefix ? `${fieldPathPrefix}.positionY` : undefined
            }
            min={0}
            max={100}
            step={1}
            value={framing.positionY}
            disabled={!canDrag}
            onChange={(event) =>
              update({ positionY: Number(event.target.value) })
            }
          />
        </label>
        {framing.fitMode === "contain" ? (
          <label>
            Màu nền
            <input
              type="color"
              value={framing.backgroundColor}
              data-field-path={
                fieldPathPrefix
                  ? `${fieldPathPrefix}.backgroundColor`
                  : undefined
              }
              onChange={(event) =>
                update({ backgroundColor: event.target.value })
              }
            />
          </label>
        ) : null}
      </div>
      <div className="image-framing-meta">
        <small>
          X {Math.round(framing.positionX)} · Y {Math.round(framing.positionY)} ·
          Zoom {Math.round(framing.zoom * 100)}%
          {framing.fitMode === "contain"
            ? ` · Nền ${framing.backgroundColor}`
            : ""}
        </small>
        <button
          type="button"
          onClick={() => onChange(resetImageFraming(framing.fitMode))}
        >
          Đặt lại
        </button>
      </div>
    </section>
  );
}
