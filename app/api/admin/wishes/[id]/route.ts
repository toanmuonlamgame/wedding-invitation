import { z } from "zod";
import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import {
  adminSecretSchema,
  adminWishUpdateSchema,
} from "@/src/lib/engagement";
import { hasValidCreatorSecret } from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const idSchema = z.string().trim().min(1).max(100);

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return Response.json({ message: "Lời chúc không tồn tại." }, { status: 404 });
  }
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminWishUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }
  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  if (
    !expectedSecret ||
    !hasValidCreatorSecret(parsed.data.creatorSecret, expectedSecret)
  ) {
    return Response.json({ message: "Không có quyền cập nhật." }, { status: 403 });
  }

  try {
    const result = await prisma.weddingWish.updateMany({
      where: { id },
      data: {
        senderName: parsed.data.senderName,
        message: parsed.data.message,
        isVisible: parsed.data.isVisible,
      },
    });
    if (result.count === 0) {
      return Response.json(
        { message: "Lời chúc không tồn tại." },
        { status: 404 },
      );
    }
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { message: "Chưa thể cập nhật lời chúc." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
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
    return Response.json({ message: "Không có quyền xóa." }, { status: 403 });
  }

  try {
    const result = await prisma.weddingWish.deleteMany({ where: { id } });
    if (result.count === 0) {
      return Response.json(
        { message: "Lời chúc không tồn tại." },
        { status: 404 },
      );
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { message: "Chưa thể xóa lời chúc." },
      { status: 503 },
    );
  }
}
