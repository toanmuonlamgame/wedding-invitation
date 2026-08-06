import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import {
  normalizeInvitationLanguage,
  type InvitationLanguage,
} from "@/src/lib/invitation-i18n";
import type { InvitationSide } from "@/src/types/wedding";

export const invitationRequestSchema = z
  .object({
    recipientText: z
      .string()
      .trim()
      .min(2, "Nội dung người được mời quá ngắn.")
      .max(120, "Nội dung người được mời không được quá 120 ký tự."),
    guestCount: z.number().int().min(1).max(20).optional(),
    privateMessage: z
      .string()
      .trim()
      .max(500, "Lời nhắn riêng không được quá 500 ký tự.")
      .optional()
      .transform((value) => value || undefined),
    invitationSide: z
      .enum(["groom", "bride", "unspecified"])
      .optional()
      .default("unspecified"),
    language: z.enum(["vi", "ko"]).optional().default("vi"),
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();

const TOKEN_BYTES = 24;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

export type InvitationRequest = z.infer<typeof invitationRequestSchema>;

export function createInvitationToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function isInvitationToken(value: string) {
  return TOKEN_PATTERN.test(value);
}

export function hasValidCreatorSecret(candidate: string, expected: string) {
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();

  return timingSafeEqual(candidateDigest, expectedDigest);
}

export const getInvitationByToken = cache(async (token: string) => {
  if (!isInvitationToken(token)) {
    return null;
  }

  await connection();

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: {
      recipientText: true,
      guestCount: true,
      privateMessage: true,
      invitationSide: true,
      language: true,
      isActive: true,
    },
  });

  if (!invitation) return null;
  const invitationSide: InvitationSide =
    invitation.invitationSide === "groom" ||
    invitation.invitationSide === "bride"
      ? invitation.invitationSide
      : "unspecified";
  return {
    ...invitation,
    invitationSide,
    language: normalizeInvitationLanguage(invitation.language),
  };
});

export type { InvitationLanguage };
