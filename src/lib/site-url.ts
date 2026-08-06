import "server-only";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getSiteOrigin(requestUrl: string) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const requestOrigin = new URL(requestUrl).origin;
  const url = new URL(configuredSiteUrl || requestOrigin);
  const isSecureOrigin = url.protocol === "https:";
  const isLocalOrigin =
    url.protocol === "http:" && LOCAL_HOSTNAMES.has(url.hostname);

  if (!isSecureOrigin && !isLocalOrigin) {
    throw new Error("Unsafe site URL origin.");
  }

  return url.origin;
}

export function getInvitationUrl(token: string, requestUrl: string) {
  return new URL(`/thiep/${token}`, getSiteOrigin(requestUrl)).toString();
}
