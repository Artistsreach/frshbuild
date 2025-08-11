DO $$ BEGIN
    ALTER TABLE "apps" ADD COLUMN "is_recreatable" boolean DEFAULT false NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
