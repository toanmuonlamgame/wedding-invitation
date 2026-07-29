"use client";

import { useEffect, useRef, useState } from "react";
import { ImageFramingEditor } from "@/src/components/ImageFramingEditor";
import { MediaUploader } from "@/src/components/MediaUploader";
import { WeddingImage } from "@/src/components/WeddingImage";
import { normalizeImageFraming } from "@/src/lib/image-framing";
import {
  hasDuplicateStoryImage,
  moveStoryImage,
} from "@/src/lib/story-chapters";
import type { FieldErrors } from "@/src/types/engagement";
import type {
  GalleryMoment,
  LoveStoryChapter,
  StoryImage,
} from "@/src/types/wedding";

const MAX_STORY_IMAGES = 10;

type Props = {
  chapter: LoveStoryChapter;
  chapterIndex: number;
  galleryImages: GalleryMoment[];
  creatorSecret: string;
  errors: FieldErrors;
  onChange: (images: StoryImage[]) => void;
  onClearError: (path: string) => void;
};

export function StoryChapterImagesEditor({
  chapter,
  chapterIndex,
  galleryImages,
  creatorSecret,
  errors,
  onChange,
  onClearError,
}: Props) {
  const [selectedSrc, setSelectedSrc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const imagesRef = useRef(chapter.images);

  useEffect(() => {
    imagesRef.current = chapter.images;
  }, [chapter.images]);

  const pathFor = (index: number, field: string) =>
    `storyChapters.${chapterIndex}.images.${index}.${field}`;

  function addImage(image: StoryImage) {
    const currentImages = imagesRef.current;
    if (currentImages.length >= MAX_STORY_IMAGES) {
      setMessage(`Mỗi chương chỉ được dùng tối đa ${MAX_STORY_IMAGES} ảnh.`);
      return;
    }
    if (hasDuplicateStoryImage(currentImages, image.src)) {
      setMessage("Ảnh này đã có trong chương.");
      return;
    }
    setMessage("");
    onClearError(`storyChapters.${chapterIndex}.images`);
    const nextImages = [...currentImages, image];
    imagesRef.current = nextImages;
    onChange(nextImages);
  }

  function updateImage(index: number, patch: Partial<StoryImage>) {
    Object.keys(patch).forEach((field) =>
      onClearError(pathFor(index, field)),
    );
    const nextImages = imagesRef.current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
    );
    imagesRef.current = nextImages;
    onChange(nextImages);
  }

  function addSelectedGalleryImage() {
    const selected = galleryImages.find((image) => image.src === selectedSrc);
    if (!selected) return;
    addImage({
      id: `story-image-${crypto.randomUUID()}`,
      src: selected.src,
      storagePath: selected.storagePath,
      alt: selected.alt,
      available: selected.available,
      ...normalizeImageFraming(selected),
    });
  }

  return (
    <div className="admin-wide-field story-images-editor">
      <div className="story-image-add-row">
        <label>
          Chọn ảnh từ album
          <select
            value={selectedSrc}
            onChange={(event) => setSelectedSrc(event.target.value)}
          >
            <option value="">Chọn một ảnh</option>
            {galleryImages.map((image) => (
              <option value={image.src} key={image.id}>
                {image.alt || image.src}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-secondary"
          type="button"
          disabled={!selectedSrc || chapter.images.length >= MAX_STORY_IMAGES}
          onClick={addSelectedGalleryImage}
        >
          Thêm từ album
        </button>
      </div>

      {chapter.images.length < MAX_STORY_IMAGES ? (
        <MediaUploader
          category="story"
          creatorSecret={creatorSecret}
          multiple
          maxFiles={MAX_STORY_IMAGES - chapter.images.length}
          onUploaded={(media, file) =>
            addImage({
              id: `story-image-${crypto.randomUUID()}`,
              src: media.publicUrl,
              storagePath: media.storagePath,
              alt: file.name.replace(/\.[^.]+$/, ""),
              available: true,
              ...normalizeImageFraming(undefined),
            })
          }
        />
      ) : (
        <p className="field-hint">
          Đã đạt giới hạn {MAX_STORY_IMAGES} ảnh cho chương này.
        </p>
      )}

      <p className="field-hint">
        {chapter.images.length}/{MAX_STORY_IMAGES} ảnh. Ảnh được hiển thị theo
        đúng thứ tự bên dưới.
      </p>
      {message ? <p className="field-error" role="alert">{message}</p> : null}
      {errors[`storyChapters.${chapterIndex}.images`] ? (
        <p className="field-error" role="alert">
          {errors[`storyChapters.${chapterIndex}.images`]}
        </p>
      ) : null}

      <div className="story-image-admin-list">
        {chapter.images.map((image, imageIndex) => {
          const altPath = pathFor(imageIndex, "alt");
          const altError = errors[altPath];
          const srcPath = pathFor(imageIndex, "src");
          const srcError = errors[srcPath];
          return (
            <article className="story-image-admin-item" key={image.id}>
              <div
                className="story-image-admin-thumbnail"
                data-fit-mode={image.fitMode}
              >
                <WeddingImage
                  src={image.src}
                  available={image.available}
                  alt={image.alt}
                  sizes="128px"
                  framing={image}
                />
              </div>
              <label className="admin-wide-field">
                Alt text
                <input
                  value={image.alt}
                  aria-invalid={Boolean(altError)}
                  aria-describedby={
                    altError
                      ? `admin-story-image-alt-${chapterIndex}-${imageIndex}`
                      : undefined
                  }
                  data-field-path={altPath}
                  onChange={(event) =>
                    updateImage(imageIndex, { alt: event.target.value })
                  }
                />
                {altError ? (
                  <span
                    className="field-error"
                    id={`admin-story-image-alt-${chapterIndex}-${imageIndex}`}
                  >
                    {altError}
                  </span>
                ) : null}
              </label>
              {srcError ? (
                <p
                  className="field-error"
                  role="alert"
                  tabIndex={-1}
                  data-field-path={srcPath}
                >
                  {srcError}
                </p>
              ) : null}
              <div className="admin-item-actions">
                <button
                  className="text-button"
                  type="button"
                  disabled={imageIndex === 0}
                  onClick={() => {
                    const nextImages = moveStoryImage(
                      imagesRef.current,
                      imageIndex,
                      -1,
                    );
                    imagesRef.current = nextImages;
                    onChange(nextImages);
                  }}
                >
                  Lên
                </button>
                <button
                  className="text-button"
                  type="button"
                  disabled={imageIndex === chapter.images.length - 1}
                  onClick={() => {
                    const nextImages = moveStoryImage(
                      imagesRef.current,
                      imageIndex,
                      1,
                    );
                    imagesRef.current = nextImages;
                    onChange(nextImages);
                  }}
                >
                  Xuống
                </button>
                <button
                  className="text-button"
                  type="button"
                  aria-expanded={editingId === image.id}
                  onClick={() =>
                    setEditingId((current) =>
                      current === image.id ? null : image.id,
                    )
                  }
                >
                  Chỉnh khung
                </button>
                <button
                  className="text-button admin-danger-button"
                  type="button"
                  onClick={() => {
                    if (editingId === image.id) setEditingId(null);
                    const nextImages = imagesRef.current.filter(
                      (entry) => entry.id !== image.id,
                    );
                    imagesRef.current = nextImages;
                    onChange(nextImages);
                  }}
                >
                  Xóa
                </button>
              </div>
              {editingId === image.id ? (
                <ImageFramingEditor
                  src={image.src}
                  alt={image.alt}
                  value={image}
                  variant="story"
                  fieldPathPrefix={`storyChapters.${chapterIndex}.images.${imageIndex}`}
                  onChange={(framing) => updateImage(imageIndex, framing)}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
