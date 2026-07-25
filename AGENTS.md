<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Wedding invitation project

- Build one private family wedding invitation for 50–100 guests, not a SaaS product.
- The couple is **Vũ Bình & Thành Long**. Do not introduce substitute names.
- Product flow: main invitation → enter guest details → create a personalized link → read-only invitation page.
- `/` is also a lightweight family admin for shared wedding content; `/thiep/[token]` must never render admin controls.
- Current stack: Next.js App Router, TypeScript, Tailwind CSS, GSAP, Prisma, PostgreSQL, and Zod.
- Target hosting: Supabase PostgreSQL and Vercel.
- Prioritize mobile-first layout, fast loading, beautiful local imagery, accessible interactions, and restrained animation.
- Do not build accounts, payments, RSVP, multiple templates, or a complex dashboard.

## Delivery phases

- Commit 1: completed static wedding invitation.
- Commit 2: GSAP, full-screen cover, music controls, and mobile polish.
- Commit 3: database persistence, personalized invitation links, advanced effects, and production readiness.

## Commit 3 boundaries

- Production packages allowed: `@prisma/client`, `zod`.
- Development package allowed: `prisma`.
- Use Node.js `crypto` for invitation tokens.
- Keep Prisma and creator-secret access server-only.
- Store shared countdown, venues, story, and gallery metadata in the singleton `WeddingContent` record with id `main`.
- Invitation records only contain recipient personalization and always read the latest shared wedding content.
- Do not expose a public invitation list, edit endpoint, or delete endpoint.

## Manual steps required

- The user must create and configure `.env` values.
- The user must create the Supabase project and run Prisma migrations.
- The user must configure and perform the Vercel deployment.
- The user must commit and push Git changes.
- Agents must not perform any of those manual steps.

## Agent constraints

- Do not commit or push Git.
- Do not create or modify `.env`.
- Do not run migrations, `prisma db push`, Prisma Studio, seeds, or database resets.
- Do not deploy or operate Supabase/Vercel.
- Do not install packages outside the explicitly allowed list.
- Always report: Summary, Files changed, Validation results, Manual step required, and Known limitations.
