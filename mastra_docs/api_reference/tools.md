createTool()
The createTool() function is used to define custom tools that your Mastra agents can execute. Tools extend an agent’s capabilities by allowing it to interact with external systems, perform calculations, or access specific data.

Usage example
src/mastra/tools/reverse-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const tool = createTool({
  id: "test-tool",
  description: "Reverse the input string",
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
  execute: async ({ context }) => {
    const { input } = context;
    const reversed = input.split("").reverse().join("");
 
    return {
      output: reversed
    };
  }
});
Parameters
id:
string
A unique identifier for the tool.
description:
string
A description of what the tool does. This is used by the agent to decide when to use the tool.
inputSchema?:
Zod schema
A Zod schema defining the expected input parameters for the tool's `execute` function.
outputSchema?:
Zod schema
A Zod schema defining the expected output structure of the tool's `execute` function.
execute:
function
The function that contains the tool's logic. It receives an object with `context` (the parsed input based on `inputSchema`), `runtimeContext`, and an object containing `abortSignal`.

MCPClient
The MCPClient class provides a way to manage multiple MCP server connections and their tools in a Mastra application. It handles connection lifecycle, tool namespacing, and provides access to tools across all configured servers.

This class replaces the deprecated 
MastraMCPClient
.

Constructor
Creates a new instance of the MCPClient class.

constructor({
  id?: string;
  servers: Record<string, MastraMCPServerDefinition>;
  timeout?: number;
}: MCPClientOptions)
MCPClientOptions

id?:
string
Optional unique identifier for the configuration instance. Use this to prevent memory leaks when creating multiple instances with identical configurations.
servers:
Record<string, MastraMCPServerDefinition>
A map of server configurations, where each key is a unique server identifier and the value is the server configuration.
timeout?:
number
= 60000
Global timeout value in milliseconds for all servers unless overridden in individual server configs.
MastraMCPServerDefinition
Each server in the servers map is configured using the MastraMCPServerDefinition type. The transport type is detected based on the provided parameters:

If command is provided, it uses the Stdio transport.
If url is provided, it first attempts to use the Streamable HTTP transport and falls back to the legacy SSE transport if the initial connection fails.

command?:
string
For Stdio servers: The command to execute.
args?:
string[]
For Stdio servers: Arguments to pass to the command.
env?:
Record<string, string>
For Stdio servers: Environment variables to set for the command.
url?:
URL
For HTTP servers (Streamable HTTP or SSE): The URL of the server.
requestInit?:
RequestInit
For HTTP servers: Request configuration for the fetch API.
eventSourceInit?:
EventSourceInit
For SSE fallback: Custom fetch configuration for SSE connections. Required when using custom headers with SSE.
logger?:
LogHandler
Optional additional handler for logging.
timeout?:
number
Server-specific timeout in milliseconds.
capabilities?:
ClientCapabilities
Server-specific capabilities configuration.
enableServerLogs?:
boolean
= true
Whether to enable logging for this server.
Methods
getTools()
Retrieves all tools from all configured servers, with tool names namespaced by their server name (in the format serverName_toolName) to prevent conflicts. Intended to be passed onto an Agent definition.

new Agent({ tools: await mcp.getTools() });
getToolsets()
Returns an object mapping namespaced tool names (in the format serverName.toolName) to their tool implementations. Intended to be passed dynamically into the generate or stream method.

const res = await agent.stream(prompt, {
  toolsets: await mcp.getToolsets(),
});
disconnect()
Disconnects from all MCP servers and cleans up resources.

async disconnect(): Promise<void>
resources Property
The MCPClient instance has a resources property that provides access to resource-related operations.

const mcpClient = new MCPClient({
  /* ...servers configuration... */
});
 
// Access resource methods via mcpClient.resources
const allResourcesByServer = await mcpClient.resources.list();
const templatesByServer = await mcpClient.resources.templates();
// ... and so on for other resource methods.
resources.list()
Retrieves all available resources from all connected MCP servers, grouped by server name.

async list(): Promise<Record<string, Resource[]>>
Example:

const resourcesByServer = await mcpClient.resources.list();
for (const serverName in resourcesByServer) {
  console.log(`Resources from ${serverName}:`, resourcesByServer[serverName]);
}
resources.templates()
Retrieves all available resource templates from all connected MCP servers, grouped by server name.

async templates(): Promise<Record<string, ResourceTemplate[]>>
Example:

const templatesByServer = await mcpClient.resources.templates();
for (const serverName in templatesByServer) {
  console.log(`Templates from ${serverName}:`, templatesByServer[serverName]);
}
resources.read(serverName: string, uri: string)
Reads the content of a specific resource from a named server.

async read(serverName: string, uri: string): Promise<ReadResourceResult>
serverName: The identifier of the server (key used in the servers constructor option).
uri: The URI of the resource to read.
Example:

const content = await mcpClient.resources.read(
  "myWeatherServer",
  "weather://current",
);
console.log("Current weather:", content.contents[0].text);
resources.subscribe(serverName: string, uri: string)
Subscribes to updates for a specific resource on a named server.

async subscribe(serverName: string, uri: string): Promise<object>
Example:

await mcpClient.resources.subscribe("myWeatherServer", "weather://current");
resources.unsubscribe(serverName: string, uri: string)
Unsubscribes from updates for a specific resource on a named server.

async unsubscribe(serverName: string, uri: string): Promise<object>
Example:

await mcpClient.resources.unsubscribe("myWeatherServer", "weather://current");
resources.onUpdated(serverName: string, handler: (params: { uri: string }) => void)
Sets a notification handler that will be called when a subscribed resource on a specific server is updated.

async onUpdated(serverName: string, handler: (params: { uri: string }) => void): Promise<void>
Example:

mcpClient.resources.onUpdated("myWeatherServer", (params) => {
  console.log(`Resource updated on myWeatherServer: ${params.uri}`);
  // You might want to re-fetch the resource content here
  // await mcpClient.resources.read("myWeatherServer", params.uri);
});
resources.onListChanged(serverName: string, handler: () => void)
Sets a notification handler that will be called when the overall list of available resources changes on a specific server.

async onListChanged(serverName: string, handler: () => void): Promise<void>
Example:

mcpClient.resources.onListChanged("myWeatherServer", () => {
  console.log("Resource list changed on myWeatherServer.");
  // You should re-fetch the list of resources
  // await mcpClient.resources.list();
});
prompts Property
The MCPClient instance has a prompts property that provides access to prompt-related operations.

const mcpClient = new MCPClient({
  /* ...servers configuration... */
});
 
// Access prompt methods via mcpClient.prompts
const allPromptsByServer = await mcpClient.prompts.list();
const { prompt, messages } = await mcpClient.prompts.get({
  serverName: "myWeatherServer",
  name: "current",
});
elicitation Property
The MCPClient instance has an elicitation property that provides access to elicitation-related operations. Elicitation allows MCP servers to request structured information from users.

const mcpClient = new MCPClient({
  /* ...servers configuration... */
});
 
