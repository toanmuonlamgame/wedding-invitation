import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { defaultWeddingContent } from "@/src/lib/wedding-data";
import {
  defaultExperienceSettings,
  mergeExperienceSettings,
} from "@/src/lib/experience-settings";
import {
  DEFAULT_FONT_PRESET,
  DEFAULT_THEME_PRESET,
  FONT_IDS,
  THEME_IDS,
  normalizeFontPreset,
  normalizeThemePreset,
} from "@/src/lib/appearance";
import {
  MAX_ALBUM_INTERVAL_MS,
  MIN_ALBUM_INTERVAL_MS,
} from "@/src/lib/album-autoplay";
import {
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ZOOM,
  normalizeImageFraming,
} from "@/src/lib/image-framing";
import { normalizeLegacyStoryChapterInput } from "@/src/lib/story-chapters";
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
    /^(album|story|venues|cover|countdown|logo)\/[A-Za-z0-9._/-]+$/,
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

const audioSourceSchema = z
  .string()
  .trim()
  .min(1)
  .max(600)
  .refine((value) => {
    if (
      /^\/music\/[A-Za-z0-9._/-]+\.(mp3|wav|ogg|m4a)$/i.test(value) &&
      !value.includes("..")
    ) {
      return true;
    }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return false;
      const configuredUrl = process.env.SUPABASE_URL?.trim();
      return configuredUrl
        ? url.origin === new URL(configuredUrl).origin
        : url.hostname.endsWith(".supabase.co");
    } catch {
      return false;
    }
  }, "Nhạc phải dùng /music/ hoặc URL HTTPS từ Supabase Storage.");

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
const imagePositionSchema = z.coerce
  .number("Vị trí ảnh phải là một số.")
  .min(0, "Vị trí ảnh phải từ 0 đến 100.")
  .max(100, "Vị trí ảnh phải từ 0 đến 100.")
  .default(50);
const imageZoomSchema = z.coerce
  .number("Zoom ảnh phải là một số.")
  .min(MIN_IMAGE_ZOOM, "Zoom ảnh đang nhỏ hơn giới hạn.")
  .max(MAX_IMAGE_ZOOM, "Zoom ảnh đang lớn hơn giới hạn.")
  .default(1);
const imageFitModeSchema = z
  .enum(["cover", "contain"], {
    error: "Chế độ hiển thị ảnh không hợp lệ.",
  })
  .default("cover");
const imageBackgroundSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-f]{6}$/i, "Màu nền ảnh phải là mã hex hợp lệ.")
  .default("#ffffff");

const framingSchema = z
  .object({
    positionX: imagePositionSchema,
    positionY: imagePositionSchema,
    zoom: imageZoomSchema,
    fitMode: imageFitModeSchema,
    backgroundColor: imageBackgroundSchema,
  })
  .strict()
  .transform(normalizeImageFraming);

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-f]{6}$/i, "Màu phải là mã hex hợp lệ.");

