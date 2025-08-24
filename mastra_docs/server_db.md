Create a Mastra Production Server
When deploying your Mastra application to production, it runs as an HTTP server that exposes your agents, workflows, and other functionality as API endpoints. This page covers how to configure and customize the server for a production environment.

Server Architecture
Mastra uses Hono  as its underlying HTTP server framework. When you build a Mastra application using mastra build, it generates a Hono-based HTTP server in the .mastra directory.

The server provides:

API endpoints for all registered agents
API endpoints for all registered workflows
Custom API route support
Custom middleware support
Configuration of timeout
Configuration of port
Configuration of body limit
See the Middleware and Custom API Routes pages for details on adding additional server behaviour.

Server configuration
You can configure server port and timeout in the Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
export const mastra = new Mastra({
  // ...
  server: {
    port: 3000, // Defaults to 4111
    timeout: 10000, // Defaults to 30000 (30s)
  },
});
The method option can be one of "GET", "POST", "PUT", "DELETE" or "ALL". Using "ALL" will cause the handler to be invoked for any HTTP method that matches the path.

Custom CORS Config
Mastra allows you to configure CORS (Cross-Origin Resource Sharing) settings for your server.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
export const mastra = new Mastra({
  // ...
  server: {
    cors: {
      origin: ["https://example.com"], // Allow specific origins or '*' for all
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    },
  },
});

Middleware
Mastra servers can execute custom middleware functions before or after an API route handler is invoked. This is useful for things like authentication, logging, injecting request-specific context or adding CORS headers.

A middleware receives the Hono  Context (c) and a next function. If it returns a Response the request is short-circuited. Calling next() continues processing the next middleware or route handler.


import { Mastra } from "@mastra/core";
 
export const mastra = new Mastra({
  server: {
    middleware: [
      {
        handler: async (c, next) => {
          // Example: Add authentication check
          const authHeader = c.req.header("Authorization");
          if (!authHeader) {
            return new Response("Unauthorized", { status: 401 });
          }
 
          await next();
        },
        path: "/api/*",
      },
      // Add a global request logger
      async (c, next) => {
        console.log(`${c.req.method} ${c.req.url}`);
        await next();
      },
    ],
  },
});
To attach middleware to a single route pass the middleware option to registerApiRoute:


registerApiRoute("/my-custom-route", {
  method: "GET",
  middleware: [
    async (c, next) => {
      console.log(`${c.req.method} ${c.req.url}`);
      await next();
    },
  ],
  handler: async (c) => {
    const mastra = c.get("mastra");
    return c.json({ message: "Hello, world!" });
  },
});
Common examples
Authentication

{
  handler: async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }
 
    // Validate token here
    await next();
  },
  path: '/api/*',
}
CORS support

{
  handler: async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    c.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
 
    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
 
    await next();
  },
}
Request logging

