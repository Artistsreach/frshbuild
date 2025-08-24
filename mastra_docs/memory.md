Memory overview
Memory is how agents manage the context that’s available to them, it’s a condensation of all chat messages into their context window.

The Context Window
The context window is the total information visible to the language model at any given time.

In Mastra, context is broken up into three parts: system instructions and information about the user (working memory), recent messages (message history), and older messages that are relevant to the user’s query (semantic recall).

Working memory can persist at different scopes - either per conversation thread (default) or across all threads for the same user (resource-scoped), enabling persistent user profiles that remember context across conversations.

In addition, we provide memory processors to trim context or remove information if the context is too long.

Quick Start
The fastest way to see memory in action is using the built-in development playground.

If you haven’t already, create a new Mastra project following the main Getting Started guide.

Install the memory package

npm install @mastra/memory@latest
Create an agent and attach a Memory instance
src/mastra/agents/index.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
import { LibSQLStore } from "@mastra/libsql";
 
// Initialize memory with LibSQLStore for persistence
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db", // Or your database URL
  }),
});
 
export const myMemoryAgent = new Agent({
  name: "MemoryAgent",
  instructions: "...",
  model: openai("gpt-4o"),
  memory,
});
Start the Development Server

npm run dev
Open the playground and select your MemoryAgent
Open the playground at http://localhost:4111 . Send a few messages and notice that it remembers information across turns:

➡️ You: My favorite color is blue.
⬅️ Agent: Got it! I'll remember that your favorite color is blue.
➡️ You: What is my favorite color?
⬅️ Agent: Your favorite color is blue.
Memory Threads
Mastra organizes memory into threads, which are records that identify specific conversation histories, using two identifiers:

threadId: A globally unique conversation id (e.g., support_123). Thread IDs must be unique across all resources.
resourceId: The user or entity id that owns each thread (e.g., user_123, org_456).
The resourceId is particularly important for resource-scoped working memory, which allows memory to persist across all conversation threads for the same user.

const response = await myMemoryAgent.stream("Hello, my name is Alice.", {
  resourceId: "user_alice",
  threadId: "conversation_123",
});
Important: without these ID’s your agent will not use memory, even if memory is properly configured. The playground handles this for you, but you need to add ID’s yourself when using memory in your application.

Thread ID Uniqueness: Each thread ID must be globally unique across all resources. A thread is permanently associated with the resource that created it. If you need to have similar thread names for different resources (e.g., a “general” thread for multiple users), include the resource ID in the thread ID: ${resourceId}-general or user_alice_general.

Thread Title Generation
Mastra can automatically generate meaningful titles for conversation threads based on the user’s first message. This helps organize and identify conversations in your application UI.

const memory = new Memory({
  options: {
    threads: {
      generateTitle: true, // Enable automatic title generation
    },
  },
});
By default, title generation uses the same model and default instructions as your agent. For customization or cost optimization, you can specify a different model or provide custom instructions specifically for title generation:

const memory = new Memory({
  options: {
    threads: {
      generateTitle: {
        model: openai("gpt-4.1-nano"), // Use cheaper model for titles
        instructions: "Generate a concise title for this conversation based on the first user message.",
      },
    },
  },
});
Title generation happens asynchronously after the agent responds, so it doesn’t impact response time. See the full configuration reference for more details and examples.

Conversation History
By default, the Memory instance includes the last 10 messages from the current Memory thread in each new request. This provides the agent with immediate conversational context.

const memory = new Memory({
  options: {
    lastMessages: 10,
  },
});
Important: Only send the newest user message in each agent call. Mastra handles retrieving and injecting the necessary history. Sending the full history yourself will cause duplication. See the AI SDK Memory Example for how to handle this with when using the useChat frontend hooks.

Storage Configuration
Conversation history relies on a storage adapter to store messages. By default it uses the same storage provided to the main Mastra instance 

If neither the Memory instance nor the Mastra object specify a storage provider, Mastra will not persist memory data across application restarts or deployments. For any deployment beyond local testing you should provide your own storage configuration either on Mastra or directly within new Memory().

When storage is given on the Mastra instance it will automatically be used by every Memory attached to agents. In that case you do not need to pass storage to new Memory() unless you want a per-agent override.

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
 
const agent = new Agent({
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./local.db",
    }),
  }),
});
Storage code Examples:

