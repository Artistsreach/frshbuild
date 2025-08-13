import { supabaseAdmin } from './supabaseAdmin';

async function createBucketIfNotExists(bucketName: string): Promise<void> {
  const { data, error } = await supabaseAdmin.storage.getBucket(bucketName);

  if (error && error.message.includes('Not found')) {
    console.log(`Bucket ${bucketName} not found. Creating...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(
      bucketName,
      {
        public: false, // Enforce RLS for all access
      }
    );

    if (createError) {
      throw new Error(`Failed to create bucket ${bucketName}: ${createError.message}`);
    }
    console.log(`Bucket ${bucketName} created successfully.`);
  } else if (error) {
    // Handle other unexpected errors from getBucket
    throw new Error(`Error checking for bucket ${bucketName}: ${error.message}`);
  } else {
    console.log(`Bucket ${bucketName} already exists. Skipping creation.`);
  }
}

// This is the main handler function for the Mastra tool.
export async function provisionSupabaseStorage({ userId, appName }: { userId: string; appName: string }) {
  try {
    // 1. Generate a unique, deterministic bucket name.
    const sanitizedAppName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const bucketName = `app-${userId.substring(0, 8)}-${sanitizedAppName}`;

    // 2. Create the bucket if it doesn't exist.
    await createBucketIfNotExists(bucketName);

    // 3. Call the Postgres function to create the RLS policies.
    const { error: rpcError } = await supabaseAdmin.rpc('create_storage_policies_for_user', {
      bucket_name: bucketName,
      user_id_text: userId,
    });

    if (rpcError) {
      throw new Error(`Failed to apply RLS policies: ${rpcError.message}`);
    }

    console.log(`Successfully provisioned storage for user ${userId} and app ${appName}.`);

    // 4. Return a success response for the agent.
    return {
      success: true,
      bucketName: bucketName,
      message: `Successfully created and secured storage bucket named '${bucketName}'.`,
    };
  } catch (error: any) {
    console.error("Error in provisionSupabaseStorage:", error);
    return {
      success: false,
      bucketName: '',
      message: `An error occurred during provisioning: ${error.message}`,
    };
  }
}
