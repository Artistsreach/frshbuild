"use server";

import { builderAgent } from "@/mastra/agents/builder";

export async function createSupabaseProject(input: {
  accessToken: string;
  organizationSlug: string;
  projectName: string;
  dbPassword: string;
  region: string;
}) {
  const { threadId } = await builderAgent.createThread();
  const result = await builderAgent.tool(threadId, "createSupabaseProject", {
    accessToken: input.accessToken,
    organizationSlug: input.organizationSlug,
    projectName: input.projectName,
    dbPassword: input.dbPassword,
    region: input.region,
  });

  if (result.status === "error") {
    throw new Error(result.error);
  }

  return result.output;
}
