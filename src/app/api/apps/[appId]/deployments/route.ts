import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { and, eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { appsTable, deploymentsTable, appUsers } from '@/db/schema';

// Re-export types from schema for easier access
type Deployment = typeof deploymentsTable.$inferSelect;
type NewDeployment = typeof deploymentsTable.$inferInsert;

// Define types for better type safety
type DeploymentStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'canceled';
type DeploymentType = 'build' | 'submit';
type Platform = 'android' | 'ios' | 'all';
type BuildProfile = 'development' | 'preview' | 'production';
type Track = 'production' | 'beta' | 'alpha' | 'internal';

// Using Deployment inferred type from schema; no custom interface needed

// Use the imported tables from schema
const deployments = deploymentsTable;
const apps = appsTable;

// Helper type for SQL query building
type SQL = ReturnType<typeof sql>;

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
    // Get user ID from headers (simplified for example)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
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

    // Verify the app exists
    const appResult = await db.query.appsTable.findFirst({
      where: (apps, { eq }) => eq(apps.id, appId)
    });

    if (!appResult) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Verify the user has access to the app via appUsers membership
    const membership = await db.query.appUsers.findFirst({
      where: (au, { and, eq }) => and(eq(au.appId, appId), eq(au.userId, userId))
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Build where conditions using Drizzle's query builder
    const whereConditions = [
      eq(deployments.appId, appId)
    ];
    
    if (status) {
      whereConditions.push(eq(deployments.status, status));
    }
    if (type) {
      whereConditions.push(eq(deployments.type, type));
    }
    if (platform && platform !== 'all') {
      whereConditions.push(eq(deployments.platform, platform));
    }

    // Get deployments with pagination and filters
    const deploymentList = await db
      .select()
      .from(deploymentsTable)
      .where(and(...whereConditions))
      .orderBy(desc(deployments.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(deploymentsTable)
      .where(and(...whereConditions));

    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      data: deploymentList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + deploymentList.length < total,
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
    type: DeploymentType;
    platform: Platform;
    buildProfile?: BuildProfile;
    track?: Track;
    metadata?: Record<string, any>;
  }
): Promise<Deployment> {
  try {
    const deploymentId = crypto.randomUUID();
    const now = new Date();
    const metadata = data.metadata || {};
    
    if (data.buildProfile) {
      metadata.buildProfile = data.buildProfile;
    }
    if (data.track) {
      metadata.track = data.track;
    }
    
    // Create the deployment record
    const newDeployment: NewDeployment = {
      id: deploymentId,
      appId,
      userId,
      type: data.type,
      platform: data.platform,
      status: 'queued',
      buildProfile: data.buildProfile,
      track: data.track,
      metadata,
      startedAt: now,
      completedAt: null,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
      buildId: null,
      submissionId: null,
      buildUrl: null,
      logs: null,
      versionCode: null,
      versionName: null,
    };

    const [deployment] = await db
      .insert(deploymentsTable)
      .values(newDeployment)
      .returning();

    if (!deployment) {
      throw new Error('Failed to create deployment record');
    }

    return deployment as unknown as Deployment;
  } catch (error) {
    console.error('Error creating deployment record:', error);
    throw new Error(`Failed to create deployment record: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Update a deployment record (used by webhooks)
export async function updateDeploymentRecord(
  deploymentId: string,
  updates: {
    status?: DeploymentStatus;
    buildId?: string;
    submissionId?: string;
    buildUrl?: string;
    logs?: string;
    versionCode?: number;
    versionName?: string;
    metadata?: Record<string, any>;
  }
): Promise<Deployment> {
  try {
    const now = new Date();
    const updateData: Record<string, any> = {
      updatedAt: now
    };
    
    // Add fields to update if they exist in updates
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.buildId !== undefined) updateData.buildId = updates.buildId;
    if (updates.submissionId !== undefined) updateData.submissionId = updates.submissionId;
    if (updates.buildUrl !== undefined) updateData.buildUrl = updates.buildUrl;
    if (updates.logs !== undefined) updateData.logs = updates.logs;
    if (updates.versionCode !== undefined) updateData.versionCode = updates.versionCode;
    if (updates.versionName !== undefined) updateData.versionName = updates.versionName;
    
    // Handle metadata merge if needed
    if (updates.metadata) {
      // First get the current metadata
      const result = await db.query.deploymentsTable.findFirst({
        columns: { metadata: true },
        where: eq(deploymentsTable.id, deploymentId)
      });
      
      const currentMetadata = result?.metadata || {};
      updateData.metadata = { ...currentMetadata, ...updates.metadata };
    }
    
    // Add completed_at if status is terminal
    if (updates.status === 'completed' || updates.status === 'failed' || updates.status === 'canceled') {
      updateData.completedAt = now;
    }
    
    // Update the deployment
    const [updatedDeployment] = await db
      .update(deploymentsTable)
      .set(updateData)
      .where(eq(deploymentsTable.id, deploymentId))
      .returning();
    
    if (!updatedDeployment) {
      throw new Error('Deployment not found after update');
    }
    
    return updatedDeployment as unknown as Deployment;
  } catch (error) {
    console.error('Error updating deployment record:', error);
    throw new Error(`Failed to update deployment record: ${error instanceof Error ? error.message : String(error)}`);
  }
}
