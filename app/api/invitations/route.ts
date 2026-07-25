import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import {
  createInvitationToken,
  hasValidCreatorSecret,
  invitationRequestSchema,
  type InvitationRequest,
} from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

const MAX_TOKEN_ATTEMPTS = 3;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function getSiteOrigin(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = new URL(configuredSiteUrl || request.nextUrl.origin);
  const isSecureOrigin = url.protocol === "https:";
  const isLocalOrigin =
    url.protocol === "http:" && LOCAL_HOSTNAMES.has(url.hostname);

  if (!isSecureOrigin && !isLocalOrigin) {
    throw new Error("Unsafe site URL origin.");
  }

  return url.origin;
}

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
        },
        select: { token: true },
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
    const invitationData = {
      recipientText: parsed.data.recipientText,
      guestCount: parsed.data.guestCount,
      privateMessage: parsed.data.privateMessage,
    };
    const invitation = await createInvitation(invitationData);
    const invitationUrl = new URL(
      `/thiep/${invitation.token}`,
      getSiteOrigin(request),
    ).toString();

    return Response.json(
      { token: invitation.token, invitationUrl },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { message: "Chưa thể tạo thiệp lúc này. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
