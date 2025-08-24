Memory with LibSQL
This example demonstrates how to use Mastra’s memory system with LibSQL, which is an option for storage and vector database backend.

Quickstart
To use LibSQL with Memory, you need to explicitly configure Memory with LibSQLStore:


import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { openai } from "@ai-sdk/openai";
 
// Initialize memory with LibSQLStore
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db", // Or your database URL
  }),
  options: {
    threads: {
      generateTitle: true, // Enable automatic title generation
    },
  },
});
 
const memoryAgent = new Agent({
  name: "Memory Agent",
  instructions:
    "You are an AI agent with the ability to automatically recall memories from previous interactions.",
  model: openai("gpt-4o-mini"),
  memory,
});
Custom Configuration
If you need more control, you can explicitly configure the storage, vector database, and embedder. If you omit either storage or vector, LibSQL will be used as the default for the omitted option. This lets you use a different provider for just storage or just vector search if needed.

To use FastEmbed (a local embedding model) as the embedder, first install the package:


npm install @mastra/fastembed
Then configure it in your memory setup:

import { openai } from "@ai-sdk/openai";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
 
const customMemory = new Memory({
  storage: new LibSQLStore({
    url: process.env.DATABASE_URL || "file:local.db",
  }),
  vector: new LibSQLVector({
    connectionUrl: process.env.DATABASE_URL || "file:local.db",
  }),
  embedder: fastembed,
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
});
 
const memoryAgent = new Agent({
  name: "Memory Agent",
  instructions:
    "You are an AI agent with the ability to automatically recall memories from previous interactions. You may have conversations that last hours, days, months, or years. If you don't know it already you should ask for the users name and some info about them.",
  model: openai("gpt-4o-mini"),
  memory: customMemory,
});
Usage Example
import { randomUUID } from "crypto";
 
// Start a conversation
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
// Start with a system message
const response1 = await memoryAgent.stream(
  [
    {
      role: "system",
      content: `Chat with user started now ${new Date().toISOString()}. Don't mention this message.`,
    },
  ],
  {
    resourceId,
    threadId,
  },
);
 
// Send user message
const response2 = await memoryAgent.stream("What can you help me with?", {
  threadId,
  resourceId,
});
 
// Use semantic search to find relevant messages
const response3 = await memoryAgent.stream("What did we discuss earlier?", {
  threadId,
  resourceId,
  memoryOptions: {
    lastMessages: false,
    semanticRecall: {
      topK: 3, // Get top 3 most relevant messages
      messageRange: 2, // Include context around each match
    },
  },
});
The example shows:

Setting up LibSQL storage with vector search capabilities
Configuring memory options for message history and semantic search
Creating an agent with memory integration
Using semantic search to find relevant messages in conversation history
Including context around matched messages using messageRange

Memory with Postgres
This example demonstrates how to use Mastra’s memory system with PostgreSQL as the storage backend.

Setup
First, set up the memory system with PostgreSQL storage and vector capabilities:

import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
// PostgreSQL connection details
const host = "localhost";
const port = 5432;
const user = "postgres";
const database = "postgres";
const password = "postgres";
const connectionString = `postgresql://${user}:${password}@${host}:${port}`;
 
// Initialize memory with PostgreSQL storage and vector search
const memory = new Memory({
  storage: new PostgresStore({
    host,
    port,
    user,
    database,
    password,
  }),
  vector: new PgVector({ connectionString }),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
});
 
// Create an agent with memory capabilities
const chefAgent = new Agent({
  name: "chefAgent",
  instructions:
    "You are Michel, a practical and experienced home chef who helps people cook great meals with whatever ingredients they have available.",
  model: openai("gpt-4o-mini"),
  memory,
});
Usage Example
import { randomUUID } from "crypto";
 
// Start a conversation
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
// Ask about ingredients
const response1 = await chefAgent.stream(
  "In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?",
  {
    threadId,
    resourceId,
  },
);
 
// Ask about different ingredients
const response2 = await chefAgent.stream(
  "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and curry powder.",
  {
    threadId,
    resourceId,
  },
);
 
