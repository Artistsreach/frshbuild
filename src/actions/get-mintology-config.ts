"use server";

export async function getMintologyConfig() {
  const projectId = process.env.MINTOLOGY_PROJECT_ID || "";
  const baseUrl = process.env.MINTOLOGY_BASE_URL || "https://api.mintology.app/v1";
  return { projectId, baseUrl, hasProjectId: Boolean(projectId) };
}
