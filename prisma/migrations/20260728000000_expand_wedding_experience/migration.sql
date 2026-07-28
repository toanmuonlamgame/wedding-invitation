ALTER TABLE "WeddingContent" ADD COLUMN "experienceJson" JSONB;

ALTER TABLE "Invitation"
ADD COLUMN "invitationSide" TEXT NOT NULL DEFAULT 'unspecified';

ALTER TABLE "Rsvp"
ADD COLUMN "guestName" TEXT,
ADD COLUMN "invitationSide" TEXT;
