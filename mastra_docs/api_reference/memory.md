Memory Class Reference
The Memory class provides a robust system for managing conversation history and thread-based message storage in Mastra. It enables persistent storage of conversations, semantic search capabilities, and efficient message retrieval. You must configure a storage provider for conversation history, and if you enable semantic recall you will also need to provide a vector store and embedder.

Basic Usage

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
 
const agent = new Agent({
  memory: new Memory(),
  ...otherOptions,
});
Custom Configuration

import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { Agent } from "@mastra/core/agent";
 
const memory = new Memory({
  // Optional storage configuration - libsql will be used by default
  storage: new LibSQLStore({
    url: "file:./memory.db",
  }),
 
  // Optional vector database for semantic search
  vector: new LibSQLVector({
    url: "file:./vector.db",
  }),
 
  // Memory configuration options
  options: {
    // Number of recent messages to include
    lastMessages: 20,
 
    // Semantic search configuration
    semanticRecall: {
      topK: 3, // Number of similar messages to retrieve
      messageRange: {
        // Messages to include around each result
        before: 2,
        after: 1,
      },
    },
 
    // Working memory configuration
    workingMemory: {
      enabled: true,
      template: `
# User
- First Name:
- Last Name:
`,
    },
 
    // Thread configuration
    threads: {
      generateTitle: true, // Enable title generation using agent's model
      // Or use a different model for title generation
      // generateTitle: {
      //   model: openai("gpt-4.1-nano"), // Use cheaper model for titles
      //   instructions: "Generate a concise title based on the initial user message.", // Custom instructions for title
      // },
    },
  },
});
 
const agent = new Agent({
  memory,
  ...otherOptions,
});
Working Memory
The working memory feature allows agents to maintain persistent information across conversations. When enabled, the Memory class automatically manages working memory updates using a dedicated tool call.

Example configuration:


const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: "# User\n- **First Name**:\n- **Last Name**:",
    },
  },
});
If no template is provided, the Memory class uses a default template that includes fields for user details, preferences, goals, and other contextual information in Markdown format. See the Working Memory guide for detailed usage examples and best practices.

Thread Title Generation
The generateTitle feature automatically creates meaningful titles for conversation threads based on the user’s first message. This helps organize and identify conversations in your application.

Basic Usage

const memory = new Memory({
  options: {
    threads: {
      generateTitle: true, // Use the agent's model for title generation
    },
  },
});
Cost Optimization with Custom Models and Instructions
You can specify a different (typically cheaper) model and custom instructions for title generation while using a high-quality model for the main conversation:


import { openai } from "@ai-sdk/openai";
 
const memory = new Memory({
  options: {
    threads: {
      generateTitle: {
        model: openai("gpt-4.1-nano"), // Cheaper model for titles
        instructions: "Generate a concise, friendly title based on the initial user message.", // Custom title instructions
      },
    },
  },
});
 
const agent = new Agent({
  model: openai("gpt-4o"), // High-quality model for main conversation
  memory,
});
Dynamic Model Selection and Instructions
You can also use a function to dynamically determine the model and instructions based on runtime context:


const memory = new Memory({
  options: {
    threads: {
      generateTitle: {
        model: (ctx: RuntimeContext) => {
          // Use different models based on context
          const userTier = ctx.get("userTier");
          return userTier === "premium" 
            ? openai("gpt-4.1")
            : openai("gpt-4.1-nano");
        },
        instructions: (ctx: RuntimeContext) => {
          const language = ctx.get("userLanguage") || "English";
          return `Generate a concise, engaging title in ${language} based on the user's first message.`;
        },
      },
    },
  },
});
embedder
An embedding model is required if semanticRecall is enabled.

One option is to use @mastra/fastembed, which provides an on-device/local embedding model using FastEmbed . This model runs locally and does not require API keys or network requests.

To use it, first install the package:


npm install @mastra/fastembed
Then, configure it in your Memory instance:

import { Memory } from "@mastra/memory";
import { fastembed } from "@mastra/fastembed";
import { Agent } from "@mastra/core/agent";
 
const agent = new Agent({
  memory: new Memory({
    embedder: fastembed,
    // ... other memory config
  }),
});
Note that, depending on where you’re deploying your project, your project may not deploy due to FastEmbeds large internal dependencies.

Alternatively, you can use an API-based embedder like OpenAI (which doesn’t have this problem):

import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
const agent = new Agent({
  memory: new Memory({
    embedder: openai.embedding("text-embedding-3-small"),
  }),
});
Mastra supports many embedding models through the Vercel AI SDK , including options from OpenAI, Google, Mistral, and Cohere.

