# Project context

This repository contains a single family wedding invitation for approximately 50–100 guests.

## Couple

- Bride: Vũ Bình
- Groom: Thành Long
- Display name: Vũ Bình & Thành Long

## Product flow

The main page is the public wedding invitation, shows visible wedding wishes, and contains the invitation creator near the end. The separate `/admin` route unlocks with the server-only creator secret and contains shared-content editors, wish moderation, RSVP reporting, and a preview. A successful invitation request stores only guest personalization and returns a `/thiep/[token]` link. That route always reads the latest shared content, lets that invitation submit a wish and update its own RSVP, and never renders creator or admin controls.

## Technology

- Application: Next.js App Router, React, TypeScript, Tailwind CSS
- Motion: GSAP plus lightweight CSS effects
- Validation: Zod on the server with matching fast feedback in the client
- Persistence: Prisma ORM with Supabase PostgreSQL
- Target hosting: Vercel

## Product principles

- Mobile-first, fast loading, high-quality imagery, accessible controls, and restrained animation
- No accounts, payments, multiple invitation templates, or complex dashboard
- No invitation editing/deleting, analytics, or public guest/RSVP list

## Delivery status

- Commit 1: completed static wedding invitation.
- Commit 2: added GSAP, full-screen cover, music controls, and mobile polish.
- Commit 3: adds database persistence, personalized invitation links, advanced visual effects, and production readiness.
- Commit 4: adds public wishes, per-invitation RSVP, admin moderation/reporting, and field-level admin validation.
- Admin media: uploads album, story, and venue images to the public `wedding-media` Supabase Storage bucket through server-only APIs.

## Admin media architecture

- `POST /api/admin/media/upload` accepts one JPEG, PNG, or WebP file up to 10 MB plus a category and creator secret.
- `DELETE /api/admin/media` deletes only confirmed paths under `album/`, `story/`, or `venues/`.
- The service-role key is read only by server modules and never sent to the browser.
- Storage metadata stays inside the existing `WeddingContent` JSON, so no additional Prisma model or migration is required.
- Legacy `/images/...` sources remain valid; new images use the configured Supabase project's public HTTPS URLs.

## Commit 4 architecture

- `WeddingWish` optionally belongs to an invitation; only visible wishes are returned publicly.
- `Rsvp` belongs to exactly one invitation and is updated by upsert through that invitation token.
- `/thiep/[token]` may submit a wish and read/update only its own RSVP.
- `/admin` uses the existing server-side creator secret to moderate wishes and read the full RSVP summary.
- Validation APIs return dot-path `fieldErrors`; admin inputs map those errors inline and keep the draft intact.
- `prisma/migrations/20260726000000_add_wishes_and_rsvp/migration.sql` is source-only and must be applied manually.

## Commit 3 architecture

- `app/page.tsx` renders the complete public sample invitation and invitation creator without shared-content admin controls.
- `app/admin/page.tsx` renders the protected shared-content workspace without the invitation creator.
- `app/api/invitations/route.ts` is the only write endpoint.
- `app/api/wedding-content/route.ts` publicly reads shared content and requires the creator secret for verification or updates.
- `app/thiep/[token]/page.tsx` reads one invitation directly through Prisma in a dynamic Server Component.
- A shared invitation composition keeps the sample and guest pages visually consistent.
- `src/lib/invitations.ts` owns request validation, token format, and safe token generation.
- `src/lib/prisma.ts` owns the development-safe Prisma singleton.
- `src/lib/wedding-content.ts` validates and maps the singleton `WeddingContent` record.
- Wedding facts and deliberate database fallbacks remain centralized in `src/lib/wedding-data.ts`.
- `prisma/migrations/20260725000000_add_wedding_content/migration.sql` is source-only; the user must apply it manually.

## Agent constraints

- Do not commit or push Git.
- Do not create or modify `.env`.
- Do not run migrations, `prisma db push`, Prisma Studio, seeds, or database resets.
- Do not deploy or operate Supabase/Vercel.
- Only install the packages explicitly allowed for Commit 3.
- Migration, environment setup, deploy, commit, and push are manual steps required from the user.
- Always report Summary, Files changed, Validation results, Manual step required, and Known limitations.
