import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { apps } from './apps';
import { users } from './users';

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

export const deployments = pgTable('deployments', {
  id: uuid('id').defaultRandom().primaryKey(),
  appId: uuid('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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

export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
