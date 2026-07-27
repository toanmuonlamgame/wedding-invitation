ALTER TABLE "Invitation"
ADD COLUMN "label" TEXT,
ADD COLUMN "adminNotes" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "disabledAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Invitation_isActive_createdAt_idx"
ON "Invitation"("isActive", "createdAt");

CREATE INDEX "Invitation_recipientText_idx"
ON "Invitation"("recipientText");

UPDATE "WeddingContent"
SET
  "themePreset" = CASE "themePreset"
    WHEN 'light-elegant' THEN 'ivory-sage'
    WHEN 'dark-elegant' THEN 'forest-noir'
    WHEN 'blush-romantic' THEN 'blush-romance'
    WHEN 'navy-classic' THEN 'midnight-navy'
    WHEN 'natural-olive' THEN 'ivory-sage'
    ELSE "themePreset"
  END,
  "fontPreset" = CASE "fontPreset"
    WHEN 'elegant' THEN 'elegant-editorial'
    WHEN 'modern' THEN 'modern-clean'
    WHEN 'romantic' THEN 'romantic-script'
    WHEN 'classic' THEN 'classic-wedding'
    ELSE "fontPreset"
  END;

ALTER TABLE "WeddingContent"
ALTER COLUMN "themePreset" SET DEFAULT 'ivory-sage',
ALTER COLUMN "fontPreset" SET DEFAULT 'elegant-editorial';