{
  handler: async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${duration}ms`);
  },
}
Special Mastra headers
When integrating with Mastra Cloud or custom clients the following headers can be inspected by middleware to tailor behaviour:


{
  handler: async (c, next) => {
    const isFromMastraCloud = c.req.header('x-mastra-cloud') === 'true';
    const clientType = c.req.header('x-mastra-client-type');
    const isDevPlayground =
      c.req.header('x-mastra-dev-playground') === 'true';
 
    if (isFromMastraCloud) {
      // Special handling
    }
    await next();
  },
}
x-mastra-cloud: request originates from Mastra Cloud
x-mastra-client-type: identifies the client SDK, e.g. js or python
x-mastra-dev-playground: request triggered from a local playground

Custom API Routes
By default Mastra automatically exposes registered agents and workflows via the server. For additional behavior you can define your own HTTP routes.

Routes are provided with a helper registerApiRoute from @mastra/core/server. Routes can live in the same file as the Mastra instance but separating them helps keep configuration concise.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { registerApiRoute } from "@mastra/core/server";
 
export const mastra = new Mastra({
  // ...
  server: {
    apiRoutes: [
      registerApiRoute("/my-custom-route", {
        method: "GET",
        handler: async (c) => {
          const mastra = c.get("mastra");
          const agents = await mastra.getAgent("my-agent");
 
          return c.json({ message: "Custom route" });
        },
      }),
    ],
  },
});
Once registered, a custom route will be accessible from the root of the server. For example:

curl http://localhost:4111/my-custom-route
Each route’s handler receives the Hono Context. Within the handler you can access the Mastra instance to fetch or call agents and workflows.

To add route-specific middleware pass a middleware array when calling registerApiRoute.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { registerApiRoute } from "@mastra/core/server";
 
export const mastra = new Mastra({
  // ...
  server: {
    apiRoutes: [
      registerApiRoute("/my-custom-route", {
        method: "GET",
        middleware: [
          async (c, next) => {
            console.log(`${c.req.method} ${c.req.url}`);
            await next();
          }
        ],
        handler: async (c) => {
          return c.json({ message: "Custom route with middleware" });
        }
      })
    ]
  }
});

MastraStorage
MastraStorage provides a unified interface for managing:

Suspended Workflows: the serialized state of suspended workflows (so they can be resumed later)
Memory: threads and messages per resourceId in your application
Traces: OpenTelemetry traces from all components of Mastra
Eval Datasets: scores and scoring reasons from eval runs


Diagram showing storage in Mastra
Mastra provides different storage providers, but you can treat them as interchangeable. Eg, you could use libsql in development but postgres in production, and your code will work the same both ways.

Configuration
Mastra can be configured with a default storage option:


import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
 
const mastra = new Mastra({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
});
If you do not specify any storage configuration, Mastra will not persist data across application restarts or deployments. For any deployment beyond local testing you should provide your own storage configuration either on Mastra or directly within new Memory().

Data Schema
Stores conversation messages and their metadata. Each message belongs to a thread and contains the actual content along with metadata about the sender role and message type.


id
uuidv4
PRIMARYKEY
NOT NULL
Unique identifier for the message (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
thread_id
uuidv4
FK → threads.id
NOT NULL
Parent thread reference
resourceId
uuidv4
CAN BE NULL
ID of the resource that owns this message
content
text
NOT NULL
JSON of the message content in V2 format. Example: { format: 2, parts: [...] }
role
text
NOT NULL
Enum of user | assistant
createdAt
timestamp
NOT NULL
Used for thread message ordering
The message content column contains a JSON object conforming to the MastraMessageContentV2 type, which is designed to align closely with the AI SDK UIMessage message shape.

format
integer
NOT NULL
Message format version (currently 2)
parts
array (JSON)
NOT NULL
Array of message parts (text, tool-invocation, file, reasoning, etc.). The structure of items in this array varies by type.
experimental_attachments
array (JSON)
CAN BE NULL
Optional array of file attachments
content
text
CAN BE NULL
Optional main text content of the message
toolInvocations
array (JSON)
CAN BE NULL
Optional array summarizing tool calls and results
reasoning
object (JSON)
CAN BE NULL
Optional information about the reasoning process behind the assistant's response
annotations
object (JSON)
CAN BE NULL
Optional additional metadata or annotations
Querying Messages
Messages are stored in a V2 format internally, which is roughly equivalent to the AI SDK’s UIMessage format. When querying messages using getMessages, you can specify the desired output format, defaulting to v1 for backwards compatibility:


// Get messages in the default V1 format (roughly equivalent to AI SDK's CoreMessage format)
const messagesV1 = await mastra.getStorage().getMessages({ threadId: 'your-thread-id' });
 
// Get messages in the V2 format (roughly equivalent to AI SDK's UIMessage format)
const messagesV2 = await mastra.getStorage().getMessages({ threadId: 'your-thread-id', format: 'v2' });
You can also retrieve messages using an array of message IDs. Note that unlike getMessages, this defaults to the V2 format:


const messagesV1 = await mastra.getStorage().getMessagesById({ messageIds: messageIdArr, format: 'v1' });
 
const messagesV2 = await mastra.getStorage().getMessagesById({ messageIds: messageIdArr });
Storage Providers
Mastra supports the following providers:

For local development, check out LibSQL Storage
For production, check out PostgreSQL Storage
For serverless deployments, check out Upstash Storage

Snapshots
In Mastra, a snapshot is a serializable representation of a workflow’s complete execution state at a specific point in time. Snapshots capture all the information needed to resume a workflow from exactly where it left off, including:

The current state of each step in the workflow
The outputs of completed steps
The execution path taken through the workflow
Any suspended steps and their metadata
The remaining retry attempts for each step
Additional contextual data needed to resume execution
Snapshots are automatically created and managed by Mastra whenever a workflow is suspended, and are persisted to the configured storage system.

The Role of Snapshots in Suspend and Resume
Snapshots are the key mechanism enabling Mastra’s suspend and resume capabilities. When a workflow step calls await suspend():

The workflow execution is paused at that exact point
The current state of the workflow is captured as a snapshot
The snapshot is persisted to storage
The workflow step is marked as “suspended” with a status of 'suspended'
Later, when resume() is called on the suspended step, the snapshot is retrieved
The workflow execution resumes from exactly where it left off
This mechanism provides a powerful way to implement human-in-the-loop workflows, handle rate limiting, wait for external resources, and implement complex branching workflows that may need to pause for extended periods.

Snapshot Anatomy
A Mastra workflow snapshot consists of several key components:

export interface WorkflowRunState {
  // Core state info
  value: Record<string, string>; // Current state machine value
  context: {
    // Workflow context
    [key: string]: Record<
      string,
      | {
          status: "success";
          output: any;
        }
      | {
          status: "failed";
          error: string;
        }
      | {
          status: "suspended";
          payload?: any;
        }
    >;
    input: Record<string, any>; // Initial input data
  };
 
  activePaths: Array<{
    // Currently active execution paths
    stepPath: string[];
    stepId: string;
    status: string;
  }>;
 
  // Paths to suspended steps
  suspendedPaths: Record<string, number[]>;
 
  // Metadata
  runId: string; // Unique run identifier
  timestamp: number; // Time snapshot was created
}
How Snapshots Are Saved and Retrieved
Mastra persists snapshots to the configured storage system. By default, snapshots are saved to a LibSQL database, but can be configured to use other storage providers like Upstash. The snapshots are stored in the workflow_snapshots table and identified uniquely by the run_id for the associated run when using libsql. Utilizing a persistence layer allows for the snapshots to be persisted across workflow runs, allowing for advanced human-in-the-loop functionality.

Read more about libsql storage and upstash storage here.

Saving Snapshots
When a workflow is suspended, Mastra automatically persists the workflow snapshot with these steps:

The suspend() function in a step execution triggers the snapshot process
The WorkflowInstance.suspend() method records the suspended machine
persistWorkflowSnapshot() is called to save the current state
The snapshot is serialized and stored in the configured database in the workflow_snapshots table
The storage record includes the workflow name, run ID, and the serialized snapshot
Retrieving Snapshots
When a workflow is resumed, Mastra retrieves the persisted snapshot with these steps:

The resume() method is called with a specific step ID
The snapshot is loaded from storage using loadWorkflowSnapshot()
The snapshot is parsed and prepared for resumption
The workflow execution is recreated with the snapshot state
The suspended step is resumed, and execution continues
Storage Options for Snapshots
Mastra provides multiple storage options for persisting snapshots.

A storage instance is configured on the Mastra class, and is used to setup a snapshot persistence layer for all workflows registered on the Mastra instance. This means that storage is shared across all workflows registered with the same Mastra instance.

LibSQL (Default)
The default storage option is LibSQL, a SQLite-compatible database:

import { Mastra } from "@mastra/core/mastra";
import { DefaultStorage } from "@mastra/core/storage/libsql";
 
const mastra = new Mastra({
  storage: new DefaultStorage({
    config: {
      url: "file:storage.db", // Local file-based database
      // For production:
      // url: process.env.DATABASE_URL,
      // authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  workflows: {
    weatherWorkflow,
    travelWorkflow,
  },
});
Upstash (Redis-Compatible)
For serverless environments:

import { Mastra } from "@mastra/core/mastra";
import { UpstashStore } from "@mastra/upstash";
 
const mastra = new Mastra({
  storage: new UpstashStore({
    url: process.env.UPSTASH_URL,
    token: process.env.UPSTASH_TOKEN,
  }),
  workflows: {
    weatherWorkflow,
    travelWorkflow,
  },
});
Best Practices for Working with Snapshots
Ensure Serializability: Any data that needs to be included in the snapshot must be serializable (convertible to JSON).

Minimize Snapshot Size: Avoid storing large data objects directly in the workflow context. Instead, store references to them (like IDs) and retrieve the data when needed.

Handle Resume Context Carefully: When resuming a workflow, carefully consider what context to provide. This will be merged with the existing snapshot data.

Set Up Proper Monitoring: Implement monitoring for suspended workflows, especially long-running ones, to ensure they are properly resumed.

Consider Storage Scaling: For applications with many suspended workflows, ensure your storage solution is appropriately scaled.

Advanced Snapshot Patterns
Custom Snapshot Metadata
When suspending a workflow, you can include custom metadata that can help when resuming:

await suspend({
  reason: "Waiting for customer approval",
  requiredApprovers: ["manager", "finance"],
  requestedBy: currentUser,
  urgency: "high",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
This metadata is stored with the snapshot and available when resuming.

Conditional Resumption
You can implement conditional logic based on the suspend payload when resuming:

run.watch(async ({ activePaths }) => {
  const isApprovalStepSuspended =
    activePaths.get("approval")?.status === "suspended";
  if (isApprovalStepSuspended) {
    const payload = activePaths.get("approval")?.suspendPayload;
    if (payload.urgency === "high" && currentUser.role === "manager") {
      await resume({
        stepId: "approval",
        context: { approved: true, approver: currentUser.id },
      });
    }
  }
});

Mastra Client SDK
The Mastra Client SDK provides a simple and type-safe interface for interacting with your Mastra Server from your client environment.

Development Requirements
To ensure smooth local development, make sure you have:

Node.js 18.x or later installed
TypeScript 4.7+ (if using TypeScript)
A modern browser environment with Fetch API support
Your local Mastra server running (typically on port 4111)
Installation

npm install @mastra/client-js@latest
Initialize Mastra Client
To get started you’ll need to initialize your MastraClient with necessary parameters:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111", // Default Mastra development server port
});
Configuration Options
You can customize the client with various options:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
export const mastraClient = new MastraClient({
  // Required
  baseUrl: "http://localhost:4111",
 
  // Optional configurations for development
  retries: 3, // Number of retry attempts
  backoffMs: 300, // Initial retry backoff time
  maxBackoffMs: 5000, // Maximum retry backoff time
  headers: {
    // Custom headers for development
    "X-Development": "true",
  },
});
AbortSignal
The Mastra Client SDK supports request cancellation using the standard Web API AbortSignal. Pass an AbortSignal to the client constructor to enable cancellation for all requests:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
const controller = new AbortController();
 
export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111",
  abortSignal: controller.signal,
});
 
// Cancel all requests from this client
controller.abort();
Example
Once your MastraClient is initialized you can start making client calls via the type-safe interface

// Get a reference to your local agent
const agent = client.getAgent("dev-agent-id");
 
// Generate responses
const response = await agent.generate({
  messages: [
    {
      role: "user",
      content: "Hello, I'm testing the local development setup!",
    },
  ],
});
Available Features
Mastra client exposes all resources served by the Mastra Server

Agents
: Create and manage AI agents, generate responses, and handle streaming interactions
Memory
: Manage conversation threads and message history
Tools
: Access and execute tools available to agents
Workflows
: Create and manage automated workflows
Vectors
: Handle vector operations for semantic search and similarity matching
Best Practices
Error Handling: Implement proper error handling for development scenarios
Environment Variables: Use environment variables for configuration
Debugging: Enable detailed logging when needed
// Example with error handling and logging
try {
  const agent = client.getAgent("dev-agent-id");
  const response = await agent.generate({
    messages: [{ role: "user", content: "Test message" }],
  });
  console.log("Response:", response);
} catch (error) {
  console.error("Development error:", error);
}
Debug
Sometimes when using MastraClient on the server instead of the client e.g /api/chat, you might need to recreate the response to your client:
const result = agent.stream(/* get your agent stream */);
return new Response(result.body);

Deployment Overview
Mastra offers multiple deployment options to suit your application’s needs, from fully-managed solutions to self-hosted options, and web framework integrations. This guide will help you understand the available deployment paths and choose the right one for your project.

Deployment Options
Mastra Cloud
Mastra Cloud is a deployment platform that connects to your GitHub repository, automatically deploys on code changes, and provides monitoring tools. It includes:

GitHub repository integration
Deployment on git push
Agent testing interface
Comprehensive logs and traces
Custom domains for each project
View Mastra Cloud documentation →

With a Web Framework
Mastra can be integrated with a variety of web frameworks. For example, see one of the following for a detailed guide.

With Next.js
With Astro
When integrated with a framework, Mastra typically requires no additional configuration for deployment.

View Web Framework Integration →

With a Server
You can deploy Mastra as a standard Node.js HTTP server, which gives you full control over your infrastructure and deployment environment.

Custom API routes and middleware
Configurable CORS and authentication
Deploy to VMs, containers, or PaaS platforms
Ideal for integrating with existing Node.js applications
Server deployment guide →

Serverless Platforms
Mastra provides platform-specific deployers for popular serverless platforms, enabling you to deploy your application with minimal configuration.

Deploy to Cloudflare Workers, Vercel, or Netlify
Platform-specific optimizations
Simplified deployment process
Automatic scaling through the platform
Serverless deployment guide →

Client Configuration
Once your Mastra application is deployed, you’ll need to configure your client to communicate with it. The Mastra Client SDK provides a simple and type-safe interface for interacting with your Mastra server.

Type-safe API interactions
Authentication and request handling
Retries and error handling
Support for streaming responses
Client configuration guide →

Choosing a Deployment Option
Option	Best For	Key Benefits
Mastra Cloud	Teams wanting to ship quickly without infrastructure concerns	Fully-managed, automatic scaling, built-in observability
Framework Deployment	Teams already using Next.js, Astro etc	Simplify deployment with a unified codebase for frontend and backend
Server Deployment	Teams needing maximum control and customization	Full control, custom middleware, integrate with existing apps
Serverless Platforms	Teams already using Vercel, Netlify, or Cloudflare	Platform integration, simplified deployment, automatic scaling

Deploy a Mastra Server
Mastra runs as a standard Node.js server and can be deployed across a wide range of environments.

Default project structure
The getting started guide scaffolds a project with sensible defaults to help you begin quickly. By default, the CLI organizes application files under the src/mastra/ directory, resulting in a structure similar to the following:

Building
The mastra build command starts the build process:


mastra build
Customizing the input directory
If your Mastra files are located elsewhere, use the --dir flag to specify the custom location. The --dir flag tells Mastra where to find your entry point file (index.ts or index.js) and related directories.


mastra build --dir ./my-project/mastra
Build process
The build process follows these steps:

Locates entry file: Finds index.ts or index.js in your specified directory (default: src/mastra/).
Creates build directory: Generates a .mastra/ directory containing:
.build: Contains dependency analysis, bundled dependencies, and build configuration files.
output: Contains the production-ready application bundle with index.mjs, instrumentation.mjs, and project-specific files.
Copies static assets: Copies the public/ folder contents to the output directory for serving static files.
Bundles code: Uses Rollup with tree shaking and source maps for optimization.
Generates server: Creates a Hono  HTTP server ready for deployment.
Build output structure
After building, Mastra creates a .mastra/ directory with the following structure:

public folder
If a public folder exists in src/mastra, its contents are copied into the .build/output directory during the build process.

Running the Server
Start the HTTP server:


node .mastra/output/index.mjs
Enable Telemetry
To enable telemetry and observability, load the instrumentation file:


node --import=./.mastra/output/instrumentation.mjs .mastra/output/index.mjs

Mastra Client SDK
The Mastra Client SDK provides a simple and type-safe interface for interacting with your Mastra Server from your client environment.

Development Requirements
To ensure smooth local development, make sure you have:

Node.js 18.x or later installed
TypeScript 4.7+ (if using TypeScript)
A modern browser environment with Fetch API support
Your local Mastra server running (typically on port 4111)
Installation

npm install @mastra/client-js@latest
Initialize Mastra Client
To get started you’ll need to initialize your MastraClient with necessary parameters:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111", // Default Mastra development server port
});
Configuration Options
You can customize the client with various options:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
export const mastraClient = new MastraClient({
  // Required
  baseUrl: "http://localhost:4111",
 
  // Optional configurations for development
  retries: 3, // Number of retry attempts
  backoffMs: 300, // Initial retry backoff time
  maxBackoffMs: 5000, // Maximum retry backoff time
  headers: {
    // Custom headers for development
    "X-Development": "true",
  },
});
AbortSignal
The Mastra Client SDK supports request cancellation using the standard Web API AbortSignal. Pass an AbortSignal to the client constructor to enable cancellation for all requests:

lib/mastra-client.ts

import { MastraClient } from "@mastra/client-js";
 
const controller = new AbortController();
 
export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111",
  abortSignal: controller.signal,
});
 
// Cancel all requests from this client
controller.abort();
Example
Once your MastraClient is initialized you can start making client calls via the type-safe interface

// Get a reference to your local agent
const agent = client.getAgent("dev-agent-id");
 
// Generate responses
const response = await agent.generate({
  messages: [
    {
      role: "user",
      content: "Hello, I'm testing the local development setup!",
    },
  ],
});
Available Features
Mastra client exposes all resources served by the Mastra Server

Agents
: Create and manage AI agents, generate responses, and handle streaming interactions
Memory
: Manage conversation threads and message history
Tools
: Access and execute tools available to agents
Workflows
: Create and manage automated workflows
Vectors
: Handle vector operations for semantic search and similarity matching
Best Practices
Error Handling: Implement proper error handling for development scenarios
Environment Variables: Use environment variables for configuration
Debugging: Enable detailed logging when needed
// Example with error handling and logging
try {
  const agent = client.getAgent("dev-agent-id");
  const response = await agent.generate({
    messages: [{ role: "user", content: "Test message" }],
  });
  console.log("Response:", response);
} catch (error) {
  console.error("Development error:", error);
}
Debug
Sometimes when using MastraClient on the server instead of the client e.g /api/chat, you might need to recreate the response to your client:
const result = agent.stream(/* get your agent stream */);
return new Response(result.body);