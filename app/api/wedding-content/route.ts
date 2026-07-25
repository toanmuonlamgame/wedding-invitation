import type { NextRequest } from "next/server";
import {
  adminVerificationSchema,
  getWeddingContent,
  saveWeddingContent,
  weddingContentUpdateSchema,
} from "@/src/lib/wedding-content";
import { hasValidCreatorSecret } from "@/src/lib/invitations";

export const runtime = "nodejs";

function isAuthorized(candidate: string) {
  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  return Boolean(
    expectedSecret && hasValidCreatorSecret(candidate, expectedSecret),
  );
}

export async function GET() {
  return Response.json(await getWeddingContent());
}

export async function POST(request: NextRequest) {
  try {
    const parsed = adminVerificationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        { message: "Yêu cầu xác thực không hợp lệ." },
        { status: 400 },
      );
    }

    if (!isAuthorized(parsed.data.creatorSecret)) {
      return Response.json(
        { message: "Không thể xác thực quyền quản trị." },
        { status: 403 },
      );
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { message: "Chưa thể xác thực lúc này." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const parsed = weddingContentUpdateSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        { message: "Vui lòng kiểm tra lại toàn bộ nội dung." },
        { status: 400 },
      );
    }

    if (!isAuthorized(parsed.data.creatorSecret)) {
      return Response.json(
        { message: "Không thể xác thực quyền cập nhật." },
        { status: 403 },
      );
    }

    const content = {
      weddingDateTime: parsed.data.weddingDateTime,
      expiredCountdownMessage: parsed.data.expiredCountdownMessage,
      venues: parsed.data.venues,
      storyChapters: parsed.data.storyChapters,
      galleryImages: parsed.data.galleryImages,
      albumIntervalMs: parsed.data.albumIntervalMs,
    };
    return Response.json(await saveWeddingContent(content));
  } catch {
    return Response.json(
      { message: "Chưa thể lưu nội dung lúc này. Bản nháp vẫn được giữ." },
      { status: 500 },
    );
  }
}
