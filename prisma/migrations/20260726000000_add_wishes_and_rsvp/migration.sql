-- CreateTable
CREATE TABLE "WeddingWish" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT,
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingWish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "confirmedCount" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeddingWish_isVisible_createdAt_idx" ON "WeddingWish"("isVisible", "createdAt");

-- CreateIndex
CREATE INDEX "WeddingWish_invitationId_idx" ON "WeddingWish"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_invitationId_key" ON "Rsvp"("invitationId");

-- AddForeignKey
ALTER TABLE "WeddingWish" ADD CONSTRAINT "WeddingWish_invitationId_fkey"
FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_invitationId_fkey"
FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
