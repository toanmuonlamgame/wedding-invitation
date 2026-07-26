import { z } from "zod";
import { readJsonBody, validationErrorResponse } from "@/src/lib/api-validation";
import { hasValidCreatorSecret } from "@/src/lib/invitations";
import {
  deleteWeddingMedia,
  isAllowedStoragePath,
} from "@/src/lib/supabase-storage";

export const runtime = "nodejs";

const deleteMediaSchema = z
  .object({
    storagePath: z
      .string()
      .trim()
      .max(300)
      .refine(isAllowedStoragePath, "Đường dẫn Storage không hợp lệ."),
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();

export async function DELETE(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;

  const parsed = deleteMediaSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  if (
    !expectedSecret ||
    !hasValidCreatorSecret(parsed.data.creatorSecret, expectedSecret)
  ) {
    return Response.json(
      { message: "Không có quyền xóa ảnh." },
      { status: 403 },
    );
  }

  try {
    await deleteWeddingMedia(parsed.data.storagePath);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED"
        ? "Supabase Storage chưa được cấu hình."
        : error instanceof Error && error.message === "INVALID_STORAGE_PATH"
          ? "Đường dẫn Storage không hợp lệ."
          : "Chưa thể xóa ảnh khỏi Storage.";
    return Response.json({ message }, { status: 503 });
  }
}
