import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import {
  createInvitationToken,
  hasValidCreatorSecret,
  invitationRequestSchema,
  type InvitationRequest,
} from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";
import { syncInvitationToGoogleSheets } from "@/src/lib/google-sheets-sync";
import { getSiteOrigin } from "@/src/lib/site-url";

export const runtime = "nodejs";

const MAX_TOKEN_ATTEMPTS = 3;

async function createInvitation(
  data: Omit<InvitationRequest, "creatorSecret">,
) {
  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
    const token = createInvitationToken();

    try {
      return await prisma.invitation.create({
        data: {
          token,
          recipientText: data.recipientText,
          guestCount: data.guestCount,
          privateMessage: data.privateMessage,
          invitationSide: data.invitationSide,
          language: data.language,
        },
        select: {
          id: true,
          token: true,
          recipientText: true,
          privateMessage: true,
          adminNotes: true,
          guestCount: true,
          invitationSide: true,
          language: true,
          createdAt: true,
        },
      });
    } catch (error) {
      const isTokenCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!isTokenCollision || attempt === MAX_TOKEN_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate a unique invitation token.");
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  const parsed = invitationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: "Vui lòng kiểm tra lại thông tin đã nhập." },
      { status: 400 },
    );
  }

  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;

  if (!expectedSecret) {
    return Response.json(
      { message: "Chức năng tạo thiệp tạm thời chưa sẵn sàng." },
      { status: 500 },
    );
  }

  if (!hasValidCreatorSecret(parsed.data.creatorSecret, expectedSecret)) {
    return Response.json(
      { message: "Không thể xác thực yêu cầu tạo thiệp." },
      { status: 403 },
    );
  }

  try {
    const siteOrigin = getSiteOrigin(request.nextUrl.toString());
    const invitationData = {
      recipientText: parsed.data.recipientText,
      guestCount: parsed.data.guestCount,
      privateMessage: parsed.data.privateMessage,
      invitationSide: parsed.data.invitationSide,
      language: parsed.data.language,
    };
    const invitation = await createInvitation(invitationData);
    const invitationUrl = new URL(
      `/thiep/${invitation.token}`,
      siteOrigin,
    ).toString();
    const sheetsSync = await syncInvitationToGoogleSheets({
      invitation,
      invitationUrl,
    });

    return Response.json(
      { token: invitation.token, invitationUrl, sheetsSync },
      { status: 201 },
    );
  } catch (error) {
    console.error("[invitations:create] Prisma create failed", error);
    return Response.json(
      {
        error: "INVITATION_CREATE_FAILED",
        message: "Chưa thể tạo thiệp lúc này. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
