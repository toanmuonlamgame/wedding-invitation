import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import type {
  AdminRsvp,
  AdminWeddingWish,
  InvitationRsvp,
  PublicWeddingWish,
  RsvpSummary,
} from "@/src/types/engagement";

export const wishInputSchema = z
  .object({
    senderName: z
      .string()
      .trim()
      .min(2, "Tên người gửi phải có ít nhất 2 ký tự.")
      .max(100, "Tên người gửi không được quá 100 ký tự."),
    message: z
      .string()
      .trim()
      .min(2, "Lời chúc phải có ít nhất 2 ký tự.")
      .max(1_000, "Lời chúc không được quá 1000 ký tự."),
  })
  .strict();

export const rsvpInputSchema = z
  .object({
    attending: z.boolean({
      error: "Vui lòng chọn trạng thái tham dự.",
    }),
    confirmedCount: z
      .number()
      .int("Số người phải là số nguyên.")
      .min(1, "Số người phải từ 1 đến 20.")
      .max(20, "Số người phải từ 1 đến 20.")
      .nullable(),
    note: z
      .string()
      .trim()
      .max(500, "Ghi chú không được quá 500 ký tự.")
      .nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.attending && value.confirmedCount === null) {
      context.addIssue({
        code: "custom",
        path: ["confirmedCount"],
        message: "Vui lòng nhập số người tham dự.",
      });
    }
    if (!value.attending && value.confirmedCount !== null) {
      context.addIssue({
        code: "custom",
        path: ["confirmedCount"],
        message: "Không nhập số người khi không tham dự.",
      });
    }
  });

export const adminWishUpdateSchema = wishInputSchema
  .extend({
    creatorSecret: z.string().min(1).max(256),
    isVisible: z.boolean(),
  })
  .strict();

export const adminSecretSchema = z
  .object({
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();

function toPublicWish(wish: {
  senderName: string;
  message: string;
  createdAt: Date;
}): PublicWeddingWish {
  return {
    senderName: wish.senderName,
    message: wish.message,
    createdAt: wish.createdAt.toISOString(),
  };
}

export async function getPublicWishes(limit = 10): Promise<PublicWeddingWish[]> {
  try {
    const wishes = await prisma.weddingWish.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 20),
      select: {
        senderName: true,
        message: true,
        createdAt: true,
      },
    });
    return wishes.map(toPublicWish);
  } catch {
    return [];
  }
}

export async function getAdminWishes(): Promise<AdminWeddingWish[]> {
  const wishes = await prisma.weddingWish.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      invitation: {
        select: { recipientText: true },
      },
    },
  });

  return wishes.map((wish) => ({
    id: wish.id,
    senderName: wish.senderName,
    message: wish.message,
    isVisible: wish.isVisible,
    createdAt: wish.createdAt.toISOString(),
    updatedAt: wish.updatedAt.toISOString(),
    recipientText: wish.invitation?.recipientText ?? null,
  }));
}

export async function getInvitationRsvp(
  invitationId: string,
): Promise<InvitationRsvp | null> {
  const rsvp = await prisma.rsvp.findUnique({
    where: { invitationId },
  });

  return rsvp
    ? {
        attending: rsvp.attending,
        confirmedCount: rsvp.confirmedCount,
        note: rsvp.note,
        updatedAt: rsvp.updatedAt.toISOString(),
      }
    : null;
}

export async function getAdminRsvps(): Promise<{
  entries: AdminRsvp[];
  summary: RsvpSummary;
}> {
  const [rsvps, invitationCount] = await Promise.all([
    prisma.rsvp.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        invitation: { select: { recipientText: true } },
      },
    }),
    prisma.invitation.count(),
  ]);

  const entries = rsvps.map((rsvp) => ({
    recipientText: rsvp.invitation.recipientText,
    attending: rsvp.attending,
    confirmedCount: rsvp.confirmedCount,
    note: rsvp.note,
    updatedAt: rsvp.updatedAt.toISOString(),
  }));
  const attendingEntries = entries.filter((entry) => entry.attending);

  return {
    entries,
    summary: {
      respondedInvitations: entries.length,
      attendingInvitations: attendingEntries.length,
      attendingGuests: attendingEntries.reduce(
        (total, entry) => total + (entry.confirmedCount ?? 0),
        0,
      ),
      declinedInvitations: entries.length - attendingEntries.length,
      pendingInvitations: Math.max(0, invitationCount - entries.length),
    },
  };
}
