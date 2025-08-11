-- Add thumbnail column to apps table (idempotent)
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "thumbnail" text;


