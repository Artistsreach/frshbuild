import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const supabaseApiBaseUrl = 'https://api.supabase.com/v1';

const createProjectInputSchema = z.object({
    accessToken: z.string().describe("The user's Supabase access token."),
    organizationSlug: z.string().describe("The unique slug of the Supabase organization."),
    projectName: z.string().describe("The name for the new project."),
    dbPassword: z.string().min(8).describe("A strong password for the new database."),
    region: z.string().describe("The cloud provider region for the project, e.g., 'us-east-1'.")
});

const createProjectOutputSchema = z.object({
    projectId: z.string(),
    projectRef: z.string(),
    projectUrl: z.string()
});

export const createProjectTool = createTool({
    id: 'create-supabase-project',
    description: 'Creates a new Supabase project within a specified organization.',
    inputSchema: createProjectInputSchema,
    outputSchema: createProjectOutputSchema,

    execute: async (executionContext) => {
        const { organizationSlug, projectName, dbPassword, region, accessToken } = executionContext.context;

        const response = await fetch(`${supabaseApiBaseUrl}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                organization_id: organizationSlug,
                name: projectName,
                db_pass: dbPassword,
                region: region,
                plan: 'free'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Supabase API Error (${response.status}): ${errorData.message || 'Failed to create project.'}`);
        }

        const projectData = await response.json();
        
        return {
            projectId: projectData.id,
            projectRef: projectData.ref,
            projectUrl: `https://app.supabase.com/project/${projectData.ref}`
        };
    }
});

const listProjectsInputSchema = z.object({
    accessToken: z.string().describe("The user's Supabase access token."),
    organizationSlug: z.string().describe("The organization's slug.")
});

const listProjectsOutputSchema = z.array(z.object({
    id: z.string(),
    ref: z.string(),
    name: z.string(),
    region: z.string(),
    status: z.string()
}));

export const listProjectsTool = createTool({
    id: 'list-supabase-projects',
    description: "Lists all Supabase projects within a given organization.",
    inputSchema: listProjectsInputSchema,
    outputSchema: listProjectsOutputSchema,
    execute: async (executionContext) => {
        const { organizationSlug, accessToken } = executionContext.context;

        const response = await fetch(`${supabaseApiBaseUrl}/organizations/${organizationSlug}/projects`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Supabase API Error (${response.status}): ${errorData.message || 'Failed to list projects.'}`);
        }

        return response.json();
    }
});

const getProjectKeysInputSchema = z.object({
    accessToken: z.string().describe("The user's Supabase access token."),
    projectRef: z.string().describe("The project's reference ID (projectRef).")
});

const getProjectKeysOutputSchema = z.object({
    anonKey: z.string(),
    serviceRoleKey: z.string(),
    apiUrl: z.string()
});

export const getProjectKeysTool = createTool({
    id: 'get-supabase-project-keys',
    description: "Retrieves the API keys for a specific Supabase project.",
    inputSchema: getProjectKeysInputSchema,
    outputSchema: getProjectKeysOutputSchema,
    execute: async (executionContext) => {
        const { projectRef, accessToken } = executionContext.context;

        // This is a placeholder for where you would get the project keys.
        // The management API does not directly expose a method to get the anon and service_role keys.
        // This would typically be done by querying the project's database or another API endpoint.
        // For the purpose of this example, we will return dummy data.
        
        // In a real implementation, you would need to find the correct endpoint or method to retrieve these keys.
        // One possible approach is to use the project's API URL (e.g., `https://${projectRef}.supabase.co`)
        // and the access token to make a request to an endpoint that returns the keys.
        
        console.log(`Retrieving keys for project ${projectRef} with token ${accessToken}`);

        return {
            anonKey: "dummy-anon-key",
            serviceRoleKey: "dummy-service-role-key",
            apiUrl: `https://${projectRef}.supabase.co`
        };
    }
});
