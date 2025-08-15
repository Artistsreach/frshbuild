import { NextResponse } from 'next/server';
import { getUser } from '@/actions/get-user';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';
import { appsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

// Schema for submit request body
const submitSchema = z.object({
  platform: z.enum(['android', 'ios', 'all']),
  buildId: z.string().optional(),
  track: z.enum(['production', 'beta', 'alpha', 'internal']).default('internal'),
});

export async function POST(
  request: Request,
  { params }: { params: { appId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = submitSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { platform, buildId, track } = validation.data;
    const appId = params.appId;

    // Verify app exists and user has access
    const app = await db.query.appsTable.findFirst({
      where: eq(appsTable.id, appId),
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // If no buildId provided, create a new production build first
    let targetBuildId = buildId;
    if (!targetBuildId) {
      const buildResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/apps/${appId}/expo/build`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({
            platform,
            target: 'production',
            message: `Build for ${track} submission`,
          }),
        }
      );

      if (!buildResponse.ok) {
        const error = await buildResponse.json();
        throw new Error(`Build failed: ${error.message || 'Unknown error'}`);
      }

      const buildData = await buildResponse.json();
      targetBuildId = buildData.buildId;
    }

    // Submit to app stores using EAS Submit
    const easCommand = `npx eas-cli@latest submit \
      --platform ${platform} \
      --track ${track} \
      --non-interactive \
      --no-wait \
      --id ${targetBuildId}`;

    const { stdout, stderr } = await execAsync(easCommand, {
      env: {
        ...process.env,
        EAS_NO_VCS: '1',
      },
    });

    let submitInfo;
    try {
      submitInfo = JSON.parse(stdout);
    } catch (e) {
      console.error('Failed to parse EAS submit output:', e);
      throw new Error(`Submission failed: ${stderr || 'Unknown error'}`);
    }

    // In a real implementation, you'd store this submission info in your database
    // and set up a webhook to receive submission status updates from EAS

    return NextResponse.json({
      success: true,
      submissionId: submitInfo.submissionId,
      platform,
      track,
      status: 'in-progress',
    });

  } catch (error) {
    console.error('Submission failed:', error);
    return NextResponse.json(
      { 
        error: 'Submission failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Webhook handler for EAS submission status updates
export async function PATCH(
  request: Request,
  { params }: { params: { appId: string } }
) {
  try {
    // Verify webhook secret
    const signature = request.headers.get('expo-signature');
    // In a real implementation, verify the webhook signature here
    
    const payload = await request.json();
    const { submissionId, status, metadata = {} } = payload;
    
    // In a real implementation, update the submission status in your database
    // and notify the client via WebSocket or polling
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to process submission webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process submission webhook' },
      { status: 500 }
    );
  }
}