LibSQL
Postgres
Upstash
Viewing Retrieved Messages
If tracing is enabled in your Mastra deployment and memory is configured either with lastMessages and/or semanticRecall, the agent’s trace output will show all messages retrieved for context—including both recent conversation history and messages recalled via semantic recall.

This is helpful for debugging, understanding agent decisions, and verifying that the agent is retrieving the right information for each request.

For more details on enabling and configuring tracing, see Tracing.

Next Steps
Now that you understand the core concepts, continue to semantic recall to learn how to add RAG memory to your Mastra agents.

Alternatively you can visit the configuration reference for available options, or browse usage examples.

Semantic Recall
If you ask your friend what they did last weekend, they will search in their memory for events associated with “last weekend” and then tell you what they did. That’s sort of like how semantic recall works in Mastra.

📹 Watch: What semantic recall is, how it works, and how to configure it in Mastra → YouTube (5 minutes) 

How Semantic Recall Works
Semantic recall is RAG-based search that helps agents maintain context across longer interactions when messages are no longer within recent conversation history.

It uses vector embeddings of messages for similarity search, integrates with various vector stores, and has configurable context windows around retrieved messages.


Diagram showing Mastra Memory semantic recall
When it’s enabled, new messages are used to query a vector DB for semantically similar messages.

After getting a response from the LLM, all new messages (user, assistant, and tool calls/results) are inserted into the vector DB to be recalled in later interactions.

Quick Start
Semantic recall is enabled by default, so if you give your agent memory it will be included:

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  name: "SupportAgent",
  instructions: "You are a helpful support agent.",
  model: openai("gpt-4o"),
  memory: new Memory(),
});
Recall configuration
The three main parameters that control semantic recall behavior are:

topK: How many semantically similar messages to retrieve
messageRange: How much surrounding context to include with each match
scope: Whether to search within the current thread or across all threads owned by a resource. Using scope: 'resource' allows the agent to recall information from any of the user’s past conversations.
const agent = new Agent({
  memory: new Memory({
    options: {
      semanticRecall: {
        topK: 3, // Retrieve 3 most similar messages
        messageRange: 2, // Include 2 messages before and after each match
        scope: 'resource', // Search across all threads for this user
      },
    },
  }),
});
Note: currently, scope: 'resource' for semantic recall is supported by the following storage adapters: LibSQL, Postgres, and Upstash.

Storage configuration
Semantic recall relies on a storage and vector db to store messages and their embeddings.

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
 
const agent = new Agent({
  memory: new Memory({
    // this is the default storage db if omitted
    storage: new LibSQLStore({
      url: "file:./local.db",
    }),
    // this is the default vector db if omitted
    vector: new LibSQLVector({
      connectionUrl: "file:./local.db",
    }),
  }),
});
Storage/vector code Examples:

LibSQL
Postgres
Upstash
Embedder configuration
Semantic recall relies on an embedding model to convert messages into embeddings. You can specify any embedding model  compatible with the AI SDK.

To use FastEmbed (a local embedding model), install @mastra/fastembed:


npm install @mastra/fastembed
Then configure it in your memory:

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { fastembed } from "@mastra/fastembed";
 
const agent = new Agent({
  memory: new Memory({
    // ... other memory options
    embedder: fastembed,
  }),
});
Alternatively, use a different provider like OpenAI:

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  memory: new Memory({
    // ... other memory options
    embedder: openai.embedding("text-embedding-3-small"),
  }),
});
Disabling
There is a performance impact to using semantic recall. New messages are converted into embeddings and used to query a vector database before new messages are sent to the LLM.

Semantic recall is enabled by default but can be disabled when not needed:

const agent = new Agent({
  memory: new Memory({
    options: {
      semanticRecall: false,
    },
  }),
});
You might want to disable semantic recall in scenarios like:

When conversation history provide sufficient context for the current conversation.
In performance-sensitive applications, like realtime two-way audio, where the added latency of creating embeddings and running vector queries is noticeable.
Viewing Recalled Messages
When tracing is enabled, any messages retrieved via semantic recall will appear in the agent’s trace output, alongside recent conversation history (if configured).

For more info on viewing message traces, see Viewing Retrieved Messages.

Working Memory
While conversation history and semantic recall help agents remember conversations, working memory allows them to maintain persistent information about users across interactions.