// Set up elicitation handler
mcpClient.elicitation.onRequest('serverName', async (request) => {
  // Handle elicitation request from server
  console.log('Server requests:', request.message);
  console.log('Schema:', request.requestedSchema);
  
  // Return user response
  return {
    action: 'accept',
    content: { name: 'John Doe', email: 'john@example.com' }
  };
});
elicitation.onRequest(serverName: string, handler: ElicitationHandler)
Sets up a handler function that will be called when any connected MCP server sends an elicitation request. The handler receives the request and must return a response.

ElicitationHandler Function:

The handler function receives a request object with:

message: A human-readable message describing what information is needed
requestedSchema: A JSON schema defining the structure of the expected response
The handler must return an ElicitResult with:

action: One of 'accept', 'decline', or 'cancel'
content: The user’s data (only when action is 'accept')
Example:

mcpClient.elicitation.onRequest('serverName', async (request) => {
  console.log(`Server requests: ${request.message}`);
  
  // Example: Simple user input collection
  if (request.requestedSchema.properties.name) {
    // Simulate user accepting and providing data
    return {
      action: 'accept',
      content: {
        name: 'Alice Smith',
        email: 'alice@example.com'
      }
    };
  }
  
  // Simulate user declining the request
  return { action: 'decline' };
});
Complete Interactive Example:

import { MCPClient } from '@mastra/mcp';
import { createInterface } from 'readline';
 
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});
 
function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    readline.question(question, answer => resolve(answer.trim()));
  });
}
 
const mcpClient = new MCPClient({
  servers: {
    interactiveServer: {
      url: new URL('http://localhost:3000/mcp'),
    },
  },
});
 
// Set up interactive elicitation handler
await mcpClient.elicitation.onRequest('interactiveServer', async (request) => {
  console.log(`\n📋 Server Request: ${request.message}`);
  console.log('Required information:');
  
  const schema = request.requestedSchema;
  const properties = schema.properties || {};
  const required = schema.required || [];
  const content: Record<string, any> = {};
  
  // Collect input for each field
  for (const [fieldName, fieldSchema] of Object.entries(properties)) {
    const field = fieldSchema as any;
    const isRequired = required.includes(fieldName);
    
    let prompt = `${field.title || fieldName}`;
    if (field.description) prompt += ` (${field.description})`;
    if (isRequired) prompt += ' *required*';
    prompt += ': ';
    
    const answer = await askQuestion(prompt);
    
    // Handle cancellation
    if (answer.toLowerCase() === 'cancel') {
      return { action: 'cancel' };
    }
    
    // Validate required fields
    if (answer === '' && isRequired) {
      console.log(`❌ ${fieldName} is required`);
      return { action: 'decline' };
    }
    
    if (answer !== '') {
      content[fieldName] = answer;
    }
  }
  
  // Confirm submission
  console.log('\n📝 You provided:');
  console.log(JSON.stringify(content, null, 2));
  
  const confirm = await askQuestion('\nSubmit this information? (yes/no/cancel): ');
  
  if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
    return { action: 'accept', content };
  } else if (confirm.toLowerCase() === 'cancel') {
    return { action: 'cancel' };
  } else {
    return { action: 'decline' };
  }
});
prompts.list()
Retrieves all available prompts from all connected MCP servers, grouped by server name.

async list(): Promise<Record<string, Prompt[]>>
Example:

const promptsByServer = await mcpClient.prompts.list();
for (const serverName in promptsByServer) {
  console.log(`Prompts from ${serverName}:`, promptsByServer[serverName]);
}
prompts.get({ serverName, name, args?, version? })
Retrieves a specific prompt and its messages from a server.

async get({
  serverName,
  name,
  args?,
  version?,
}: {
  serverName: string;
  name: string;
  args?: Record<string, any>;
  version?: string;
}): Promise<{ prompt: Prompt; messages: PromptMessage[] }>
Example:

const { prompt, messages } = await mcpClient.prompts.get({
  serverName: "myWeatherServer",
  name: "current",
  args: { location: "London" },
});
console.log(prompt);
console.log(messages);
prompts.onListChanged(serverName: string, handler: () => void)
Sets a notification handler that will be called when the list of available prompts changes on a specific server.

async onListChanged(serverName: string, handler: () => void): Promise<void>
Example:

mcpClient.prompts.onListChanged("myWeatherServer", () => {
  console.log("Prompt list changed on myWeatherServer.");
  // You should re-fetch the list of prompts
  // await mcpClient.prompts.list();
});
Elicitation
Elicitation is a feature that allows MCP servers to request structured information from users. When a server needs additional data, it can send an elicitation request that the client handles by prompting the user. A common example is during a tool call.

How Elicitation Works
Server Request: An MCP server tool calls server.elicitation.sendRequest() with a message and schema
Client Handler: Your elicitation handler function is called with the request
User Interaction: Your handler collects user input (via UI, CLI, etc.)
Response: Your handler returns the user’s response (accept/decline/cancel)
Tool Continuation: The server tool receives the response and continues execution
Setting Up Elicitation
You must set up an elicitation handler before tools that use elicitation are called:

import { MCPClient } from '@mastra/mcp';
 
const mcpClient = new MCPClient({
  servers: {
    interactiveServer: {
      url: new URL('http://localhost:3000/mcp'),
    },
  },
});
 
// Set up elicitation handler
mcpClient.elicitation.onRequest('interactiveServer', async (request) => {
  // Handle the server's request for user input
  console.log(`Server needs: ${request.message}`);
  
  // Your logic to collect user input
  const userData = await collectUserInput(request.requestedSchema);
  
  return {
    action: 'accept',
    content: userData
  };
});
Response Types
Your elicitation handler must return one of three response types:

Accept: User provided data and confirmed submission

return {
  action: 'accept',
  content: { name: 'John Doe', email: 'john@example.com' }
};
Decline: User explicitly declined to provide the information

return { action: 'decline' };
Cancel: User dismissed or cancelled the request

return { action: 'cancel' };
Schema-Based Input Collection
The requestedSchema provides structure for the data the server needs:

await mcpClient.elicitation.onRequest('interactiveServer', async (request) => {
  const { properties, required = [] } = request.requestedSchema;
  const content: Record<string, any> = {};
  
  for (const [fieldName, fieldSchema] of Object.entries(properties || {})) {
    const field = fieldSchema as any;
    const isRequired = required.includes(fieldName);
    
    // Collect input based on field type and requirements
    const value = await promptUser({
      name: fieldName,
      title: field.title,
      description: field.description,
      type: field.type,
      required: isRequired,
      format: field.format,
      enum: field.enum,
    });
    
    if (value !== null) {
      content[fieldName] = value;
    }
  }
  
  return { action: 'accept', content };
});
Best Practices
Always handle elicitation: Set up your handler before calling tools that might use elicitation
Validate input: Check that required fields are provided
Respect user choice: Handle decline and cancel responses gracefully
Clear UI: Make it obvious what information is being requested and why
Security: Never auto-accept requests for sensitive information
Examples
Static Tool Configuration
For tools where you have a single connection to the MCP server for you entire app, use getTools() and pass the tools to your agent:

import { MCPClient } from "@mastra/mcp";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
const mcp = new MCPClient({
  servers: {
    stockPrice: {
      command: "npx",
      args: ["tsx", "stock-price.ts"],
      env: {
        API_KEY: "your-api-key",
      },
      log: (logMessage) => {
        console.log(`[${logMessage.level}] ${logMessage.message}`);
      },
    },
    weather: {
      url: new URL("http://localhost:8080/sse"),
    },
  },
  timeout: 30000, // Global 30s timeout
});
 
