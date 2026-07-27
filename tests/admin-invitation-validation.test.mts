import assert from "node:assert/strict";
import test from "node:test";
import {
  adminInvitationDeleteSchema,
  adminInvitationListSchema,
  adminInvitationMutationSchema,
} from "../src/lib/admin-invitation-validation.ts";

test("admin list validation applies safe pagination defaults", () => {
  const parsed = adminInvitationListSchema.parse({
    creatorSecret: "secret",
  });
  assert.deepEqual(parsed, {
    creatorSecret: "secret",
    search: "",
    filter: "all",
    sort: "newest",
    page: 1,
    pageSize: 20,
  });
  assert.equal(
    adminInvitationListSchema.safeParse({
      creatorSecret: "secret",
      pageSize: 500,
    }).success,
    false,
  );
});

test("admin update trims optional fields and converts blanks to null", () => {
  const parsed = adminInvitationMutationSchema.parse({
    creatorSecret: "secret",
    action: "update",
    recipientText: "  Gia đình anh Minh  ",
    guestCount: null,
    privateMessage: " ",
    label: "  Nhà trai ",
    adminNotes: "",
  });
  assert.equal(parsed.action, "update");
  if (parsed.action !== "update") return;
  assert.equal(parsed.recipientText, "Gia đình anh Minh");
  assert.equal(parsed.privateMessage, null);
  assert.equal(parsed.label, "Nhà trai");
  assert.equal(parsed.adminNotes, null);
});

test("admin dangerous actions and delete require a creator secret", () => {
  for (const action of ["disable", "enable", "regenerate"] as const) {
    assert.equal(
      adminInvitationMutationSchema.safeParse({
        creatorSecret: "secret",
        action,
      }).success,
      true,
    );
  }
  assert.equal(adminInvitationDeleteSchema.safeParse({}).success, false);
});
