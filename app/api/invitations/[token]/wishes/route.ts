import {
  readJsonBody,
  validationErrorResponse,
} from "@/src/lib/api-validation";
import { wishInputSchema } from "@/src/lib/engagement";
import { isInvitationToken } from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { token } = await params;
  if (!isInvitationToken(token)) {
    return Response.json({ message: "Không tìm thấy thiệp mời." }, { status: 404 });
  }

  const body = await readJsonBody(request);
  if (!body.success) return body.response;
  const parsed = wishInputSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: { id: true },
    });
    if (!invitation) {
      return Response.json(
        { message: "Không tìm thấy thiệp mời." },
        { status: 404 },
      );
    }

    const wish = await prisma.weddingWish.create({
      data: {
        invitationId: invitation.id,
        senderName: parsed.data.senderName,
        message: parsed.data.message,
      },
      select: {
        senderName: true,
        message: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        senderName: wish.senderName,
        message: wish.message,
        createdAt: wish.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { message: "Chưa thể gửi lời chúc lúc này. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }
}
