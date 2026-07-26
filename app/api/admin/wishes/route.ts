import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { adminSecretSchema, getAdminWishes } from "@/src/lib/engagement";
import { hasValidCreatorSecret } from "@/src/lib/invitations";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminSecretSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }
  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  if (
    !expectedSecret ||
    !hasValidCreatorSecret(parsed.data.creatorSecret, expectedSecret)
  ) {
    return Response.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  try {
    return Response.json(await getAdminWishes());
  } catch {
    return Response.json(
      { message: "Chưa thể tải danh sách lời chúc." },
      { status: 503 },
    );
  }
}
