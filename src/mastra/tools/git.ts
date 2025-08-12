import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import simpleGit from "simple-git";

// Define a custom context type that includes the optional writer for streaming.
type StreamingToolExecutionContext<T extends z.ZodSchema | undefined> = ToolExecutionContext<T> & {
  writer?: {
    write: (chunk: any) => void;
  };
};

const cloneRepoInputSchema = z.object({
  repoId: z.string().describe("The ID of the Freestyle.sh Git repository."),
  accessToken: z.string().describe("The Freestyle.sh access token for authentication."),
});

export const cloneRepoTool = createTool({
  id: "clone_freestyle_repo",
  description: "Clones a Freestyle.sh Git repository to a temporary local directory.",
  inputSchema: cloneRepoInputSchema,
  outputSchema: z.object({
    localPath: z.string().describe("The local filesystem path where the repository was cloned."),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof cloneRepoInputSchema>;
    const { repoId, accessToken } = context;
    const repoUrl = `https://oauth2:${accessToken}@git.freestyle.sh/${repoId}`;
    
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Cloning repository ${repoId}...` });
    }
    
    // Create a unique temporary directory for the clone
    const tempDir = await fs.mkdtemp(path.join("/tmp", "repo-"));

    try {
      const git = simpleGit();
      await git.clone(repoUrl, tempDir);
      
      console.log(`Repository ${repoId} cloned to ${tempDir}`);
      if (writer) {
        writer.write({ type: 'notification', status: 'success', message: `Repository ${repoId} cloned successfully.` });
      }
      return { localPath: tempDir };
    } catch (error: any) {
      console.error(`Failed to clone repository ${repoId}:`, error);
      if (writer) {
        writer.write({ type: 'notification', status: 'error', message: `Failed to clone repository: ${error.message}` });
      }
      // Cleanup the directory on failure
      await fs.rm(tempDir, { recursive: true, force: true });
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  },
});