// Create an agent with access to all tools
const agent = new Agent({
  name: "Multi-tool Agent",
  instructions: "You have access to multiple tool servers.",
  model: openai("gpt-4"),
  tools: await mcp.getTools(),
});
 
// Example of using resource methods
async function checkWeatherResource() {
  try {
    const weatherResources = await mcp.resources.list();
    if (weatherResources.weather && weatherResources.weather.length > 0) {
      const currentWeatherURI = weatherResources.weather[0].uri;
      const weatherData = await mcp.resources.read(
        "weather",
        currentWeatherURI,
      );
      console.log("Weather data:", weatherData.contents[0].text);
    }
  } catch (error) {
    console.error("Error fetching weather resource:", error);
  }
}
checkWeatherResource();
 
// Example of using prompt methods
async function checkWeatherPrompt() {
  try {
    const weatherPrompts = await mcp.prompts.list();
    if (weatherPrompts.weather && weatherPrompts.weather.length > 0) {
      const currentWeatherPrompt = weatherPrompts.weather.find(
        (p) => p.name === "current"
      );
      if (currentWeatherPrompt) {
        console.log("Weather prompt:", currentWeatherPrompt);
      } else {
        console.log("Current weather prompt not found");
      }
    }
  } catch (error) {
    console.error("Error fetching weather prompt:", error);
  }
}
checkWeatherPrompt();
Dynamic toolsets
When you need a new MCP connection for each user, use getToolsets() and add the tools when calling stream or generate:

import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { openai } from "@ai-sdk/openai";
 
// Create the agent first, without any tools
const agent = new Agent({
  name: "Multi-tool Agent",
  instructions: "You help users check stocks and weather.",
  model: openai("gpt-4"),
});
 
// Later, configure MCP with user-specific settings
const mcp = new MCPClient({
  servers: {
    stockPrice: {
      command: "npx",
      args: ["tsx", "stock-price.ts"],
      env: {
        API_KEY: "user-123-api-key",
      },
      timeout: 20000, // Server-specific timeout
    },
    weather: {
      url: new URL("http://localhost:8080/sse"),
      requestInit: {
        headers: {
          Authorization: `Bearer user-123-token`,
        },
      },
    },
  },
});
 
// Pass all toolsets to stream() or generate()
const response = await agent.stream(
  "How is AAPL doing and what is the weather?",
  {
    toolsets: await mcp.getToolsets(),
  },
);
Instance Management
The MCPClient class includes built-in memory leak prevention for managing multiple instances:

Creating multiple instances with identical configurations without an id will throw an error to prevent memory leaks
If you need multiple instances with identical configurations, provide a unique id for each instance
Call await configuration.disconnect() before recreating an instance with the same configuration
If you only need one instance, consider moving the configuration to a higher scope to avoid recreation
For example, if you try to create multiple instances with the same configuration without an id:

// First instance - OK
const mcp1 = new MCPClient({
  servers: {
    /* ... */
  },
});
 
// Second instance with same config - Will throw an error
const mcp2 = new MCPClient({
  servers: {
    /* ... */
  },
});
 
// To fix, either:
// 1. Add unique IDs
const mcp3 = new MCPClient({
  id: "instance-1",
  servers: {
    /* ... */
  },
});
 
// 2. Or disconnect before recreating
await mcp1.disconnect();
const mcp4 = new MCPClient({
  servers: {
    /* ... */
  },
});
Server Lifecycle
MCPClient handles server connections gracefully:

Automatic connection management for multiple servers
Graceful server shutdown to prevent error messages during development
Proper cleanup of resources when disconnecting
Using SSE Request Headers
When using the legacy SSE MCP transport, you must configure both requestInit and eventSourceInit due to a bug in the MCP SDK:

const sseClient = new MCPClient({
  servers: {
    exampleServer: {
      url: new URL("https://your-mcp-server.com/sse"),
      // Note: requestInit alone isn't enough for SSE
      requestInit: {
        headers: {
          Authorization: "Bearer your-token",
        },
      },
      // This is also required for SSE connections with custom headers
      eventSourceInit: {
        fetch(input: Request | URL | string, init?: RequestInit) {
          const headers = new Headers(init?.headers || {});
          headers.set("Authorization", "Bearer your-token");
          return fetch(input, {
            ...init,
            headers,
          });
        },
      },
    },
  },
});

MCPServer
The MCPServer class provides the functionality to expose your existing Mastra tools and Agents as a Model Context Protocol (MCP) server. This allows any MCP client (like Cursor, Windsurf, or Claude Desktop) to connect to these capabilities and make them available to an agent.

Note that if you only need to use your tools or agents directly within your Mastra application, you don’t necessarily need to create an MCP server. This API is specifically for exposing your Mastra tools and agents to external MCP clients.

It supports both stdio (subprocess) and SSE (HTTP) MCP transports .

Constructor
To create a new MCPServer, you need to provide some basic information about your server, the tools it will offer, and optionally, any agents you want to expose as tools.

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { MCPServer } from "@mastra/mcp";
import { z } from "zod";
import { dataProcessingWorkflow } from "../workflows/dataProcessingWorkflow";
 
const myAgent = new Agent({
  name: "MyExampleAgent",
  description: "A generalist to help with basic questions."
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});
 
const weatherTool = createTool({
  id: "getWeather",
  description: "Gets the current weather for a location.",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ context }) => `Weather in ${context.location} is sunny.`,
});
 
const server = new MCPServer({
  name: "My Custom Server",
  version: "1.0.0",
  tools: { weatherTool },
  agents: { myAgent }, // this agent will become tool "ask_myAgent"
  workflows: {
    dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  }
});
Configuration Properties
The constructor accepts an MCPServerConfig object with the following properties:

name:
string
A descriptive name for your server (e.g., 'My Weather and Agent Server').
version:
string
The semantic version of your server (e.g., '1.0.0').
tools:
ToolsInput
An object where keys are tool names and values are Mastra tool definitions (created with `createTool` or Vercel AI SDK). These tools will be directly exposed.
agents?:
Record<string, Agent>
An object where keys are agent identifiers and values are Mastra Agent instances. Each agent will be automatically converted into a tool named `ask_<agentIdentifier>`. The agent **must** have a non-empty `description` string property defined in its constructor configuration. This description will be used in the tool's description. If an agent's description is missing or empty, an error will be thrown during MCPServer initialization.
workflows?:
Record<string, Workflow>
An object where keys are workflow identifiers and values are Mastra Workflow instances. Each workflow is converted into a tool named `run_<workflowKey>`. The workflow's `inputSchema` becomes the tool's input schema. The workflow **must** have a non-empty `description` string property, which is used for the tool's description. If a workflow's description is missing or empty, an error will be thrown. The tool executes the workflow by calling `workflow.createRun().start({ inputData: <tool_input> })`. If a tool name derived from an agent or workflow (e.g., `ask_myAgent` or `run_myWorkflow`) collides with an explicitly defined tool name or another derived name, the explicitly defined tool takes precedence, and a warning is logged. Agents/workflows leading to subsequent collisions are skipped.
id?:
string
Optional unique identifier for the server. If not provided, a UUID will be generated. This ID is considered final and cannot be changed by Mastra if provided.
description?:
string
Optional description of what the MCP server does.
repository?:
Repository
Optional repository information for the server's source code.
releaseDate?:
string
Optional release date of this server version (ISO 8601 string). Defaults to the time of instantiation if not provided.
isLatest?:
boolean
Optional flag indicating if this is the latest version. Defaults to true if not provided.
packageCanonical?:
'npm' | 'docker' | 'pypi' | 'crates' | string
Optional canonical packaging format if the server is distributed as a package (e.g., 'npm', 'docker').
packages?:
PackageInfo[]
Optional list of installable packages for this server.
remotes?:
RemoteInfo[]
Optional list of remote access points for this server.
resources?:
MCPServerResources
An object defining how the server should handle MCP resources. See Resource Handling section for details.
prompts?:
MCPServerPrompts
An object defining how the server should handle MCP prompts. See Prompt Handling section for details.
Exposing Agents as Tools
A powerful feature of MCPServer is its ability to automatically expose your Mastra Agents as callable tools. When you provide agents in the agents property of the configuration:

Tool Naming: Each agent is converted into a tool named ask_<agentKey>, where <agentKey> is the key you used for that agent in the agents object. For instance, if you configure agents: { myAgentKey: myAgentInstance }, a tool named ask_myAgentKey will be created.

Tool Functionality:

Description: The generated tool’s description will be in the format: “Ask agent <AgentName> a question. Original agent instructions: <agent description>”.
Input: The tool expects a single object argument with a message property (string): { message: "Your question for the agent" }.
Execution: When this tool is called, it invokes the generate() method of the corresponding agent, passing the provided query.
Output: The direct result from the agent’s generate() method is returned as the output of the tool.
Name Collisions: If an explicit tool defined in the tools configuration has the same name as an agent-derived tool (e.g., you have a tool named ask_myAgentKey and also an agent with the key myAgentKey), the explicitly defined tool will take precedence. The agent will not be converted into a tool in this conflicting case, and a warning will be logged.

This makes it straightforward to allow MCP clients to interact with your agents using natural language queries, just like any other tool.

Agent-to-Tool Conversion
When you provide agents in the agents configuration property, MCPServer will automatically create a corresponding tool for each agent. The tool will be named ask_<agentIdentifier>, where <agentIdentifier> is the key you used in the agents object.

The description for this generated tool will be: “Ask agent <agent.name> a question. Agent description: <agent.description>”.

Important: For an agent to be converted into a tool, it must have a non-empty description string property set in its configuration when it was instantiated (e.g., new Agent({ name: 'myAgent', description: 'This agent does X.', ... })). If an agent is passed to MCPServer with a missing or empty description, an error will be thrown when the MCPServer is instantiated, and server setup will fail.

This allows you to quickly expose the generative capabilities of your agents through the MCP, enabling clients to “ask” your agents questions directly.

Methods
These are the functions you can call on an MCPServer instance to control its behavior and get information.

startStdio()
Use this method to start the server so it communicates using standard input and output (stdio). This is typical when running the server as a command-line program.

async startStdio(): Promise<void>
Here’s how you would start the server using stdio:

const server = new MCPServer({
  // example configuration above
});
await server.startStdio();
startSSE()
This method helps you integrate the MCP server with an existing web server to use Server-Sent Events (SSE) for communication. You’ll call this from your web server’s code when it receives a request for the SSE or message paths.

async startSSE({
  url,
  ssePath,
  messagePath,
  req,
  res,
}: {
  url: URL;
  ssePath: string;
  messagePath: string;
  req: any;
  res: any;
}): Promise<void>
Here’s an example of how you might use startSSE within an HTTP server request handler. In this example an MCP client could connect to your MCP server at http://localhost:1234/sse:

import http from "http";
 
const httpServer = http.createServer(async (req, res) => {
  await server.startSSE({
    url: new URL(req.url || "", `http://localhost:1234`),
    ssePath: "/sse",
    messagePath: "/message",
    req,
    res,
  });
});
 
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
Here are the details for the values needed by the startSSE method:

url:
URL
The web address the user is requesting.
ssePath:
string
The specific part of the URL where clients will connect for SSE (e.g., '/sse').
messagePath:
string
The specific part of the URL where clients will send messages (e.g., '/message').
req:
any
The incoming request object from your web server.
res:
any
The response object from your web server, used to send data back.
startHonoSSE()
This method helps you integrate the MCP server with an existing web server to use Server-Sent Events (SSE) for communication. You’ll call this from your web server’s code when it receives a request for the SSE or message paths.

async startHonoSSE({
  url,
  ssePath,
  messagePath,
  req,
  res,
}: {
  url: URL;
  ssePath: string;
  messagePath: string;
  req: any;
  res: any;
}): Promise<void>
Here’s an example of how you might use startHonoSSE within an HTTP server request handler. In this example an MCP client could connect to your MCP server at http://localhost:1234/hono-sse:

import http from "http";
 
const httpServer = http.createServer(async (req, res) => {
  await server.startHonoSSE({
    url: new URL(req.url || "", `http://localhost:1234`),
    ssePath: "/hono-sse",
    messagePath: "/message",
    req,
    res,
  });
});
 
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
Here are the details for the values needed by the startHonoSSE method:

url:
URL
The web address the user is requesting.
ssePath:
string
The specific part of the URL where clients will connect for SSE (e.g., '/hono-sse').
messagePath:
string
The specific part of the URL where clients will send messages (e.g., '/message').
req:
any
The incoming request object from your web server.
res:
any
The response object from your web server, used to send data back.
startHTTP()
This method helps you integrate the MCP server with an existing web server to use streamable HTTP for communication. You’ll call this from your web server’s code when it receives HTTP requests.

async startHTTP({
  url,
  httpPath,
  req,
  res,
  options = { sessionIdGenerator: () => randomUUID() },
}: {
  url: URL;
  httpPath: string;
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage>;
  options?: StreamableHTTPServerTransportOptions;
}): Promise<void>
Here’s an example of how you might use startHTTP within an HTTP server request handler. In this example an MCP client could connect to your MCP server at http://localhost:1234/http:

import http from "http";
 
const httpServer = http.createServer(async (req, res) => {
  await server.startHTTP({
    url: new URL(req.url || '', 'http://localhost:1234'),
    httpPath: `/mcp`,
    req,
    res,
    options: {
      sessionIdGenerator: undefined,
    },
  });
});
 
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
Here are the details for the values needed by the startHTTP method:

url:
URL
The web address the user is requesting.
httpPath:
string
The specific part of the URL where the MCP server will handle HTTP requests (e.g., '/mcp').
req:
http.IncomingMessage
The incoming request object from your web server.
res:
http.ServerResponse
The response object from your web server, used to send data back.
options:
StreamableHTTPServerTransportOptions
Optional configuration for the HTTP transport. See the options table below for more details.
The StreamableHTTPServerTransportOptions object allows you to customize the behavior of the HTTP transport. Here are the available options:

