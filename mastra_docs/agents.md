Using Agents
Agents let you build intelligent assistants powered by language models that can make decisions and perform actions. Each agent has required instructions and an LLM, with optional tools and memory.

An agent coordinates conversations, calls tools when needed, maintains context through memory, and produces responses tailored to the interaction. Agents can operate on their own or work as part of larger workflows.

Agents overview

To create an agent:

Define instructions with the Agent class and set the LLM it will use.
Optionally configure tools and memory to extend functionality.
Run the agent to generate responses, with support for streaming, structured output, and dynamic configuration.
This approach provides type safety and runtime validation, ensuring reliable behavior across all agent interactions.

📹 Watch: → An introduction to agents, and how they compare to workflows YouTube (7 minutes) 

Getting started
To use agents, install the required dependencies:

npm install @mastra/core @ai-sdk/openai
Mastra works with all AI SDK provider. See Model Providers for more information.

Import the necessary class from the agents module, and an LLM provider:

src/mastra/agents/test-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
LLM providers
Each LLM provider needs its own API key, named using the provider’s identifier:

.env

OPENAI_API_KEY=<your-api-key>
See the AI SDK Providers  in the Vercel AI SDK docs.

Creating an agent
To create an agent in Mastra, use the Agent class. Every agent must include instructions to define its behavior, and a model parameter to specify the LLM provider and model:

src/mastra/agents/test-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const testAgent = new Agent({
  name: "test-agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini")
});
See Agent for more information.

Registering an agent
Register your agent in the Mastra instance:

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { testAgent } from './agents/test-agent';
 
export const mastra = new Mastra({
  // ...
  agents: { testAgent },
});
Referencing an agent
You can call agents from workflow steps, tools, the Mastra Client, or the command line. Get a reference by calling .getAgent() on your mastra or mastraClient instance, depending on your setup:


const testAgent = mastra.getAgent("testAgent");
See Calling agents for more information.

Generating responses
Use .generate() to get a response from an agent. Pass a single string for simple prompts, an array of strings when providing multiple pieces of context, or an array of message objects with role and content for precise control over roles and conversational flows.

See .generate() for more information.

Generating text
Call .generate() with an array of message objects that include role and content:


const response = await testAgent.generate([
  { role: "user", content: "Help me organize my day" },
  { role: "user", content: "My day starts at 9am and finishes at 5.30pm" },
  { role: "user", content: "I take lunch between 12:30 and 13:30" },
  { role: "user", content: "I have meetings Monday to Friday between 10:30 and 11:30" }
]);
 
console.log(response.text);
Streaming responses
Use .stream() for real-time responses. Pass a single string for simple prompts, an array of strings when providing multiple pieces of context, or an array of message objects with role and content for precise control over roles and conversational flows.

See .stream() for more information.

Streaming text
Call .stream() with an array of message objects that include role and content:


const stream = await testAgent.stream([
  { role: "user", content: "Help me organize my day" },
  { role: "user", content: "My day starts at 9am and finishes at 5.30pm" },
  { role: "user", content: "I take lunch between 12:30 and 13:30" },
  { role: "user", content: "I have meetings Monday to Friday between 10:30 and 11:30" }
]);
 
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
Completion using onFinish()
When streaming responses, the onFinish() callback runs after the LLM finishes generating its response and all tool executions are complete. It provides the final text, execution steps, finishReason, token usage statistics, and other metadata useful for monitoring or logging.


const stream = await testAgent.stream("Help me organize my day", {
  onFinish: ({ steps, text, finishReason, usage }) => {
    console.log({ steps, text, finishReason, usage });
  }
});
 
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
Structured output
Agents can return structured, type-safe data by defining the expected output with either Zod  or JSON Schema . In both cases, the parsed result is available on response.object, allowing you to work directly with validated and typed data.

Using Zod
Define the output shape using Zod :


import { z } from "zod";
 
const response = await testAgent.generate("Monkey, Ice Cream, Boat", {
  experimental_output: z.object({
    summary: z.string(),
    keywords: z.array(z.string())
  })
});
 
console.log(response.object);
Using Tools
If you need to generate structured output alongside tool calls, you’ll need to use the experimental_output or structuredOutput property instead of output. Here’s how:


const response = await testAgent.generate("Monkey, Ice Cream, Boat", {
  experimental_output: z.object({
    summary: z.string(),
    keywords: z.array(z.string())
  })
});
 
const responseWithExperimentalOutput = await testAgent.generate(
  [
    {
      role: "user",
      content:
        "Please analyze this repository and provide a summary and keywords...",
    },
  ],
  {
    // Use experimental_output to enable both structured output and tool calls
    experimental_output: schema,
  },
);
 
console.log("Structured Output:", responseWithExperimentalOutput.object);
 
const responseWithStructuredOutput = await testAgent.generate(
  [
    {
      role: "user",
      content:
        "Please analyze this repository and provide a summary and keywords...",
    },
  ],
  {
    structuredOutput: {
      schema: z.object({
        summary: z.string(),
        keywords: z.array(z.string())
      }),
      model: openai("gpt-4o-mini"),
    }
  },
);
 
console.log("Structured Output:", responseWithStructuredOutput.object);
Describing images
Agents can analyze and describe images by processing both the visual content and any text within them. To enable image analysis, pass an object with type: 'image' and the image URL in the content array. You can combine image content with text prompts to guide the agent’s analysis.


const response = await testAgent.generate([
  {
    role: "user",
    content: [
      {
        type: "image",
        image: "https://placebear.com/cache/395-205.jpg",
        mimeType: "image/jpeg"
      },
      {
        type: "text",
        text: "Describe the image in detail, and extract all the text in the image."
      }
    ]
  }
]);
 
console.log(response.text);
Multi-step tool use
Agents can be enhanced with tools, functions that extend their capabilities beyond text generation. Tools allow agents to perform calculations, access external systems, and process data. Agents not only decide whether to call tools they’re given, they determine the parameters that should be given to that tool.

For a detailed guide to creating and configuring tools, see the Tools Overview page.

Using maxSteps
The maxSteps parameter controls the maximum number of sequential LLM calls an agent can make, particularly important when using tool calls. By default, it is set to 1 to prevent infinite loops in case of misconfigured tools:


const response = await testAgent.generate("Help me organize my day", {
  maxSteps: 5
});
 
console.log(response.text);
Using onStepFinish
You can monitor the progress of multi-step operations using the onStepFinish callback. This is useful for debugging or providing progress updates to users.

onStepFinish is only available when streaming or generating text without structured output.


