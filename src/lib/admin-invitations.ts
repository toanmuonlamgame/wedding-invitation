import "server-only";

import { Prisma } from "@prisma/client";
import {
  buildAdminInvitationOrder,
  buildAdminInvitationWhere,
} from "@/src/lib/admin-invitation-query";
import { createInvitationToken } from "@/src/lib/invitations";
import { prisma } from "@/src/lib/prisma";
import { normalizeInvitationLanguage } from "@/src/lib/invitation-i18n";
import type {
  AdminInvitationFilter,
  AdminInvitationPage,
  AdminInvitationSort,
} from "@/src/types/admin-invitation";

const MAX_TOKEN_ATTEMPTS = 3;

type ListOptions = {
  search: string;
  filter: AdminInvitationFilter;
  sort: AdminInvitationSort;
  page: number;
  pageSize: number;
};

export async function listAdminInvitations({
  search,
  filter,
  sort,
  page,
  pageSize,
}: ListOptions): Promise<AdminInvitationPage> {
  const where = buildAdminInvitationWhere(search, filter);

  const [total, invitations] = await Promise.all([
    prisma.invitation.count({ where }),
    prisma.invitation.findMany({
      where,
      orderBy: buildAdminInvitationOrder(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        token: true,
        recipientText: true,
        language: true,
        guestCount: true,
        invitationSide: true,
        privateMessage: true,
        label: true,
        adminNotes: true,
        isActive: true,
        disabledAt: true,
        createdAt: true,
        updatedAt: true,
        rsvp: {
          select: {
            attending: true,
            confirmedCount: true,
            note: true,
            updatedAt: true,
          },
        },
        wishes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        _count: { select: { wishes: true } },
      },
    }),
  ]);

  return {
    items: invitations.map((invitation) => {
      const rsvpAt = invitation.rsvp?.updatedAt ?? null;
      const latestWishAt = invitation.wishes[0]?.createdAt ?? null;
      const latestResponseAt =
        rsvpAt && latestWishAt
          ? rsvpAt > latestWishAt
            ? rsvpAt
            : latestWishAt
          : rsvpAt ?? latestWishAt;

      return {
        id: invitation.id,
        token: invitation.token,
        recipientText: invitation.recipientText,
        language: normalizeInvitationLanguage(invitation.language),
        guestCount: invitation.guestCount,
        invitationSide:
          invitation.invitationSide === "groom" ||
          invitation.invitationSide === "bride"
            ? invitation.invitationSide
            : "unspecified",
        privateMessage: invitation.privateMessage,
        label: invitation.label,
        adminNotes: invitation.adminNotes,
        isActive: invitation.isActive,
        disabledAt: invitation.disabledAt?.toISOString() ?? null,
        createdAt: invitation.createdAt.toISOString(),
        updatedAt: invitation.updatedAt.toISOString(),
        rsvp: invitation.rsvp
          ? {
              attending: invitation.rsvp.attending,
              confirmedCount: invitation.rsvp.confirmedCount,
              note: invitation.rsvp.note,
              updatedAt: invitation.rsvp.updatedAt.toISOString(),
            }
          : null,
        wishCount: invitation._count.wishes,
        latestWishAt: latestWishAt?.toISOString() ?? null,
        latestResponseAt: latestResponseAt?.toISOString() ?? null,
      };
    }),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function regenerateInvitationToken(id: string) {
  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.invitation.update({
        where: { id },
        data: {
          token: createInvitationToken(),
          isActive: true,
          disabledAt: null,
        },
        select: { token: true },
      });
    } catch (error) {
      const collision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!collision || attempt === MAX_TOKEN_ATTEMPTS - 1) throw error;
    }
  }
  throw new Error("Unable to regenerate invitation token.");
}