sessionIdGenerator:
(() => string) | undefined
A function that generates a unique session ID. This should be a cryptographically secure, globally unique string. Return `undefined` to disable session management.
onsessioninitialized:
(sessionId: string) => void
A callback that is invoked when a new session is initialized. This is useful for tracking active MCP sessions.
enableJsonResponse:
boolean
If `true`, the server will return plain JSON responses instead of using Server-Sent Events (SSE) for streaming. Defaults to `false`.
eventStore:
EventStore
An event store for message resumability. Providing this enables clients to reconnect and resume message streams.
close()
This method closes the server and releases all resources.

async close(): Promise<void>
getServerInfo()
This method gives you a look at the server’s basic information.

getServerInfo(): ServerInfo
getServerDetail()
This method gives you a detailed look at the server’s information.

getServerDetail(): ServerDetail
getToolListInfo()
This method gives you a look at the tools that were set up when you created the server. It’s a read-only list, useful for debugging purposes.

getToolListInfo(): ToolListInfo
getToolInfo()
This method gives you detailed information about a specific tool.

getToolInfo(toolName: string): ToolInfo
executeTool()
This method executes a specific tool and returns the result.

executeTool(toolName: string, input: any): Promise<any>
getStdioTransport()
If you started the server with startStdio(), you can use this to get the object that manages the stdio communication. This is mostly for checking things internally or for testing.

getStdioTransport(): StdioServerTransport | undefined
getSseTransport()
If you started the server with startSSE(), you can use this to get the object that manages the SSE communication. Like getStdioTransport, this is mainly for internal checks or testing.

getSseTransport(): SSEServerTransport | undefined
getSseHonoTransport()
If you started the server with startHonoSSE(), you can use this to get the object that manages the SSE communication. Like getSseTransport, this is mainly for internal checks or testing.

getSseHonoTransport(): SSETransport | undefined
getStreamableHTTPTransport()
If you started the server with startHTTP(), you can use this to get the object that manages the HTTP communication. Like getSseTransport, this is mainly for internal checks or testing.

getStreamableHTTPTransport(): StreamableHTTPServerTransport | undefined
tools()
Executes a specific tool provided by this MCP server.

async executeTool(
  toolId: string,
  args: any,
  executionContext?: { messages?: any[]; toolCallId?: string },
): Promise<any>
toolId:
string
The ID/name of the tool to execute.
args:
any
The arguments to pass to the tool's execute function.
executionContext?:
object
Optional context for the tool execution, like messages or a toolCallId.
Resource Handling
What are MCP Resources?
Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions. They represent any kind of data that an MCP server wants to make available, such as:

File contents
Database records
API responses
Live system data
Screenshots and images
Log files
Resources are identified by unique URIs (e.g., file:///home/user/documents/report.pdf, postgres://database/customers/schema) and can contain either text (UTF-8 encoded) or binary data (base64 encoded).

Clients can discover resources through:

Direct resources: Servers expose a list of concrete resources via a resources/list endpoint.
Resource templates: For dynamic resources, servers can expose URI templates (RFC 6570) that clients use to construct resource URIs.
To read a resource, clients make a resources/read request with the URI. Servers can also notify clients about changes to the resource list (notifications/resources/list_changed) or updates to specific resource content (notifications/resources/updated) if a client has subscribed to that resource.

For more detailed information, refer to the official MCP documentation on Resources .

MCPServerResources Type
The resources option takes an object of type MCPServerResources. This type defines the callbacks your server will use to handle resource requests:

export type MCPServerResources = {
  // Callback to list available resources
  listResources: () => Promise<Resource[]>;
 
  // Callback to get the content of a specific resource
  getResourceContent: ({
    uri,
  }: {
    uri: string;
  }) => Promise<MCPServerResourceContent | MCPServerResourceContent[]>;
 
  // Optional callback to list available resource templates
  resourceTemplates?: () => Promise<ResourceTemplate[]>;
};
 
export type MCPServerResourceContent = { text?: string } | { blob?: string };
Example:

import { MCPServer } from "@mastra/mcp";
import type {
  MCPServerResourceContent,
  Resource,
  ResourceTemplate,
} from "@mastra/mcp";
 
// Resources/resource templates will generally be dynamically fetched.
const myResources: Resource[] = [
  { uri: "file://data/123.txt", name: "Data File", mimeType: "text/plain" },
];
 
const myResourceContents: Record<string, MCPServerResourceContent> = {
  "file://data.txt/123": { text: "This is the content of the data file." },
};
 
const myResourceTemplates: ResourceTemplate[] = [
  {
    uriTemplate: "file://data/{id}",
    name: "Data File",
    description: "A file containing data.",
    mimeType: "text/plain",
  },
];
 
const myResourceHandlers: MCPServerResources = {
  listResources: async () => myResources,
  getResourceContent: async ({ uri }) => {
    if (myResourceContents[uri]) {
      return myResourceContents[uri];
    }
    throw new Error(`Resource content not found for ${uri}`);
  },
  resourceTemplates: async () => myResourceTemplates,
};
 
const serverWithResources = new MCPServer({
  name: "Resourceful Server",
  version: "1.0.0",
  tools: {
    /* ... your tools ... */
  },
  resources: myResourceHandlers,
});
Notifying Clients of Resource Changes
If the available resources or their content change, your server can notify connected clients that are subscribed to the specific resource.

server.resources.notifyUpdated({ uri: string })
Call this method when the content of a specific resource (identified by its uri) has been updated. If any clients are subscribed to this URI, they will receive a notifications/resources/updated message.

async server.resources.notifyUpdated({ uri: string }): Promise<void>
Example:

// After updating the content of 'file://data.txt'
await serverWithResources.resources.notifyUpdated({ uri: "file://data.txt" });
server.resources.notifyListChanged()
Call this method when the overall list of available resources has changed (e.g., a resource was added or removed). This will send a notifications/resources/list_changed message to clients, prompting them to re-fetch the list of resources.

async server.resources.notifyListChanged(): Promise<void>
Example:

// After adding a new resource to the list managed by 'myResourceHandlers.listResources'
await serverWithResources.resources.notifyListChanged();
Prompt Handling
What are MCP Prompts?
Prompts are reusable templates or workflows that MCP servers expose to clients. They can accept arguments, include resource context, support versioning, and be used to standardize LLM interactions.

Prompts are identified by a unique name (and optional version) and can be dynamic or static.

MCPServerPrompts Type
The prompts option takes an object of type MCPServerPrompts. This type defines the callbacks your server will use to handle prompt requests:

export type MCPServerPrompts = {
  // Callback to list available prompts
  listPrompts: () => Promise<Prompt[]>;
 
  // Callback to get the messages/content for a specific prompt
  getPromptMessages?: ({
    name,
    version,
    args,
  }: {
    name: string;
    version?: string;
    args?: any;
  }) => Promise<{ prompt: Prompt; messages: PromptMessage[] }>;
};
Example:

import { MCPServer } from "@mastra/mcp";
import type { Prompt, PromptMessage, MCPServerPrompts } from "@mastra/mcp";
 
const prompts: Prompt[] = [
  {
    name: "analyze-code",
    description: "Analyze code for improvements",
    version: "v1"
  },
  {
    name: "analyze-code",
    description: "Analyze code for improvements (new logic)",
    version: "v2"
  }
];
 
const myPromptHandlers: MCPServerPrompts = {
  listPrompts: async () => prompts,
  getPromptMessages: async ({ name, version, args }) => {
    if (name === "analyze-code") {
      if (version === "v2") {
        const prompt = prompts.find(p => p.name === name && p.version === "v2");
        if (!prompt) throw new Error("Prompt version not found");
        return {
          prompt,
          messages: [
            {
              role: "user",
              content: { type: "text", text: `Analyze this code with the new logic: ${args.code}` }
            }
          ]
        };
      }
      // Default or v1
      const prompt = prompts.find(p => p.name === name && p.version === "v1");
      if (!prompt) throw new Error("Prompt version not found");
      return {
        prompt,
        messages: [
          {
            role: "user",
            content: { type: "text", text: `Analyze this code: ${args.code}` }
          }
        ]
      };
    }
    throw new Error("Prompt not found");
  }
};
 
const serverWithPrompts = new MCPServer({
  name: "Promptful Server",
  version: "1.0.0",
  tools: { /* ... */ },
  prompts: myPromptHandlers,
});
Notifying Clients of Prompt Changes
If the available prompts change, your server can notify connected clients:

server.prompts.notifyListChanged()
Call this method when the overall list of available prompts has changed (e.g., a prompt was added or removed). This will send a notifications/prompts/list_changed message to clients, prompting them to re-fetch the list of prompts.

await serverWithPrompts.prompts.notifyListChanged();
Best Practices for Prompt Handling
Use clear, descriptive prompt names and descriptions.
Validate all required arguments in getPromptMessages.
Include a version field if you expect to make breaking changes.
Use the version parameter to select the correct prompt logic.
Notify clients when prompt lists change.
Handle errors with informative messages.
Document argument expectations and available versions.
Examples
For practical examples of setting up and deploying an MCPServer, see the Deploying an MCPServer Example.

The example at the beginning of this page also demonstrates how to instantiate MCPServer with both tools and agents.

Elicitation
What is Elicitation?
Elicitation is a feature in the Model Context Protocol (MCP) that allows servers to request structured information from users. This enables interactive workflows where servers can collect additional data dynamically.

The MCPServer class automatically includes elicitation capabilities. Tools receive an options parameter in their execute function that includes an elicitation.sendRequest() method for requesting user input.

Tool Execution Signature
When tools are executed within an MCP server context, they receive an additional options parameter:

execute: async ({ context }, options) => {
  // context contains the tool's input parameters
  // options contains server capabilities like elicitation and authentication info
  
  // Access authentication information (when available)
  if (options.extra?.authInfo) {
    console.log('Authenticated request from:', options.extra.authInfo.clientId);
  }
  
  // Use elicitation capabilities
  const result = await options.elicitation.sendRequest({
    message: "Please provide information",
    requestedSchema: { /* schema */ }
  });
  
  return result;
}
How Elicitation Works
A common use case is during tool execution. When a tool needs user input, it can use the elicitation functionality provided through the tool’s execution options:

The tool calls options.elicitation.sendRequest() with a message and schema
The request is sent to the connected MCP client
The client presents the request to the user (via UI, command line, etc.)
The user provides input, declines, or cancels the request
The client sends the response back to the server
The tool receives the response and continues execution
Using Elicitation in Tools
Here’s an example of a tool that uses elicitation to collect user contact information:

import { MCPServer } from "@mastra/mcp";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
const server = new MCPServer({
  name: "Interactive Server",
  version: "1.0.0",
  tools: {
    collectContactInfo: createTool({
      id: "collectContactInfo",
      description: "Collects user contact information through elicitation",
      inputSchema: z.object({
        reason: z.string().optional().describe("Reason for collecting contact info"),
      }),
      execute: async ({ context }, options) => {
        const { reason } = context;
        
        // Log session info if available
        console.log('Request from session:', options.extra?.sessionId);
 
        try {
          // Request user input via elicitation
          const result = await options.elicitation.sendRequest({
            message: reason 
              ? `Please provide your contact information. ${reason}`
              : 'Please provide your contact information',
            requestedSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: 'Full Name',
                  description: 'Your full name',
                },
                email: {
                  type: 'string',
                  title: 'Email Address', 
                  description: 'Your email address',
                  format: 'email',
                },
                phone: {
                  type: 'string',
                  title: 'Phone Number',
                  description: 'Your phone number (optional)',
                },
              },
              required: ['name', 'email'],
            },
          });
 
          // Handle the user's response
          if (result.action === 'accept') {
            return `Contact information collected: ${JSON.stringify(result.content, null, 2)}`;
          } else if (result.action === 'decline') {
            return 'Contact information collection was declined by the user.';
          } else {
            return 'Contact information collection was cancelled by the user.';
          }
        } catch (error) {
          return `Error collecting contact information: ${error}`;
        }
      },
    }),
  },
});
Elicitation Request Schema
The requestedSchema must be a flat object with primitive properties only. Supported types include:

String: { type: 'string', title: 'Display Name', description: 'Help text' }
Number: { type: 'number', minimum: 0, maximum: 100 }
Boolean: { type: 'boolean', default: false }
Enum: { type: 'string', enum: ['option1', 'option2'] }
Example schema:

{
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Full Name',
      description: 'Your complete name',
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to Newsletter',
      default: false,
    },
  },
  required: ['name'],
}
Response Actions
Users can respond to elicitation requests in three ways:

Accept (action: 'accept'): User provided data and confirmed submission
Contains content field with the submitted data
Decline (action: 'decline'): User explicitly declined to provide information
No content field
Cancel (action: 'cancel'): User dismissed the request without deciding
No content field
Tools should handle all three response types appropriately.

Security Considerations
Never request sensitive information like passwords, SSNs, or credit card numbers
Validate all user input against the provided schema
Handle declining and cancellation gracefully
Provide clear reasons for data collection
Respect user privacy and preferences
Tool Execution API
The elicitation functionality is available through the options parameter in tool execution:

// Within a tool's execute function
execute: async ({ context }, options) => {
  // Use elicitation for user input
  const result = await options.elicitation.sendRequest({
    message: string,           // Message to display to user
    requestedSchema: object    // JSON schema defining expected response structure
  }): Promise<ElicitResult>
  
  // Access authentication info if needed
  if (options.extra?.authInfo) {
    // Use options.extra.authInfo.token, etc.
  }
}
Note that elicitation is session-aware when using HTTP-based transports (SSE or HTTP). This means that when multiple clients are connected to the same server, elicitation requests are routed to the correct client session that initiated the tool execution.

The ElicitResult type:

type ElicitResult = {
  action: 'accept' | 'decline' | 'cancel';
  content?: any; // Only present when action is 'accept'
}
Authentication Context
Tools can access request metadata via options.extra when using HTTP-based transports:

execute: async ({ context }, options) => {
  if (!options.extra?.authInfo?.token) {
    return "Authentication required";
  }
  
  // Use the auth token
  const response = await fetch('/api/data', {
    headers: { Authorization: `Bearer ${options.extra.authInfo.token}` },
    signal: options.extra.signal,
  });
  
  return response.json();
}
The extra object contains:

authInfo: Authentication info (when provided by server middleware)
sessionId: Session identifier
signal: AbortSignal for cancellation
sendNotification/sendRequest: MCP protocol functions
Note: To enable authentication, your HTTP server needs middleware that populates req.auth before calling server.startHTTP(). For example:

httpServer.createServer((req, res) => {
  // Add auth middleware
  req.auth = validateAuthToken(req.headers.authorization);
  
  // Then pass to MCP server
  await server.startHTTP({ url, httpPath, req, res });
});

createDocumentChunkerTool()
The createDocumentChunkerTool() function creates a tool for splitting documents into smaller chunks for efficient processing and retrieval. It supports different chunking strategies and configurable parameters.

Basic Usage
import { createDocumentChunkerTool, MDocument } from "@mastra/rag";
 
const document = new MDocument({
  text: "Your document content here...",
  metadata: { source: "user-manual" },
});
 
const chunker = createDocumentChunkerTool({
  doc: document,
  params: {
    strategy: "recursive",
    size: 512,
    overlap: 50,
    separator: "\n",
  },
});
 
const { chunks } = await chunker.execute();
Parameters
doc:
MDocument
The document to be chunked
params?:
ChunkParams
= Default chunking parameters
Configuration parameters for chunking
ChunkParams
strategy?:
'recursive'
= 'recursive'
The chunking strategy to use
size?:
number
= 512
Target size of each chunk in tokens/characters
overlap?:
number
= 50
Number of overlapping tokens/characters between chunks
separator?:
string
= '\n'
Character(s) to use as chunk separator
Returns
chunks:
DocumentChunk[]
Array of document chunks with their content and metadata
Example with Custom Parameters
const technicalDoc = new MDocument({
  text: longDocumentContent,
  metadata: {
    type: "technical",
    version: "1.0",
  },
});
 
const chunker = createDocumentChunkerTool({
  doc: technicalDoc,
  params: {
    strategy: "recursive",
    size: 1024, // Larger chunks
    overlap: 100, // More overlap
    separator: "\n\n", // Split on double newlines
  },
});
 
const { chunks } = await chunker.execute();
 
// Process the chunks
chunks.forEach((chunk, index) => {
  console.log(`Chunk ${index + 1} length: ${chunk.content.length}`);
});
Tool Details
The chunker is created as a Mastra tool with the following properties:

Tool ID: Document Chunker {strategy} {size}
Description: Chunks document using {strategy} strategy with size {size} and {overlap} overlap
Input Schema: Empty object (no additional inputs required)
Output Schema: Object containing the chunks array

createGraphRAGTool()
The createGraphRAGTool() creates a tool that enhances RAG by building a graph of semantic relationships between documents. It uses the GraphRAG system under the hood to provide graph-based retrieval, finding relevant content through both direct similarity and connected relationships.

Usage Example
import { openai } from "@ai-sdk/openai";
import { createGraphRAGTool } from "@mastra/rag";
 
const graphTool = createGraphRAGTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    dimension: 1536,
    threshold: 0.7,
    randomWalkSteps: 100,
    restartProb: 0.15,
  },
});
Parameters
Parameter Requirements: Most fields can be set at creation as defaults. Some fields can be overridden at runtime via the runtime context or input. If a required field is missing from both creation and runtime, an error will be thrown. Note that model, id, and description can only be set at creation time.

id?:
string
Custom ID for the tool. By default: 'GraphRAG {vectorStoreName} {indexName} Tool'. (Set at creation only.)
description?:
string
Custom description for the tool. By default: 'Access and analyze relationships between information in the knowledge base to answer complex questions about connections and patterns.' (Set at creation only.)
vectorStoreName:
string
Name of the vector store to query. (Can be set at creation or overridden at runtime.)
indexName:
string
Name of the index within the vector store. (Can be set at creation or overridden at runtime.)
model:
EmbeddingModel
Embedding model to use for vector search. (Set at creation only.)
enableFilter?:
boolean
= false
Enable filtering of results based on metadata. (Set at creation only, but will be automatically enabled if a filter is provided in the runtime context.)
includeSources?:
boolean
= true
Include the full retrieval objects in the results. (Can be set at creation or overridden at runtime.)
graphOptions?:
GraphOptions
= Default graph options
Configuration for the graph-based retrieval
GraphOptions
dimension?:
number
= 1536
Dimension of the embedding vectors
threshold?:
number
= 0.7
Similarity threshold for creating edges between nodes (0-1)
randomWalkSteps?:
number
= 100
Number of steps in random walk for graph traversal. (Can be set at creation or overridden at runtime.)
restartProb?:
number
= 0.15
Probability of restarting random walk from query node. (Can be set at creation or overridden at runtime.)
Returns
The tool returns an object with:

relevantContext:
string
Combined text from the most relevant document chunks, retrieved using graph-based ranking
sources:
QueryResult[]
Array of full retrieval result objects. Each object contains all information needed to reference the original document, chunk, and similarity score.
QueryResult object structure
{
  id: string;         // Unique chunk/document identifier
  metadata: any;      // All metadata fields (document ID, etc.)
  vector: number[];   // Embedding vector (if available)
  score: number;      // Similarity score for this retrieval
  document: string;   // Full chunk/document text (if available)
}
Default Tool Description
The default description focuses on:

Analyzing relationships between documents
Finding patterns and connections
Answering complex queries
Advanced Example
const graphTool = createGraphRAGTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    dimension: 1536,
    threshold: 0.8, // Higher similarity threshold
    randomWalkSteps: 200, // More exploration steps
    restartProb: 0.2, // Higher restart probability
  },
});
Example with Custom Description
const graphTool = createGraphRAGTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  description:
    "Analyze document relationships to find complex patterns and connections in our company's historical data",
});
This example shows how to customize the tool description for a specific use case while maintaining its core purpose of relationship analysis.

Example: Using Runtime Context
const graphTool = createGraphRAGTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
});
When using runtime context, provide required parameters at execution time via the runtime context:

const runtimeContext = new RuntimeContext<{
  vectorStoreName: string;
  indexName: string;
  topK: number;
  filter: any;
}>();
runtimeContext.set("vectorStoreName", "my-store");
runtimeContext.set("indexName", "my-index");
runtimeContext.set("topK", 5);
runtimeContext.set("filter", { category: "docs" });
runtimeContext.set("randomWalkSteps", 100);
runtimeContext.set("restartProb", 0.15);
 
const response = await agent.generate(
  "Find documentation from the knowledge base.",
  {
    runtimeContext,
  },
);

createVectorQueryTool()
The createVectorQueryTool() function creates a tool for semantic search over vector stores. It supports filtering, reranking, database-specific configurations, and integrates with various vector store backends.

Basic Usage
import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";
 
const queryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
});
Parameters
Parameter Requirements: Most fields can be set at creation as defaults. Some fields can be overridden at runtime via the runtime context or input. If a required field is missing from both creation and runtime, an error will be thrown. Note that model, id, and description can only be set at creation time.

