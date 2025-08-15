CREATE TABLE IF NOT EXISTS "app_subscriptions" (
  "user_id" text NOT NULL,
  "app_id" uuid NOT NULL REFERENCES "apps"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Ensure one row per user/app
CREATE UNIQUE INDEX IF NOT EXISTS app_subscriptions_user_app_idx ON "app_subscriptions" ("user_id", "app_id");
