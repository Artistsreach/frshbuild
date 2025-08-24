Tools Overview
Tools are functions that agents can execute to perform specific tasks or access external information. They extend an agent’s capabilities beyond simple text generation, allowing interaction with APIs, databases, or other systems.

Each tool typically defines:

Inputs: What information the tool needs to run (defined with an inputSchema, often using Zod).
Outputs: The structure of the data the tool returns (defined with an outputSchema).
Execution Logic: The code that performs the tool’s action.
Description: Text that helps the agent understand what the tool does and when to use it.
Creating Tools
In Mastra, you create tools using the 
createTool
 function from the @mastra/core/tools package.

src/mastra/tools/weatherInfo.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
const getWeatherInfo = async (city: string) => {
  // Replace with an actual API call to a weather service
  console.log(`Fetching weather for ${city}...`);
  // Example data structure
  return { temperature: 20, conditions: "Sunny" };
};
 
export const weatherTool = createTool({
  id: "Get Weather Information",
  description: `Fetches the current weather information for a given city`,
  inputSchema: z.object({
    city: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ context: { city } }) => {
    console.log("Using tool to fetch weather information for", city);
    return await getWeatherInfo(city);
  },
});
This example defines a weatherTool with an input schema for the city, an output schema for the weather data, and an execute function that contains the tool’s logic.

When creating tools, keep tool descriptions simple and focused on what the tool does and when to use it, emphasizing its primary use case. Technical details belong in the parameter schemas, guiding the agent on how to use the tool correctly with descriptive names, clear descriptions, and explanations of default values.

Adding Tools to an Agent
To make tools available to an agent, you configure them in the agent’s definition. Mentioning available tools and their general purpose in the agent’s system prompt can also improve tool usage. For detailed steps and examples, see the guide on Using Tools and MCP with Agents.

Compatibility Layer for Tool Schemas
Different models interpret schemas differently. Some error when certain schema properties are passed and some ignore certain schema properties but don’t throw an error. Mastra adds a compatibility layer for tool schemas, ensuring tools work consistently across different model providers and that the schema constraints are respected.

Some providers that we include this layer for:

Google Gemini & Anthropic: Remove unsupported schema properties and append relevant constraints to the tool description.
OpenAI (including reasoning models): Strip or adapt schema fields that are ignored or unsupported, and add instructions to the description for agent guidance.
DeepSeek & Meta: Apply similar compatibility logic to ensure schema alignment and tool usability.
This approach makes tool usage more reliable and model-agnostic for both custom and MCP tools.

MCP Overview
Model Context Protocol (MCP)  is an open standard designed to let AI models discover and interact with external tools and resources. Think of it as a universal plugin system for AI agents, allowing them to use tools regardless of the language they were written in or where they are hosted.

Mastra uses MCP to connect agents to external tool servers.

Use third-party tools with an MCP Client
Mastra provides the MCPClient class to manage connections to one or more MCP servers and access their tools.

Installation
If you haven’t already, install the Mastra MCP package:


npm install @mastra/mcp@latest
Registering the MCPServer
Register your MCP server with Mastra to enable logging and access to configured tools and integrations:

src/mastra/index.ts

import { Mastra } from "@mastra/core";
import { myMcpServer } from "./mcpServers";
 
export const mastra = new Mastra({
  mcpServers: { myMcpServer },
});
Configuring MCPClient
You configure MCPClient with a map of servers you want to connect to. It supports connections via subprocess (Stdio) or HTTP (Streamable HTTP with SSE fallback).

import { MCPClient } from "@mastra/mcp";
 
const mcp = new MCPClient({
  servers: {
    // Stdio example
    sequential: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
    // HTTP example
    weather: {
      url: new URL("http://localhost:8080/mcp"),
      requestInit: {
        headers: {
          Authorization: "Bearer your-token",
        },
      },
    },
  },
});
For detailed configuration options, see the 
MCPClient
reference documentation.

Static vs Dynamic Tool Configurations
MCPClient offers two approaches to retrieving tools from connected servers, suitable for different application architectures:

Feature	Static Configuration (await mcp.getTools())	Dynamic Configuration (await mcp.getToolsets())
Use Case	Single-user, static config (e.g., CLI tool)	Multi-user, dynamic config (e.g., SaaS app)
Configuration	Fixed at agent initialization	Per-request, dynamic
Credentials	Shared across all uses	Can vary per user/request
Agent Setup	Tools added in Agent constructor	Tools passed in generate() or stream() options
Static Configuration (getTools()): Fetches all tools from all configured servers. Best when the tool configuration (like API keys) is static and shared across all users or requests. You typically call this once and pass the result to the tools property when defining your Agent. Reference:
getTools()

import { Agent } from "@mastra/core/agent";
// ... mcp client setup
 
const agent = new Agent({
  // ... other agent config
  tools: await mcp.getTools(),
});
Dynamic Configuration (getToolsets()): Designed for scenarios where configuration might change per request or per user (e.g., different API keys for different tenants in a multi-user application). You pass the result of getToolsets() to the toolsets option in the agent’s generate() or stream() method. Reference:
getToolsets()

import { Agent } from "@mastra/core/agent";
// ... agent setup without tools initially
 
async function handleRequest(userPrompt: string, userApiKey: string) {
  const userMcp = new MCPClient({
    /* config with userApiKey */
  });
  const toolsets = await userMcp.getToolsets();
 
  const response = await agent.stream(userPrompt, {
    toolsets, // Pass dynamic toolsets
  });
  // ... handle response
  await userMcp.disconnect();
}
Connecting to an MCP registry
MCP servers can be discovered through registries. Here’s how to connect to some popular ones using MCPClient:

Klavis AI  provides hosted, enterprise-authenticated, high-quality MCP servers.

import { MCPClient } from "@mastra/mcp";
 
const mcp = new MCPClient({
  servers: {
    salesforce: {
      url: new URL("https://salesforce-mcp-server.klavis.ai/mcp/?instance_id={private-instance-id}"),
    },
    hubspot: {
      url: new URL("https://hubspot-mcp-server.klavis.ai/mcp/?instance_id={private-instance-id}"),
    },
  },
});
Klavis AI offers enterprise-grade authentication and security for production deployments.

For more details on how to integrate Mastra with Klavis, check out their documentation .

Share your tools with an MCP server
If you have created your own Mastra tools, you can expose them to any MCP-compatible client using Mastra’s MCPServer class.

Similarly, Mastra Agent and Workflow instances can also be exposed as tools via MCPServer. This allows other MCP clients to interact with your agents by “asking” them questions or run your workflows. Each agent provided in the MCPServer configuration will be converted into a tool named ask_<agentKey>, using the agent’s description property. Each workflow will be converted into a tool named run_<workflowKey>, using its inputSchema and description.

This allows others to use your tools, agents, and workflows without needing direct access to your codebase.

Using MCPServer
You initialize MCPServer with a name, version, and the Mastra tools, agents, and/or workflows you want to share.

import { MCPServer } from "@mastra/mcp";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { weatherTool } from "./tools"; // Your Mastra tool
import { weatherAgent } from "./agents"; // Your Mastra Agent
import { dataWorkflow } from "./workflows"; // Your Mastra Workflow
 
const server = new MCPServer({
  name: "My Custom Server",
  version: "1.0.0",
  tools: { weatherTool }, // Provide your tool(s) here
  agents: { weatherAgent }, // Provide your agent(s) here
  workflows: { dataWorkflow }, // Provide your workflow(s) here
});
 
// Start the server (e.g., using stdio for a CLI tool)
// await server.startStdio();
 
// Or integrate with an HTTP server using startSSE()
// See MCPServer reference for details
For an agent to be exposed as a tool, it must have a non-empty description string. Similarly, for a workflow to be exposed, its description must also be a non-empty string. If the description is missing or empty for either, MCPServer will throw an error during initialization. Workflows will use their inputSchema for the tool’s input.

Tools with Structured Outputs
You can define an outputSchema for your tools to enforce a specific structure for the tool’s output. This is useful for ensuring that the tool returns data in a consistent and predictable format, which can then be validated by the client.