const response = await testAgent.generate("Help me organize my day", {
  onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
    console.log({ text, toolCalls, toolResults, finishReason, usage });
  }
});
Testing agents locally
Use the mastra dev CLI command to run your agents behind a local API. By default, it loads exported agents from the src/mastra/agents directory and creates endpoints for testing (for example, http://localhost:4111/api/agents/myAgent/generate). It also launches a visual playground where you can chat with your agent and view execution traces.

For more information, see the Local Dev Playground documentation.

Agent Streaming (VNext)
Agents in Mastra support streaming responses for real-time interaction with clients. This enables progressive rendering of responses and better user experience.

Experimental API: The streamVNext method shown in this guide is an experimental feature with enhanced streaming format support. It will replace the current stream() method after additional testing and refinement. For production use, consider using the stable 
stream()
method until streamVNext is finalized.

Usage
The experimental streaming protocol uses the streamVNext method on an agent. This method now supports multiple output stream formats, for Mastra (default) and AI SDK v5.

Format Parameter
The format parameter determines the output stream type:

'mastra' (default): Returns MastraModelOutput - Mastra’s native streaming format
'aisdk': Returns AISDKV5OutputStream - Compatible with AI SDK v5 interfaces like useChat.
// Mastra format (default)
const mastraStream = await agent.streamVNext("Hello");
 
// AI SDK v5 format
const aiSdkStream = await agent.streamVNext("Hello", { 
  format: 'aisdk' 
});
Default Mastra Format
By default, streamVNext returns a MastraModelOutput stream:

const stream = await agent.streamVNext("Tell me a story.");
 
// Access the text stream
for await (const chunk of stream.textStream) {
  console.log(chunk);
}
 
// Or get the full text after streaming
const fullText = await stream.text;
AI SDK v5 Compatibility
For integration with AI SDK v5, use the format: 'aisdk' parameter to get an AISDKV5OutputStream:

const stream = await agent.streamVNext("Tell me a story.", {
  format: 'aisdk'
});
 
// The stream is now compatible with AI SDK v5 interfaces
for await (const chunk of stream.fullStream) {
  // Process AI SDK v5 formatted chunks
  console.log(chunk);
}
Stream Properties
Both stream formats provide access to various response properties:

stream.textStream - A readable stream that emits text chunks
stream.text - Promise that resolves to the full text response
stream.finishReason - The reason the agent stopped streaming
stream.usage - Token usage information
How to use the stream in a tool
Each tool gets a writer argument, which is a writable stream with a custom write function. This write function is used to write the tool’s response to the stream.

src/mastra/tools/test-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const weatherInfo = createTool({
  id: "Get Weather Information",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    conditions: z.string(),
    temperature: z.number(),
  }),
  description: `Fetches the current weather information for a given city`,
  execute: async ({ context: { city }, writer }) => {
    writer.write({
      type: "weather-data",
      args: {
        city
      },
      status: "pending"
    })
    // Tool logic here (e.g., API call)
    console.log("Using tool to fetch weather information for", city);
 
    writer.write({
      type: "weather-data",
      args: {
        city
      },
      status: "success",
      result: {
        temperature: 20,
        conditions: "Sunny"
      }
    })
 
    return { temperature: 20, conditions: "Sunny" }; // Example return
  },
});
To use streaming within an agent-based tool, call streamVNext on the agent and pipe it to the writer:

src/mastra/tools/test-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const weatherInfo = createTool({
  id: "Get Weather Information",
  description: `Fetches the current weather information for a given city`,
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async ({ context: { city }, writer, mastra }) => {
    const agent = mastra.getAgent('weatherAgent')
    const stream = await agent.streamVNext(`What is the weather in ${city}?`);
 
    await stream.pipeTo(writer);
 
    return {
      text: await stream.text,
    }
  },
});
Piping the stream to the writer enables automatic aggregation of token usage across nested agent calls.

Agent Memory
Agents in Mastra can leverage a powerful memory system to store conversation history, recall relevant information, and maintain persistent context across interactions. This allows agents to have more natural, stateful conversations.

Enabling Memory for an Agent
To enable memory, simply instantiate the Memory class and pass it to your agent’s configuration. You also need to install the memory package and a storage adapter:


npm install @mastra/memory@latest @mastra/libsql@latest
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { openai } from "@ai-sdk/openai";
 
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../../memory.db",
  }),
});
 
const agent = new Agent({
  name: "MyMemoryAgent",
  instructions: "You are a helpful assistant with memory.",
  model: openai("gpt-4o"),
  memory, // Attach the memory instance
});
This basic setup uses the default settings. Visit the Memory documentation for more configuration info.

Dynamic Memory Configuration
Similar to how you can configure dynamic instructions, models, and tools, you can also configure memory dynamically using runtime context. This allows you to:

Use different memory systems based on user tiers or preferences
Switch between memory configurations for different environments
Enable or disable memory features based on feature flags
Customize memory behavior based on user context
Example: User Tier-Based Memory
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";
 
// Create different memory instances for different user tiers
const premiumMemory = new Memory({
  storage: new LibSQLStore({ url: "file:premium.db" }),
  options: {
    semanticRecall: { topK: 10, messageRange: 5 }, // More context for premium users
    workingMemory: { enabled: true },
  },
});
 
const standardMemory = new Memory({
  storage: new LibSQLStore({ url: "file:standard.db" }),
  options: {
    semanticRecall: { topK: 3, messageRange: 2 }, // Basic recall for standard users
    workingMemory: { enabled: false },
  },
});
 
const agent = new Agent({
  name: "TieredMemoryAgent",
  instructions: "You are a helpful assistant with tiered memory capabilities.",
  model: openai("gpt-4o"),
  memory: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("userTier");
    return userTier === "premium" ? premiumMemory : standardMemory;
  },
});
Example: Environment-Based Memory
const agent = new Agent({
  name: "EnvironmentAwareAgent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o"),
  memory: ({ runtimeContext }) => {
    const environment = runtimeContext.get("environment");
    
    if (environment === "test") {
      // Use local storage for testing
      return new Memory({
        storage: new LibSQLStore({ url: ":memory:" }),
        options: {
          workingMemory: { enabled: true },
        },
      });
    } else if (environment === "production") {
      // Use production database
      return new Memory({
        storage: new PostgresStore({ connectionString: process.env.PRODUCTION_DB_URL }),
        options: {
          workingMemory: { enabled: true },
        },
      });
    }
    
    // Development environment
    return new Memory({
      storage: new LibSQLStore({ url: "file:dev.db" }),
    });
  },
});
Example: Async Memory Configuration
const agent = new Agent({
  name: "AsyncMemoryAgent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o"),
  memory: async ({ runtimeContext }) => {
    const userId = runtimeContext.get("userId");
    
    // Simulate async memory setup (e.g., database lookup)
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return new Memory({
      storage: new LibSQLStore({ 
        url: `file:user_${userId}.db` 
      }),
    });
  },
});
Using Dynamic Memory
When using dynamic memory, pass the runtime context to your agent calls:

import { RuntimeContext } from "@mastra/core/runtime-context";
 
// Create runtime context with user information
const runtimeContext = new RuntimeContext();
runtimeContext.set("userTier", "premium");
runtimeContext.set("environment", "production");
 
// Use the agent with runtime context
const response = await agent.generate("Remember my favorite color is blue.", {
  memory: {
    resource: "user_alice",
    thread: { id: "preferences_thread" },
  },
  runtimeContext, // Pass the runtime context
});
Using Memory in Agent Calls
To utilize memory during interactions, you must provide a memory object with resource and thread properties when calling the agent’s stream() or generate() methods.

resource: Typically identifies the user or entity (e.g., user_123).
thread: Identifies a specific conversation thread (e.g., support_chat_456).
// Example agent call using memory
await agent.stream("Remember my favorite color is blue.", {
  memory: {
    resource: "user_alice",
    thread: "preferences_thread",
  },
});
 
// Later in the same thread...
const response = await agent.stream("What's my favorite color?", {
  memory: {
    resource: "user_alice",
    thread: "preferences_thread",
  },
});
// Agent will use memory to recall the favorite color.
These IDs ensure that conversation history and context are correctly stored and retrieved for the appropriate user and conversation.

Next Steps
Keep exploring Mastra’s memory capabilities like threads, conversation history, semantic recall, and working memory.

Using Tools with Agents
Tools are typed functions that can be executed by agents or workflows. Each tool has a schema defining its inputs, an executor function implementing its logic, and optional access to configured integrations.

Mastra supports two patterns for providing tools to agents:

Direct assignment: Static tools available at initialization
Function-based: Dynamic tools resolved based on runtime context
Creating Tools
Here’s a basic example of creating a tool:

src/mastra/tools/weatherInfo.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const weatherInfo = createTool({
  id: "Get Weather Information",
  inputSchema: z.object({
    city: z.string(),
  }),
  description: `Fetches the current weather information for a given city`,
  execute: async ({ context: { city } }) => {
    // Tool logic here (e.g., API call)
    console.log("Using tool to fetch weather information for", city);
    return { temperature: 20, conditions: "Sunny" }; // Example return
  },
});
For details on creating and designing tools, see the Tools Overview.

Adding Tools to an Agent
To make a tool available to an agent, add it to the tools property in the agent’s configuration.

src/mastra/agents/weatherAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { weatherInfo } from "../tools/weatherInfo";
 
export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are a helpful assistant that provides current weather information. When asked about the weather, use the weather information tool to fetch the data.",
  model: openai("gpt-4o-mini"),
  tools: {
    weatherInfo,
  },
});
When you call the agent, it can now decide to use the configured tool based on its instructions and the user’s prompt.

Adding MCP Tools to an Agent
Model Context Protocol (MCP)  provides a standardized way for AI models to discover and interact with external tools and resources. You can connect your Mastra agent to MCP servers to use tools provided by third parties.

For more details on MCP concepts and how to set up MCP clients and servers, see the MCP Overview.

Installation
First, install the Mastra MCP package:


npm install @mastra/mcp@latest
Using MCP Tools
Because there are so many MCP server registries to choose from, we’ve created an MCP Registry Registry  to help you find MCP servers.

Once you have a server you want to use with your agent, import the Mastra MCPClient and add the server configuration.

src/mastra/mcp.ts
import { MCPClient } from "@mastra/mcp";
 
// Configure MCPClient to connect to your server(s)
export const mcp = new MCPClient({
  servers: {
    filesystem: {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Downloads",
      ],
    },
  },
});
Then connect your agent to the server tools:

src/mastra/agents/mcpAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { mcp } from "../mcp";
 
// Create an agent and add tools from the MCP client
const agent = new Agent({
  name: "Agent with MCP Tools",
  instructions: "You can use tools from connected MCP servers.",
  model: openai("gpt-4o-mini"),
  tools: await mcp.getTools(),
});
When creating agents that will consume an MCP server in the same repo they need to connect to, always use function based tools to prevent race conditions.

src/mastra/agents/selfReferencingAgent.ts
import { Agent } from "@mastra/core/agent";
import { MCPServer } from "@mastra/mcp";
import { MCPClient } from "@mastra/mcp";
import { openai } from "@ai-sdk/openai";
 
const myAgent = new Agent({
  name: "My Agent",
  description: "An agent that can use tools from an http MCP server", 
  instructions: "You can use remote calculation tools.",
  model: openai("gpt-4o-mini"),
  tools: async () => {
    // Tools resolve when needed, not during initialization
    const mcpClient = new MCPClient({
      servers: {
        myServer: {
          url: new URL("http://localhost:4111/api/mcp/mcpServer/mcp"),
        },
      },
    });
    return await mcpClient.getTools();
  },
});
 
// This works because tools resolve after server startup
export const mcpServer = new MCPServer({
  name: "My MCP Server",
  agents: {
    myAgent
  },
});
For more details on configuring MCPClient and the difference between static and dynamic MCP server configurations, see the MCP Overview.

Accessing MCP Resources
In addition to tools, MCP servers can also expose resources - data or content that can be retrieved and used in your application.

src/mastra/resources.ts
import { mcp } from "./mcp";
 
// Get resources from all connected MCP servers
const resources = await mcp.getResources();
 
// Access resources from a specific server
if (resources.filesystem) {
  const resource = resources.filesystem.find(
    (r) => r.uri === "filesystem://Downloads",
  );
  console.log(`Resource: ${resource?.name}`);
}
Each resource has a URI, name, description, and MIME type. The getResources() method handles errors gracefully - if a server fails or doesn’t support resources, it will be omitted from the results.

Accessing MCP Prompts
MCP servers can also expose prompts, which represent structured message templates or conversational context for agents.

Listing Prompts
src/mastra/prompts.ts
import { mcp } from "./mcp";
 
// Get prompts from all connected MCP servers
const prompts = await mcp.prompts.list();
 
// Access prompts from a specific server
if (prompts.weather) {
  const prompt = prompts.weather.find(
    (p) => p.name === "current"
  );
  console.log(`Prompt: ${prompt?.name}`);
}
Each prompt has a name, description, and (optional) version.

Retrieving a Prompt and Its Messages
src/mastra/prompts.ts
const { prompt, messages } = await mcp.prompts.get({ serverName: "weather", name: "current" });
console.log(prompt);    // { name: "current", version: "v1", ... }
console.log(messages);  // [ { role: "assistant", content: { type: "text", text: "..." } }, ... ]
Exposing Agents as Tools via MCPServer
In addition to using tools from MCP servers, your Mastra Agents themselves can be exposed as tools to any MCP-compatible client using Mastra’s MCPServer.

