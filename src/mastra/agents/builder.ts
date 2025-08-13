import { SYSTEM_MESSAGE } from "@/lib/system";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { scrapeTool, extractTool, checkExtractStatusTool, crawlTool, checkCrawlStatusTool, searchTool } from "../tools/firecrawl";
import { easLoginTool, easBuildTool, easSubmitTool } from "../tools/expo";
import { cloneRepoTool } from "../tools/git";
import { createProjectTool } from "../tools/supabase";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { z } from "zod";

export const memory = new Memory({
  options: {
    lastMessages: 1000,
    semanticRecall: false,
    threads: {
      generateTitle: true,
    },
  },
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!,
  }),
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  processors: [
    // new ToolCallFilter({
    //   exclude: ["read_file", "read_multiple_files"],
    // }),
    // new TokenLimiter(100_000),
  ],
});

export const builderAgent = new Agent({
  name: "BuilderAgent",
  model: openai("gpt-4o"),
  instructions: SYSTEM_MESSAGE,
  memory,
  tools: {
    scrape: scrapeTool,
    extract: extractTool,
    checkExtractStatus: checkExtractStatusTool,
    crawl: crawlTool,
    checkCrawlStatus: checkCrawlStatusTool,
    search: searchTool,
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
      execute: async ({ writer }) => {
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
