import type { InvitationSide } from "@/src/types/wedding";

export type InvitationPersonalization = {
  recipientText: string;
  guestCount: number | null;
  privateMessage: string | null;
  invitationSide: InvitationSide;
};

export type CreatedInvitation = {
  token: string;
  invitationUrl: string;
};
