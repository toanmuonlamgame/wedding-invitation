# Project context

This repository contains a single family wedding invitation for approximately 50–100 guests.

## Couple

- Bride: Vũ Bình
- Groom: Thành Long
- Display name: Vũ Bình & Thành Long

## Product flow

The main page is the complete wedding invitation. Near the end, the family enters guest details. A later release will create a personalized `/thiep/[token]` link that opens a read-only invitation.

## Technology

- Current: Next.js, TypeScript, Tailwind CSS, App Router
- Planned later: Prisma, Supabase PostgreSQL, Vercel

## Product principles

- Mobile-first, fast loading, high-quality local imagery, and restrained animation
- No accounts, payments, multiple invitation templates, or complex dashboard
- No database, API, personalized route, or deployment in Commit 2

## Agent constraints

- Do not commit or push Git.
- Do not create or modify `.env`.
- Do not run migrations.
- Do not install packages outside the allowed list; Commit 2 permits only `gsap`.
- Always report Summary, Files changed, Validation results, Manual step required, and Known limitations.
