import { SYSTEM_MESSAGE } from "@/lib/system";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { scrapeTool, extractTool, checkExtractStatusTool, crawlTool, checkCrawlStatusTool, searchTool, mapTool } from "../tools/firecrawl";
import { easLoginTool, easBuildTool, easSubmitTool } from "../tools/expo";
import { cloneRepoTool } from "../tools/git";
import { createProjectTool } from "../tools/supabase";
import { Memory } from "@mastra/memory";
import { TokenLimiter, ToolCallFilter } from "@mastra/memory/processors";
import { PostgresStore, PgVector } from "@mastra/pg";
import { z } from "zod";

const hasDb = process.env.MASTRA_ENABLE_DB === "true" && Boolean(process.env.DATABASE_URL);
const RECALL_TOPK = Number(process.env.MASTRA_RECALL_TOPK ?? "3");
const RECALL_RANGE = Number(process.env.MASTRA_RECALL_RANGE ?? "2");
const LAST_MESSAGES = Number(process.env.MASTRA_LAST_MESSAGES ?? "20");

function getDbBackends() {
  if (!hasDb) {
    // No DB configured: rely on Mastra's default non-persistent in-memory behavior
    return { vector: undefined as PgVector | undefined, storage: undefined as PostgresStore | undefined, semanticRecall: false as const };
  }
  try {
    const vector = new PgVector({ connectionString: process.env.DATABASE_URL! });
    const storage = new PostgresStore({ connectionString: process.env.DATABASE_URL! });
    return {
      vector,
      storage,
      semanticRecall: {
        topK: RECALL_TOPK,
        messageRange: RECALL_RANGE,
        scope: "resource" as const,
      },
    };
  } catch (err) {
    console.warn("Mastra: DB backends failed to initialize, falling back to memory-only mode:", err);
    return { vector: undefined as PgVector | undefined, storage: undefined as PostgresStore | undefined, semanticRecall: false as const };
  }
}

const { vector, storage, semanticRecall } = getDbBackends();

// Structured working memory schema tailored for the Builder agent
const builderWorkingMemorySchema = z.object({
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      preferences: z
        .object({
          communicationStyle: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  project: z
    .object({
      appId: z.string().optional(),
      appName: z.string().optional(),
      repoId: z.string().optional(),
      domain: z.string().optional(),
      stack: z.array(z.string()).optional(),
    })
    .optional(),
  goals: z.array(z.string()).optional(),
  lastTask: z.string().optional(),
  openTodos: z.array(z.string()).optional(),
});

// Only create Memory when a storage backend is available to avoid runtime errors in dev
export const memory = storage
  ? new Memory({
      options: {
        // Keep recent conversational context light; rely on recall for older info
        lastMessages: LAST_MESSAGES,
        // Enable semantic recall across the resource (user) so different threads share memory
        semanticRecall,
        // Generate titles for new threads
        threads: {
          generateTitle: true,
        },
        // Enable resource-scoped working memory with a structured schema
        workingMemory: {
          enabled: true,
          scope: "resource",
          schema: builderWorkingMemorySchema,
        },
      },
      vector,
      storage,
      // Embedder required for semantic recall (see mastra_docs/memory.md)
      embedder: openai.embedding("text-embedding-3-small"),
      processors: [
        // Filter noisy tool call logs from context sent to the model
        new ToolCallFilter(),
        // Ensure retrieved memory does not exceed model context
        new TokenLimiter(127_000),
      ],
    })
  : undefined as any;

export const builderAgent = new Agent({
  name: "BuilderAgent",
  model: openai.chat("gpt-5"),
  instructions: SYSTEM_MESSAGE,
  // Attach memory only if configured
  memory: memory as any,
  tools: {
    scrape: scrapeTool,
    extract: extractTool,
    checkExtractStatus: checkExtractStatusTool,
    crawl: crawlTool,
    checkCrawlStatus: checkCrawlStatusTool,
    search: searchTool,
    map: mapTool,
    easLogin: easLoginTool,
    easBuild: easBuildTool,
    easSubmit: easSubmitTool,
    cloneFreestyleRepo: cloneRepoTool,
    createSupabaseProject: createProjectTool,
    update_todo_list: createTool({
      id: "update_todo_list",
      description:
        "Use the update todo list tool to keep track of the tasks you need to do to accomplish the user's request. You should should update the todo list each time you complete an item. You can remove tasks from the todo list, but only if they are no longer relevant or you've finished the user's request completely and they are asking for something else. Make sure to update the todo list each time the user asks you do something new. If they're asking for something new, you should probably just clear the whole todo list and start over with new items. For complex logic, use multiple todos to ensure you get it all right rather than just a single todo for implementing all logic.",
      inputSchema: z.object({
        items: z.array(
          z.object({
            description: z.string(),
            completed: z.boolean(),
          })
        ),
      }),
      outputSchema: z.object({
        success: z.boolean(),
      }),
      execute: async (context: ToolExecutionContext<any>) => {
        const writer =
          context && (context as any) && "writer" in (context as any)
            ? ((context as any).writer as { write: (chunk: any) => void })
            : undefined;
        if (writer) {
          writer.write({
            type: "update-todo-list",
            status: "pending",
          });
        }
        // In a real application, you would save the to-do list to a database here.
        // For this example, we'll just log it to the console.
        console.log("Updating todo list...");
        if (writer) {
          writer.write({
            type: "update-todo-list",
            status: "success",
          });
        }
        return { success: true };
      },
    }),
  },
});

// Fallback agent: same tools and memory, but using gpt-4o
export const builderAgentFallback = new Agent({
  name: "BuilderAgentFallback",
  model: openai.chat("gpt-4o"),
  instructions: SYSTEM_MESSAGE,
  memory: memory as any,
  tools: {
    scrape: scrapeTool,
    extract: extractTool,
    checkExtractStatus: checkExtractStatusTool,
    crawl: crawlTool,
    checkCrawlStatus: checkCrawlStatusTool,
    search: searchTool,
    map: mapTool,
    easLogin: easLoginTool,
    easBuild: easBuildTool,
    easSubmit: easSubmitTool,
    cloneFreestyleRepo: cloneRepoTool,
    createSupabaseProject: createProjectTool,
    update_todo_list: (builderAgent as any).tools.update_todo_list,
  },
});
