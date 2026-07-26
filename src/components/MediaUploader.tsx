"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { WeddingImage } from "@/src/components/WeddingImage";
import type { MediaCategory } from "@/src/lib/supabase-storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BATCH_SIZE = 20;

export type UploadedMedia = {
  publicUrl: string;
  storagePath: string;
};

type UploadStatus = "queued" | "uploading" | "success" | "error" | "cancelled";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
  error?: string;
};

type ExistingMedia = {
  src: string;
  storagePath?: string;
  alt: string;
};

type MediaUploaderProps = {
  category: MediaCategory;
  creatorSecret: string;
  multiple?: boolean;
  existingMedia?: ExistingMedia;
  onUploaded: (media: UploadedMedia, file: File) => void;
  onRemoveMetadata?: () => void;
};

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function statusLabel(status: UploadStatus) {
  if (status === "uploading") return "Đang tải";
  if (status === "success") return "Thành công";
  if (status === "error") return "Thất bại";
  if (status === "cancelled") return "Đã hủy";
  return "Đang chờ";
}

export function MediaUploader({
  category,
  creatorSecret,
  multiple = false,
  existingMedia,
  onUploaded,
  onRemoveMetadata,
}: MediaUploaderProps) {
  const inputId = useId();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const previewUrlsRef = useRef(new Set<string>());
  const controllersRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    const controllers = controllersRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  function validateFile(file: File) {
    if (file.size === 0) return "File ảnh đang rỗng.";
    if (file.size > MAX_FILE_SIZE) return "Ảnh không được lớn hơn 10 MB.";
    if (!ACCEPTED_TYPES.has(file.type)) {
      return "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.";
    }
    return "";
  }

  async function uploadItem(item: UploadItem) {
    const validationError = validateFile(item.file);
    if (validationError) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "error", error: validationError }
            : entry,
        ),
      );
      return;
    }

    const controller = new AbortController();
    controllersRef.current.set(item.id, controller);
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, status: "uploading", error: undefined }
          : entry,
      ),
    );

    try {
      const formData = new FormData();
      formData.set("file", item.file);
      formData.set("category", category);
      formData.set("creatorSecret", creatorSecret);
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = (await response.json()) as {
        message?: unknown;
        publicUrl?: unknown;
        storagePath?: unknown;
      };
      if (
        !response.ok ||
        typeof payload.publicUrl !== "string" ||
        typeof payload.storagePath !== "string"
      ) {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Chưa thể tải ảnh lên.",
        );
      }

      onUploaded(
        {
          publicUrl: payload.publicUrl,
          storagePath: payload.storagePath,
        },
        item.file,
      );
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "success", error: undefined }
            : entry,
        ),
      );
    } catch (error) {
      const wasCancelled =
        error instanceof DOMException && error.name === "AbortError";
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: wasCancelled ? "cancelled" : "error",
                error: wasCancelled
                  ? "Đã hủy tải ảnh."
                  : error instanceof Error
                    ? error.message
                    : "Chưa thể tải ảnh lên.",
              }
            : entry,
        ),
      );
    } finally {
      controllersRef.current.delete(item.id);
    }
  }

  function addFiles(fileList: FileList | File[]) {
    const selected = Array.from(fileList);
    const allowed = (multiple ? selected : selected.slice(0, 1)).slice(
      0,
      MAX_BATCH_SIZE,
    );
    if (selected.length > allowed.length) {
      setMessage(
        multiple
          ? `Mỗi lượt chọn tối đa ${MAX_BATCH_SIZE} ảnh.`
          : "Mỗi lượt chỉ chọn một ảnh.",
      );
    } else {
      setMessage("");
    }

    const nextItems = allowed.map<UploadItem>((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
        status: "queued",
      };
    });
    setItems((current) => [...nextItems, ...current]);
    nextItems.forEach((item) => void uploadItem(item));
  }

  function removeQueueItem(item: UploadItem) {
    controllersRef.current.get(item.id)?.abort();
    URL.revokeObjectURL(item.previewUrl);
    previewUrlsRef.current.delete(item.previewUrl);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  async function deleteStoredFile() {
    if (
      !existingMedia?.storagePath ||
      !onRemoveMetadata ||
      !window.confirm(
        "Xóa ảnh khỏi nội dung và xóa vĩnh viễn file trên Storage?",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setMessage("Đang xóa file khỏi Storage…");
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath: existingMedia.storagePath,
          creatorSecret,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: unknown };
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Chưa thể xóa file khỏi Storage.",
        );
      }
      onRemoveMetadata();
      setMessage("Đã xóa ảnh và file trên Storage.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Chưa thể xóa file khỏi Storage.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="media-uploader" aria-label="Tải ảnh lên">
      {existingMedia ? (
        <div className="media-current">
          <div className="media-current-preview">
            <WeddingImage
              src={existingMedia.src}
              available
              alt={existingMedia.alt}
              sizes="(max-width: 640px) 100vw, 18rem"
              className="media-preview-image"
            />
          </div>
          {onRemoveMetadata ? (
            <div className="media-current-actions">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (window.confirm("Xóa ảnh khỏi nội dung đã chỉnh sửa?")) {
                    onRemoveMetadata();
                    setMessage(
                      "Đã gỡ metadata ảnh. File Storage chưa bị xóa.",
                    );
                  }
                }}
              >
                Gỡ khỏi nội dung
              </button>
              {existingMedia.storagePath ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={deleteStoredFile}
                >
                  Xóa cả file Storage
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="media-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          className="visually-hidden"
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <label className="button button-secondary" htmlFor={inputId}>
          {multiple ? "Chọn nhiều ảnh" : "Tải ảnh lên"}
        </label>
        <p>Kéo thả ảnh vào đây · JPEG, PNG hoặc WebP · tối đa 10 MB/ảnh</p>
      </div>

      {items.length ? (
        <div className="media-upload-list">
          {items.map((item) => (
            <article className="media-upload-item" key={item.id}>
              <Image
                src={item.previewUrl}
                alt=""
                width={120}
                height={90}
                unoptimized
              />
              <div>
                <strong>{item.file.name}</strong>
                <small>{formatFileSize(item.file.size)}</small>
                <span data-status={item.status}>
                  {statusLabel(item.status)}
                </span>
                {item.status === "uploading" ? (
                  <progress aria-label={`Đang tải ${item.file.name}`} />
                ) : null}
                {item.error ? <p className="field-error">{item.error}</p> : null}
              </div>
              <div className="media-upload-actions">
                {item.status === "error" || item.status === "cancelled" ? (
                  <button type="button" onClick={() => void uploadItem(item)}>
                    Thử lại
                  </button>
                ) : null}
                <button type="button" onClick={() => removeQueueItem(item)}>
                  {item.status === "uploading" ? "Hủy" : "Đóng"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <p className="form-status" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
