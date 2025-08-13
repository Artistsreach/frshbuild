import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/db';
import { deployments, apps } from '@/db/schema';
import { and, eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(['queued', 'in_progress', 'completed', 'failed', 'canceled']).optional(),
  type: z.enum(['build', 'submit']).optional(),
  platform: z.enum(['android', 'ios', 'all']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { appId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = querySchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      platform: searchParams.get('platform'),
    });

    if (!queryParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryParams.error.format() },
        { status: 400 }
      );
    }

    const { limit, offset, status, type, platform } = queryParams.data;
    const appId = params.appId;

    // Verify the user has access to the app
    const app = await db.query.apps.findFirst({
      where: and(
        eq(apps.id, appId),
        eq(apps.userId, userId) // Assuming there's a userId field in the apps table
      ),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found or access denied' },
        { status: 404 }
      );
    }

    // Build the query
    let query = db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.appId, appId),
          status ? eq(deployments.status, status) : undefined,
          type ? eq(deployments.type, type) : undefined,
          platform ? eq(deployments.platform, platform) : undefined
        )
      )
      .orderBy(desc(deployments.createdAt))
      .limit(limit)
      .offset(offset);

    // Execute the query
    const deploymentsList = await query;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(deployments)
      .where(
        and(
          eq(deployments.appId, appId),
          status ? eq(deployments.status, status) : undefined,
          type ? eq(deployments.type, type) : undefined,
          platform ? eq(deployments.platform, platform) : undefined
        )
      )
      .execute();

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      data: deploymentsList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + deploymentsList.length < total,
      },
    });

  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

// Create a new deployment record (used by the build/submit endpoints)
export async function createDeploymentRecord(
  appId: string,
  userId: string,
  data: {
    type: 'build' | 'submit';
    platform: 'android' | 'ios' | 'all';
    buildProfile?: 'development' | 'preview' | 'production';
    track?: 'production' | 'beta' | 'alpha' | 'internal';
    metadata?: Record<string, any>;
  }
) {
  const [deployment] = await db
    .insert(deployments)
    .values({
      appId,
      userId,
      type: data.type,
      platform: data.platform,
      buildProfile: data.buildProfile || null,
      track: data.track || null,
      status: 'queued', // Default status
      metadata: data.metadata || {},
    })
    .returning();

  return deployment;
}

// Update a deployment record (used by webhooks)
export async function updateDeploymentRecord(
  deploymentId: string,
  updates: {
    status?: 'queued' | 'in_progress' | 'completed' | 'failed' | 'canceled';
    buildId?: string;
    submissionId?: string;
    buildUrl?: string;
    logs?: string;
    versionCode?: number;
    versionName?: string;
    metadata?: Record<string, any>;
  }
) {
  const [deployment] = await db
    .update(deployments)
    .set({
      ...updates,
      ...(updates.status === 'completed' || updates.status === 'failed' || updates.status === 'canceled'
        ? { completedAt: new Date() }
        : {}),
      updatedAt: new Date(),
      metadata: updates.metadata ? updates.metadata : undefined,
    })
    .where(eq(deployments.id, deploymentId))
    .returning();

  return deployment;
}