id?:
string
Custom ID for the tool. By default: 'VectorQuery {vectorStoreName} {indexName} Tool'. (Set at creation only.)
description?:
string
Custom description for the tool. By default: 'Access the knowledge base to find information needed to answer user questions' (Set at creation only.)
model:
EmbeddingModel
Embedding model to use for vector search. (Set at creation only.)
vectorStoreName:
string
Name of the vector store to query. (Can be set at creation or overridden at runtime.)
indexName:
string
Name of the index within the vector store. (Can be set at creation or overridden at runtime.)
enableFilter?:
boolean
= false
Enable filtering of results based on metadata. (Set at creation only, but will be automatically enabled if a filter is provided in the runtime context.)
includeVectors?:
boolean
= false
Include the embedding vectors in the results. (Can be set at creation or overridden at runtime.)
includeSources?:
boolean
= true
Include the full retrieval objects in the results. (Can be set at creation or overridden at runtime.)
reranker?:
RerankConfig
Options for reranking results. (Can be set at creation or overridden at runtime.)
databaseConfig?:
DatabaseConfig
Database-specific configuration options for optimizing queries. (Can be set at creation or overridden at runtime.)
DatabaseConfig
The DatabaseConfig type allows you to specify database-specific configurations that are automatically applied to query operations. This enables you to take advantage of unique features and optimizations offered by different vector stores.

pinecone?:
PineconeConfig
Configuration specific to Pinecone vector store
object
namespace?:
string
Pinecone namespace for organizing vectors
sparseVector?:
{ indices: number[]; values: number[]; }
Sparse vector for hybrid search
pgvector?:
PgVectorConfig
Configuration specific to PostgreSQL with pgvector extension
object
minScore?:
number
Minimum similarity score threshold for results
ef?:
number
HNSW search parameter - controls accuracy vs speed tradeoff
probes?:
number
IVFFlat probe parameter - number of cells to visit during search
chroma?:
ChromaConfig
Configuration specific to Chroma vector store
object
where?:
Record<string, any>
Metadata filtering conditions
whereDocument?:
Record<string, any>
Document content filtering conditions
RerankConfig
model:
MastraLanguageModel
Language model to use for reranking
options?:
RerankerOptions
Options for the reranking process
object
weights?:
WeightConfig
Weights for scoring components (semantic: 0.4, vector: 0.4, position: 0.2)
topK?:
number
Number of top results to return
Returns
The tool returns an object with:

relevantContext:
string
Combined text from the most relevant document chunks
sources:
QueryResult[]
Array of full retrieval result objects. Each object contains all information needed to reference the original document, chunk, and similarity score.
QueryResult object structure
{
  id: string;         // Unique chunk/document identifier
  metadata: any;      // All metadata fields (document ID, etc.)
  vector: number[];   // Embedding vector (if available)
  score: number;      // Similarity score for this retrieval
  document: string;   // Full chunk/document text (if available)
}
Default Tool Description
The default description focuses on:

Finding relevant information in stored knowledge
Answering user questions
Retrieving factual content
Result Handling
The tool determines the number of results to return based on the user’s query, with a default of 10 results. This can be adjusted based on the query requirements.

Example with Filters
const queryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  enableFilter: true,
});
With filtering enabled, the tool processes queries to construct metadata filters that combine with semantic search. The process works as follows:

A user makes a query with specific filter requirements like “Find content where the ‘version’ field is greater than 2.0”
The agent analyzes the query and constructs the appropriate filters:
{
   "version": { "$gt": 2.0 }
}
This agent-driven approach:

Processes natural language queries into filter specifications
Implements vector store-specific filter syntax
Translates query terms to filter operators
For detailed filter syntax and store-specific capabilities, see the Metadata Filters documentation.

For an example of how agent-driven filtering works, see the Agent-Driven Metadata Filtering example.

Example with Reranking
const queryTool = createVectorQueryTool({
  vectorStoreName: "milvus",
  indexName: "documentation",
  model: openai.embedding("text-embedding-3-small"),
  reranker: {
    model: openai("gpt-4o-mini"),
    options: {
      weights: {
        semantic: 0.5, // Semantic relevance weight
        vector: 0.3, // Vector similarity weight
        position: 0.2, // Original position weight
      },
      topK: 5,
    },
  },
});
Reranking improves result quality by combining:

Semantic relevance: Using LLM-based scoring of text similarity
Vector similarity: Original vector distance scores
Position bias: Consideration of original result ordering
Query analysis: Adjustments based on query characteristics
The reranker processes the initial vector search results and returns a reordered list optimized for relevance.

Example with Custom Description
const queryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  description:
    "Search through document archives to find relevant information for answering questions about company policies and procedures",
});
This example shows how to customize the tool description for a specific use case while maintaining its core purpose of information retrieval.

Database-Specific Configuration Examples
The databaseConfig parameter allows you to leverage unique features and optimizations specific to each vector database. These configurations are automatically applied during query execution.

Pinecone Configuration
const pineconeQueryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pinecone: {
      namespace: "production",  // Organize vectors by environment
      sparseVector: {          // Enable hybrid search
        indices: [0, 1, 2, 3],
        values: [0.1, 0.2, 0.15, 0.05]
      }
    }
  }
});
Pinecone Features:

Namespace: Isolate different data sets within the same index
Sparse Vector: Combine dense and sparse embeddings for improved search quality
Use Cases: Multi-tenant applications, hybrid semantic search
Runtime Configuration Override
You can override database configurations at runtime to adapt to different scenarios:

import { RuntimeContext } from '@mastra/core/runtime-context';
 
const queryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pinecone: {
      namespace: "development"
    }
  }
});
 
// Override at runtime
const runtimeContext = new RuntimeContext();
runtimeContext.set('databaseConfig', {
  pinecone: {
    namespace: 'production'  // Switch to production namespace
  }
});
 
const response = await agent.generate(
  "Find information about deployment",
  { runtimeContext }
);
This approach allows you to:

Switch between environments (dev/staging/prod)
Adjust performance parameters based on load
Apply different filtering strategies per request
Example: Using Runtime Context
const queryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
});
When using runtime context, provide required parameters at execution time via the runtime context:

const runtimeContext = new RuntimeContext<{
  vectorStoreName: string;
  indexName: string;
  topK: number;
  filter: VectorFilter;
  databaseConfig: DatabaseConfig;
}>();
runtimeContext.set("vectorStoreName", "my-store");
runtimeContext.set("indexName", "my-index");
runtimeContext.set("topK", 5);
runtimeContext.set("filter", { category: "docs" });
runtimeContext.set("databaseConfig", {
  pinecone: { namespace: "runtime-namespace" }
});
runtimeContext.set("model", openai.embedding("text-embedding-3-small"));
 
const response = await agent.generate(
  "Find documentation from the knowledge base.",
  {
    runtimeContext,
  },
);
For more information on runtime context, please see:

Runtime Variables
Dynamic Context
Usage Without a Mastra Server
The tool can be used by itself to retrieve documents matching a query:

src/index.ts

import { openai } from "@ai-sdk/openai";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { createVectorQueryTool } from "@mastra/rag";
import { PgVector } from "@mastra/pg";
 
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector", // optional since we're passing in a store
  vectorStore: pgVector,
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
 
const runtimeContext = new RuntimeContext();
const queryResult = await vectorQueryTool.execute({
  context: { queryText: "foo", topK: 1 },
  runtimeContext,
});
 
console.log(queryResult.sources);
Tool Details
The tool is created with:

ID: VectorQuery {vectorStoreName} {indexName} Tool
Input Schema: Requires queryText and filter objects
Output Schema: Returns relevantContext string