When a tool includes an outputSchema, its execute function must return an object. The value of the object must conform to the outputSchema. Mastra will automatically validate this output on both the server and client sides.

Here’s an example of a tool with an outputSchema:

src/tools/structured-tool.ts
import { createTool } from '@mastra/core';
import { z } from 'zod';
 
export const structuredTool = createTool({
  description: 'A test tool that returns structured data.',
  parameters: z.object({
    input: z.string().describe('Some input string.'),
  }),
  outputSchema: z.object({
    processedInput: z.string().describe('The processed input string.'),
    timestamp: z.string().describe('An ISO timestamp.'),
  }),
  execute: async ({ input }) => {
    // When outputSchema is defined, you must return an object
    return {
      processedInput: `processed: ${input}`,
      timestamp: new Date().toISOString(),
    };
  },
});
When this tool is called, the MCP client will receive both the structured data and a text representation of it.

Tool result
{
  "content": [
    {
      "type": "text",
      "text": "{\"processedInput\": \"hello\", \"timestamp\": \"2025-06-19T16:53:16.472Z\"}"
    }
  ],
  "structuredContent": {
    "processedInput": "processed: hello",
    "timestamp": "2025-06-19T16:53:16.472Z",
  }
}

Dynamic Tool Context
Mastra provides RuntimeContext, a system based on dependency injection, that allows you to pass dynamic, request-specific configuration to your tools during execution. This is useful when a tool’s behavior needs to change based on user identity, request headers, or other runtime factors, without altering the tool’s core code.

Note: RuntimeContext is primarily used for passing data into tool executions. It’s distinct from agent memory, which handles conversation history and state persistence across multiple calls.

Basic Usage
To use RuntimeContext, first define a type structure for your dynamic configuration. Then, create an instance of RuntimeContext typed with your definition and set the desired values. Finally, include the runtimeContext instance in the options object when calling agent.generate() or agent.stream().

import { RuntimeContext } from "@mastra/core/di";
// Assume 'agent' is an already defined Mastra Agent instance
 
// Define the context type
type WeatherRuntimeContext = {
  "temperature-scale": "celsius" | "fahrenheit";
};
 
// Instantiate RuntimeContext and set values
const runtimeContext = new RuntimeContext<WeatherRuntimeContext>();
runtimeContext.set("temperature-scale", "celsius");
 
// Pass to agent call
const response = await agent.generate("What's the weather like today?", {
  runtimeContext, // Pass the context here
});
 
console.log(response.text);
Accessing Context in Tools
Tools receive the runtimeContext as part of the second argument to their execute function. You can then use the .get() method to retrieve values.

src/mastra/tools/weather-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
// Assume WeatherRuntimeContext is defined as above and accessible here
 
// Dummy fetch function
async function fetchWeather(
  location: string,
  options: { temperatureUnit: "celsius" | "fahrenheit" },
): Promise<any> {
  console.log(`Fetching weather for ${location} in ${options.temperatureUnit}`);
  // Replace with actual API call
  return { temperature: options.temperatureUnit === "celsius" ? 20 : 68 };
}
 
export const weatherTool = createTool({
  id: "getWeather",
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  // The tool's execute function receives runtimeContext
  execute: async ({ context, runtimeContext }) => {
    // Type-safe access to runtimeContext variables
    const temperatureUnit = runtimeContext.get("temperature-scale");
 
    // Use the context value in the tool logic
    const weather = await fetchWeather(context.location, {
      temperatureUnit,
    });
 
    return {
      result: `The temperature is ${weather.temperature}°${temperatureUnit === "celsius" ? "C" : "F"}`,
    };
  },
});
When the agent uses weatherTool, the temperature-scale value set in the runtimeContext during the agent.generate() call will be available inside the tool’s execute function.

Using with Server Middleware
In server environments (like Express or Next.js), you can use middleware to automatically populate RuntimeContext based on incoming request data, such as headers or user sessions.

Here’s an example using Mastra’s built-in server middleware support (which uses Hono internally) to set the temperature scale based on the Cloudflare CF-IPCountry header:

src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { RuntimeContext } from "@mastra/core/di";
import { weatherAgent } from "./agents/weather"; // Assume agent is defined elsewhere
 
// Define RuntimeContext type
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
        // Get the RuntimeContext instance
        const runtimeContext =
          c.get<RuntimeContext<WeatherRuntimeContext>>("runtimeContext");
 
        // Get country code from request header
        const country = c.req.header("CF-IPCountry");
 
        // Set temperature scale based on country
        runtimeContext.set(
          "temperature-scale",
          country === "US" ? "fahrenheit" : "celsius",
        );
 
        // Continue request processing
        await next();
      },
    ],
  },
});
With this middleware in place, any agent call handled by this Mastra server instance will automatically have the temperature-scale set in its RuntimeContext based on the user’s inferred country, and tools like weatherTool will use it accordingly.

Advanced Tool Usage
This page covers more advanced techniques and features related to using tools in Mastra.

Abort Signals
When you initiate an agent interaction using generate() or stream(), you can provide an AbortSignal. Mastra automatically forwards this signal to any tool executions that occur during that interaction.

This allows you to cancel long-running operations within your tools, such as network requests or intensive computations, if the parent agent call is aborted.

You access the abortSignal in the second parameter of the tool’s execute function.

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const longRunningTool = createTool({
  id: "long-computation",
  description: "Performs a potentially long computation",
  inputSchema: z.object({ /* ... */ }),
  execute: async ({ context }, { abortSignal }) => {
    // Example: Forwarding signal to fetch
    const response = await fetch("https://api.example.com/data", {
      signal: abortSignal, // Pass the signal here
    });
 
    if (abortSignal?.aborted) {
      console.log("Tool execution aborted.");
      throw new Error("Aborted");
    }
 
    // Example: Checking signal during a loop
    for (let i = 0; i < 1000000; i++) {
      if (abortSignal?.aborted) {
        console.log("Tool execution aborted during loop.");
        throw new Error("Aborted");
      }
      // ... perform computation step ...
    }
 
    const data = await response.json();
    return { result: data };
  },\n});
To use this, provide an AbortController’s signal when calling the agent:

import { Agent } from "@mastra/core/agent";
// Assume 'agent' is an Agent instance with longRunningTool configured
 
const controller = new AbortController();
 
// Start the agent call
const promise = agent.generate("Perform the long computation.", {
  abortSignal: controller.signal,
});
 
// Sometime later, if needed:
// controller.abort();
 
try {
  const result = await promise;
  console.log(result.text);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Agent generation was aborted.");
  } else {
    console.error("An error occurred:", error);
  }
}
AI SDK Tool Format
Mastra maintains compatibility with the tool format used by the Vercel AI SDK (ai package). You can define tools using the tool function from the ai package and use them directly within your Mastra agents alongside tools created with Mastra’s createTool.

First, ensure you have the ai package installed:


npm install ai
Here’s an example of a tool defined using the Vercel AI SDK format:

src/mastra/tools/vercelWeatherTool.ts

import { tool } from "ai";
import { z } from "zod";
 
export const vercelWeatherTool = tool({
  description: "Fetches current weather using Vercel AI SDK format",
  parameters: z.object({
    city: z.string().describe("The city to get weather for"),
  }),
  execute: async ({ city }) => {
    console.log(`Fetching weather for ${city} (Vercel format tool)`);
    // Replace with actual API call
    const data = await fetch(`https://api.example.com/weather?city=${city}`);
    return data.json();
  },
});
You can then add this tool to your Mastra agent just like any other tool:

src/mastra/agents/mixedToolsAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { vercelWeatherTool } from "../tools/vercelWeatherTool"; // Vercel AI SDK tool
import { mastraTool } from "../tools/mastraTool"; // Mastra createTool tool
 
export const mixedToolsAgent = new Agent({
  name: "Mixed Tools Agent",
  instructions: "You can use tools defined in different formats.",
  model: openai("gpt-4o-mini"),
  tools: {
    weatherVercel: vercelWeatherTool,
    someMastraTool: mastraTool,
  },
});
Mastra supports both tool formats, allowing you to mix and match as needed.