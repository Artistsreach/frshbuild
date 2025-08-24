create-mastra
The create-mastra command creates a new standalone Mastra project. Use this command to scaffold a complete Mastra setup in a dedicated directory.

Usage
create-mastra [options]
Options
--version?:
boolean
Output the version number
--project-name?:
string
Project name that will be used in package.json and as the project directory name
--default?:
boolean
Quick start with defaults(src, OpenAI, no examples)
--components?:
string
Comma-separated list of components (agents, tools, workflows)
--llm?:
string
Default model provider (openai, anthropic, groq, google, or cerebras)
--llm-api-key?:
string
API key for the model provider
--example?:
boolean
Include example code
--no-example?:
boolean
Do not include example code
--template?:
string
Create project from a template (use template name, public GitHub URL, or leave blank to select from list)
--timeout?:
number
Configurable timeout for package installation, defaults to 60000 ms
--dir?:
string
Target directory for Mastra source code (default: src/)
--mcp?:
string
MCP Server for code editor (cursor, cursor-global, windsurf, vscode)
--help?:
boolean
Display help for command

mastra init
The mastra init command initializes Mastra in an existing project. Use this command to scaffold the necessary folders and configuration without generating a new project.

Usage
mastra init [options]
Options
--default?:
boolean
Quick start with defaults (src, OpenAI, no examples)
--dir:
string
Directory for Mastra files (defaults to src/)
--components:
string
Comma-separated list of components (agents, tools, workflows)
--llm:
string
Default model provider (openai, anthropic, groq, google or cerebras)
--llm-api-key:
string
API key for the model provider
--example?:
boolean
Include example code
--no-example?:
boolean
Do not include example code
--mcp:
string
MCP Server for code editor (cursor, cursor-global, windsurf, vscode)
--help?:
boolean
Display help for command
Advanced usage
Disable analytics
If you prefer not to send anonymous usage data then set the MASTRA_TELEMETRY_DISABLED=1 environment variable when running the command:


MASTRA_TELEMETRY_DISABLED=1 mastra init
Custom provider endpoints
Initialized projects respect the OPENAI_BASE_URL and ANTHROPIC_BASE_URL variables if present. This lets you route provider traffic through proxies or private gateways when starting the dev server later on.

mastra dev
The mastra dev command starts a development server that exposes REST endpoints for your agents, tools, and workflows.

Usage
mastra dev [options]
Options
--dir?:
string
Path to your mastra folder
--root?:
string
Path to your root folder
--tools?:
string
Comma-separated list of paths to tool files to include
--port?:
number
deprecated: Port number for the development server (defaults to 4111)
--env?:
string
Path to custom environment file
--inspect?:
boolean
Start the dev server in inspect mode for debugging (cannot be used with --inspect-brk)
--inspect-brk?:
boolean
Start the dev server in inspect mode and break at the beginning of the script (cannot be used with --inspect)
--custom-args?:
string
Comma-separated list of custom arguments to pass to the dev server. IE: --experimental-transform-types
--help?:
boolean
display help for command
Routes
Starting the server with mastra dev exposes a set of REST routes by default:

System Routes
GET /api: Get API status.
Agent Routes
Agents are expected to be exported from src/mastra/agents.

GET /api/agents: Lists the registered agents found in your Mastra folder.
GET /api/agents/:agentId: Get agent by ID.
GET /api/agents/:agentId/evals/ci: Get CI evals by agent ID.
GET /api/agents/:agentId/evals/live: Get live evals by agent ID.
POST /api/agents/:agentId/generate: Sends a text-based prompt to the specified agent, returning the agent’s response.
POST /api/agents/:agentId/stream: Stream a response from an agent.
POST /api/agents/:agentId/instructions: Update an agent’s instructions.
POST /api/agents/:agentId/instructions/enhance: Generate an improved system prompt from instructions.
GET /api/agents/:agentId/speakers: Get available speakers for an agent.
POST /api/agents/:agentId/speak: Convert text to speech using the agent’s voice provider.
POST /api/agents/:agentId/listen: Convert speech to text using the agent’s voice provider.
POST /api/agents/:agentId/tools/:toolId/execute: Execute a tool through an agent.
Tool Routes
Tools are expected to be exported from src/mastra/tools (or the configured tools directory).