const experienceSchema = z
  .object({
    cover: z
      .object({
        kicker: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập dòng mở đầu cover.")
          .max(100, "Dòng mở đầu không được quá 100 ký tự."),
        brideName: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập tên cô dâu.")
          .max(80, "Tên cô dâu không được quá 80 ký tự."),
        connector: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập ký hiệu nối.")
          .max(12, "Ký hiệu nối không được quá 12 ký tự."),
        groomName: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập tên chú rể.")
          .max(80, "Tên chú rể không được quá 80 ký tự."),
        note: z
          .string()
          .trim()
          .max(240, "Dòng mô tả không được quá 240 ký tự."),
        buttonText: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập nhãn nút mở thiệp.")
          .max(60, "Nhãn nút không được quá 60 ký tự."),
        backgroundEnabled: z.boolean(),
        backgroundSrc: optionalImageSchema,
        backgroundStoragePath: optionalStoragePathSchema,
        backgroundAlt: z.string().trim().max(200),
        background: framingSchema,
        textColor: hexColorSchema,
        overlayColor: hexColorSchema,
        overlayOpacity: z
          .number()
          .min(0, "Độ phủ cover không được nhỏ hơn 0%.")
          .max(0.85, "Độ phủ cover không được lớn hơn 85%."),
        blurPx: z
          .number()
          .min(0, "Độ mờ cover không được nhỏ hơn 0.")
          .max(12, "Độ mờ cover không được lớn hơn 12px."),
        alignment: z.enum(["left", "center", "right"], {
          error: "Cách căn nội dung cover không hợp lệ.",
        }),
        nameSize: z.enum(["compact", "balanced", "grand"], {
          error: "Cỡ tên trên cover không hợp lệ.",
        }),
        logoMode: z.enum(["monogram", "image", "hidden"], {
          error: "Kiểu biểu trưng cover không hợp lệ.",
        }),
        monogramText: z
          .string()
          .trim()
          .max(20, "Monogram không được quá 20 ký tự."),
        logoSrc: optionalImageSchema,
        logoStoragePath: optionalStoragePathSchema,
        logoAlt: z.string().trim().max(200),
        logoSize: z.enum(["small", "medium", "large"], {
          error: "Kích thước logo cover không hợp lệ.",
        }),
        logoFrame: framingSchema,
      })
      .strict(),
    invitation: z
      .object({
        eyebrow: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập nhãn nhỏ cho phần lời mời.")
          .max(80, "Nhãn nhỏ không được quá 80 ký tự."),
        title: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập tiêu đề lời mời.")
          .max(300, "Tiêu đề lời mời không được quá 300 ký tự."),
        body: z
          .string()
          .trim()
          .min(10, "Nội dung lời mời phải có ít nhất 10 ký tự.")
          .max(1_200, "Nội dung lời mời không được quá 1.200 ký tự."),
        supportingText: z
          .string()
          .trim()
          .max(400, "Mô tả phụ không được quá 400 ký tự."),
        brideFamily: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập thông tin nhà gái.")
          .max(160, "Thông tin nhà gái không được quá 160 ký tự."),
        groomFamily: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập thông tin nhà trai.")
          .max(160, "Thông tin nhà trai không được quá 160 ký tự."),
      })
      .strict(),
    music: z
      .object({
        enabled: z.boolean(),
        src: audioSourceSchema,
        title: z.string().trim().min(1).max(120),
        volume: z.number().min(0.2).max(0.35),
        loop: z.boolean(),
        autoplayAfterOpen: z.boolean(),
      })
      .strict(),
    youtube: z
      .object({
        enabled: z.boolean(),
        url: z
          .string()
          .trim()
          .url()
          .max(500)
          .refine(
            (value) =>
              /^(https:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(value),
            "URL YouTube không hợp lệ.",
          ),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(300),
      })
      .strict(),
    countdown: z
      .object({
        backgroundEnabled: z.boolean(),
        backgroundSrc: optionalImageSchema,
        backgroundStoragePath: optionalStoragePathSchema,
        backgroundAlt: z.string().trim().max(200),
        background: framingSchema,
        overlayColor: hexColorSchema,
        overlayOpacity: z.number().min(0).max(0.85),
        showCalendar: z.boolean(),
        showLunarDate: z.boolean(),
        showTime: z.boolean(),
        showCountdown: z.boolean(),
        markerStyle: z.enum(["circle", "dot", "heart"]),
      })
      .strict(),
    wishLayout: z.enum(["elegant", "bubble"]),
    wishes: z
      .object({
        overlayEnabled: z.boolean(),
        showList: z.boolean(),
        preset: z.enum(["soft", "balanced", "prominent"]),
        intervalMs: z.number().int().min(3_500).max(15_000),
        opacity: z.number().min(0.55).max(0.75),
        visibleCount: z.number().int().min(2).max(4),
        autoHideWhenTyping: z.boolean(),
      })
      .strict(),
    sections: z
      .object({
        invitation: z.boolean(),
        heroCollage: z.boolean(),
        story: z.boolean(),
        rsvp: z.boolean(),
      })
      .strict(),
    allowGuestSideSelection: z.boolean(),
  })
  .strict()
  .default(defaultExperienceSettings);

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
    fitMode: imageFitModeSchema,
    backgroundColor: imageBackgroundSchema,
    showImage: z.boolean().default(false),
    available: z.boolean(),
  })
  .strict()
  .transform((value) => ({ ...value, ...normalizeImageFraming(value) }));