Think of it as the agent’s active thoughts or scratchpad – the key information they keep available about the user or task. It’s similar to how a person would naturally remember someone’s name, preferences, or important details during a conversation.

This is useful for maintaining ongoing state that’s always relevant and should always be available to the agent.

Working memory can persist at two different scopes:

Thread-scoped (default): Memory is isolated per conversation thread
Resource-scoped: Memory persists across all conversation threads for the same user
Important: Switching between scopes means the agent won’t see memory from the other scope - thread-scoped memory is completely separate from resource-scoped memory.

Quick Start
Here’s a minimal example of setting up an agent with working memory:

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
 
// Create agent with working memory enabled
const agent = new Agent({
  name: "PersonalAssistant",
  instructions: "You are a helpful personal assistant.",
  model: openai("gpt-4o"),
  memory: new Memory({
    options: {
      workingMemory: {
        enabled: true,
      },
    },
  }),
});
How it Works
Working memory is a block of Markdown text that the agent is able to update over time to store continuously relevant information:


Memory Persistence Scopes
Working memory can operate in two different scopes, allowing you to choose how memory persists across conversations:

Thread-Scoped Memory (Default)
By default, working memory is scoped to individual conversation threads. Each thread maintains its own isolated memory:

const memory = new Memory({
  storage,
  options: {
    workingMemory: {
      enabled: true,
      scope: 'thread', // Default - memory is isolated per thread
      template: `# User Profile
- **Name**: 
- **Interests**: 
- **Current Goal**: 
`,
    },
  },
});
Use cases:

Different conversations about separate topics
Temporary or session-specific information
Workflows where each thread needs working memory but threads are ephemeral and not related to each other
Resource-Scoped Memory
Resource-scoped memory persists across all conversation threads for the same user (resourceId), enabling persistent user memory:

const memory = new Memory({
  storage,
  options: {
    workingMemory: {
      enabled: true,
      scope: 'resource', // Memory persists across all user threads
      template: `# User Profile
- **Name**: 
- **Location**: 
- **Interests**: 
- **Preferences**: 
- **Long-term Goals**: 
`,
    },
  },
});
Use cases:

Personal assistants that remember user preferences
Customer service bots that maintain customer context
Educational applications that track student progress
Usage with Agents
When using resource-scoped memory, make sure to pass the resourceId parameter:

// Resource-scoped memory requires resourceId
const response = await agent.generate("Hello!", {
  threadId: "conversation-123",
  resourceId: "user-alice-456" // Same user across different threads
});
Storage Adapter Support
Resource-scoped working memory requires specific storage adapters that support the mastra_resources table:

✅ Supported Storage Adapters
LibSQL (@mastra/libsql)
PostgreSQL (@mastra/pg)
Upstash (@mastra/upstash)
Custom Templates
Templates guide the agent on what information to track and update in working memory. While a default template is used if none is provided, you’ll typically want to define a custom template tailored to your agent’s specific use case to ensure it remembers the most relevant information.

Here’s an example of a custom template. In this example the agent will store the users name, location, timezone, etc as soon as the user sends a message containing any of the info:

const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `
# User Profile
 
## Personal Info
 
- Name:
- Location:
- Timezone:
 
## Preferences
 
- Communication Style: [e.g., Formal, Casual]
- Project Goal:
- Key Deadlines:
  - [Deadline 1]: [Date]
  - [Deadline 2]: [Date]
 
## Session State
 
- Last Task Discussed:
- Open Questions:
  - [Question 1]
  - [Question 2]
`,
    },
  },
});
Designing Effective Templates
A well-structured template keeps the information easy for the agent to parse and update. Treat the template as a short form that you want the assistant to keep up to date.

Short, focused labels. Avoid paragraphs or very long headings. Keep labels brief (for example ## Personal Info or - Name:) so updates are easy to read and less likely to be truncated.
Use consistent casing. Inconsistent capitalization (Timezone: vs timezone:) can cause messy updates. Stick to Title Case or lower case for headings and bullet labels.
Keep placeholder text simple. Use hints such as [e.g., Formal] or [Date] to help the LLM fill in the correct spots.
Abbreviate very long values. If you only need a short form, include guidance like - Name: [First name or nickname] or - Address (short): rather than the full legal text.
Mention update rules in instructions. You can instruct how and when to fill or clear parts of the template directly in the agent’s instructions field.
Alternative Template Styles
Use a shorter single block if you only need a few items:

const basicMemory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `User Facts:\n- Name:\n- Favorite Color:\n- Current Topic:`,
    },
  },
});
You can also store the key facts in a short paragraph format if you prefer a more narrative style:

const paragraphMemory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `Important Details:\n\nKeep a short paragraph capturing the user's important facts (name, main goal, current task).`,
    },
  },
});
Structured Working Memory
Working memory can also be defined using a structured schema instead of a Markdown template. This allows you to specify the exact fields and types that should be tracked, using a Zod  schema. When using a schema, the agent will see and update working memory as a JSON object matching your schema.

Important: You must specify either template or schema, but not both.

Example: Schema-Based Working Memory
import { z } from 'zod';
import { Memory } from '@mastra/memory';
 
const userProfileSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.object({
    communicationStyle: z.string().optional(),
    projectGoal: z.string().optional(),
    deadlines: z.array(z.string()).optional(),
  }).optional(),
});
 
const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      schema: userProfileSchema,
      // template: ... (do not set)
    },
  },
});
When a schema is provided, the agent receives the working memory as a JSON object. For example:

{
  "name": "Sam",
  "location": "Berlin",
  "timezone": "CET",
  "preferences": {
    "communicationStyle": "Formal",
    "projectGoal": "Launch MVP",
    "deadlines": ["2025-07-01"]
  }
}
Choosing Between Template and Schema
Use a template (Markdown) if you want the agent to maintain memory as a free-form text block, such as a user profile or scratchpad.
Use a schema if you need structured, type-safe data that can be validated and programmatically accessed as JSON.
Only one mode can be active at a time: setting both template and schema is not supported.
Example: Multi-step Retention
Below is a simplified view of how the User Profile template updates across a short user conversation:

# User Profile
## Personal Info
- Name:
- Location:
- Timezone:
--- After user says "My name is **Sam** and I'm from **Berlin**" ---
# User Profile
- Name: Sam
- Location: Berlin
- Timezone:
--- After user adds "By the way I'm normally in **CET**" ---
# User Profile
- Name: Sam
- Location: Berlin
- Timezone: CET
The agent can now refer to Sam or Berlin in later responses without requesting the information again because it has been stored in working memory.

If your agent is not properly updating working memory when you expect it to, you can add system instructions on how and when to use this template in your agent’s instructions setting.

Setting Initial Working Memory
While agents typically update working memory through the updateWorkingMemory tool, you can also set initial working memory programmatically when creating or updating threads. This is useful for injecting user data (like their name, preferences, or other info) that you want available to the agent without passing it in every request.

Setting Working Memory via Thread Metadata
When creating a thread, you can provide initial working memory through the metadata’s workingMemory key:

src/app/medical-consultation.ts

// Create a thread with initial working memory
const thread = await memory.createThread({
  threadId: "thread-123",
  resourceId: "user-456",
  title: "Medical Consultation",
  metadata: {
    workingMemory: `# Patient Profile
- Name: John Doe
- Blood Type: O+
- Allergies: Penicillin
- Current Medications: None
- Medical History: Hypertension (controlled)
`
  }
});
 
// The agent will now have access to this information in all messages
await agent.generate("What's my blood type?", {
  threadId: thread.id,
  resourceId: "user-456"
});
// Response: "Your blood type is O+."
Updating Working Memory Programmatically
You can also update an existing thread’s working memory:

src/app/medical-consultation.ts

// Update thread metadata to add/modify working memory
await memory.updateThread({
  id: "thread-123",
  title: thread.title,
  metadata: {
    ...thread.metadata,
    workingMemory: `# Patient Profile
- Name: John Doe
- Blood Type: O+
- Allergies: Penicillin, Ibuprofen  // Updated
- Current Medications: Lisinopril 10mg daily  // Added
- Medical History: Hypertension (controlled)
`
  }
});
Direct Memory Update
Alternatively, use the updateWorkingMemory method directly:

src/app/medical-consultation.ts

await memory.updateWorkingMemory({
  threadId: "thread-123",
  resourceId: "user-456", // Required for resource-scoped memory
  workingMemory: "Updated memory content..."
});
Examples
Streaming working memory
Using a working memory template
Using a working memory schema
Per-resource working memory  - Complete example showing resource-scoped memory persistence