// Use memory to recall previous conversation
const response3 = await chefAgent.stream(
  "What did we cook before I went to my friends house?",
  {
    threadId,
    resourceId,
    memoryOptions: {
      lastMessages: 3, // Get last 3 messages for context
    },
  },
);
The example shows:

Setting up PostgreSQL storage with vector search capabilities
Configuring memory options for message history and semantic search
Creating an agent with memory integration
Using the agent to maintain conversation context across multiple 

Memory with Upstash
This example demonstrates how to use Mastra’s memory system with Upstash as the storage backend.

Setup
First, set up the memory system with Upstash storage and vector capabilities:

import { Memory } from "@mastra/memory";
import { UpstashStore, UpstashVector } from "@mastra/upstash";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
// Initialize memory with Upstash storage and vector search
const memory = new Memory({
  storage: new UpstashStore({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  vector: new UpstashVector({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  }),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
});
 
// Create an agent with memory capabilities
const chefAgent = new Agent({
  name: "chefAgent",
  instructions:
    "You are Michel, a practical and experienced home chef who helps people cook great meals with whatever ingredients they have available.",
  model: openai("gpt-4o-mini"),
  memory,
});
Environment Setup
Make sure to set up your Upstash credentials in the environment variables:

UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
UPSTASH_VECTOR_REST_URL=your-vector-index-url
UPSTASH_VECTOR_REST_TOKEN=your-vector-index-token
Usage Example
import { randomUUID } from "crypto";
 
// Start a conversation
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
// Ask about ingredients
const response1 = await chefAgent.stream(
  "In my kitchen I have: pasta, canned tomatoes, garlic, olive oil, and some dried herbs (basil and oregano). What can I make?",
  {
    threadId,
    resourceId,
  },
);
 
// Ask about different ingredients
const response2 = await chefAgent.stream(
  "Now I'm over at my friend's house, and they have: chicken thighs, coconut milk, sweet potatoes, and curry powder.",
  {
    threadId,
    resourceId,
  },
);
 
// Use memory to recall previous conversation
const response3 = await chefAgent.stream(
  "What did we cook before I went to my friends house?",
  {
    threadId,
    resourceId,
    memoryOptions: {
      lastMessages: 3, // Get last 3 messages for context
      semanticRecall: {
        topK: 2, // Also get 2 most relevant messages
        messageRange: 2, // Include context around matches
      },
    },
  },
);
The example shows:

Setting up Upstash storage with vector search capabilities
Configuring environment variables for Upstash connection
Creating an agent with memory integration
Using both recent history and semantic search in the same query

Memory with Mem0
This example demonstrates how to use Mastra’s agent system with Mem0 as the memory backend through custom tools.

Setup
First, set up the Mem0 integration and create tools for memorizing and remembering information:

import { Mem0Integration } from "@mastra/mem0";
import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
 
// Initialize Mem0 integration
const mem0 = new Mem0Integration({
  config: {
    apiKey: process.env.MEM0_API_KEY || "",
    user_id: "alice", // Unique user identifier
  },
});
 
// Create memory tools
const mem0RememberTool = createTool({
  id: "Mem0-remember",
  description:
    "Remember your agent memories that you've previously saved using the Mem0-memorize tool.",
  inputSchema: z.object({
    question: z
      .string()
      .describe("Question used to look up the answer in saved memories."),
  }),
  outputSchema: z.object({
    answer: z.string().describe("Remembered answer"),
  }),
  execute: async ({ context }) => {
    console.log(`Searching memory "${context.question}"`);
    const memory = await mem0.searchMemory(context.question);
    console.log(`\nFound memory "${memory}"\n`);
 
    return {
      answer: memory,
    };
  },
});
 
const mem0MemorizeTool = createTool({
  id: "Mem0-memorize",
  description:
    "Save information to mem0 so you can remember it later using the Mem0-remember tool.",
  inputSchema: z.object({
    statement: z.string().describe("A statement to save into memory"),
  }),
  execute: async ({ context }) => {
    console.log(`\nCreating memory "${context.statement}"\n`);
    // To reduce latency, memories can be saved async without blocking tool execution
    void mem0.createMemory(context.statement).then(() => {
      console.log(`\nMemory "${context.statement}" saved.\n`);
    });
    return { success: true };
  },
});
 
// Create an agent with memory tools
const mem0Agent = new Agent({
  name: "Mem0 Agent",
  instructions: `
    You are a helpful assistant that has the ability to memorize and remember facts using Mem0.
    Use the Mem0-memorize tool to save important information that might be useful later.
    Use the Mem0-remember tool to recall previously saved information when answering questions.
  `,
  model: openai("gpt-4o"),
  tools: { mem0RememberTool, mem0MemorizeTool },
});
Environment Setup
Make sure to set up your Mem0 API key in the environment variables:

MEM0_API_KEY=your-mem0-api-key
You can get your Mem0 API key by signing up at app.mem0.ai  and creating a new project.

Usage Example
import { randomUUID } from "crypto";
 
// Start a conversation
const threadId = randomUUID();
 
// Ask the agent to remember some information
const response1 = await mem0Agent.text(
  "Please remember that I prefer vegetarian meals and I'm allergic to nuts. Also, I live in San Francisco.",
  {
    threadId,
  },
);
 
// Ask about different topics
const response2 = await mem0Agent.text(
  "I'm planning a dinner party for 6 people next weekend. Can you suggest a menu?",
  {
    threadId,
  },
);
 
// Later, ask the agent to recall information
const response3 = await mem0Agent.text(
  "What do you remember about my dietary preferences?",
  {
    threadId,
  },
);
 
// Ask about location-specific information
const response4 = await mem0Agent.text(
  "Recommend some local restaurants for my dinner party based on what you know about me.",
  {
    threadId,
  },
);
Key Features
The Mem0 integration provides several advantages:

Automatic Memory Management: Mem0 handles the storage, indexing, and retrieval of memories intelligently
Semantic Search: The agent can find relevant memories based on semantic similarity, not just exact matches
User-specific Memories: Each user_id maintains separate memory spaces
Asynchronous Saving: Memories are saved in the background to reduce response latency
Long-term Persistence: Memories persist across conversations and sessions
Tool-based Approach
Unlike Mastra’s built-in memory system, this example uses a tool-based approach where:

The agent decides when to save information using the Mem0-memorize tool
The agent can actively search for relevant memories using the Mem0-remember tool
This gives the agent more control over memory operations and makes the memory usage transparent
Best Practices
Clear Instructions: Provide clear instructions to the agent about when to memorize and remember information
User Identification: Use consistent user_id values to maintain separate memory spaces for different users
Descriptive Statements: When saving memories, use descriptive statements that will be easy to search for later
Memory Cleanup: Consider implementing periodic cleanup of old or irrelevant memories
The example shows how to create an intelligent agent that can learn and remember information about users across conversations, making interactions more personalized and contextual over time.

Streaming Working Memory
This example demonstrates how to create an agent that maintains a working memory for relevant conversational details like the users name, location, or preferences.

Setup
First, set up the memory system with working memory enabled. Note that new Memory() without a configured storage provider will not persist data across application restarts. For persistence, you can configure a storage provider like @mastra/libsql:

import { Memory } from "@mastra/memory";
 
const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
    },
  },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
});
Add the memory instance to an agent:

import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  name: "Memory agent",
  instructions: "You are a helpful AI assistant.",
  model: openai("gpt-4o-mini"),
  memory, // or toolCallMemory
});
Usage Example
Now that working memory is set up you can interact with the agent and it will remember key details about interactions.

import { randomUUID } from "crypto";
 
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
const response = await agent.stream("Hello, my name is Jane", {
  threadId,
  resourceId,
});
 
for await (const chunk of response.textStream) {
  process.stdout.write(chunk);
}
Summary
This example demonstrates:

Setting up memory with working memory enabled
The agent maintaining relevant user info between interactions
Advanced use cases
For examples on controlling which information is relevant for working memory, or showing loading states while working memory is being saved, see our advanced working memory example.

To learn more about agent memory, including other memory types and storage options, check out the Memory documentation page.

Streaming Working Memory (advanced)
This example demonstrates how to create an agent that maintains a todo list using working memory, even with minimal context. For a simpler introduction to working memory, see the basic working memory example.

Setup
Let’s break down how to create an agent with working memory capabilities. We’ll build a todo list manager that remembers tasks even with minimal context.

1. Setting up Memory
First, we’ll configure the memory system with a short context window since we’ll be using working memory to maintain state. Note that new Memory() without a configured storage provider will not persist data across application restarts. For persistence, you can configure a storage provider like @mastra/libsql:

import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
 
const memory = new Memory({
  options: {
    lastMessages: 1, // working memory means we can have a shorter context window and still maintain conversational coherence
    workingMemory: {
      enabled: true,
    },
  },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
});
2. Defining the Working Memory Template
Next, we’ll define a template that shows the agent how to structure the todo list data. The template uses Markdown to represent the data structure. This helps the agent understand what information to track for each todo item.

const memory = new Memory({
  options: {
    lastMessages: 1,
    workingMemory: {
      enabled: true,
      template: `
# Todo List
## Item Status
- Active items:
  - Example (Due: Feb 7 3028, Started: Feb 7 2025)
    - Description: This is an example task
## Completed
- None yet
`,
    },
  },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
});
3. Creating the Todo List Agent
Finally, we’ll create an agent that uses this memory system. The agent’s instructions define how it should interact with users and manage the todo list.

import { openai } from "@ai-sdk/openai";
 
const todoAgent = new Agent({
  name: "TODO Agent",
  instructions:
    "You are a helpful todolist AI agent. Help the user manage their todolist. If there is no list yet ask them what to add! If there is a list always print it out when the chat starts. For each item add emojis, dates, titles (with an index number starting at 1), descriptions, and statuses. For each piece of info add an emoji to the left of it. Also support subtask lists with bullet points inside a box. Help the user timebox each task by asking them how long it will take.",
  model: openai("gpt-4o-mini"),
  memory,
});
Note: The template and instructions are optional - when workingMemory.enabled is set to true, a default system message is automatically injected to help the agent understand how to use working memory.

Usage Example
The agent’s responses will contain XML-like <working_memory>$data</working_memory> tags that Mastra uses to automatically update the working memory. We’ll look at two ways to handle this:

Basic Usage
For simple cases, you can use maskStreamTags to hide the working memory updates from users:

import { randomUUID } from "crypto";
import { maskStreamTags } from "@mastra/core/utils";
 
// Start a conversation
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
// Add a new todo item
const response = await todoAgent.stream(
  "Add a task: Build a new feature for our app. It should take about 2 hours and needs to be done by next Friday.",
  {
    threadId,
    resourceId,
  },
);
 
// Process the stream, hiding working memory updates
for await (const chunk of maskStreamTags(
  response.textStream,
  "working_memory",
)) {
  process.stdout.write(chunk);
}
Advanced Usage with UI Feedback
For a better user experience, you can show loading states while working memory is being updated:

// Same imports and setup as above...
 
// Add lifecycle hooks to provide UI feedback
const maskedStream = maskStreamTags(response.textStream, "working_memory", {
  // Called when a working_memory tag starts
  onStart: () => showLoadingSpinner("Updating todo list..."),
  // Called when a working_memory tag ends
  onEnd: () => hideLoadingSpinner(),
  // Called with the content that was masked
  onMask: (chunk) => console.debug("Updated todo list:", chunk),
});
 
// Process the masked stream
for await (const chunk of maskedStream) {
  process.stdout.write(chunk);
}
The example demonstrates:

Setting up a memory system with working memory enabled
Creating a todo list template with structured XML
Using maskStreamTags to hide memory updates from users
Providing UI loading states during memory updates with lifecycle hooks
Even with only one message in context (lastMessages: 1), the agent maintains the complete todo list in working memory. Each time the agent responds, it updates the working memory with the current state of the todo list, ensuring persistence across interactions.