Parameters
storage?:
MastraStorage
Storage implementation for persisting memory data
vector?:
MastraVector
Vector store for semantic search capabilities
embedder?:
EmbeddingModel
Embedder instance for vector embeddings. Required when semantic recall is enabled
options?:
MemoryConfig
General memory configuration options
options
lastMessages?:
number | false
= 10
Number of most recent messages to retrieve. Set to false to disable.
semanticRecall?:
boolean | SemanticRecallConfig
= false
Enable semantic search in message history. Automatically enabled when vector store is provided.
topK?:
number
= 2
Number of similar messages to retrieve when using semantic search
messageRange?:
number | { before: number; after: number }
= 2
Range of messages to include around semantic search results
scope?:
'thread' | 'resource'
= 'thread'
Scope for semantic search. 'thread' searches within the current thread only (default). 'resource' searches across all threads for a given resourceId, allowing agents to recall information from any of the user's past conversations. The 'resource' scope is currently supported by LibSQL, Postgres, and Upstash storage adapters.
workingMemory?:
{ enabled: boolean; template?: string }
= { enabled: false, template: '# User Information\n- **First Name**:\n- **Last Name**:\n...' }
Configuration for working memory feature that allows persistent storage of user information across conversations. Working memory uses Markdown format to structure and store continuously relevant information.
threads?:
{ generateTitle?: boolean | { model: MastraLanguageModel | ((ctx: RuntimeContext) => MastraLanguageModel | Promise<MastraLanguageModel>), instructions?: string | ((ctx: RuntimeContext) => string | Promise<string>) } }
= { generateTitle: false }
Settings related to memory thread creation. `generateTitle` controls automatic thread title generation from the user's first message. Can be a boolean to enable/disable using the agent's model, or an object specifying a custom model or custom instructions for title generation (useful for cost optimization or title customization). Example: { generateTitle: { model: openai('gpt-4.1-nano'), instructions: 'Concise title based on the initial user message.' } }

createThread
Creates a new conversation thread in the memory system. Each thread represents a distinct conversation or context and can contain multiple messages.

Usage Example
import { Memory } from "@mastra/memory";
 
const memory = new Memory({
  /* config */
});
const thread = await memory.createThread({
  resourceId: "user-123",
  title: "Support Conversation",
  metadata: {
    category: "support",
    priority: "high",
  },
});
Parameters
resourceId:
string
Identifier for the resource this thread belongs to (e.g., user ID, project ID)
threadId?:
string
Optional custom ID for the thread. If not provided, one will be generated.
title?:
string
Optional title for the thread
metadata?:
Record<string, unknown>
Optional metadata to associate with the thread
Returns
id:
string
Unique identifier of the created thread
resourceId:
string
Resource ID associated with the thread
title:
string
Title of the thread (if provided)
createdAt:
Date
Timestamp when the thread was created
updatedAt:
Date
Timestamp when the thread was last updated
metadata:
Record<string, unknown>
Additional metadata associated with the thread

query
Retrieves messages from a specific thread, with support for pagination, filtering options, and semantic search.

Usage Example
import { Memory } from "@mastra/memory";
 
const memory = new Memory({
  /* config */
});
 
// Get last 50 messages
const { messages, uiMessages, messagesV2 } = await memory.query({
  threadId: "thread-123",
  selectBy: {
    last: 50,
  },
});
 
// Get messages with context around specific messages
const { messages: contextMessages } = await memory.query({
  threadId: "thread-123",
  selectBy: {
    include: [
      {
        id: "msg-123", // Get just this message (no context)
      },
      {
        id: "msg-456", // Get this message with custom context
        withPreviousMessages: 3, // 3 messages before
        withNextMessages: 1, // 1 message after
      },
    ],
  },
});
 