When an Agent instance is provided to an MCPServer configuration:

It is automatically converted into a callable tool.
The tool is named ask_<agentKey>, where <agentKey> is the identifier you used when adding the agent to the MCPServer’s agents configuration.
The agent’s description property (which must be a non-empty string) is used to generate the tool’s description.
This allows other AI models or MCP clients to interact with your Mastra Agents as if they were standard tools, typically by “asking” them a question.

Example MCPServer Configuration with an Agent:

src/mastra/mcp.ts
import { Agent } from "@mastra/core/agent";
import { MCPServer } from "@mastra/mcp";
import { openai } from "@ai-sdk/openai";
import { weatherInfo } from "../tools/weatherInfo";
import { generalHelper } from "../agents/generalHelper";
 
const server = new MCPServer({
  name: "My Custom Server with Agent-Tool",
  version: "1.0.0",
  tools: {
    weatherInfo,
  },
  agents: { generalHelper }, // Exposes 'ask_generalHelper' tool
});
For an agent to be successfully converted into a tool by MCPServer, its description property must be set to a non-empty string in its constructor configuration. If the description is missing or empty, MCPServer will throw an error during initialization.

For more details on setting up and configuring MCPServer, refer to the MCPServer reference documentation.

Input Processors
Input Processors allow you to intercept, modify, validate, or filter messages before they are sent to the language model. This is useful for implementing guardrails, content moderation, message transformation, and security controls.

Processors operate on the messages in your conversation thread. They can modify, filter, or validate content, and even abort the request entirely if certain conditions are met.

Built-in Processors
Mastra provides several built-in processors for common use cases:

UnicodeNormalizer
This processor normalizes Unicode text to ensure consistent formatting and remove potentially problematic characters.


import { Agent } from "@mastra/core/agent";
import { UnicodeNormalizer } from "@mastra/core/processors";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  name: 'normalized-agent',
  instructions: 'You are a helpful assistant',
  model: openai("gpt-4o"),
  inputProcessors: [
    new UnicodeNormalizer({
      stripControlChars: true,
      collapseWhitespace: true,
    }),
  ],
});
Available options:

stripControlChars: Remove control characters (default: false)
preserveEmojis: Keep emojis intact (default: true)
collapseWhitespace: Collapse multiple spaces/newlines (default: true)
trim: Remove leading/trailing whitespace (default: true)
ModerationProcessor
This processor provides content moderation using an LLM to detect inappropriate content across multiple categories.


import { ModerationProcessor } from "@mastra/core/processors";
 
const agent = new Agent({
  inputProcessors: [
    new ModerationProcessor({
      model: openai("gpt-4.1-nano"), // Use a fast, cost-effective model
      threshold: 0.7, // Confidence threshold for flagging
      strategy: 'block', // Block flagged content
      categories: ['hate', 'harassment', 'violence'], // Custom categories
    }),
  ],
});
Available options:

model: Language model for moderation analysis (required)
categories: Array of categories to check (default: [‘hate’,‘hate/threatening’,‘harassment’,‘harassment/threatening’,‘self-harm’,‘self-harm/intent’,‘self-harm/instructions’,‘sexual’,‘sexual/minors’,‘violence’,‘violence/graphic’])
threshold: Confidence threshold for flagging (0-1, default: 0.5)
strategy: Action when content is flagged (default: ‘block’)
customInstructions: Custom instructions for the moderation agent
Strategies available:

block: Reject the request with an error (default)
warn: Log warning but allow content through
filter: Remove flagged messages but continue processing
PromptInjectionDetector
This processor detects and prevents prompt injection attacks, jailbreaks, and system manipulation attempts.


import { PromptInjectionDetector } from "@mastra/core/processors";
 
const agent = new Agent({
  inputProcessors: [
    new PromptInjectionDetector({
      model: openai("gpt-4.1-nano"),
      threshold: 0.8, // Higher threshold for fewer false positives
      strategy: 'rewrite', // Attempt to neutralize while preserving intent
      detectionTypes: ['injection', 'jailbreak', 'system-override'],
    }),
  ],
});
Available options:

model: Language model for injection detection (required)
detectionTypes: Array of injection types to detect (default: [‘injection’, ‘jailbreak’, ‘system-override’])
threshold: Confidence threshold for flagging (0-1, default: 0.7)
strategy: Action when injection is detected (default: ‘block’)
instructions: Custom detection instructions for the agent
includeScores: Whether to include confidence scores in logs (default: false)
Strategies available:

block: Reject the request (default)
warn: Log warning but allow through
filter: Remove flagged messages
rewrite: Attempt to neutralize the injection while preserving legitimate intent
PIIDetector
This processor detects and optionally redacts personally identifiable information (PII) from messages.


import { PIIDetector } from "@mastra/core/processors";
 
const agent = new Agent({
  inputProcessors: [
    new PIIDetector({
      model: openai("gpt-4.1-nano"),
      threshold: 0.6,
      strategy: 'redact', // Automatically redact detected PII
      detectionTypes: ['email', 'phone', 'credit-card', 'ssn', 'api-key', 'crypto-wallet', 'iban'],
      redactionMethod: 'mask', // Preserve format while masking
      preserveFormat: true, // Keep original structure in redacted values
      includeDetections: true, // Log details for compliance auditing
    }),
  ],
});
Available options:

model: Language model for PII detection (required)
detectionTypes: Array of PII types to detect (default: [‘email’, ‘phone’, ‘credit-card’, ‘ssn’, ‘api-key’, ‘ip-address’, ‘name’, ‘address’, ‘date-of-birth’, ‘url’, ‘uuid’, ‘crypto-wallet’, ‘iban’])
threshold: Confidence threshold for flagging (0-1, default: 0.6)
strategy: Action when PII is detected (default: ‘block’)
redactionMethod: How to redact PII (‘mask’, ‘hash’, ‘remove’, ‘placeholder’, default: ‘mask’)
preserveFormat: Maintain PII structure during redaction (default: true)
includeDetections: Include detection details in logs for compliance (default: false)
instructions: Custom detection instructions for the agent
Strategies available:

block: Reject requests containing PII (default)
warn: Log warning but allow through
filter: Remove messages containing PII
redact: Replace PII with placeholder values
LanguageDetector
This processor detects the language of incoming messages and can automatically translate them to a target language.


import { LanguageDetector } from "@mastra/core/processors";
 
const agent = new Agent({
  inputProcessors: [
    new LanguageDetector({
      model: openai("gpt-4o-mini"),
      targetLanguages: ['English', 'en'], // Accept English content
      strategy: 'translate', // Auto-translate non-English content
      threshold: 0.8, // High confidence threshold
    }),
  ],
});
Available options:

model: Language model for detection and translation (required)
targetLanguages: Array of target languages (language names or ISO codes)
threshold: Confidence threshold for language detection (0-1, default: 0.7)
strategy: Action when non-target language is detected (default: ‘detect’)
preserveOriginal: Keep original content in metadata (default: true)
instructions: Custom detection instructions for the agent
Strategies available:

detect: Only detect language, don’t translate (default)
translate: Automatically translate to target language
block: Reject content not in target language
warn: Log warning but allow content through
Applying Multiple Processors
You can chain multiple processors. They execute sequentially in the order they appear in the inputProcessors array. The output of one processor becomes the input for the next.

Order matters! Generally, it’s best practice to place text normalization first, security checks next, and content modification last.


import { Agent } from "@mastra/core/agent";
import { 
  UnicodeNormalizer, 
  ModerationProcessor, 
  PromptInjectionDetector,
  PIIDetector 
} from "@mastra/core/processors";
 
const secureAgent = new Agent({
  inputProcessors: [
    // 1. Normalize text first
    new UnicodeNormalizer({ stripControlChars: true }),
    // 2. Check for security threats
    new PromptInjectionDetector({ model: openai("gpt-4.1-nano") }),
    // 3. Moderate content
    new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
    // 4. Handle PII last
    new PIIDetector({ model: openai("gpt-4.1-nano"), strategy: 'redact' }),
  ],
});
Creating Custom Processors
You can create custom processors by implementing the Processor interface. A Processor can be used for input processing when it implements the processInput method.


import type { Processor, MastraMessageV2, TripWire } from "@mastra/core/processors";
 
class MessageLengthLimiter implements Processor {
  readonly name = 'message-length-limiter';
  
  constructor(private maxLength: number = 1000) {}
 
  processInput({ messages, abort }: { 
    messages: MastraMessageV2[]; 
    abort: (reason?: string) => never 
  }): MastraMessageV2[] {
    // Check total message length
    try {
      const totalLength = messages.reduce((sum, msg) => {
        return sum + msg.content.parts
          .filter(part => part.type === 'text')
          .reduce((partSum, part) => partSum + (part as any).text.length, 0);
      }, 0);
      
      if (totalLength > this.maxLength) {
        abort(`Message too long: ${totalLength} characters (max: ${this.maxLength})`); // throws a TripWire error
      }
    } catch (error) {
      if (error instanceof TripWire) {
        throw error; // Re-throw tripwire errors
      }
      throw new Error(`Length validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`); // application level throw a standard error
    }
    
    return messages;
  }
}
 
// Use the custom processor
const agent = new Agent({
  inputProcessors: [
    new MessageLengthLimiter(2000), // Limit to 2000 characters
  ],
});
When creating custom processors:

Always return the messages array (potentially modified)
Use abort(reason) to terminate processing early. Abort is used to simulate blocking a message. errors thrown with abort will be an instance of TripWire. For code/application level errors, throw standard errors.
Mutate the input messages directly, make sure to mutate both the parts and content of a message.
Keep processors focused on a single responsibility
If using an agent inside your processor, use a fast model, limit the size of the response from it as much as possible (every token slows down the response exponentially), and make the system prompt as concise as possible, these are both latency bottlenecks.
Integration with Agent Methods
Input processors work with the generate(), stream(), and streamVNext() methods. The entire processor pipeline completes before the agent begins generating or streaming a response.


// Processors run before generate()
const result = await agent.generate('Hello');
 
// Processors also run before streamVNext()
const stream = await agent.streamVNext('Hello');
for await (const chunk of stream) {
  console.log(chunk);
}
If any processor calls abort(), the request terminates immediately and subsequent processors are not executed. The agent returns a 200 response with details (result.tripwireReason) about why the request was blocked.

Output Processors
While input processors handle user messages before they reach the language model, output processors handle the LLM’s responses after generation but before they’re returned to the user. This is useful for response validation, content filtering, and safety controls on LLM-generated content.

See the Output Processors documentation for details on processing LLM responses.

Adding Voice to Agents
Mastra agents can be enhanced with voice capabilities, allowing them to speak responses and listen to user input. You can configure an agent to use either a single voice provider or combine multiple providers for different operations.

Using a Single Provider
The simplest way to add voice to an agent is to use a single provider for both speaking and listening:

import { createReadStream } from "fs";
import path from "path";
import { Agent } from "@mastra/core/agent";
import { OpenAIVoice } from "@mastra/voice-openai";
import { openai } from "@ai-sdk/openai";
 
// Initialize the voice provider with default settings
const voice = new OpenAIVoice();
 
// Create an agent with voice capabilities
export const agent = new Agent({
  name: "Agent",
  instructions: `You are a helpful assistant with both STT and TTS capabilities.`,
  model: openai("gpt-4o"),
  voice,
});
 
// The agent can now use voice for interaction
const audioStream = await agent.voice.speak("Hello, I'm your AI assistant!", {
  filetype: "m4a",
});
 
playAudio(audioStream!);
 
try {
  const transcription = await agent.voice.listen(audioStream);
  console.log(transcription);
} catch (error) {
  console.error("Error transcribing audio:", error);
}
Using Multiple Providers
For more flexibility, you can use different providers for speaking and listening using the CompositeVoice class:

import { Agent } from "@mastra/core/agent";
import { CompositeVoice } from "@mastra/core/voice";
import { OpenAIVoice } from "@mastra/voice-openai";
import { PlayAIVoice } from "@mastra/voice-playai";
import { openai } from "@ai-sdk/openai";
 
export const agent = new Agent({
  name: "Agent",
  instructions: `You are a helpful assistant with both STT and TTS capabilities.`,
  model: openai("gpt-4o"),
 
  // Create a composite voice using OpenAI for listening and PlayAI for speaking
  voice: new CompositeVoice({
    input: new OpenAIVoice(),
    output: new PlayAIVoice(),
  }),
});
Working with Audio Streams
The speak() and listen() methods work with Node.js streams. Here’s how to save and load audio files:

Saving Speech Output
The speak method returns a stream that you can pipe to a file or speaker.

import { createWriteStream } from "fs";
import path from "path";
 
// Generate speech and save to file
const audio = await agent.voice.speak("Hello, World!");
const filePath = path.join(process.cwd(), "agent.mp3");
const writer = createWriteStream(filePath);
 
audio.pipe(writer);
 
await new Promise<void>((resolve, reject) => {
  writer.on("finish", () => resolve());
  writer.on("error", reject);
});
Transcribing Audio Input
The listen method expects a stream of audio data from a microphone or file.

import { createReadStream } from "fs";
import path from "path";
 
// Read audio file and transcribe
const audioFilePath = path.join(process.cwd(), "/agent.m4a");
const audioStream = createReadStream(audioFilePath);
 
