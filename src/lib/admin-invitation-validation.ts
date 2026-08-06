import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

export const adminInvitationListSchema = z
  .object({
    creatorSecret: z.string().min(1).max(256),
    search: z.string().trim().max(200).default(""),
    filter: z
      .enum([
        "all",
        "pending",
        "attending",
        "declined",
        "wished",
        "unwished",
        "active",
        "inactive",
      ])
      .default("all"),
    sort: z
      .enum([
        "newest",
        "oldest",
        "name-asc",
        "name-desc",
        "response-newest",
      ])
      .default("newest"),
    page: z.number().int().min(1).max(10_000).default(1),
    pageSize: z.number().int().min(10).max(50).default(20),
  })
  .strict();

export const adminInvitationMutationSchema = z.discriminatedUnion("action", [
  z
    .object({
      creatorSecret: z.string().min(1).max(256),
      action: z.literal("update"),
      recipientText: z
        .string()
        .trim()
        .min(2, "Tên hoặc nội dung người được mời quá ngắn.")
        .max(120),
      guestCount: z.number().int().min(1).max(20).nullable(),
      invitationSide: z.enum(["groom", "bride", "unspecified"]),
      language: z.enum(["vi", "ko"]),
      privateMessage: optionalTrimmedString(500),
      label: optionalTrimmedString(80),
      adminNotes: optionalTrimmedString(1_000),
    })
    .strict(),
  z
    .object({
      creatorSecret: z.string().min(1).max(256),
      action: z.enum(["disable", "enable", "regenerate", "sync-sheets"]),
    })
    .strict(),
]);

export const adminInvitationDeleteSchema = z
  .object({
    creatorSecret: z.string().min(1).max(256),
  })
  .strict();