To learn more about agent memory, including other memory types and storage options, check out the Memory documentation page.

Streaming Structured Working Memory
This example demonstrates how to create an agent that maintains a todo list using structured working memory (schema-based), even with minimal context. For a Markdown-based version, see the advanced working memory example.

Setup
Let’s break down how to create an agent with structured working memory. We’ll build a todo list manager that remembers tasks as a JSON object.

1. Setting up Structured Memory
We’ll configure the memory system with a short context window and provide a Zod schema for the todo list. For persistence, you can configure a storage provider like @mastra/libsql:

import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
 
// Define the schema for the todo list
const todoListSchema = z.object({
  items: z.array(
    z.object({
      description: z.string(),
      due: z.string().optional(),
      started: z.string().optional(),
      status: z.enum(["active", "completed"]).default("active"),
    })
  ),
});
 
const memory = new Memory({
  options: {
    lastMessages: 1,
    workingMemory: {
      enabled: true,
      schema: todoListSchema,
    },
  },
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
});
2. Creating the Todo List Agent
We’ll create an agent that uses this structured memory. The instructions should guide the agent to maintain the todo list as a JSON object matching the schema.

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
const todoAgent = new Agent({
  name: "TODO Agent",
  instructions:
    "You are a helpful todolist AI agent. Maintain the user's todo list as a JSON object according to the provided schema. Each item should include a description, status (active/completed), and optional due/started dates. When the user adds, completes, or updates a task, update the JSON accordingly. Always show the current todo list at the start of the chat.",
  model: openai("gpt-4o-mini"),
  memory,
});
Note: When workingMemory.schema is set, a default system prompt is automatically injected to instruct the agent on how to use structured working memory. You can override or extend this prompt as needed.

Usage Example
The agent’s responses will contain <working_memory>{...}</working_memory> tags with the updated JSON. We’ll look at two ways to handle this:

Basic Usage
For simple cases, you can use maskStreamTags to hide the working memory updates from users:

import { randomUUID } from "crypto";
import { maskStreamTags } from "@mastra/core/utils";
 
// Start a conversation
const threadId = randomUUID();
const resourceId = "SOME_USER_ID";
 
// Add a new todo item
const response = await todoAgent.stream(
  "Add a task: Build a new feature for our app. It should take about 2 hours and needs to be done by next Friday.",
  {
    threadId,
    resourceId,
  },
);
 
// Process the stream, hiding working memory updates
for await (const chunk of maskStreamTags(
  response.textStream,
  "working_memory",
)) {
  process.stdout.write(chunk);
}
Advanced Usage with UI Feedback
For a better user experience, you can show loading states while working memory is being updated:

// Add lifecycle hooks to provide UI feedback
const maskedStream = maskStreamTags(response.textStream, "working_memory", {
  // Called when a working_memory tag starts
  onStart: () => showLoadingSpinner("Updating todo list..."),
  // Called when a working_memory tag ends
  onEnd: () => hideLoadingSpinner(),
  // Called with the content that was masked
  onMask: (chunk) => console.debug("Updated todo list:", chunk),
});
 
// Process the masked stream
for await (const chunk of maskedStream) {
  process.stdout.write(chunk);
}
Example: Structured Working Memory State
After several interactions, the working memory might look like:

{
  "items": [
    {
      "description": "Buy groceries",
      "due": "2025-07-01",
      "started": "2025-06-24",
      "status": "active"
    },
    {
      "description": "Finish project report",
      "due": "2025-07-05",
      "status": "completed"
    }
  ]
}
The agent can refer to or update this list directly in JSON, ensuring structured, type-safe memory retention across conversations.

This example demonstrates:

Setting up a memory system with structured working memory using a Zod schema
Creating an agent that manages a todo list as a JSON object
Using maskStreamTags to hide memory updates from users
Providing UI loading states during memory updates with lifecycle hooks
Maintaining persistent, structured memory even with a short context window
Even with only one message in context (lastMessages: 1), the agent maintains the complete todo list in structured working memory. Each time the agent responds, it updates the JSON object, ensuring persistence across interactions.

