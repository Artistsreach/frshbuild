import {
  pgTable,
  text,
  timestamp,
  uuid,
  json,
  jsonb,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

import type { UIMessage } from "ai";

// Deployment related enums
export const deploymentStatusEnum = pgEnum('deployment_status', [
  'queued',
  'in_progress',
  'completed',
  'failed',
  'canceled',
]);

export const deploymentTypeEnum = pgEnum('deployment_type', [
  'build',
  'submit',
]);

export const platformEnum = pgEnum('platform', [
  'android',
  'ios',
  'all',
]);

export const buildProfileEnum = pgEnum('build_profile', [
  'development',
  'preview',
  'production',
]);

export const trackEnum = pgEnum('track', [
  'production',
  'beta',
  'alpha',
  'internal',
]);

export const deploymentsTable = pgTable('deployments', {
  id: uuid('id').defaultRandom().primaryKey(),
  appId: uuid('app_id').notNull().references(() => appsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  type: deploymentTypeEnum('type').notNull(),
  status: deploymentStatusEnum('status').notNull().default('queued'),
  platform: platformEnum('platform').notNull(),
  buildProfile: buildProfileEnum('build_profile'),
  track: trackEnum('track'),
  buildId: text('build_id'),
  submissionId: text('submission_id'),
  buildUrl: text('build_url'),
  logs: text('logs'),
  metadata: jsonb('metadata').notNull().default({}),
  isPublic: boolean('is_public').notNull().default(false),
  versionCode: integer('version_code'),
  versionName: text('version_name'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const appsTable = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Unnamed App"),
  description: text("description").notNull().default("No description"),
  gitRepo: text("git_repo").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  baseId: text("base_id").notNull().default("nextjs-dkjfgdf"),
  previewDomain: text("preview_domain").unique(),
  is_public: boolean("is_public").notNull().default(false),
  is_recreatable: boolean("is_recreatable").notNull().default(false),
  requires_subscription: boolean("requires_subscription").notNull().default(false),
  stripeProductId: text("stripe_product_id"),
  stripePriceIds: json("stripe_price_ids").$type<string[]>(),
  stripeAccountId: text("stripe_account_id"),
  subscribedUsers: integer("subscribed_users").notNull().default(0),
  thumbnail: text("thumbnail"),
  expoProjectId: text("expo_project_id"),
  expoConfig: jsonb("expo_config").$type<{
    name?: string;
    slug?: string;
    version?: string;
    orientation?: string;
    icon?: string;
    splash?: {
      image?: string;
      resizeMode?: string;
      backgroundColor?: string;
    };
    updates?: {
      url?: string;
    };
    assetBundlePatterns?: string[];
    ios?: {
      supportsTablet?: boolean;
      bundleIdentifier?: string;
      buildNumber?: string;
    };
    android?: {
      package?: string;
      versionCode?: number;
      adaptiveIcon?: {
        foregroundImage?: string;
        backgroundColor?: string;
      };
    };
    web?: {
      favicon?: string;
    };
    extra?: {
      eas?: {
        projectId?: string;
      };
    };
  }>(),
});

export const appPermissions = pgEnum("app_user_permission", [
  "read",
  "write",
  "admin",
]);

export const appSubscriptions = pgTable("app_subscriptions", {
  userId: text("user_id").notNull(),
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appUsers = pgTable("app_users", {
  userId: text("user_id").notNull(),
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  permissions: appPermissions("permissions"),
  freestyleIdentity: text("freestyle_identity").notNull(),
  freestyleAccessToken: text("freestyle_access_token").notNull(),
  freestyleAccessTokenId: text("freestyle_access_token_id").notNull(),
  credits: integer("credits").notNull().default(0),
});

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id),
  message: json("message").notNull().$type<UIMessage>(),
});

export const appDeployments = pgTable("app_deployments", {
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deploymentId: text("deployment_id").notNull(),
  commit: text("commit").notNull(), // sha of the commit
});
