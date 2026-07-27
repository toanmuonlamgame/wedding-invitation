import { cache } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { defaultWeddingContent } from "@/src/lib/wedding-data";
import {
  DEFAULT_FONT_PRESET,
  DEFAULT_THEME_PRESET,
  FONT_IDS,
  THEME_IDS,
} from "@/src/lib/appearance";
import {
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ZOOM,
} from "@/src/lib/image-framing";
import type { WeddingContentData } from "@/src/types/wedding";

const idSchema = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/);
const dateTimeSchema = z
  .string()
  .trim()
  .max(40)
  .refine(
    (value) =>
      /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
    "Ngày giờ phải đúng định dạng.",
  );
const imageSourceSchema = z
  .string()
  .trim()
  .min(12, "Đường dẫn ảnh chưa hợp lệ.")
  .max(600)
  .refine((value) => {
    if (
      /^\/images\/[A-Za-z0-9._/-]+$/.test(value) &&
      !value.includes("..")
    ) {
      return true;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return false;

      const configuredUrl = process.env.SUPABASE_URL?.trim();
      if (configuredUrl && url.origin !== new URL(configuredUrl).origin) {
        return false;
      }
      if (!configuredUrl && !url.hostname.endsWith(".supabase.co")) {
        return false;
      }

      const bucket =
        process.env.SUPABASE_STORAGE_BUCKET?.trim() || "wedding-media";
      return url.pathname.startsWith(
        `/storage/v1/object/public/${bucket}/`,
      );
    } catch {
      return false;
    }
  }, "Ảnh phải dùng /images/ hoặc URL HTTPS từ Supabase Storage.");
const storagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^(album|story|venues)\/[A-Za-z0-9._/-]+$/,
    "Đường dẫn Storage không hợp lệ.",
  )
  .refine(
    (value) =>
      !value.includes("..") &&
      !value.includes("\\") &&
      !value.includes("://"),
    "Đường dẫn Storage không hợp lệ.",
  );
const mapsUrlSchema = z
  .string()
  .trim()
  .url("Link Google Maps không hợp lệ.")
  .max(500)
  .refine(
    (value) => /^https?:\/\//.test(value),
    "Link Google Maps không hợp lệ.",
  );

function emptyStringToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

const nullableDateTimeSchema = z.preprocess(
  emptyStringToNull,
  dateTimeSchema.nullable(),
);
const nullableMapsUrlSchema = z.preprocess(
  emptyStringToNull,
  mapsUrlSchema.nullable(),
);
const optionalNoteSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(300).optional(),
);
const optionalImageSchema = z.preprocess(
  emptyStringToUndefined,
  imageSourceSchema.optional(),
);
const optionalStoragePathSchema = z.preprocess(
  emptyStringToUndefined,
  storagePathSchema.optional(),
);
const optionalImageAltSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(200).optional(),
);
const imagePositionSchema = z.coerce.number().min(0).max(100).default(50);
const imageZoomSchema = z.coerce
  .number()
  .min(MIN_IMAGE_ZOOM)
  .max(MAX_IMAGE_ZOOM)
  .default(1);

export const weddingEventSchema = z
  .object({
    id: idSchema,
    title: z.string().trim().min(1, "Vui lòng nhập tiêu đề.").max(100),
    eventType: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập loại sự kiện.")
      .max(80),
    dateTime: nullableDateTimeSchema,
    venueName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên địa điểm.")
      .max(160),
    address: z.string().trim().min(1, "Vui lòng nhập địa chỉ.").max(300),
    mapsUrl: nullableMapsUrlSchema,
    note: optionalNoteSchema,
    imageSrc: optionalImageSchema,
    imageStoragePath: optionalStoragePathSchema,
    imageAlt: optionalImageAltSchema,
    positionX: imagePositionSchema,
    positionY: imagePositionSchema,
    zoom: imageZoomSchema,
    showImage: z.boolean().default(false),
    available: z.boolean(),
  })
  .strict();

export const storyChapterSchema = z
  .object({
    id: idSchema,
    chapterNumber: z.string().trim().min(1).max(40),
    period: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(120),
    summary: z.string().trim().min(1).max(400),
    fullStory: z
      .string()
      .trim()
      .min(10, "Nội dung chương phải có ít nhất 10 ký tự.")
      .max(4_000),
    imageSrc: optionalImageSchema,
    imageStoragePath: optionalStoragePathSchema,
    imageAlt: z.string().trim().min(1).max(200),
    positionX: imagePositionSchema,
    positionY: imagePositionSchema,
    zoom: imageZoomSchema,
    available: z.boolean(),
    visible: z.boolean(),
  })
  .strict();