To learn more about agent memory, including other memory types and storage options, see the Memory documentation.

Memory Processors
This example demonstrates how to use memory processors to limit token usage, filter out tool calls, and create a simple custom processor.

Setup
First, install the memory package:


npm install @mastra/memory@latest
# or
pnpm add @mastra/memory@latest
# or
yarn add @mastra/memory@latest
Basic Memory Setup with Processors
import { Memory } from "@mastra/memory";
import { TokenLimiter, ToolCallFilter } from "@mastra/memory/processors";
 
// Create memory with processors
const memory = new Memory({
  processors: [new TokenLimiter(127000), new ToolCallFilter()],
});
Using Token Limiting
The TokenLimiter helps you stay within your model’s context window:

import { Memory } from "@mastra/memory";
import { TokenLimiter } from "@mastra/memory/processors";
 
// Set up memory with a token limit
const memory = new Memory({
  processors: [
    // Limit to approximately 12700 tokens (for GPT-4o)
    new TokenLimiter(127000),
  ],
});
You can also specify a different encoding if needed:

import { Memory } from "@mastra/memory";
import { TokenLimiter } from "@mastra/memory/processors";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";
 
const memory = new Memory({
  processors: [
    new TokenLimiter({
      limit: 16000,
      encoding: cl100k_base, // Specific encoding for certain models eg GPT-3.5
    }),
  ],
});
Filtering Tool Calls
The ToolCallFilter processor removes tool calls and their results from memory:

import { Memory } from "@mastra/memory";
import { ToolCallFilter } from "@mastra/memory/processors";
 
// Filter out all tool calls
const memoryNoTools = new Memory({
  processors: [new ToolCallFilter()],
});
 
// Filter specific tool calls
const memorySelectiveFilter = new Memory({
  processors: [
    new ToolCallFilter({
      exclude: ["imageGenTool", "clipboardTool"],
    }),
  ],
});
Combining Multiple Processors
Processors run in the order they are defined:

import { Memory } from "@mastra/memory";
import { TokenLimiter, ToolCallFilter } from "@mastra/memory/processors";
 
const memory = new Memory({
  processors: [
    // First filter out tool calls
    new ToolCallFilter({ exclude: ["imageGenTool"] }),
    // Then limit tokens (always put token limiter last for accurate measuring after other filters/transforms)
    new TokenLimiter(16000),
  ],
});
Creating a Simple Custom Processor
You can create your own processors by extending the MemoryProcessor class:

import type { CoreMessage } from "@mastra/core";
import { MemoryProcessor } from "@mastra/core/memory";
import { Memory } from "@mastra/memory";
 
// Simple processor that keeps only the most recent messages
class RecentMessagesProcessor extends MemoryProcessor {
  private limit: number;
 
  constructor(limit: number = 10) {
    super();
    this.limit = limit;
  }
 
  process(messages: CoreMessage[]): CoreMessage[] {
    // Keep only the most recent messages
    return messages.slice(-this.limit);
  }
}
 
// Use the custom processor
const memory = new Memory({
  processors: [
    new RecentMessagesProcessor(5), // Keep only the last 5 messages
    new TokenLimiter(16000),
  ],
});
Note: this example is for simplicity of understanding how custom processors work - you can limit messages more efficiently using new Memory({ options: { lastMessages: 5 } }). Memory processors are applied after memories are retrieved from storage, while options.lastMessages is applied before messages are fetched from storage.

Integration with an Agent
Here’s how to use memory with processors in an agent:

import { Agent } from "@mastra/core/agent";
import { Memory, TokenLimiter, ToolCallFilter } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
 
// Set up memory with processors
const memory = new Memory({
  processors: [
    new ToolCallFilter({ exclude: ["debugTool"] }),
    new TokenLimiter(16000),
  ],
});
 
// Create an agent with the memory
const agent = new Agent({
  name: "ProcessorAgent",
  instructions: "You are a helpful assistant with processed memory.",
  model: openai("gpt-4o-mini"),
  memory,
});
 
