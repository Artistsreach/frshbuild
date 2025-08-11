DO $$ BEGIN
    ALTER TABLE "apps" ADD COLUMN "stripe_account_id" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