Memory Processors
Memory Processors allow you to modify the list of messages retrieved from memory before they are added to the agent’s context window and sent to the LLM. This is useful for managing context size, filtering content, and optimizing performance.

Processors operate on the messages retrieved based on your memory configuration (e.g., lastMessages, semanticRecall). They do not affect the new incoming user message.

Built-in Processors
Mastra provides built-in processors:

TokenLimiter
This processor is used to prevent errors caused by exceeding the LLM’s context window limit. It counts the tokens in the retrieved memory messages and removes the oldest messages until the total count is below the specified limit.


import { Memory } from "@mastra/memory";
import { TokenLimiter } from "@mastra/memory/processors";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  model: openai("gpt-4o"),
  memory: new Memory({
    processors: [
      // Ensure the total tokens from memory don't exceed ~127k
      new TokenLimiter(127000),
    ],
  }),
});
The TokenLimiter uses the o200k_base encoding by default (suitable for GPT-4o). You can specify other encodings if needed for different models:


// Import the encoding you need (e.g., for older OpenAI models)
import cl100k_base from "js-tiktoken/ranks/cl100k_base";
 
const memoryForOlderModel = new Memory({
  processors: [
    new TokenLimiter({
      limit: 16000, // Example limit for a 16k context model
      encoding: cl100k_base,
    }),
  ],
});
See the OpenAI cookbook  or 
js-tiktoken
repo for more on encodings.

ToolCallFilter
This processor removes tool calls from the memory messages sent to the LLM. It saves tokens by excluding potentially verbose tool interactions from the context, which is useful if the details aren’t needed for future interactions. It’s also useful if you always want your agent to call a specific tool again and not rely on previous tool results in memory.


import { Memory } from "@mastra/memory";
import { ToolCallFilter, TokenLimiter } from "@mastra/memory/processors";
 
const memoryFilteringTools = new Memory({
  processors: [
    // Example 1: Remove all tool calls/results
    new ToolCallFilter(),
 
    // Example 2: Remove only noisy image generation tool calls/results
    new ToolCallFilter({ exclude: ["generateImageTool"] }),
 
    // Always place TokenLimiter last
    new TokenLimiter(127000),
  ],
});
Applying Multiple Processors
You can chain multiple processors. They execute in the order they appear in the processors array. The output of one processor becomes the input for the next.

Order matters! It’s generally best practice to place TokenLimiter last in the chain. This ensures it operates on the final set of messages after other filtering has occurred, providing the most accurate token limit enforcement.


import { Memory } from "@mastra/memory";
import { ToolCallFilter, TokenLimiter } from "@mastra/memory/processors";
// Assume a hypothetical 'PIIFilter' custom processor exists
// import { PIIFilter } from './custom-processors';
 
const memoryWithMultipleProcessors = new Memory({
  processors: [
    // 1. Filter specific tool calls first
    new ToolCallFilter({ exclude: ["verboseDebugTool"] }),
    // 2. Apply custom filtering (e.g., remove hypothetical PII - use with caution)
    // new PIIFilter(),
    // 3. Apply token limiting as the final step
    new TokenLimiter(127000),
  ],
});
Creating Custom Processors
You can create custom logic by extending the base MemoryProcessor class.


import { Memory } from "@mastra/memory";
import { CoreMessage, MemoryProcessorOpts } from "@mastra/core";
import { MemoryProcessor } from "@mastra/core/memory";
 
class ConversationOnlyFilter extends MemoryProcessor {
  constructor() {
    // Provide a name for easier debugging if needed
    super({ name: "ConversationOnlyFilter" });
  }
 
  process(
    messages: CoreMessage[],
    _opts: MemoryProcessorOpts = {}, // Options passed during memory retrieval, rarely needed here
  ): CoreMessage[] {
    // Filter messages based on role
    return messages.filter(
      (msg) => msg.role === "user" || msg.role === "assistant",
    );
  }
}
 
// Use the custom processor
const memoryWithCustomFilter = new Memory({
  processors: [
    new ConversationOnlyFilter(),
    new TokenLimiter(127000), // Still apply token limiting
  ],
});
When creating custom processors avoid mutating the input messages array or its objects directly.