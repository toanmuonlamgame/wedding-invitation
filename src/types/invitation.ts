export type InvitationPersonalization = {
  recipientText: string;
  guestCount: number | null;
  privateMessage: string | null;
};

export type CreatedInvitation = {
  token: string;
  invitationUrl: string;
};
