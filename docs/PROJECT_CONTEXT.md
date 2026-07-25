# Project context

This repository contains a single family wedding invitation for approximately 50–100 guests.

## Couple

- Bride: Vũ Bình
- Groom: Thành Long
- Display name: Vũ Bình & Thành Long

## Product flow

The main page is the complete wedding invitation. Near the end, the family enters guest details and a server-only creator secret. A successful request stores the guest invitation and returns a personalized `/thiep/[token]` link. That route renders the complete invitation as a read-only guest experience without the creator form.

## Technology

- Application: Next.js App Router, React, TypeScript, Tailwind CSS
- Motion: GSAP plus lightweight CSS effects
- Validation: Zod on the server with matching fast feedback in the client
- Persistence: Prisma ORM with Supabase PostgreSQL
- Target hosting: Vercel

## Product principles

- Mobile-first, fast loading, high-quality imagery, accessible controls, and restrained animation
- No accounts, payments, multiple invitation templates, or complex dashboard
- No RSVP, invitation editing/deleting, analytics, or public guest list in Commit 3

## Delivery status

- Commit 1: completed static wedding invitation.
- Commit 2: added GSAP, full-screen cover, music controls, and mobile polish.
- Commit 3: adds database persistence, personalized invitation links, advanced visual effects, and production readiness.

## Commit 3 architecture

- `app/page.tsx` renders the complete sample invitation and creator form.
- `app/api/invitations/route.ts` is the only write endpoint.
- `app/thiep/[token]/page.tsx` reads one invitation directly through Prisma in a dynamic Server Component.
- A shared invitation composition keeps the sample and guest pages visually consistent.
- `src/lib/invitations.ts` owns request validation, token format, and safe token generation.
- `src/lib/prisma.ts` owns the development-safe Prisma singleton.
- Wedding facts and deliberate placeholders remain centralized in `src/lib/wedding-data.ts`.

## Agent constraints

- Do not commit or push Git.
- Do not create or modify `.env`.
- Do not run migrations, `prisma db push`, Prisma Studio, seeds, or database resets.
- Do not deploy or operate Supabase/Vercel.
- Only install the packages explicitly allowed for Commit 3.
- Migration, environment setup, deploy, commit, and push are manual steps required from the user.
- Always report Summary, Files changed, Validation results, Manual step required, and Known limitations.