const storyImageSchema = z
  .object({
    id: idSchema,
    src: imageSourceSchema,
    storagePath: optionalStoragePathSchema,
    alt: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập alt text cho ảnh.")
      .max(200, "Alt text ảnh không được quá 200 ký tự."),
    available: z.boolean(),
    positionX: imagePositionSchema,
    positionY: imagePositionSchema,
    zoom: imageZoomSchema,
    fitMode: imageFitModeSchema,
    backgroundColor: imageBackgroundSchema,
  })
  .strict()
  .transform((value) => ({ ...value, ...normalizeImageFraming(value) }));

export const storyChapterSchema = z.preprocess(
  normalizeLegacyStoryChapterInput,
  z
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
      images: z
        .array(storyImageSchema)
        .max(10, "Mỗi chương chỉ được có tối đa 10 ảnh."),
      available: z.boolean(),
      visible: z.boolean(),
    })
    .strict()
    .superRefine((chapter, context) => {
      const seen = new Set<string>();
      chapter.images.forEach((image, index) => {
        if (seen.has(image.src)) {
          context.addIssue({
            code: "custom",
            path: ["images", index, "src"],
            message: "Ảnh này đã có trong chương.",
          });
        }
        seen.add(image.src);
      });
    }),
);

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
    fitMode: imageFitModeSchema,
    backgroundColor: imageBackgroundSchema,
    featured: z.boolean(),
    carousel: z.boolean(),
    visible: z.boolean(),
  })
  .strict()
  .transform((value) => ({ ...value, ...normalizeImageFraming(value) }));

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
    albumIntervalMs: z
      .number()
      .int()
      .min(
        MIN_ALBUM_INTERVAL_MS,
        "Chu kỳ album phải từ 2 đến 30 giây.",
      )
      .max(
        MAX_ALBUM_INTERVAL_MS,
        "Chu kỳ album phải từ 2 đến 30 giây.",
      ),
    themePreset: z.enum(THEME_IDS).default(DEFAULT_THEME_PRESET),
    fontPreset: z.enum(FONT_IDS).default(DEFAULT_FONT_PRESET),
    experience: z.preprocess(mergeExperienceSettings, experienceSchema),
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
  experienceJson: unknown;
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
    themePreset: normalizeThemePreset(record.themePreset),
    fontPreset: normalizeFontPreset(record.fontPreset),
    experience: mergeExperienceSettings(record.experienceJson),
  });

  return parsed.success ? parsed.data : defaultWeddingContent;
}

async function loadWeddingContent(): Promise<WeddingContentData> {
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
        experienceJson: true,
      },
    });

    return record ? parseStoredContent(record) : defaultWeddingContent;
  } catch {
    return defaultWeddingContent;
  }
}

const getCachedWeddingContent = unstable_cache(
  loadWeddingContent,
  ["wedding-content-main"],
  {
    tags: ["wedding-content"],
    revalidate: 300,
  },
);

export const getWeddingContent = cache(async (): Promise<WeddingContentData> => {
  if (!process.env.DATABASE_URL) return defaultWeddingContent;
  return getCachedWeddingContent();
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
      experienceJson: content.experience,
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
      experienceJson: content.experience,
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
      experienceJson: true,
    },
  });

  return parseStoredContent(record);
}