GET /api/tools: Get all tools.
GET /api/tools/:toolId: Get tool by ID.
POST /api/tools/:toolId/execute: Invokes a specific tool by name, passing input data in the request body.
Workflow Routes
Workflows are expected to be exported from src/mastra/workflows (or the configured workflows directory).

GET /api/workflows: Get all workflows.
GET /api/workflows/:workflowId: Get workflow by ID.
POST /api/workflows/:workflowName/start: Starts the specified workflow.
POST /api/workflows/:workflowName/:instanceId/event: Sends an event or trigger signal to an existing workflow instance.
GET /api/workflows/:workflowName/:instanceId/status: Returns status info for a running workflow instance.
POST /api/workflows/:workflowId/resume: Resume a suspended workflow step.
POST /api/workflows/:workflowId/resume-async: Resume a suspended workflow step asynchronously.
POST /api/workflows/:workflowId/createRun: Create a new workflow run.
POST /api/workflows/:workflowId/start-async: Execute/Start a workflow asynchronously.
GET /api/workflows/:workflowId/watch: Watch workflow transitions in real-time.
Memory Routes
GET /api/memory/status: Get memory status.
GET /api/memory/threads: Get all threads.
GET /api/memory/threads/:threadId: Get thread by ID.
GET /api/memory/threads/:threadId/messages: Get messages for a thread.
GET /api/memory/threads/:threadId/messages/paginated: Get paginated messages for a thread.
POST /api/memory/threads: Create a new thread.
PATCH /api/memory/threads/:threadId: Update a thread.
DELETE /api/memory/threads/:threadId: Delete a thread.
POST /api/memory/save-messages: Save messages.
Telemetry Routes
GET /api/telemetry: Get all traces.
Log Routes
GET /api/logs: Get all logs.
GET /api/logs/transports: List of all log transports.
GET /api/logs/:runId: Get logs by run ID.
Vector Routes
POST /api/vector/:vectorName/upsert: Upsert vectors into an index.
POST /api/vector/:vectorName/create-index: Create a new vector index.
POST /api/vector/:vectorName/query: Query vectors from an index.
GET /api/vector/:vectorName/indexes: List all indexes for a vector store.
GET /api/vector/:vectorName/indexes/:indexName: Get details about a specific index.
DELETE /api/vector/:vectorName/indexes/:indexName: Delete a specific index.
OpenAPI Specification
GET /openapi.json: Returns an auto-generated OpenAPI specification for your project’s routes.
GET /swagger-ui: Access Swagger UI for API documentation.
Additional Notes
The port defaults to 4111. Both the port and hostname can be configured via the mastra server config. See Launch Development Server for configuration details.

Make sure you have your environment variables set up in your .env.development or .env file for any providers you use (e.g., OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.).

Make sure the index.ts file in your Mastra folder exports the Mastra instance for the dev server to read.

Example request
To test an agent after running mastra dev:


curl -X POST http://localhost:4111/api/agents/myAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hello, how can you assist me today?" }
    ]
  }'
Advanced usage
The mastra dev server obeys a few extra environment variables that can be handy during development:

Disable build caching
Set MASTRA_DEV_NO_CACHE=1 to force a full rebuild rather than using the cached assets under .mastra/:


MASTRA_DEV_NO_CACHE=1 mastra dev
This helps when you are debugging bundler plugins or suspect stale output.

Limit parallelism
MASTRA_CONCURRENCY caps how many expensive operations run in parallel (primarily build and evaluation steps). For example:


MASTRA_CONCURRENCY=4 mastra dev
Leave it unset to let the CLI pick a sensible default for the machine.

Custom provider endpoints
When using providers supported by the Vercel AI SDK you can redirect requests through proxies or internal gateways by setting a base URL. For OpenAI:


OPENAI_API_KEY=<your-api-key> \
OPENAI_BASE_URL=https://openrouter.example/v1 \
mastra dev
and for Anthropic:


OPENAI_API_KEY=<your-api-key> \
ANTHROPIC_BASE_URL=https://anthropic.internal \
mastra dev
These are forwarded by the AI SDK and work with any openai() or anthropic() calls.

Disable telemetry
To opt out of anonymous CLI analytics set MASTRA_TELEMETRY_DISABLED=1. This also prevents tracking within the local playground.