// Use the agent
const response = await agent.stream("Hi, can you remember our conversation?", {
  threadId: "unique-thread-id",
  resourceId: "user-123",
});
 
for await (const chunk of response.textStream) {
  process.stdout.write(chunk);
}
Summary
This example demonstrates:

Setting up memory with token limiting to prevent context window overflow
Filtering out tool calls to reduce noise and token usage
Creating a simple custom processor to keep only recent messages
Combining multiple processors in the correct order
Integrating processed memory with an agent
For more details on memory processors, check out the Memory Processors documentation.

Example: AI SDK useChat Hook with Mastra Server
This example shows how to integrate Mastra’s memory with the Vercel AI SDK’s useChat hook when using a Mastra Server deployment. The key is connecting your Next.js app to the Mastra Server via the MastraClient SDK.

Architecture Overview
When using a Mastra Server, you have two options:

Option 1: Via API Route (Recommended for production)

Your React frontend uses the useChat hook to manage UI state
Your API route uses MastraClient to communicate with the Mastra Server
The Mastra Server handles agent execution, memory, and tools
Benefits:

Keeps your Mastra Server URL and API keys secure on the backend
Allows you to add additional authentication/authorization logic
Enables request transformation and response handling
Better for multi-tenant applications
Option 2: Direct Connection (Good for development/prototyping)

Your React frontend uses the useChat hook to manage UI state
The useChat hook connects directly to the Mastra Server’s stream endpoint
The Mastra Server handles agent execution, memory, and tools
Preventing Message Duplication with useChat
The default behavior of useChat sends the entire chat history with each request. Since Mastra’s memory automatically retrieves history based on threadId, sending the full history from the client leads to duplicate messages in the context window and storage.

Solution: Configure useChat to send only the latest message along with your memory configuration (thread and resource identifiers).

components/Chat.tsx

import { useChat } from "ai/react";
 
export function Chat({ thread, resource }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat", // Your backend endpoint
    // Pass only the latest message and custom IDs
    experimental_prepareRequestBody: (request) => {
      // Ensure messages array is not empty and get the last message
      const lastMessage = request.messages.length > 0 ? request.messages[request.messages.length - 1] : null;
 
      // Return the structured body for your API route
      return {
        message: lastMessage, // Send only the most recent message content/role
        memory: {
          thread,
          resource,
        },
      };
    },
    // Optional: Initial messages if loading history from backend
    // initialMessages: loadedMessages,
  });
 
  // ... rest of your chat UI component
  return (
    <div>
      {/* Render messages */}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Send a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
 
app/api/chat/route.ts

import { MastraClient } from "@mastra/client-js";
import { CoreMessage } from "@mastra/core";
 
// Initialize the Mastra client to connect to your server
const mastraClient = new MastraClient({
  baseUrl: process.env.MASTRA_SERVER_URL || "http://localhost:4111",
  // Optional: Add API key if your server requires authentication
  headers: {
    "x-api-key": process.env.MASTRA_API_KEY,
  },
});
 
export async function POST(request: Request) {
  // Get data structured by experimental_prepareRequestBody
  const { message, memory }: { message: CoreMessage | null; memory: { thread: string; resource: string } } = await request.json();
 
  // Handle cases where message might be null (e.g., initial load or error)
  if (!message || !message.content) {
    return new Response("Missing message content", { status: 400 });
  }
 
  // Get the agent from your Mastra Server
  const agent = mastraClient.getAgent("ChatAgent"); // Use your agent's ID
 
  // Stream the response with memory context
  const response = await agent.stream({
    messages: [{ role: message.role || "user", content: message.content }],
    memory,
  });
 
  // Return the streaming response to the frontend
  return new Response(response.body);
}
Alternative: Direct Server Route
If you’ve deployed your Mastra Server with a custom route handler for chat, you can also connect directly:

components/Chat.tsx

import { useChat } from "ai/react";
 
export function Chat({ thread, resource, agentId = "ChatAgent" }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    // Connect directly to your Mastra Server's stream endpoint
    api: `${process.env.NEXT_PUBLIC_MASTRA_SERVER_URL}/api/agents/${agentId}/stream`,
    experimental_prepareRequestBody: (request) => {
      const lastMessage = request.messages.length > 0 ? request.messages[request.messages.length - 1] : null;
      // The Mastra Server expects the full messages array, not just a single message
      return {
        messages: lastMessage ? [lastMessage] : [],
        memory: {
          thread,
          resource,
        },
      };
    },
    headers: {
      // Include authentication if required
      "x-api-key": process.env.NEXT_PUBLIC_MASTRA_API_KEY,
    },
  });
 
  // ... rest of component
}
Environment Variables
Make sure to configure your environment variables:

.env.local

MASTRA_SERVER_URL=http://localhost:4111  # Your Mastra Server URL
MASTRA_API_KEY=your-api-key             # If authentication is enabled
 
# For direct client connection (if using the alternative approach)
NEXT_PUBLIC_MASTRA_SERVER_URL=http://localhost:4111
NEXT_PUBLIC_MASTRA_API_KEY=your-api-key
See the AI SDK documentation on message persistence  for more background.

Basic Thread Management UI
While this page focuses on useChat, you can also build UIs for managing threads (listing, creating, selecting). This typically involves backend API endpoints that interact with Mastra’s memory functions like memory.getThreadsByResourceId() and memory.createThread().

components/ThreadList.tsx

import React, { useState, useEffect } from 'react';
 
// Assume API functions exist: fetchThreads, createNewThread
async function fetchThreads(userId: string): Promise<{ id: string; title: string }[]> { /* ... */ }
async function createNewThread(userId: string): Promise<{ id: string; title: string }> { /* ... */ }
 
function ThreadList({ userId, currentThreadId, onSelectThread }) {
  const [threads, setThreads] = useState([]);
  // ... loading and error states ...
 
  useEffect(() => {
    // Fetch threads for userId
  }, [userId]);
 
  const handleCreateThread = async () => {
    // Call createNewThread API, update state, select new thread
  };
 
  // ... render UI with list of threads and New Conversation button ...
  return (
     <div>
       <h2>Conversations</h2>
       <button onClick={handleCreateThread}>New Conversation</button>
       <ul>
         {threads.map(thread => (
           <li key={thread.id}>
             <button onClick={() => onSelectThread(thread.id)} disabled={thread.id === currentThreadId}>
               {thread.title || `Chat ${thread.id.substring(0, 8)}...`}
             </button>
           </li>
         ))}
       </ul>
     </div>
  );
}
 
// Example Usage in a Parent Chat Component
function ChatApp() {
  const userId = "user_123";
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
 
  return (
    <div style={{ display: 'flex' }}>
      <ThreadList
        userId={userId}
        currentThreadId={currentThreadId}
        onSelectThread={setCurrentThreadId}
      />
      <div style={{ flexGrow: 1 }}>
        {currentThreadId ? (
          <Chat thread={currentThreadId} resource={userId} agentId="your-agent-id" /> // Your useChat component
        ) : (
          <div>Select or start a conversation.</div>
        )}
      </div>
    </div>
  );
}
Key Differences: Mastra Server vs Direct Integration
When using Mastra Server:
Your Next.js app acts as a client to the Mastra Server
Use MastraClient to communicate with the server
Agent configuration, memory, and tools are managed on the server
Better for production deployments and multi-client scenarios
When using direct integration (from the AI SDK docs):
Agent runs directly in your Next.js server
You manage agent configuration and dependencies locally
Simpler for development but requires more setup
Troubleshooting
Common Issues:
Connection refused: Ensure your Mastra Server is running and accessible
Authentication errors: Check your API key configuration
Message duplication: Verify you’re only sending the latest message
Missing thread history: Ensure memory configuration with thread and resource is passed correctly
CORS errors (direct connection): Configure your Mastra Server to allow requests from your frontend origin
Related
MastraClient Overview: Learn more about the Mastra Client SDK
Mastra Server: How to deploy and configure a Mastra Server
Memory Overview: Core concepts of memory resources and threads
AI SDK Integration: General useChat documentation