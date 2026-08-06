export type AdminInvitationFilter =
  | "all"
  | "pending"
  | "attending"
  | "declined"
  | "wished"
  | "unwished"
  | "active"
  | "inactive";

export type AdminInvitationSort =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "response-newest";

export type AdminInvitationItem = {
  id: string;
  token: string;
  recipientText: string;
  language: InvitationLanguage;
  guestCount: number | null;
  invitationSide: "groom" | "bride" | "unspecified";
  privateMessage: string | null;
  label: string | null;
  adminNotes: string | null;
  isActive: boolean;
  disabledAt: string | null;
  createdAt: string;
  updatedAt: string;
  rsvp: {
    attending: boolean;
    confirmedCount: number | null;
    note: string | null;
    updatedAt: string;
  } | null;
  wishCount: number;
  latestWishAt: string | null;
  latestResponseAt: string | null;
};

export type AdminInvitationPage = {
  items: AdminInvitationItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
import type { InvitationLanguage } from "@/src/lib/invitation-i18n";