try {
  console.log("Transcribing audio file...");
  const transcription = await agent.voice.listen(audioStream, {
    filetype: "m4a",
  });
  console.log("Transcription:", transcription);
} catch (error) {
  console.error("Error transcribing audio:", error);
}
Speech-to-Speech Voice Interactions
For more dynamic and interactive voice experiences, you can use real-time voice providers that support speech-to-speech capabilities:

import { Agent } from "@mastra/core/agent";
import { getMicrophoneStream } from "@mastra/node-audio";
import { OpenAIRealtimeVoice } from "@mastra/voice-openai-realtime";
import { search, calculate } from "../tools";
 
// Initialize the realtime voice provider
const voice = new OpenAIRealtimeVoice({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini-realtime",
  speaker: "alloy",
});
 
// Create an agent with speech-to-speech voice capabilities
export const agent = new Agent({
  name: "Agent",
  instructions: `You are a helpful assistant with speech-to-speech capabilities.`,
  model: openai("gpt-4o"),
  tools: {
    // Tools configured on Agent are passed to voice provider
    search,
    calculate,
  },
  voice,
});
 
// Establish a WebSocket connection
await agent.voice.connect();
 
// Start a conversation
agent.voice.speak("Hello, I'm your AI assistant!");
 
// Stream audio from a microphone
const microphoneStream = getMicrophoneStream();
agent.voice.send(microphoneStream);
 
// When done with the conversation
agent.voice.close();
Event System
The realtime voice provider emits several events you can listen for:

// Listen for speech audio data sent from voice provider
agent.voice.on("speaking", ({ audio }) => {
  // audio contains ReadableStream or Int16Array audio data
});
 
// Listen for transcribed text sent from both voice provider and user
agent.voice.on("writing", ({ text, role }) => {
  console.log(`${role} said: ${text}`);
});
 
// Listen for errors
agent.voice.on("error", (error) => {
  console.error("Voice error:", error);
});

OpenAI Realtime	@mastra/voice-openai-realtime	Realtime speech-to-speech

OpenAI
The OpenAIVoice class in Mastra provides text-to-speech and speech-to-text capabilities using OpenAI’s models.

Usage Example
import { OpenAIVoice } from "@mastra/voice-openai";
 
// Initialize with default configuration using environment variables
const voice = new OpenAIVoice();
 
// Or initialize with specific configuration
const voiceWithConfig = new OpenAIVoice({
  speechModel: {
    name: "tts-1-hd",
    apiKey: "your-openai-api-key",
  },
  listeningModel: {
    name: "whisper-1",
    apiKey: "your-openai-api-key",
  },
  speaker: "alloy", // Default voice
});
 
// Convert text to speech
const audioStream = await voice.speak("Hello, how can I help you?", {
  speaker: "nova", // Override default voice
  speed: 1.2, // Adjust speech speed
});
 
// Convert speech to text
const text = await voice.listen(audioStream, {
  filetype: "mp3",
});
Configuration
Constructor Options
speechModel?:
OpenAIConfig
= { name: 'tts-1' }
Configuration for text-to-speech synthesis.
listeningModel?:
OpenAIConfig
= { name: 'whisper-1' }
Configuration for speech-to-text recognition.
speaker?:
OpenAIVoiceId
= 'alloy'
Default voice ID for speech synthesis.
OpenAIConfig
name?:
'tts-1' | 'tts-1-hd' | 'whisper-1'
Model name. Use 'tts-1-hd' for higher quality audio.
apiKey?:
string
OpenAI API key. Falls back to OPENAI_API_KEY environment variable.
Methods
speak()
Converts text to speech using OpenAI’s text-to-speech models.

input:
string | NodeJS.ReadableStream
Text or text stream to convert to speech.
options.speaker?:
OpenAIVoiceId
= Constructor's speaker value
Voice ID to use for speech synthesis.
options.speed?:
number
= 1.0
Speech speed multiplier.
Returns: Promise<NodeJS.ReadableStream>

listen()
Transcribes audio using OpenAI’s Whisper model.

audioStream:
NodeJS.ReadableStream
Audio stream to transcribe.
options.filetype?:
string
= 'mp3'
Audio format of the input stream.
Returns: Promise<string>

getSpeakers()
Returns an array of available voice options, where each node contains:

voiceId:
string
Unique identifier for the voice
Notes
API keys can be provided via constructor options or the OPENAI_API_KEY environment variable
The tts-1-hd model provides higher quality audio but may have slower processing times
Speech recognition supports multiple audio formats including mp3, wav, and webm

Agent Runtime Context
Mastra provides runtime context, which is a system based on dependency injection that enables you to configure your agents and tools with runtime variables. If you find yourself creating several different agents that do very similar things, runtime context allows you to combine them into one agent.

Overview
The dependency injection system allows you to:

Pass runtime configuration variables to agents through a type-safe runtimeContext
Access these variables within tool execution contexts
Modify agent behavior without changing the underlying code
Share configuration across multiple tools within the same agent
Basic Usage
const agent = mastra.getAgent("weatherAgent");
 
// Define your runtimeContext's type structure
type WeatherRuntimeContext = {
  "temperature-scale": "celsius" | "fahrenheit";
};
 
const runtimeContext = new RuntimeContext<WeatherRuntimeContext>();
runtimeContext.set("temperature-scale", "celsius");
 
const response = await agent.generate("What's the weather like today?", {
  runtimeContext,
});
 
console.log(response.text);
Using with REST API
Here’s how to dynamically set temperature units based on a user’s location using the Cloudflare CF-IPCountry header:

src/index.ts
import { Mastra } from "@mastra/core";
import { RuntimeContext } from "@mastra/core/di";
import { agent as weatherAgent } from "./agents/weather";
 
// Define RuntimeContext type with clear, descriptive types
type WeatherRuntimeContext = {
  "temperature-scale": "celsius" | "fahrenheit";
};
 
export const mastra = new Mastra({
  agents: {
    weather: weatherAgent,
  },
  server: {
    middleware: [
      async (c, next) => {
        const country = c.req.header("CF-IPCountry");
        const runtimeContext = c.get<WeatherRuntimeContext>("runtimeContext");
 
        // Set temperature scale based on country
        runtimeContext.set(
          "temperature-scale",
          country === "US" ? "fahrenheit" : "celsius",
        );
 
        await next(); // Don't forget to call next()
      },
    ],
  },
});
Creating Tools with Variables
Tools can access runtimeContext variables and must conform to the agent’s runtimeContext type:

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const weatherTool = createTool({
  id: "getWeather",
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  execute: async ({ context, runtimeContext }) => {
    // Type-safe access to runtimeContext variables
    const temperatureUnit = runtimeContext.get("temperature-scale");
 
    const weather = await fetchWeather(context.location, {
      temperatureUnit,
    });
 
    return { result: weather };
  },
});
 
