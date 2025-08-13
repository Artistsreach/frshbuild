import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { provisionSupabaseStorage } from '../../lib/provisioning';

export const addDatabaseTool = createTool({
  id: 'addDatabaseToApp',
  description: 'Provisions a new, secure Supabase Storage database (bucket) for a user\'s application. Use this when a user explicitly asks to add data storage, a database, or file upload capabilities to their app. This tool creates a private storage area and configures security rules so that the specified user has exclusive control over their own files, while also allowing for a designated public folder.',
  inputSchema: z.object({
    userId: z.string().uuid().describe("The unique identifier (UUID) of the user who owns the application. This is essential for setting up correct security policies."),
    appName: z.string().describe("A short, URL-friendly name for the application (e.g., 'photo-app', 'blog'). This will be used to create a unique name for the database."),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    bucketName: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return provisionSupabaseStorage(context);
  }
});