MASTRA_TELEMETRY_DISABLED=1 mastra dev

mastra build
The mastra build command bundles your Mastra project into a production-ready Hono server. Hono is a lightweight, type-safe web framework that makes it easy to deploy Mastra agents as HTTP endpoints with middleware support.

Usage
mastra build [options]
Options
--dir?:
string
Path to your Mastra Folder
--root?:
string
Path to your root folder
--tools?:
string
Comma-separated list of paths to tool files to include
--env?:
string
Path to custom environment file
--help?:
boolean
display help for command
Advanced usage
Limit parallelism
For CI or when running in resource constrained environments you can cap how many expensive tasks run at once by setting MASTRA_CONCURRENCY.


MASTRA_CONCURRENCY=2 mastra build
Unset it to allow the CLI to base concurrency on the host capabilities.

Disable telemetry
To opt out of anonymous build analytics set:


MASTRA_TELEMETRY_DISABLED=1 mastra build
Custom provider endpoints
Build time respects the same OPENAI_BASE_URL and ANTHROPIC_BASE_URL variables that mastra dev does. They are forwarded by the AI SDK to any workflows or tools that call the providers.

What It Does
Locates your Mastra entry file (either src/mastra/index.ts or src/mastra/index.js)
Creates a .mastra output directory
Bundles your code using Rollup with:
Tree shaking for optimal bundle size
Node.js environment targeting
Source map generation for debugging
Excluding test files (named .test., .spec. or inside __tests__ directory)
Example

# Build from current directory
mastra build
 
# Build from specific directory
mastra build --dir ./my-mastra-project
Output
The command generates a production bundle in the .mastra directory, which includes:

A Hono-based HTTP server with your Mastra agents exposed as endpoints
Bundled JavaScript files optimized for production
Source maps for debugging
Required dependencies
This output is suitable for:

Deploying to cloud servers (EC2, Digital Ocean)
Running in containerized environments
Using with container orchestration systems
Deployers
When a Deployer is used, the build output is automatically prepared for the target platform e.g

Vercel Deployer
Netlify Deployer
Cloudflare Deployer

mastra start
Start your built Mastra application. This command is used to run your built Mastra application in production mode. Telemetry is enabled by default.

Usage
After building your project with mastra build run:

mastra start [options]
Options
Option	Description
-d, --dir <path>	Path to your built Mastra output directory (default: .mastra/output)
-nt, --no-telemetry	Enable OpenTelemetry instrumentation for observability
Examples
Start the application with default settings:

mastra start
Start from a custom output directory:

mastra start --dir ./my-output
Start with telemetry disabled:

mastra start -nt

mastra lint
The mastra lint command validates the structure and code of your Mastra project to ensure it follows best practices and is error-free.

Usage
mastra lint [options]
Options
--dir?:
string
Path to your Mastra folder
--root?:
string
Path to your root folder
--tools?:
string
Comma-separated list of paths to tool files to include
--help?:
boolean
display help for command
Advanced usage
Disable telemetry
To disable CLI analytics while running linting (and other commands) set MASTRA_TELEMETRY_DISABLED=1:


MASTRA_TELEMETRY_DISABLED=1 mastra lint

mastra scorers
The mastra scorers command provides management capabilities for evaluation scorers that measure the quality, accuracy, and performance of AI-generated outputs.

Usage
mastra scorers <command> [options]
Commands
mastra scorers add
Add a new scorer template to your project.

mastra scorers add [scorer-name] [options]
Options
--dir?:
string
Path to your Mastra directory (default: auto-detect)
--help?:
boolean
Display help for command
Examples
Add a specific scorer by name:


mastra scorers add answer-relevancy
Interactive scorer selection (when no name provided):


mastra scorers add
Add scorer to custom directory:


mastra scorers add toxicity-detection --dir ./custom/scorers
mastra scorers list
List all available scorer templates.

mastra scorers list
This command displays built-in scorer templates organized by category:

Accuracy and Reliability: answer-relevancy, bias-detection, faithfulness, hallucination, toxicity-detection
Output Quality: completeness, content-similarity, keyword-coverage, textual-difference, tone-consistency
Available Scorers
When running mastra scorers add without specifying a scorer name, you can select from these built-in templates:

Accuracy and Reliability
answer-relevancy: Evaluates how relevant an AI response is to the input question
bias-detection: Identifies potential biases in AI-generated content
faithfulness: Measures how faithful the response is to provided context
hallucination: Detects when AI generates information not grounded in the input
toxicity-detection: Identifies harmful or inappropriate content
Output Quality
completeness: Assesses whether the response fully addresses the input
content-similarity: Measures semantic similarity between expected and actual outputs
keyword-coverage: Evaluates coverage of expected keywords or topics
textual-difference: Measures textual differences between responses
tone-consistency: Evaluates consistency of tone and style
What It Does
Dependency Management: Automatically installs @mastra/evals package if needed
Template Selection: Provides interactive selection when no scorer specified
File Generation: Creates scorer files from built-in templates
Directory Structure: Places scorers in src/mastra/scorers/ or custom directory
Duplicate Detection: Prevents overwriting existing scorer files
Integration
After adding scorers, integrate them with your agents or workflows:

With Agents
src/mastra/agents/evaluated-agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { createAnswerRelevancyScorer } from "../scorers/answer-relevancy-scorer";
 
export const evaluatedAgent = new Agent({
  // ... other config
  scorers: {
    relevancy: {
      scorer: createAnswerRelevancyScorer({ model: openai("gpt-4o-mini") }),
      sampling: { type: "ratio", rate: 0.5 }
    }
  }
});
With Workflow Steps
src/mastra/workflows/content-generation.ts
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { customStepScorer } from "../scorers/custom-step-scorer";
 
const contentStep = createStep({
  // ... other config
  scorers: {
    customStepScorer: {
      scorer: customStepScorer(),
      sampling: { type: "ratio", rate: 1 }
    }
  },
});
Testing Scorers
Use the Local Dev Playground to test your scorers:


mastra dev
Navigate to http://localhost:4111/  and access the scorers section to run individual scorers against test inputs and view detailed results.

Next Steps
Learn about scorer implementation in Creating Custom Scorers
Explore built-in options in Off-the-shelf Scorers
See Scorers Overview for evaluation pipeline details
Test scorers with the Local Dev Playground

The @mastra/mcp-docs-server package runs a small Model Context Protocol  server that makes Mastra documentation, code examples, blog posts and changelogs queryable by an LLM agent. It can be invoked manually from the command line or configured inside an MCP-aware IDE such as Cursor or Windsurf.

Running from the CLI
npx -y @mastra/mcp-docs-server
The command above runs a stdio based MCP server. The process will keep reading requests from stdin and returning responses on stdout. This is the same command that IDE integrations use. When run manually it can be pointed at the @wong2/mcp-cli package for exploration.

Examples
Rebuild the docs before serving (useful if you’ve modified docs locally):

REBUILD_DOCS_ON_START=true npx -y @mastra/mcp-docs-server
Enable verbose logging while experimenting:

DEBUG=1 npx -y @mastra/mcp-docs-server
Serve blog posts from a custom domain:

BLOG_URL=https://my-blog.example npx -y @mastra/mcp-docs-server
Environment variables
@mastra/mcp-docs-server honours a few environment variables that tweak its behaviour:

REBUILD_DOCS_ON_START - when set to true the server rebuilds the .docs directory before binding to stdio. This can be helpful after editing or adding documentation locally.
PREPARE - the docs build step (pnpm mcp-docs-server prepare-docs) looks for PREPARE=true to copy Markdown sources from the repository into .docs.
BLOG_URL - base URL used for fetching blog posts. Defaults to https://mastra.ai.
DEBUG or NODE_ENV=development - increase logging written to stderr.
No other variables are required for a basic run; the server ships with a pre-built docs directory.

Rebuilding with custom docs
The package includes a precompiled copy of the documentation. If you want to experiment with additional content you can rebuild the .docs directory locally:

pnpm mcp-docs-server prepare-docs
The script will copy documentation from mastra/docs/src/content/en/docs and mastra/docs/src/content/en/reference into the package. Once rebuilt, start the server with REBUILD_DOCS_ON_START=true so the fresh content is served.

A rebuild is only necessary if you need to serve customised docs. For regular use you can rely on the published package contents.

For IDE configuration details see the Getting started guide.