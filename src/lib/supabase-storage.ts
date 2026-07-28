import "server-only";

import { randomBytes } from "node:crypto";

export const MEDIA_CATEGORIES = [
  "album",
  "story",
  "venues",
  "cover",
  "countdown",
  "logo",
] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_MEDIA_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

type StorageConfig = {
  bucket: string;
  serviceRoleKey: string;
  url: string;
};

function getStorageConfig(): StorageConfig {
  const urlValue = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || "wedding-media";

  if (!urlValue || !serviceRoleKey) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlValue);
  } catch {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  if (
    parsedUrl.protocol !== "https:" ||
    !/^[A-Za-z0-9_-]+$/.test(bucket)
  ) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  return {
    bucket,
    serviceRoleKey,
    url: parsedUrl.origin,
  };
}

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function isMediaCategory(value: string): value is MediaCategory {
  return MEDIA_CATEGORIES.includes(value as MediaCategory);
}

export function isAllowedStoragePath(value: string) {
  return (
    /^(album|story|venues|cover|countdown|logo)\/[A-Za-z0-9._/-]+$/.test(value) &&
    !value.includes("..") &&
    !value.includes("\\") &&
    !value.includes("://")
  );
}

export async function hasValidMediaSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function uploadWeddingMedia(
  file: File,
  category: MediaCategory,
) {
  const config = getStorageConfig();
  const extension =
    ALLOWED_MEDIA_TYPES[file.type as keyof typeof ALLOWED_MEDIA_TYPES];
  if (!extension) {
    throw new Error("UNSUPPORTED_MEDIA_TYPE");
  }

  const year = new Date().getUTCFullYear();
  const storagePath = `${category}/${year}/${randomBytes(18).toString("base64url")}${extension}`;
  const response = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeStoragePath(storagePath)}`,
    {
      method: "POST",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "cache-control": "31536000",
        "content-type": file.type,
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    throw new Error("STORAGE_UPLOAD_FAILED");
  }

  return {
    publicUrl: `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodeStoragePath(storagePath)}`,
    storagePath,
  };
}

export async function deleteWeddingMedia(storagePath: string) {
  if (!isAllowedStoragePath(storagePath)) {
    throw new Error("INVALID_STORAGE_PATH");
  }

  const config = getStorageConfig();
  const response = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}`,
    {
      method: "DELETE",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ prefixes: [storagePath] }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    throw new Error("STORAGE_DELETE_FAILED");
  }
}
