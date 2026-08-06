import type { InvitationSide } from "@/src/types/wedding";
import type { InvitationLanguage } from "@/src/lib/invitation-i18n";

export type InvitationPersonalization = {
  recipientText: string;
  guestCount: number | null;
  privateMessage: string | null;
  invitationSide: InvitationSide;
  language: InvitationLanguage;
};

export type CreatedInvitation = {
  token: string;
  invitationUrl: string;
};