// Semantic search in messages
const { messages } = await memory.query({
  threadId: "thread-123",
  selectBy: {
    vectorSearchString: "What was discussed about deployment?",
  },
  threadConfig: {
    semanticRecall: true,
  },
});
Parameters
threadId:
string
The unique identifier of the thread to retrieve messages from
resourceId?:
string
Optional ID of the resource that owns the thread. If provided, validates thread ownership
selectBy?:
object
Options for filtering and selecting messages
threadConfig?:
MemoryConfig
Configuration options for message retrieval and semantic search
selectBy
vectorSearchString?:
string
Search string for finding semantically similar messages. Requires semantic recall to be enabled in threadConfig.
last?:
number | false
= 40
Number of most recent messages to retrieve. Set to false to disable limit. Note: threadConfig.lastMessages (default: 40) will override this if smaller.
include?:
array
Array of specific message IDs to include with optional context messages
include
id:
string
ID of the message to include
threadId?:
string
Optional thread ID (defaults to the main threadId parameter)
withPreviousMessages?:
number
Number of messages to include before this message. Defaults to 2 when using vector search, 0 otherwise.
withNextMessages?:
number
Number of messages to include after this message. Defaults to 2 when using vector search, 0 otherwise.
Returns
messages:
CoreMessage[]
Array of retrieved messages in their core format (v1 format for backwards compatibility)
uiMessages:
UIMessage[]
Array of messages formatted for UI display, including proper threading of tool calls and results
messagesV2:
MastraMessageV2[]
Array of messages in the v2 format, the current internal message format
Additional Notes
The query function returns three different message formats:

messages: Core message format (v1) used for backwards compatibility with older APIs
uiMessages: Formatted messages suitable for UI display, including proper threading of tool calls and results
messagesV2: The current internal message format with enhanced structure and metadata
Semantic Search
When using vectorSearchString, ensure that:

Semantic recall is enabled in your threadConfig
A vector database is configured in your Memory instance
An embedding model is provided
The function will automatically include context messages around semantically similar results based on the configured messageRange.

Related

getThreadById Reference
The getThreadById function retrieves a specific thread by its ID from storage.

Usage Example
import { Memory } from "@mastra/core/memory";
 
const memory = new Memory(config);
 
const thread = await memory.getThreadById({ threadId: "thread-123" });
Parameters
threadId:
string
The ID of the thread to be retrieved.
Returns
StorageThreadType | null:
Promise
A promise that resolves to the thread associated with the given ID, or null if not found.

getThreadsByResourceId Reference
The getThreadsByResourceId function retrieves all threads associated with a specific resource ID from storage. Threads can be sorted by creation or modification time in ascending or descending order.

Usage Example
import { Memory } from "@mastra/core/memory";
 
const memory = new Memory(config);
 
// Basic usage - returns threads sorted by createdAt DESC (default)
const threads = await memory.getThreadsByResourceId({
  resourceId: "resource-123",
});
 
// Custom sorting by updatedAt in ascending order
const threadsByUpdate = await memory.getThreadsByResourceId({
  resourceId: "resource-123",
  orderBy: "updatedAt",
  sortDirection: "ASC",
});
Parameters
resourceId:
string
The ID of the resource whose threads are to be retrieved.
orderBy?:
ThreadOrderBy
Field to sort threads by. Accepts 'createdAt' or 'updatedAt'. Default: 'createdAt'
sortDirection?:
ThreadSortDirection
Sort order direction. Accepts 'ASC' or 'DESC'. Default: 'DESC'
Type Definitions
type ThreadOrderBy = 'createdAt' | 'updatedAt';
type ThreadSortDirection = 'ASC' | 'DESC';
 
interface ThreadSortOptions {
  orderBy?: ThreadOrderBy;
  sortDirection?: ThreadSortDirection;
}
Returns
StorageThreadType[]:
Promise
A promise that resolves to an array of threads associated with the given resource ID.

getThreadsByResourceIdPaginated Reference
The getThreadsByResourceIdPaginated function retrieves threads associated with a specific resource ID with pagination support. This method addresses performance and memory usage concerns when dealing with large numbers of threads by returning results in manageable chunks with metadata for navigation.

Usage Example
import { Memory } from "@mastra/core/memory";
 
const memory = new Memory(config);
 
// Basic usage with default parameters
const result = await memory.getThreadsByResourceIdPaginated({
  resourceId: "resource-123",
  page: 0,
  perPage: 100,
});
 
console.log(result.threads);
console.log(result.total);
console.log(result.hasMore);
 
// Custom pagination with sorting
const customResult = await memory.getThreadsByResourceIdPaginated({
  resourceId: "resource-123",
  page: 2,
  perPage: 50,
  orderBy: "updatedAt",
  sortDirection: "ASC",
});
 
// Process paginated results
let currentPage = 0;
let hasMorePages = true;
 
