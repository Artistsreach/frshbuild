import {
  pgTable,
  text,
  timestamp,
  uuid,
  json,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

import type { UIMessage } from "ai";

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
  thumbnail: text("thumbnail"),
});

export const appPermissions = pgEnum("app_user_permission", [
  "read",
  "write",
  "admin",
]);

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
