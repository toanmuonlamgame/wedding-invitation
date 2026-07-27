import { Prisma } from "@prisma/client";
import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { hasAdminAccess } from "@/src/lib/admin-auth";
import {
  adminInvitationDeleteSchema,
  adminInvitationMutationSchema,
} from "@/src/lib/admin-invitation-validation";
import { regenerateInvitationToken } from "@/src/lib/admin-invitations";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function notFoundResponse() {
  return Response.json(
    { message: "Không tìm thấy thiệp mời." },
    { status: 404 },
  );
}

function isNotFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminInvitationMutationSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  if (!hasAdminAccess(parsed.data.creatorSecret)) {
    return Response.json(
      { message: "Không có quyền cập nhật thiệp." },
      { status: 403 },
    );
  }

  try {
    if (parsed.data.action === "regenerate") {
      return Response.json(await regenerateInvitationToken(id));
    }

    if (parsed.data.action === "disable") {
      await prisma.invitation.update({
        where: { id },
        data: { isActive: false, disabledAt: new Date() },
      });
      return Response.json({ success: true });
    }

    if (parsed.data.action === "enable") {
      await prisma.invitation.update({
        where: { id },
        data: { isActive: true, disabledAt: null },
      });
      return Response.json({ success: true });
    }

    if (parsed.data.action !== "update") {
      return Response.json(
        { message: "Thao tác không hợp lệ." },
        { status: 400 },
      );
    }

    await prisma.invitation.update({
      where: { id },
      data: {
        recipientText: parsed.data.recipientText,
        guestCount: parsed.data.guestCount,
        privateMessage: parsed.data.privateMessage,
        label: parsed.data.label,
        adminNotes: parsed.data.adminNotes,
      },
    });
    return Response.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) return notFoundResponse();
    return Response.json(
      { message: "Chưa thể cập nhật thiệp mời lúc này." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = adminInvitationDeleteSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  if (!hasAdminAccess(parsed.data.creatorSecret)) {
    return Response.json(
      { message: "Không có quyền xóa thiệp." },
      { status: 403 },
    );
  }

  try {
    await prisma.invitation.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (isNotFound(error)) return notFoundResponse();
    return Response.json(
      { message: "Chưa thể xóa thiệp mời lúc này." },
      { status: 503 },
    );
  }
}
