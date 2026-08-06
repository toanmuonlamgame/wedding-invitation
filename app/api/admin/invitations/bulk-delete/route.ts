import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { hasAdminAccess } from "@/src/lib/admin-auth";
import { adminInvitationBulkDeleteSchema } from "@/src/lib/admin-invitation-validation";
import { syncInvitationsDeletionToGoogleSheets } from "@/src/lib/google-sheets-sync";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminInvitationBulkDeleteSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  if (!hasAdminAccess(parsed.data.creatorSecret)) {
    return Response.json(
      { message: "Không có quyền xóa thiệp." },
      { status: 403 },
    );
  }

  try {
    const invitations = await prisma.invitation.findMany({
      where: { id: { in: parsed.data.ids } },
      select: { id: true, token: true },
    });
    if (invitations.length === 0) {
      return Response.json(
        { message: "Không tìm thấy thiệp đã chọn." },
        { status: 404 },
      );
    }

    const result = await prisma.invitation.deleteMany({
      where: { id: { in: invitations.map((invitation) => invitation.id) } },
    });
    const sheetsSync = await syncInvitationsDeletionToGoogleSheets({
      invitations: invitations.map((invitation) => ({
        invitationId: invitation.id,
        token: invitation.token,
      })),
    });

    return Response.json({
      success: true,
      deletedCount: result.count,
      sheetsSync,
    });
  } catch {
    return Response.json(
      { message: "Chưa thể xóa hàng loạt thiệp lúc này." },
      { status: 503 },
    );
  }
}