async function fetchWeather(
  location: string,
  { temperatureUnit }: { temperatureUnit: "celsius" | "fahrenheit" },
): Promise<WeatherResponse> {
  // Implementation of weather API call
  const response = await weatherApi.fetch(location, temperatureUnit);
 
  return {
    location,
    temperature: "72°F",
    conditions: "Sunny",
    unit: temperatureUnit,
  };
}

Dynamic Agents
Dynamic agents use runtime context, like user IDs and other important parameters, to adjust their settings in real-time.

This means they can change the model they use, update their instructions, select different tools, and configure memory as needed.

By using this context, agents can better respond to each user’s needs. They can also call any API to gather more information, which helps improve what the agents can do.

Example Configuration
Here’s an example of a dynamic support agent that adjusts its behavior based on the user’s subscription tier and language preferences:

const supportAgent = new Agent({
  name: "Dynamic Support Agent",
 
  instructions: async ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");
    const language = runtimeContext.get("language");
 
    return `You are a customer support agent for our SaaS platform.
    The current user is on the ${userTier} tier and prefers ${language} language.
    
    For ${userTier} tier users:
    ${userTier === "free" ? "- Provide basic support and documentation links" : ""}
    ${userTier === "pro" ? "- Offer detailed technical support and best practices" : ""}
    ${userTier === "enterprise" ? "- Provide priority support with custom solutions" : ""}
    
    Always respond in ${language} language.`;
  },
 
  model: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");
    return userTier === "enterprise"
      ? openai("gpt-4")
      : openai("gpt-3.5-turbo");
  },
 
  tools: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");
    const baseTools = [knowledgeBase, ticketSystem];
 
    if (userTier === "pro" || userTier === "enterprise") {
      baseTools.push(advancedAnalytics);
    }
 
    if (userTier === "enterprise") {
      baseTools.push(customIntegration);
    }
 
    return baseTools;
  },
 
  memory: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");
    
    if (userTier === "enterprise") {
      return new Memory({
        storage: new LibSQLStore({ url: "file:enterprise.db" }),
        options: {
          semanticRecall: { topK: 15, messageRange: 8 },
          workingMemory: { enabled: true },
        },
      });
    } else if (userTier === "pro") {
      return new Memory({
        storage: new LibSQLStore({ url: "file:pro.db" }),
        options: {
          semanticRecall: { topK: 8, messageRange: 4 },
          workingMemory: { enabled: true },
        },
      });
    }
    
    // Basic memory for free tier
    return new Memory({
      storage: new LibSQLStore({ url: "file:free.db" }),
      options: {
        semanticRecall: { topK: 3, messageRange: 2 },
        workingMemory: { enabled: false },
      },
    });
  },
});
In this example, the agent:

Adjusts its instructions based on the user’s subscription tier (free, pro, or enterprise)
Uses a more powerful model (GPT-4) for enterprise users
Provides different sets of tools based on the user’s tier
Configures memory with different capabilities based on the user’s tier
Responds in the user’s preferred language
This demonstrates how a single agent can handle different types of users and scenarios by leveraging runtime context, making it more flexible and maintainable than creating separate agents for each use case.

For a complete implementation example including API routes, middleware setup, and runtime context handling, see our Dynamic Agents Example.

Runtime Context
Output Pro

Output Processors
Output Processors allow you to intercept, modify, validate, or filter AI responses after they are generated by the language model but before they are returned to users. This is useful for implementing response validation, content moderation, response transformation, and safety controls on AI-generated content.

Processors operate on the AI’s response messages in your conversation thread. They can modify, filter, or validate content, and even abort the response entirely if certain conditions are met.

Built-in Processors
Mastra provides several built-in output processors for common use cases:

ModerationProcessor
This processor provides content moderation using an LLM to detect inappropriate content across multiple categories.


import { ModerationProcessor } from "@mastra/core/processors";
 
const agent = new Agent({
  outputProcessors: [
    new ModerationProcessor({
      model: openai("gpt-4.1-nano"), // Use a fast, cost-effective model
      threshold: 0.7, // Confidence threshold for flagging
      strategy: 'block', // Block flagged content
      categories: ['hate', 'harassment', 'violence'], // Custom categories
    }),
  ],
});
Available options:

model: Language model for moderation analysis (required)
categories: Array of categories to check (default: [‘hate’,‘hate/threatening’,‘harassment’,‘harassment/threatening’,‘self-harm’,‘self-harm/intent’,‘self-harm/instructions’,‘sexual’,‘sexual/minors’,‘violence’,‘violence/graphic’])
threshold: Confidence threshold for flagging (0-1, default: 0.5)
strategy: Action when content is flagged (default: ‘block’)
customInstructions: Custom instructions for the moderation agent
Strategies available:

block: Reject the response with an error (default)
warn: Log warning but allow content through
filter: Remove flagged messages but continue processing
PIIDetector
This processor detects and optionally redacts personally identifiable information (PII) from AI responses.


import { PIIDetector } from "@mastra/core/processors";
 
const agent = new Agent({
  outputProcessors: [
    new PIIDetector({
      model: openai("gpt-4.1-nano"),
      threshold: 0.6,
      strategy: 'redact', // Automatically redact detected PII
      detectionTypes: ['email', 'phone', 'credit-card', 'ssn', 'api-key', 'crypto-wallet', 'iban'],
      redactionMethod: 'mask', // Preserve format while masking
      preserveFormat: true, // Keep original structure in redacted values
      includeDetections: true, // Log details for compliance auditing
    }),
  ],
});
Available options:

model: Language model for PII detection (required)
detectionTypes: Array of PII types to detect (default: [‘email’, ‘phone’, ‘credit-card’, ‘ssn’, ‘api-key’, ‘ip-address’, ‘name’, ‘address’, ‘date-of-birth’, ‘url’, ‘uuid’, ‘crypto-wallet’, ‘iban’])
threshold: Confidence threshold for flagging (0-1, default: 0.6)
strategy: Action when PII is detected (default: ‘block’)
redactionMethod: How to redact PII (‘mask’, ‘hash’, ‘remove’, ‘placeholder’, default: ‘mask’)
preserveFormat: Maintain PII structure during redaction (default: true)
includeDetections: Include detection details in logs for compliance (default: false)
instructions: Custom detection instructions for the agent
Strategies available:

block: Reject responses containing PII (default)
warn: Log warning but allow through
filter: Remove messages containing PII
redact: Replace PII with placeholder values
BatchPartsProcessor
This processor batches multiple stream parts together to reduce the frequency of emissions, useful for reducing network overhead or improving user experience.


import { BatchPartsProcessor } from "@mastra/core/processors";
 
