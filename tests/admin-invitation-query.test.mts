import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdminInvitationOrder,
  buildAdminInvitationWhere,
} from "../src/lib/admin-invitation-query.ts";
import { buildInvitationUrl } from "../src/lib/invitation-links.ts";

test("admin invitation search covers recipient and private admin fields", () => {
  const where = buildAdminInvitationWhere("  Gia đình Minh  ", "all");
  const serialized = JSON.stringify(where);
  for (const field of [
    "recipientText",
    "token",
    "privateMessage",
    "label",
    "adminNotes",
  ]) {
    assert.match(serialized, new RegExp(field));
  }
  assert.match(serialized, /Gia đình Minh/);
});

test("admin invitation filters represent RSVP and active states", () => {
  assert.match(
    JSON.stringify(buildAdminInvitationWhere("", "attending")),
    /"attending":true/,
  );
  assert.match(
    JSON.stringify(buildAdminInvitationWhere("", "pending")),
    /"rsvp":\{"is":null\}/,
  );
  assert.match(
    JSON.stringify(buildAdminInvitationWhere("", "inactive")),
    /"isActive":false/,
  );
});

test("admin invitation sort and link builder are deterministic", () => {
  assert.deepEqual(buildAdminInvitationOrder("name-asc"), [
    { recipientText: "asc" },
  ]);
  assert.equal(
    buildInvitationUrl("https://wedding.example/", "abc_123"),
    "https://wedding.example/thiep/abc_123",
  );
});
