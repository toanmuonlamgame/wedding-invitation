import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { rsvpInputSchema } from "@/src/lib/engagement";
import { isInvitationToken } from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

async function findInvitation(token: string) {
  if (!isInvitationToken(token)) {
    return null;
  }
  return prisma.invitation.findUnique({
    where: { token },
    select: {
      id: true,
      recipientText: true,
      guestCount: true,
      isActive: true,
    },
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;

  try {
    const invitation = await findInvitation(token);
    if (!invitation) {
      return Response.json(
        { message: "Không tìm thấy thiệp mời." },
        { status: 404 },
      );
    }
    if (!invitation.isActive) {
      return Response.json(
        { message: "Thiệp mời này hiện không còn khả dụng." },
        { status: 410 },
      );
    }

    const rsvp = await prisma.rsvp.findUnique({
      where: { invitationId: invitation.id },
    });

    return Response.json({
      recipientText: invitation.recipientText,
      suggestedCount: invitation.guestCount ?? 1,
      rsvp: rsvp
        ? {
            attending: rsvp.attending,
            confirmedCount: rsvp.confirmedCount,
            note: rsvp.note,
            updatedAt: rsvp.updatedAt.toISOString(),
          }
        : null,
    });
  } catch {
    return Response.json(
      { message: "Chưa thể tải xác nhận tham dự lúc này." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { token } = await params;
  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = rsvpInputSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const invitation = await findInvitation(token);
    if (!invitation) {
      return Response.json(
        { message: "Không tìm thấy thiệp mời." },
        { status: 404 },
      );
    }
    if (!invitation.isActive) {
      return Response.json(
        { message: "Thiệp mời này hiện không còn khả dụng." },
        { status: 410 },
      );
    }

    const normalized = {
      attending: parsed.data.attending,
      confirmedCount: parsed.data.attending
        ? parsed.data.confirmedCount
        : null,
      note: parsed.data.note || null,
    };
    const rsvp = await prisma.rsvp.upsert({
      where: { invitationId: invitation.id },
      create: {
        invitationId: invitation.id,
        ...normalized,
      },
      update: normalized,
    });

    return Response.json({
      attending: rsvp.attending,
      confirmedCount: rsvp.confirmedCount,
      note: rsvp.note,
      updatedAt: rsvp.updatedAt.toISOString(),
    });
  } catch {
    return Response.json(
      { message: "Chưa thể lưu xác nhận tham dự lúc này." },
      { status: 503 },
    );
  }
}
