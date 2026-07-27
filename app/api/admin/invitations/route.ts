import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { hasAdminAccess } from "@/src/lib/admin-auth";
import { adminInvitationListSchema } from "@/src/lib/admin-invitation-validation";
import { listAdminInvitations } from "@/src/lib/admin-invitations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminInvitationListSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  if (!hasAdminAccess(parsed.data.creatorSecret)) {
    return Response.json(
      { message: "Không có quyền xem danh sách thiệp." },
      { status: 403 },
    );
  }

  try {
    return Response.json(await listAdminInvitations(parsed.data));
  } catch {
    return Response.json(
      { message: "Chưa thể tải danh sách thiệp mời." },
      { status: 503 },
    );
  }
}
