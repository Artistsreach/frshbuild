DO $$ BEGIN
    CREATE TYPE "public"."app_user_permission" AS ENUM('read', 'write', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_deployments" (
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deployment_id" text NOT NULL,
	"commit" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_users" (
	"user_id" text NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"permissions" "app_user_permission",
	"freestyle_identity" text NOT NULL,
	"freestyle_access_token" text NOT NULL,
	"freestyle_access_token_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'Unnamed App' NOT NULL,
	"description" text DEFAULT 'No description' NOT NULL,
	"git_repo" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"base_id" text DEFAULT 'nextjs-dkjfgdf' NOT NULL,
	"preview_domain" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"stripe_product_id" text,
	"stripe_price_ids" json,
	CONSTRAINT "apps_preview_domain_unique" UNIQUE("preview_domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"app_id" uuid NOT NULL,
	"message" json NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "app_deployments" ADD CONSTRAINT "app_deployments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "app_users" ADD CONSTRAINT "app_users_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
