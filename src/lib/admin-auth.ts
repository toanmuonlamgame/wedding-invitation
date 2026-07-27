import "server-only";

import { hasValidCreatorSecret } from "@/src/lib/invitations";

export function hasAdminAccess(candidate: string) {
  const expectedSecret = process.env.INVITATION_CREATOR_SECRET;
  return Boolean(
    expectedSecret && hasValidCreatorSecret(candidate, expectedSecret),
  );
}
