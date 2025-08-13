import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const supabaseApiBaseUrl = 'https://api.supabase.com/v1';

const createSupabaseProjectInputSchema = z.object({
  accessToken: z.string().describe("The user's Supabase personal access token."),
  projectName: z.string().describe("The name for the new Supabase project."),
  organizationId: z.string().describe("The user's Supabase organization ID."),
  dbPass: z.string().describe("A strong password for the new database."),
  region: z.string().describe("The region for the new project (e.g., 'us-east-1')."),
});

export const createSupabaseProjectTool = createTool({
  id: 'create_supabase_project',
  description: 'Creates a new Supabase project on behalf of the user.',
  inputSchema: createSupabaseProjectInputSchema,
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const { accessToken, projectName, organizationId, dbPass, region } = context;
    const response = await fetch(`${supabaseApiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        organization_id: organizationId,
        db_pass: dbPass,
        region: region
      })
    });
    return response.json();
  }
});

const initiateSupabaseOAuthInputSchema = z.object({
  clientId: z.string().describe("The OAuth app's client ID."),
  redirectUri: z.string().describe("The redirect URI for the OAuth flow."),
});

export const initiateSupabaseOAuthTool = createTool({
  id: 'initiate_supabase_oauth',
  description: 'Initiates the Supabase OAuth flow to authorize the app builder.',
  inputSchema: initiateSupabaseOAuthInputSchema,
  outputSchema: z.object({
    authorizationUrl: z.string(),
  }),
  execute: async ({ context }) => {
    const { clientId, redirectUri } = context;
    const authorizationUrl = `${supabaseApiBaseUrl}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    return { authorizationUrl };
  }
});

const exchangeCodeForTokenInputSchema = z.object({
  clientId: z.string().describe("The OAuth app's client ID."),
  clientSecret: z.string().describe("The OAuth app's client secret."),
  code: z.string().describe("The authorization code received from Supabase."),
  redirectUri: z.string().describe("The redirect URI for the OAuth flow."),
});

export const exchangeCodeForTokenTool = createTool({
  id: 'exchange_code_for_token',
  description: 'Exchanges an authorization code for an access token.',
  inputSchema: exchangeCodeForTokenInputSchema,
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const { clientId, clientSecret, code, redirectUri } = context;
    const response = await fetch(`${supabaseApiBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      })
    });
    return response.json();
  }
});
