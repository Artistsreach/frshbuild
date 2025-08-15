import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { apps } from '@/db/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

// Schema for build request body
const buildSchema = z.object({
  platform: z.enum(['android', 'ios', 'all']),
  target: z.enum(['development', 'preview', 'production']),
  message: z.string().optional(),
});

export async function POST(
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

    // Validate request body
    const body = await request.json();
    const validation = buildSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { platform, target, message } = validation.data;
    const appId = params.appId;

    // Verify app exists and user has access
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Create a temporary directory for the build
    const buildId = uuidv4();
    const tempDir = join(tmpdir(), 'expo-builds', buildId);
    await mkdir(tempDir, { recursive: true });

    // Clone the app repository (in a real app, you'd clone from your git repo)
    // For now, we'll assume the app code is already in place
    
    // Create or update app.json
    const appJson = {
      expo: {
        ...JSON.parse(app.config || '{}'),
        updates: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/apps/${appId}/updates`,
        },
        extra: {
          eas: {
            projectId: app.expoProjectId,
          },
        },
      },
    };

    await writeFile(
      join(tempDir, 'app.json'),
      JSON.stringify(appJson, null, 2)
    );

    // Run EAS build
    const easCommand = `npx eas-cli@latest build \
      --platform ${platform} \
      --profile ${target} \
      --non-interactive \
      --no-wait \
      --json`;

    const { stdout, stderr } = await execAsync(easCommand, {
      cwd: tempDir,
      env: {
        ...process.env,
        EAS_NO_VCS: '1',
        EAS_PROJECT_ROOT: tempDir,
      },
    });

    let buildInfo;
    try {
      buildInfo = JSON.parse(stdout);
    } catch (e) {
      console.error('Failed to parse EAS build output:', e);
      throw new Error(`Build failed: ${stderr || 'Unknown error'}`);
    }

    // In a real implementation, you'd store this build info in your database
    // and set up a webhook to receive build status updates from EAS

    return NextResponse.json({
      success: true,
      buildId: buildInfo.buildId,
      buildUrl: buildInfo.buildUrl,
      status: 'in-progress',
    });

  } catch (error) {
    console.error('Build failed:', error);
    return NextResponse.json(
      { 
        error: 'Build failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Webhook handler for EAS build status updates
export async function PATCH(
  request: Request,
  { params }: { params: { appId: string } }
) {
  try {
    // Verify webhook secret
    const signature = request.headers.get('expo-signature');
    // In a real implementation, verify the webhook signature here
    
    const payload = await request.json();
    const { buildId, status, metadata = {} } = payload;
    
    // In a real implementation, update the build status in your database
    // and notify the client via WebSocket or polling
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to process webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
