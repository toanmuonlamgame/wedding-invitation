import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  adminVerificationSchema,
  getWeddingContent,
  saveWeddingContent,
  weddingContentUpdateSchema,
} from "@/src/lib/wedding-content";
import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
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
    const body = await readJsonBody(request);
    if (!body.success) return body.response;
    const parsed = adminVerificationSchema.safeParse(body.data);

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
    const body = await readJsonBody(request);
    if (!body.success) return body.response;
    const parsed = weddingContentUpdateSchema.safeParse(body.data);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
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
      themePreset: parsed.data.themePreset,
      fontPreset: parsed.data.fontPreset,
      experience: parsed.data.experience,
    };
    const savedContent = await saveWeddingContent(content);
    revalidateTag("wedding-content", { expire: 0 });
    revalidatePath("/", "page");
    revalidatePath("/thiep/[token]", "page");
    return Response.json(savedContent);
  } catch {
    return Response.json(
      { message: "Chưa thể lưu nội dung lúc này. Bản nháp vẫn được giữ." },
      { status: 500 },
    );
  }
}
