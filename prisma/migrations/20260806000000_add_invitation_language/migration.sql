ALTER TABLE "Invitation"
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'vi';

CREATE INDEX "Invitation_language_createdAt_idx"
ON "Invitation"("language", "createdAt");