while (hasMorePages) {
  const pageResult = await memory.getThreadsByResourceIdPaginated({
    resourceId: "user-456",
    page: currentPage,
    perPage: 25,
    orderBy: "createdAt",
    sortDirection: "DESC",
  });
  
  // Process threads
  pageResult.threads.forEach(thread => {
    console.log(`Thread: ${thread.id}, Created: ${thread.createdAt}`);
  });
  
  hasMorePages = pageResult.hasMore;
  currentPage++;
}
Parameters
resourceId:
string
The ID of the resource whose threads are to be retrieved.
page:
number
Page number to retrieve. Must be a positive integer.
perPage:
number
Number of threads to return per page. Must be a positive integer.
orderBy?:
ThreadOrderBy
Field to sort threads by. Accepts 'createdAt' or 'updatedAt'. Default: 'createdAt'
sortDirection?:
ThreadSortDirection
Sort order direction. Accepts 'ASC' or 'DESC'. Default: 'DESC'
Type Definitions
type ThreadOrderBy = 'createdAt' | 'updatedAt';
type ThreadSortDirection = 'ASC' | 'DESC';
 
interface ThreadSortOptions {
  orderBy?: ThreadOrderBy;
  sortDirection?: ThreadSortDirection;
}
 
interface PaginationInfo {
  total: number;      // Total number of threads across all pages
  page: number;       // Current page number
  perPage: number;    // Number of threads per page
  hasMore: boolean;   // Whether additional pages exist
}
Returns
threads:
StorageThreadType[]
Array of threads for the current page, sorted according to the specified criteria.
total:
number
Total number of threads associated with the resource ID across all pages.
page:
number
Current page number.
perPage:
number
Number of threads returned per page as specified in the request.
hasMore:
boolean
Indicates whether additional pages of results are available.
Technical Notes
Performance Considerations
This method executes database-level pagination using LIMIT/OFFSET operations (or equivalent), which provides better performance and memory usage compared to retrieving all threads and paginating in application code.

Default Values
orderBy: Defaults to "createdAt"
sortDirection: Defaults to "DESC" (newest first)
Relationship to getThreadsByResourceId
The paginated version (getThreadsByResourceIdPaginated) complements the existing getThreadsByResourceId method:

Use getThreadsByResourceId when you need all threads for a resource
Use getThreadsByResourceIdPaginated when working with potentially large thread collections or implementing UI pagination
Both methods support the same sorting options for consistency.

Error Handling
try {
  const result = await memory.getThreadsByResourceIdPaginated({
    resourceId: "resource-123",
    page: 0,
    perPage: 100,
  });
  
  if (result.threads.length === 0) {
    console.log("No threads found for this resource");
  }
} catch (error) {
  console.error("Failed to retrieve paginated threads:", error);
}

deleteMessages
Deletes one or more messages from the memory storage. This method accepts arrays to delete multiple messages in a single operation.

Syntax
memory.deleteMessages(input: MessageDeleteInput): Promise<void>
 
type MessageDeleteInput = 
  | string[]                  // Array of message IDs
  | { id: string }[]         // Array of message objects
Parameters
input (required): An array of messages to delete. Must be either:
An array of message IDs (strings)
An array of message objects with id properties
Returns
A Promise that resolves when all messages have been successfully deleted.

Examples
Delete a single message
// Using an array with a single string ID
await memory.deleteMessages(['msg-123']);
 
// Using an array with a single message object
await memory.deleteMessages([{ id: 'msg-123' }]);
Delete multiple messages
// Using an array of string IDs
await memory.deleteMessages(['msg-1', 'msg-2', 'msg-3']);
 
// Using an array of message objects
await memory.deleteMessages([
  { id: 'msg-1' },
  { id: 'msg-2' },
  { id: 'msg-3' }
]);
Using with client SDK
// Get a thread instance
const thread = client.getAgent('my-agent').getThread('thread-123');
 
// Delete a single message
await thread.deleteMessages(['msg-123']);
 
// Delete multiple messages
await thread.deleteMessages(['msg-1', 'msg-2', 'msg-3']);
 
// Delete using message objects (useful when you have message data)
const messagesToDelete = messages.map(msg => ({ id: msg.id }));
await thread.deleteMessages(messagesToDelete);
Error handling
try {
  await memory.deleteMessages(['msg-1', 'msg-2', 'msg-3']);
  console.log('Messages deleted successfully');
} catch (error) {
  console.error('Failed to delete messages:', error);
}
Notes
This method requires an array as input, even when deleting a single message
Thread timestamps are automatically updated when messages are deleted
The method automatically extracts message IDs from message objects
All message IDs must be non-empty strings
An empty array will result in no operation (no error thrown)
Messages from different threads can be deleted in the same operation
When using message objects, only the id property is required