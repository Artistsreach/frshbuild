DO $$ BEGIN
    ALTER TABLE "app_users" ADD COLUMN "credits" integer DEFAULT 100 NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
