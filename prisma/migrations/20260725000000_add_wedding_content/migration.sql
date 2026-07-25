-- CreateTable
CREATE TABLE "WeddingContent" (
    "id" TEXT NOT NULL,
    "weddingDateTime" TIMESTAMP(3),
    "expiredCountdownMessage" TEXT,
    "venuesJson" JSONB NOT NULL,
    "storyChaptersJson" JSONB NOT NULL,
    "galleryImagesJson" JSONB NOT NULL,
    "albumIntervalMs" INTEGER NOT NULL DEFAULT 5000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingContent_pkey" PRIMARY KEY ("id")
);
