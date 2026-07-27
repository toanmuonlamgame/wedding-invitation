import type { Prisma } from "@prisma/client";
import type {
  AdminInvitationFilter,
  AdminInvitationSort,
} from "@/src/types/admin-invitation";

export function buildAdminInvitationWhere(
  search: string,
  filter: AdminInvitationFilter,
): Prisma.InvitationWhereInput {
  const filterWhere: Prisma.InvitationWhereInput =
    filter === "pending"
      ? { rsvp: { is: null } }
      : filter === "attending"
        ? { rsvp: { is: { attending: true } } }
        : filter === "declined"
          ? { rsvp: { is: { attending: false } } }
          : filter === "wished"
            ? { wishes: { some: {} } }
            : filter === "unwished"
              ? { wishes: { none: {} } }
              : filter === "active"
                ? { isActive: true }
                : filter === "inactive"
                  ? { isActive: false }
                  : {};
  const normalizedSearch = search.trim();

  return {
    AND: [
      filterWhere,
      normalizedSearch
        ? {
            OR: [
              {
                recipientText: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              { token: { contains: normalizedSearch } },
              {
                privateMessage: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                label: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                adminNotes: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {},
    ],
  };
}

export function buildAdminInvitationOrder(
  sort: AdminInvitationSort,
): Prisma.InvitationOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ createdAt: "asc" }];
  if (sort === "name-asc") return [{ recipientText: "asc" }];
  if (sort === "name-desc") return [{ recipientText: "desc" }];
  if (sort === "response-newest") {
    return [{ rsvp: { updatedAt: "desc" } }, { updatedAt: "desc" }];
  }
  return [{ createdAt: "desc" }];
}
