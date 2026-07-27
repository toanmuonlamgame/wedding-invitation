export function buildInvitationUrl(origin: string, token: string) {
  return `${origin.replace(/\/+$/, "")}/thiep/${token}`;
}
