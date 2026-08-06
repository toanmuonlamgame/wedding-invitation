import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeGoogleSheetsDeletePayload,
  normalizeGoogleSheetsPayload,
  postInvitationDeletionToGoogleSheets,
  postInvitationToGoogleSheets,
} from "../src/lib/google-sheets-sync-core.ts";

const webAppUrl =
  "https://script.google.com/macros/s/example-deployment/exec";
const invitation = {
  id: "invitation-01",
  token: "token-01",
  recipientText: " Anh Tuấn và gia đình ",
  privateMessage: "Mong gia đình tới chung vui",
  adminNotes: null,
  guestCount: 2,
  invitationSide: "groom",
  language: "ko",
  createdAt: new Date("2026-08-06T07:00:00.000Z"),
};
const input = {
  invitation,
  invitationUrl: "https://wedding.example/thiep/token-01",
};

test("normalizes the Apps Script payload without inventing database fields", () => {
  const payload = normalizeGoogleSheetsPayload(input, "server-secret");
  assert.deepEqual(payload, {
    secret: "server-secret",
    action: "upsert",
    invitationId: "invitation-01",
    token: "token-01",
    recipientText: "Anh Tuấn và gia đình",
    companionText: "",
    guestCount: 2,
    invitationSide: "groom",
    language: "ko",
    invitationUrl: "https://wedding.example/thiep/token-01",
    createdAt: "2026-08-06T07:00:00.000Z",
    sent: false,
    rsvpStatus: "Chưa phản hồi",
    confirmedCount: 0,
    notes: "Mong gia đình tới chung vui",
  });
});

test("normalizes a deletion command without guest data", () => {
  assert.deepEqual(
    normalizeGoogleSheetsDeletePayload(
      { invitationId: " invitation-01 ", token: " token-01 " },
      "server-secret",
    ),
    {
      secret: "server-secret",
      action: "delete",
      invitationId: "invitation-01",
      token: "token-01",
    },
  );
});

test("returns skipped without making a request when configuration is missing", async () => {
  let called = false;
  const status = await postInvitationToGoogleSheets({
    input,
    fetchImpl: async () => {
      called = true;
      return new Response();
    },
  });
  assert.equal(status, "skipped");
  assert.equal(called, false);
});

test("requires both a successful HTTP response and JSON ok", async () => {
  const success = await postInvitationToGoogleSheets({
    input,
    webAppUrl,
    secret: "server-secret",
    fetchImpl: async () => Response.json({ ok: true }),
  });
  const rejected = await postInvitationToGoogleSheets({
    input,
    webAppUrl,
    secret: "server-secret",
    fetchImpl: async () => Response.json({ ok: false }),
  });
  const httpFailure = await postInvitationToGoogleSheets({
    input,
    webAppUrl,
    secret: "server-secret",
    fetchImpl: async () => Response.json({ ok: true }, { status: 500 }),
  });
  assert.equal(success, "success");
  assert.equal(rejected, "failed");
  assert.equal(httpFailure, "failed");
});

test("rejects an invalid or non-Apps-Script URL without a request", async () => {
  let called = false;
  const status = await postInvitationToGoogleSheets({
    input,
    webAppUrl: "https://example.com/not-an-apps-script-endpoint",
    secret: "server-secret",
    fetchImpl: async () => {
      called = true;
      return Response.json({ ok: true });
    },
  });
  assert.equal(status, "failed");
  assert.equal(called, false);
});

test("times out safely and does not retry", async () => {
  let calls = 0;
  const status = await postInvitationToGoogleSheets({
    input,
    webAppUrl,
    secret: "server-secret",
    timeoutMs: 5,
    fetchImpl: (_url, options) => {
      calls += 1;
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      });
    },
  });
  assert.equal(status, "failed");
  assert.equal(calls, 1);
});

test("RSVP resync keeps the same upsert identifiers", async () => {
  const bodies = [];
  const fetchImpl = async (_url, options) => {
    bodies.push(JSON.parse(String(options?.body)));
    return Response.json({ ok: true });
  };
  await postInvitationToGoogleSheets({
    input,
    webAppUrl,
    secret: "server-secret",
    fetchImpl,
  });
  await postInvitationToGoogleSheets({
    input: {
      ...input,
      rsvp: { attending: true, confirmedCount: 2, note: "Ăn chay" },
    },
    webAppUrl,
    secret: "server-secret",
    fetchImpl,
  });
  assert.equal(bodies.length, 2);
  assert.equal(bodies[0].invitationId, bodies[1].invitationId);
  assert.equal(bodies[0].token, bodies[1].token);
  assert.equal(bodies[1].rsvpStatus, "Tham dự");
  assert.equal(bodies[1].confirmedCount, 2);
  assert.equal(bodies[1].notes, "Ăn chay");
});

test("deletion posts one delete command and accepts JSON ok", async () => {
  const bodies = [];
  const status = await postInvitationDeletionToGoogleSheets({
    input: { invitationId: "invitation-01", token: "token-01" },
    webAppUrl,
    secret: "server-secret",
    fetchImpl: async (_url, options) => {
      bodies.push(JSON.parse(String(options?.body)));
      return Response.json({ ok: true });
    },
  });
  assert.equal(status, "success");
  assert.deepEqual(bodies, [
    {
      secret: "server-secret",
      action: "delete",
      invitationId: "invitation-01",
      token: "token-01",
    },
  ]);
});
