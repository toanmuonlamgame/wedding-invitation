"use client";

import { useId, useRef, useState } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import {
  DEFAULT_IMAGE_FRAMING,
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ZOOM,
  clampNumber,
  normalizeImageFraming,
} from "@/src/lib/image-framing";
import type { ImageFraming } from "@/src/types/wedding";

type ImageFramingEditorProps = {
  src: string;
  alt: string;
  value: Partial<ImageFraming>;
  variant: "album" | "story" | "venue";
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
  onChange,
}: ImageFramingEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const fitGroupName = useId();
  const [isDragging, setIsDragging] = useState(false);
  const framing = normalizeImageFraming(value);
  const canCrop = framing.fitMode === "cover";

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
            name={fitGroupName}
            checked={framing.fitMode === "contain"}
            onChange={() =>
              update({
                fitMode: "contain",
                positionX: 50,
                positionY: 50,
                zoom: 1,
                backgroundColor: "#ffffff",
              })
            }
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
        {canCrop
          ? "Kéo ảnh để căn phần quan trọng vào giữa khung."
          : "Chế độ toàn ảnh không cần căn cắt; kéo và zoom đã được tắt."}
      </p>
      <div
        ref={frameRef}
        className="image-framing-frame"
        data-variant={variant}
        data-dragging={isDragging}
        data-fit-mode={framing.fitMode}
        onPointerDown={(event) => {
          if (!frameRef.current || !canCrop) return;
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
          if (!canCrop) return;
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

      <div className="image-framing-controls" aria-disabled={!canCrop}>
        <label>
          Zoom
          <input
            type="range"
            min={MIN_IMAGE_ZOOM}
            max={MAX_IMAGE_ZOOM}
            step={0.05}
            value={framing.zoom}
            disabled={!canCrop}
            onChange={(event) => update({ zoom: Number(event.target.value) })}
          />
        </label>
        <label>
          Ngang
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={framing.positionX}
            disabled={!canCrop}
            onChange={(event) =>
              update({ positionX: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Dọc
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={framing.positionY}
            disabled={!canCrop}
            onChange={(event) =>
              update({ positionY: Number(event.target.value) })
            }
          />
        </label>
      </div>
      <div className="image-framing-meta">
        <small>
          {canCrop
            ? `X ${Math.round(framing.positionX)} · Y ${Math.round(
                framing.positionY,
              )} · Zoom ${framing.zoom.toFixed(2)}`
            : "Toàn ảnh · Căn giữa · Nền #ffffff"}
        </small>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_IMAGE_FRAMING)}
        >
          Đặt lại
        </button>
      </div>
    </section>
  );
}
