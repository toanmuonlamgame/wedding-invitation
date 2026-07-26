import { cache } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { defaultWeddingContent } from "@/src/lib/wedding-data";
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
const internalImageSchema = z
  .string()
  .trim()
  .min(12, "Đường dẫn ảnh phải bắt đầu bằng /images/.")
  .max(200)
  .regex(
    /^\/images\/[A-Za-z0-9._/-]+$/,
    "Đường dẫn ảnh phải bắt đầu bằng /images/ và không chứa ký tự lạ.",
  )
  .refine((value) => !value.includes(".."), "Đường dẫn ảnh không hợp lệ.");
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
  internalImageSchema.optional(),
);

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
    imageAlt: z.string().trim().min(1).max(200),
    available: z.boolean(),
    visible: z.boolean(),
  })
  .strict();

export const galleryImageSchema = z
  .object({
    id: idSchema,
    src: internalImageSchema,
    available: z.boolean(),
    alt: z.string().trim().min(1).max(200),
    caption: z.string().trim().min(1).max(120),
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
    },
    select: {
      weddingDateTime: true,
      expiredCountdownMessage: true,
      venuesJson: true,
      storyChaptersJson: true,
      galleryImagesJson: true,
      albumIntervalMs: true,
    },
  });

  return parseStoredContent(record);
}
