import { z } from "zod";
import {
  createRsvpsCsv,
  createWishesCsv,
  exportFilename,
} from "@/src/lib/admin-export";
import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { hasValidCreatorSecret } from "@/src/lib/invitations";

export const runtime = "nodejs";

const exportRequestSchema = z
  .object({
    creatorSecret: z.string().min(1).max(256),
    type: z.enum(["wishes", "rsvps"]),
    wishStatus: z.enum(["all", "visible", "hidden"]).default("all"),
    rsvpStatus: z.enum(["all", "attending", "declined"]).default("all"),
  })
  .strict();

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = exportRequestSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  if (
    !expectedSecret ||
    !hasValidCreatorSecret(parsed.data.creatorSecret, expectedSecret)
  ) {
    return Response.json(
      { message: "Không có quyền xuất dữ liệu." },
      { status: 403 },
    );
  }

  try {
    const isWishes = parsed.data.type === "wishes";
    const csv = isWishes
      ? await createWishesCsv(parsed.data.wishStatus)
      : await createRsvpsCsv(parsed.data.rsvpStatus);
    const filename = exportFilename(
      isWishes ? "loi-chuc-cuoi" : "danh-sach-tham-du",
    );

    return new Response(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { message: "Chưa thể tạo file xuất dữ liệu lúc này." },
      { status: 503 },
    );
  }
}
