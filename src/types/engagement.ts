export type PublicWeddingWish = {
  senderName: string;
  message: string;
  createdAt: string;
};

export type AdminWeddingWish = PublicWeddingWish & {
  id: string;
  isVisible: boolean;
  updatedAt: string;
  recipientText: string | null;
};

export type InvitationRsvp = {
  guestName: string | null;
  invitationSide: InvitationSide;
  attending: boolean;
  confirmedCount: number | null;
  note: string | null;
  updatedAt: string;
};

export type AdminRsvp = InvitationRsvp & {
  recipientText: string;
};

export type RsvpSummary = {
  respondedInvitations: number;
  attendingInvitations: number;
  attendingGuests: number;
  declinedInvitations: number;
  pendingInvitations: number;
};

export type FieldErrors = Record<string, string>;

export type WishExportStatus = "all" | "visible" | "hidden";
export type RsvpExportStatus = "all" | "attending" | "declined";
import type { InvitationSide } from "@/src/types/wedding";
