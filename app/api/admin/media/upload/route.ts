import { hasValidCreatorSecret } from "@/src/lib/invitations";
import {
  ALLOWED_MEDIA_TYPES,
  hasValidMediaSignature,
  isMediaCategory,
  MAX_MEDIA_FILE_SIZE,
  uploadWeddingMedia,
} from "@/src/lib/supabase-storage";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return Response.json(
    { message: "Không có quyền tải ảnh lên." },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { message: "Dữ liệu tải lên không hợp lệ." },
      { status: 400 },
    );
  }

  const creatorSecret = formData.get("creatorSecret");
  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  if (
    typeof creatorSecret !== "string" ||
    !expectedSecret ||
    !hasValidCreatorSecret(creatorSecret, expectedSecret)
  ) {
    return unauthorizedResponse();
  }

  const category = formData.get("category");
  if (typeof category !== "string" || !isMediaCategory(category)) {
    return Response.json(
      { message: "Nhóm ảnh không hợp lệ." },
      { status: 400 },
    );
  }

  const files = formData.getAll("file");
  if (files.length !== 1 || !(files[0] instanceof File)) {
    return Response.json(
      { message: "Mỗi request chỉ được tải lên một ảnh." },
      { status: 400 },
    );
  }

  const file = files[0];
  if (file.size === 0) {
    return Response.json(
      { message: "File ảnh đang rỗng." },
      { status: 400 },
    );
  }
  if (file.size > MAX_MEDIA_FILE_SIZE) {
    return Response.json(
      { message: "Ảnh không được lớn hơn 10 MB." },
      { status: 413 },
    );
  }
  if (!(file.type in ALLOWED_MEDIA_TYPES)) {
    return Response.json(
      { message: "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP." },
      { status: 415 },
    );
  }
  if (!(await hasValidMediaSignature(file))) {
    return Response.json(
      { message: "Nội dung file không khớp định dạng ảnh." },
      { status: 415 },
    );
  }

  try {
    const result = await uploadWeddingMedia(file, category);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED"
        ? "Supabase Storage chưa được cấu hình."
        : "Chưa thể tải ảnh lên Storage. Vui lòng thử lại.";
    return Response.json({ message }, { status: 503 });
  }
}