const agent = new Agent({
  outputProcessors: [
    new BatchPartsProcessor({
      maxBatchSize: 5, // Maximum parts to batch together
      maxWaitTime: 100, // Maximum time to wait before emitting (ms)
      emitOnNonText: true, // Emit immediately on non-text parts
    }),
  ],
});
Available options:

maxBatchSize: Maximum number of parts to batch together (default: 3)
maxWaitTime: Maximum time to wait before emitting batch (ms, default: 50)
emitOnNonText: Whether to emit immediately when non-text parts are received (default: true)
TokenLimiterProcessor
This processor limits the number of tokens in AI responses, either by truncating or aborting when limits are exceeded.


import { TokenLimiterProcessor } from "@mastra/core/processors";
 
const agent = new Agent({
  outputProcessors: [
    new TokenLimiterProcessor({
      maxTokens: 1000, // Maximum tokens allowed
      strategy: 'truncate', // Truncate when limit exceeded
      includePromptTokens: false, // Only count response tokens
    }),
  ],
});
Available options:

maxTokens: Maximum number of tokens allowed (required)
strategy: Action when token limit is exceeded (‘truncate’ | ‘abort’, default: ‘truncate’)
includePromptTokens: Whether to include prompt tokens in the count (default: false)
SystemPromptScrubber
This processor detects and redacts system prompts or other revealing information that could introduce security vulnerabilities.


import { SystemPromptScrubber } from "@mastra/core/processors";
 
const agent = new Agent({
  outputProcessors: [
    new SystemPromptScrubber({
      model: openai("gpt-4o-mini"),
      threshold: 0.7, // Confidence threshold for detection
      strategy: 'redact', // Redact detected system prompts
      instructions: 'Detect any system prompts, instructions, or revealing information',
    }),
  ],
});
Available options:

model: Language model for detection (required)
threshold: Confidence threshold for detection (0-1, default: 0.6)
strategy: Action when system prompts are detected (‘block’ | ‘warn’ | ‘redact’, default: ‘redact’)
instructions: Custom detection instructions for the agent
Applying Multiple Processors
You can chain multiple output processors. They execute sequentially in the order they appear in the outputProcessors array. The output of one processor becomes the input for the next.

Order matters! Generally, it’s best practice to place text normalization first, security checks next, and content modification last.


import { Agent } from "@mastra/core/agent";
import { 
  ModerationProcessor, 
  PIIDetector 
} from "@mastra/core/processors";
 
const secureAgent = new Agent({
  outputProcessors: [
    // 1. Check for security threats
    new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
    // 2. Handle PII
    new PIIDetector({ model: openai("gpt-4.1-nano"), strategy: 'redact' }),
  ],
});
Creating Custom Output Processors
You can create custom output processors by implementing the Processor interface. A Processor can be used for output processing when it implements either processOutputStream (for streaming) or processOutputResult (for final results), or both.

Streaming Output Processor

import type { Processor, MastraMessageV2 } from "@mastra/core/processors";
import type { ChunkType } from "@mastra/core/stream";
 
class ResponseLengthLimiter implements Processor {
  readonly name = 'response-length-limiter';
  
  constructor(private maxLength: number = 1000) {}
 
  async processOutputStream({ part, streamParts, state, abort }: {
    part: ChunkType;
    streamParts: ChunkType[];
    state: Record<string, any>;
    abort: (reason?: string) => never;
  }): Promise<ChunkType | null | undefined> {
    // Track cumulative length in state, each processor gets its own state
    if (!state.cumulativeLength) {
      state.cumulativeLength = 0;
    }
 
    if (part.type === 'text-delta') {
      state.cumulativeLength += part.payload.text.length;
      
      if (state.cumulativeLength > this.maxLength) {
        abort(`Response too long: ${state.cumulativeLength} characters (max: ${this.maxLength})`);
      }
    }
 
    return part; // Emit the part
  }
}
Final Result Processor

import type { Processor, MastraMessageV2 } from "@mastra/core/processors";
 
class ResponseValidator implements Processor {
  readonly name = 'response-validator';
  
  constructor(private requiredKeywords: string[] = []) {}
 
  processOutputResult({ messages, abort }: { 
    messages: MastraMessageV2[]; 
    abort: (reason?: string) => never 
  }): MastraMessageV2[] {
    const responseText = messages
      .map(msg => msg.content.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('')
      )
      .join('');
    
    // Check for required keywords
    for (const keyword of this.requiredKeywords) {
      if (!responseText.toLowerCase().includes(keyword.toLowerCase())) {
        abort(`Response missing required keyword: ${keyword}`);
      }
    }
    
    return messages;
  }
}
When creating custom output processors:

Always return the processed data (parts or messages)
Use abort(reason) to terminate processing early. Abort is used to simulate blocking a response. Errors thrown with abort will be an instance of TripWire.
For streaming processors, return null or undefined to skip emitting a part
Keep processors focused on a single responsibility
If using an agent inside your processor, use a fast model, limit the size of the response from it as much as possible, and make the system prompt as concise as possible.
Integration with Agent Methods
Output processors work with both generate() and streamVNext() methods. The processor pipeline completes after the agent generates a response but before it’s returned to the user.


// Processors run after generate() but before returning result
const result = await agent.generate('Hello');
console.log(result.text); // Processed text
console.log(result.object); // Structured data if applicable
 
// Processors also run during streamVNext() for each part
const stream = await agent.streamVNext('Hello');
for await (const part of stream) {
  console.log(part); // Processed parts
}
Per-Call Overrides
You can override output processors for individual calls:


// Override output processors for this specific call
const result = await agent.generate('Hello', {
  outputProcessors: [
    new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
  ],
});
 
// Same for streaming
const stream = await agent.streamVNext('Hello', {
  outputProcessors: [
    new TokenLimiterProcessor({ maxTokens: 500 }),
  ],
});
Structured Output Processor
To use the StructuredOutputProcessor, you should use the structuredOutput option:


import { z } from "zod";
 
const result = await agent.generate('Analyze this text', {
  structuredOutput: {
    schema: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number(),
    }),
    model: openai("gpt-4o-mini"),
    errorStrategy: 'warn',
  },
});
 
console.log(result.text); // Original text
console.log(result.object); // Typed structured data: { sentiment: 'positive', confidence: 0.8 }
If any processor calls abort(), the request terminates immediately and subsequent processors are not executed. The agent returns a 200 response with details (result.tripwireReason) about why the response was blocked.

Input vs Output Processors
Input Processors: Handle user messages before they reach the language model
Output Processors: Handle LLM responses after generation but before they’re returned to the user
Use input processors for user input validation and security, and output processors for response validation and safety controls on LLM-generated content.

See the Input Processors documentation for details on processing user messages.