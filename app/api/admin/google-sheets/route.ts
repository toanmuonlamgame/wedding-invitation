import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { hasAdminAccess } from "@/src/lib/admin-auth";
import { adminGoogleSheetsActionSchema } from "@/src/lib/admin-invitation-validation";
import { clearGoogleSheetsInvitations } from "@/src/lib/google-sheets-sync";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminGoogleSheetsActionSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  if (!hasAdminAccess(parsed.data.creatorSecret)) {
    return Response.json(
      { message: "Không có quyền quản lý Google Sheets." },
      { status: 403 },
    );
  }

  const sheetsSync = await clearGoogleSheetsInvitations();
  return Response.json({
    success: sheetsSync === "success",
    sheetsSync,
  });
}