export const galleryImageSchema = z
  .object({
    id: idSchema,
    src: imageSourceSchema,
    storagePath: optionalStoragePathSchema,
    available: z.boolean(),
    alt: z.string().trim().min(1).max(200),
    caption: z.string().trim().min(1).max(120),
    positionX: imagePositionSchema,
    positionY: imagePositionSchema,
    zoom: imageZoomSchema,
    featured: z.boolean(),
    carousel: z.boolean(),
    visible: z.boolean(),
  })
  .strict();

export const weddingContentSchema = z
  .object({
    weddingDateTime: nullableDateTimeSchema,
    expiredCountdownMessage: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập thông điệp sau countdown.")
      .max(200),
    venues: z.array(weddingEventSchema).min(1).max(8),
    storyChapters: z.array(storyChapterSchema).max(20),
    galleryImages: z.array(galleryImageSchema).max(40),
    albumIntervalMs: z.number().int().min(4_000).max(10_000),
    themePreset: z.enum(THEME_IDS).default(DEFAULT_THEME_PRESET),
    fontPreset: z.enum(FONT_IDS).default(DEFAULT_FONT_PRESET),
  })
  .strict();

export const weddingContentUpdateSchema = weddingContentSchema
  .extend({
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();

export const adminVerificationSchema = z
  .object({
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();

function parseStoredContent(record: {
  weddingDateTime: Date | null;
  expiredCountdownMessage: string | null;
  venuesJson: unknown;
  storyChaptersJson: unknown;
  galleryImagesJson: unknown;
  albumIntervalMs: number;
  themePreset: string;
  fontPreset: string;
}): WeddingContentData {
  const parsed = weddingContentSchema.safeParse({
    weddingDateTime: record.weddingDateTime?.toISOString() ?? null,
    expiredCountdownMessage:
      record.expiredCountdownMessage ??
      defaultWeddingContent.expiredCountdownMessage,
    venues: record.venuesJson,
    storyChapters: record.storyChaptersJson,
    galleryImages: record.galleryImagesJson,
    albumIntervalMs: record.albumIntervalMs,
    themePreset: record.themePreset,
    fontPreset: record.fontPreset,
  });

  return parsed.success ? parsed.data : defaultWeddingContent;
}

export const getWeddingContent = cache(async (): Promise<WeddingContentData> => {
  if (!process.env.DATABASE_URL) {
    return defaultWeddingContent;
  }

  await connection();

  try {
    const record = await prisma.weddingContent.findUnique({
      where: { id: "main" },
      select: {
        weddingDateTime: true,
        expiredCountdownMessage: true,
        venuesJson: true,
        storyChaptersJson: true,
        galleryImagesJson: true,
        albumIntervalMs: true,
        themePreset: true,
        fontPreset: true,
      },
    });

    return record ? parseStoredContent(record) : defaultWeddingContent;
  } catch {
    return defaultWeddingContent;
  }
});

export async function saveWeddingContent(
  content: WeddingContentData,
): Promise<WeddingContentData> {
  const record = await prisma.weddingContent.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      weddingDateTime: content.weddingDateTime
        ? new Date(content.weddingDateTime)
        : null,
      expiredCountdownMessage: content.expiredCountdownMessage,
      venuesJson: content.venues,
      storyChaptersJson: content.storyChapters,
      galleryImagesJson: content.galleryImages,
      albumIntervalMs: content.albumIntervalMs,
      themePreset: content.themePreset,
      fontPreset: content.fontPreset,
    },
    update: {
      weddingDateTime: content.weddingDateTime
        ? new Date(content.weddingDateTime)
        : null,
      expiredCountdownMessage: content.expiredCountdownMessage,
      venuesJson: content.venues,
      storyChaptersJson: content.storyChapters,
      galleryImagesJson: content.galleryImages,
      albumIntervalMs: content.albumIntervalMs,
      themePreset: content.themePreset,
      fontPreset: content.fontPreset,
    },
    select: {
      weddingDateTime: true,
      expiredCountdownMessage: true,
      venuesJson: true,
      storyChaptersJson: true,
      galleryImagesJson: true,
      albumIntervalMs: true,
      themePreset: true,
      fontPreset: true,
    },
  });

  return parseStoredContent(record);
}
