Agent Class
The Agent class is the foundation for creating AI agents in Mastra. It provides methods for generating responses, streaming interactions, and handling voice capabilities.

Usage example
src/mastra/agents/test-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const agent = new Agent({
  name: "test-agent",
  instructions: 'message for agent',
  model: openai("gpt-4o")
});
Constructor parameters
id?:
string
Optional unique identifier for the agent. Defaults to `name` if not provided.
name:
string
Unique identifier for the agent.
description?:
string
Optional description of the agent's purpose and capabilities.
instructions:
string | ({ runtimeContext: RuntimeContext }) => string | Promise<string>
Instructions that guide the agent's behavior. Can be a static string or a function that returns a string dynamically.
model:
MastraLanguageModel | ({ runtimeContext: RuntimeContext }) => MastraLanguageModel | Promise<MastraLanguageModel>
The language model used by the agent. Can be provided statically or resolved at runtime.
tools?:
ToolsInput | ({ runtimeContext: RuntimeContext }) => ToolsInput | Promise<ToolsInput>
Tools that the agent can access. Can be provided statically or resolved dynamically.
workflows?:
Record<string, Workflow> | ({ runtimeContext: RuntimeContext }) => Record<string, Workflow> | Promise<Record<string, Workflow>>
Workflows that the agent can execute. Can be static or dynamically resolved.
defaultGenerateOptions?:
AgentGenerateOptions | ({ runtimeContext: RuntimeContext }) => AgentGenerateOptions | Promise<AgentGenerateOptions>
Default options used when calling `generate()`.
defaultStreamOptions?:
AgentStreamOptions | ({ runtimeContext: RuntimeContext }) => AgentStreamOptions | Promise<AgentStreamOptions>
Default options used when calling `stream()`.
defaultVNextStreamOptions?:
AgentExecutionOptions | ({ runtimeContext: RuntimeContext }) => AgentExecutionOptions | Promise<AgentExecutionOptions>
Default options used when calling `stream()` in vNext mode.
mastra?:
Mastra
Reference to the Mastra runtime instance (injected automatically).
scorers?:
MastraScorers | ({ runtimeContext: RuntimeContext }) => MastraScorers | Promise<MastraScorers>
Scoring configuration for runtime evaluation and telemetry. Can be static or dynamically provided.
evals?:
Record<string, Metric>
Evaluation metrics for scoring agent responses.
memory?:
MastraMemory | ({ runtimeContext: RuntimeContext }) => MastraMemory | Promise<MastraMemory>
Memory module used for storing and retrieving stateful context.
voice?:
CompositeVoice
Voice settings for speech input and output.
inputProcessors?:
Processor[] | ({ runtimeContext: RuntimeContext }) => Processor[] | Promise<Processor[]>
Input processors that can modify or validate messages before they are processed by the agent. Must implement the `processInput` function.
outputProcessors?:
Processor[] | ({ runtimeContext: RuntimeContext }) => Processor[] | Promise<Processor[]>
Output processors that can modify or validate messages from the agent, before it is sent to the client. Must implement either (or both) of the `processOutputResult` and `processOutputStream` functions.
Returns
agent:
Agent<TAgentId, TTools, TMetrics>
A new Agent instance with the specified configuration.

Agent.getAgent()
The .getAgent() method is used to retrieve an agent. The method accepts a single string parameter for the agent’s name.

Usage example

mastra.getAgent("testAgent");
Parameters
name:
TAgentName extends keyof TAgents
The name of the agent to retrieve. Must be a valid agent name that exists in the Mastra configuration.
Returns
agent:
TAgents[TAgentName]
The agent instance with the specified name. Throws an error if the agent is not found.

Agent.generate()
The .generate() method is used to interact with an agent to produce text or structured responses. This method accepts messages and optional generation options.

Usage example

await agent.generate("message for agent");
Parameters
messages:
string | string[] | CoreMessage[] | AiMessageType[] | UIMessageWithMetadata[]
The messages to send to the agent. Can be a single string, array of strings, or structured message objects with multimodal content (text, images, etc.).
options?:
AgentGenerateOptions
Optional configuration for the generation process.
Options parameters
abortSignal?:
AbortSignal
Signal object that allows you to abort the agent's execution. When the signal is aborted, all ongoing operations will be terminated.
context?:
CoreMessage[]
Additional context messages to provide to the agent.
structuredOutput?:
StructuredOutputOptions<S extends ZodTypeAny = ZodTypeAny>
Enables structured output generation with better developer experience. Automatically creates and uses a StructuredOutputProcessor internally.
schema:
z.ZodSchema<S>
Zod schema to validate the output against.
model:
MastraLanguageModel
Model to use for the internal structuring agent.
errorStrategy?:
'strict' | 'warn' | 'fallback'
Strategy when parsing or validation fails. Defaults to 'strict'.
fallbackValue?:
<S extends ZodTypeAny>
Fallback value when errorStrategy is 'fallback'.
instructions?:
string
Custom instructions for the structuring agent.
outputProcessors?:
Processor[]
Overrides the output processors set on the agent. Output processors that can modify or validate messages from the agent before they are returned to the user. Must implement either (or both) of the `processOutputResult` and `processOutputStream` functions.
inputProcessors?:
Processor[]
Overrides the input processors set on the agent. Input processors that can modify or validate messages before they are processed by the agent. Must implement the `processInput` function.
experimental_output?:
Zod schema | JsonSchema7
Note, the preferred route is to use the `structuredOutput` property. Enables structured output generation alongside text generation and tool calls. The model will generate responses that conform to the provided schema.
instructions?:
string
Custom instructions that override the agent's default instructions for this specific generation. Useful for dynamically modifying agent behavior without creating a new agent instance.
output?:
Zod schema | JsonSchema7
Defines the expected structure of the output. Can be a JSON Schema object or a Zod schema.
memory?:
object
Configuration for memory. This is the preferred way to manage memory.
thread:
string | { id: string; metadata?: Record<string, any>, title?: string }
The conversation thread, as a string ID or an object with an `id` and optional `metadata`.
resource:
string
Identifier for the user or resource associated with the thread.
options?:
MemoryConfig
Configuration for memory behavior, like message history and semantic recall. See `MemoryConfig` below.
maxSteps?:
number
= 5
Maximum number of execution steps allowed.
maxRetries?:
number
= 2
Maximum number of retries. Set to 0 to disable retries.
onStepFinish?:
GenerateTextOnStepFinishCallback<any> | never
Callback function called after each execution step. Receives step details as a JSON string. Unavailable for structured output
runId?:
string
Unique ID for this generation run. Useful for tracking and debugging purposes.
telemetry?:
TelemetrySettings
Settings for telemetry collection during generation.
isEnabled?:
boolean
Enable or disable telemetry. Disabled by default while experimental.
recordInputs?:
boolean
Enable or disable input recording. Enabled by default. You might want to disable input recording to avoid recording sensitive information.
recordOutputs?:
boolean
Enable or disable output recording. Enabled by default. You might want to disable output recording to avoid recording sensitive information.
functionId?:
string
Identifier for this function. Used to group telemetry data by function.
temperature?:
number
Controls randomness in the model's output. Higher values (e.g., 0.8) make the output more random, lower values (e.g., 0.2) make it more focused and deterministic.
toolChoice?:
'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }
= 'auto'
Controls how the agent uses tools during generation.
'auto':
string
Let the model decide whether to use tools (default).
'none':
string
Do not use any tools.
'required':
string
Require the model to use at least one tool.
{ type: 'tool'; toolName: string }:
object
Require the model to use a specific tool by name.
toolsets?:
ToolsetsInput
Additional toolsets to make available to the agent during generation.
clientTools?:
ToolsInput
Tools that are executed on the 'client' side of the request. These tools do not have execute functions in the definition.
savePerStep?:
boolean
Save messages incrementally after each stream step completes (default: false).
providerOptions?:
Record<string, Record<string, JSONValue>>
Additional provider-specific options that are passed through to the underlying LLM provider. The structure is `{ providerName: { optionKey: value } }`. Since Mastra extends AI SDK, see the [AI SDK documentation](https://sdk.vercel.ai/docs/providers/ai-sdk-providers) for complete provider options.
openai?:
Record<string, JSONValue>
OpenAI-specific options. Example: `{ reasoningEffort: 'high' }`
anthropic?:
Record<string, JSONValue>
Anthropic-specific options. Example: `{ maxTokens: 1000 }`
google?:
Record<string, JSONValue>
Google-specific options. Example: `{ safetySettings: [...] }`
[providerName]?:
Record<string, JSONValue>
Other provider-specific options. The key is the provider name and the value is a record of provider-specific options.
runtimeContext?:
RuntimeContext
Runtime context for dependency injection and contextual information.
maxTokens?:
number
Maximum number of tokens to generate.
topP?:
number
Nucleus sampling. This is a number between 0 and 1. It is recommended to set either `temperature` or `topP`, but not both.
topK?:
number
Only sample from the top K options for each subsequent token. Used to remove 'long tail' low probability responses.
presencePenalty?:
number
Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
frequencyPenalty?:
number
Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
stopSequences?:
string[]
Stop sequences. If set, the model will stop generating text when one of the stop sequences is generated.
seed?:
number
The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results.
headers?:
Record<string, string | undefined>
Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
Returns
text?:
string
The generated text response. Present when output is 'text' (no schema provided).
object?:
object
The generated structured response. Present when a schema is provided via `output`, `structuredOutput`, or `experimental_output`.
toolCalls?:
Array<ToolCall>
The tool calls made during the generation process. Present in both text and object modes.
toolName:
string
The name of the tool invoked.
args:
any
The arguments passed to the tool.
Extended usage example

import { z } from "zod";
import { ModerationProcessor, TokenLimiterProcessor } from "@mastra/core/processors";
 
await agent.generate(
  [
    { role: "user", content: "message for agent" },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "message for agent"
        },
        {
          type: "image",
          imageUrl: "https://example.com/image.jpg",
          mimeType: "image/jpeg"
        }
      ]
    }
  ],
  {
    temperature: 0.7,
    maxSteps: 3,
    memory: {
      thread: "user-123",
      resource: "test-app"
    },
    toolChoice: "auto",
    providerOptions: {
      openai: {
        reasoningEffort: "high"
      }
    },
    // Structured output with better DX
    structuredOutput: {
      schema: z.object({
        sentiment: z.enum(['positive', 'negative', 'neutral']),
        confidence: z.number(),
      }),
      model: openai("gpt-4o-mini"),
      errorStrategy: 'warn',
    },
    // Output processors for response validation
    outputProcessors: [
      new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
      new TokenLimiterProcessor({ maxTokens: 1000 }),
    ],
  }
);

Agent.stream()
The .stream() method enables real-time streaming of responses from an agent. This method accepts messages and optional streaming options.

Usage example

await agent.stream("message for agent");
Parameters
messages:
string | string[] | CoreMessage[] | AiMessageType[] | UIMessageWithMetadata[]
The messages to send to the agent. Can be a single string, array of strings, or structured message objects.
options?:
AgentStreamOptions<OUTPUT, EXPERIMENTAL_OUTPUT>
Optional configuration for the streaming process.
Options parameters
abortSignal?:
AbortSignal
Signal object that allows you to abort the agent's execution. When the signal is aborted, all ongoing operations will be terminated.
context?:
CoreMessage[]
Additional context messages to provide to the agent.
experimental_output?:
Zod schema | JsonSchema7
Enables structured output generation alongside text generation and tool calls. The model will generate responses that conform to the provided schema.
instructions?:
string
Custom instructions that override the agent's default instructions for this specific generation. Useful for dynamically modifying agent behavior without creating a new agent instance.
output?:
Zod schema | JsonSchema7
Defines the expected structure of the output. Can be a JSON Schema object or a Zod schema.
memory?:
object
Configuration for memory. This is the preferred way to manage memory.
thread:
string | { id: string; metadata?: Record<string, any>, title?: string }
The conversation thread, as a string ID or an object with an `id` and optional `metadata`.
resource:
string
Identifier for the user or resource associated with the thread.
options?:
MemoryConfig
Configuration for memory behavior, like message history and semantic recall.
maxSteps?:
number
= 5
Maximum number of execution steps allowed.
maxRetries?:
number
= 2
Maximum number of retries. Set to 0 to disable retries.
memoryOptions?:
MemoryConfig
**Deprecated.** Use `memory.options` instead. Configuration options for memory management.
lastMessages?:
number | false
Number of recent messages to include in context, or false to disable.
semanticRecall?:
boolean | { topK: number; messageRange: number | { before: number; after: number }; scope?: 'thread' | 'resource' }
Enable semantic recall to find relevant past messages. Can be a boolean or detailed configuration.
workingMemory?:
WorkingMemory
Configuration for working memory functionality.
threads?:
{ generateTitle?: boolean | { model: DynamicArgument<MastraLanguageModel>; instructions?: DynamicArgument<string> } }
Thread-specific configuration, including automatic title generation.
onFinish?:
StreamTextOnFinishCallback<any> | StreamObjectOnFinishCallback<OUTPUT>
Callback function called when streaming completes. Receives the final result.
onStepFinish?:
StreamTextOnStepFinishCallback<any> | never
Callback function called after each execution step. Receives step details as a JSON string. Unavailable for structured output
resourceId?:
string
**Deprecated.** Use `memory.resource` instead. Identifier for the user or resource interacting with the agent. Must be provided if threadId is provided.
telemetry?:
TelemetrySettings
Settings for telemetry collection during streaming.
isEnabled?:
boolean
Enable or disable telemetry. Disabled by default while experimental.
recordInputs?:
boolean
Enable or disable input recording. Enabled by default. You might want to disable input recording to avoid recording sensitive information.
recordOutputs?:
boolean
Enable or disable output recording. Enabled by default. You might want to disable output recording to avoid recording sensitive information.
functionId?:
string
Identifier for this function. Used to group telemetry data by function.
temperature?:
number
Controls randomness in the model's output. Higher values (e.g., 0.8) make the output more random, lower values (e.g., 0.2) make it more focused and deterministic.
threadId?:
string
**Deprecated.** Use `memory.thread` instead. Identifier for the conversation thread. Allows for maintaining context across multiple interactions. Must be provided if resourceId is provided.
toolChoice?:
'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }
= 'auto'
Controls how the agent uses tools during streaming.
'auto':
string
Let the model decide whether to use tools (default).
'none':
string
Do not use any tools.
'required':
string
Require the model to use at least one tool.
{ type: 'tool'; toolName: string }:
object
Require the model to use a specific tool by name.
toolsets?:
ToolsetsInput
Additional toolsets to make available to the agent during streaming.
clientTools?:
ToolsInput
Tools that are executed on the 'client' side of the request. These tools do not have execute functions in the definition.
savePerStep?:
boolean
Save messages incrementally after each stream step completes (default: false).
providerOptions?:
Record<string, Record<string, JSONValue>>
Additional provider-specific options that are passed through to the underlying LLM provider. The structure is `{ providerName: { optionKey: value } }`. For example: `{ openai: { reasoningEffort: 'high' }, anthropic: { maxTokens: 1000 } }`.
openai?:
Record<string, JSONValue>
OpenAI-specific options. Example: `{ reasoningEffort: 'high' }`
anthropic?:
Record<string, JSONValue>
Anthropic-specific options. Example: `{ maxTokens: 1000 }`
google?:
Record<string, JSONValue>
Google-specific options. Example: `{ safetySettings: [...] }`
[providerName]?:
Record<string, JSONValue>
Other provider-specific options. The key is the provider name and the value is a record of provider-specific options.
runId?:
string
Unique ID for this generation run. Useful for tracking and debugging purposes.
runtimeContext?:
RuntimeContext
Runtime context for dependency injection and contextual information.
maxTokens?:
number
Maximum number of tokens to generate.
topP?:
number
Nucleus sampling. This is a number between 0 and 1. It is recommended to set either `temperature` or `topP`, but not both.
topK?:
number
Only sample from the top K options for each subsequent token. Used to remove 'long tail' low probability responses.
presencePenalty?:
number
Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
frequencyPenalty?:
number
Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
stopSequences?:
string[]
Stop sequences. If set, the model will stop generating text when one of the stop sequences is generated.
seed?:
number
The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results.
headers?:
Record<string, string | undefined>
Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
Returns
textStream?:
AsyncGenerator<string>
Async generator that yields text chunks as they become available.
fullStream?:
Promise<ReadableStream>
Promise that resolves to a ReadableStream for the complete response.
text?:
Promise<string>
Promise that resolves to the complete text response.
usage?:
Promise<{ totalTokens: number; promptTokens: number; completionTokens: number }>
Promise that resolves to token usage information.
finishReason?:
Promise<string>
Promise that resolves to the reason why the stream finished.
toolCalls?:
Promise<Array<ToolCall>>
Promise that resolves to the tool calls made during the streaming process.
toolName:
string
The name of the tool invoked.
args:
any
The arguments passed to the tool.
Extended usage example

await agent.stream("message for agent", {
  temperature: 0.7,
  maxSteps: 3,
  memory: {
    thread: "user-123",
    resource: "test-app"
  },
  toolChoice: "auto"
});

Agent.streamVNext() (Experimental)
Experimental Feature: This is a new streaming implementation with support for multiple output formats, including AI SDK v5 compatibility. It will replace the existing stream() method once battle-tested. The API may change as we refine the feature based on feedback.

The .streamVNext() method enables real-time streaming of responses from an agent with enhanced capabilities and format flexibility. This method accepts messages and optional streaming options, providing a next-generation streaming experience with support for both Mastra’s native format and AI SDK v5 compatibility.

Usage example

// Default Mastra format
const mastraStream = await agent.streamVNext("message for agent");
 
// AI SDK v5 compatible format
const aiSdkStream = await agent.streamVNext("message for agent", {
  format: 'aisdk'
});
Parameters
messages:
string | string[] | CoreMessage[] | AiMessageType[] | UIMessageWithMetadata[]
The messages to send to the agent. Can be a single string, array of strings, or structured message objects.
options?:
AgentExecutionOptions<Output, StructuredOutput, Format>
Optional configuration for the streaming process.
Options parameters
format?:
'mastra' | 'aisdk'
= 'mastra'
Determines the output stream format. Use 'mastra' for Mastra's native format (default) or 'aisdk' for AI SDK v5 compatibility.
abortSignal?:
AbortSignal
Signal object that allows you to abort the agent's execution. When the signal is aborted, all ongoing operations will be terminated.
context?:
CoreMessage[]
Additional context messages to provide to the agent.
structuredOutput?:
StructuredOutputOptions<S extends ZodTypeAny = ZodTypeAny>
Enables structured output generation with better developer experience. Automatically creates and uses a StructuredOutputProcessor internally.
schema:
z.ZodSchema<S>
Zod schema to validate the output against.
model:
MastraLanguageModel
Model to use for the internal structuring agent.
errorStrategy?:
'strict' | 'warn' | 'fallback'
Strategy when parsing or validation fails. Defaults to 'strict'.
fallbackValue?:
<S extends ZodTypeAny>
Fallback value when errorStrategy is 'fallback'.
instructions?:
string
Custom instructions for the structuring agent.
outputProcessors?:
Processor[]
Overrides the output processors set on the agent. Output processors that can modify or validate messages from the agent before they are returned to the user. Must implement either (or both) of the `processOutputResult` and `processOutputStream` functions.
inputProcessors?:
Processor[]
Overrides the input processors set on the agent. Input processors that can modify or validate messages before they are processed by the agent. Must implement the `processInput` function.
experimental_output?:
Zod schema | JsonSchema7
Note, the preferred route is to use the `structuredOutput` property. Enables structured output generation alongside text generation and tool calls. The model will generate responses that conform to the provided schema.
instructions?:
string
Custom instructions that override the agent's default instructions for this specific generation. Useful for dynamically modifying agent behavior without creating a new agent instance.
output?:
Zod schema | JsonSchema7
Defines the expected structure of the output. Can be a JSON Schema object or a Zod schema.
memory?:
object
Configuration for memory. This is the preferred way to manage memory.
thread:
string | { id: string; metadata?: Record<string, any>, title?: string }
The conversation thread, as a string ID or an object with an `id` and optional `metadata`.
resource:
string
Identifier for the user or resource associated with the thread.
options?:
MemoryConfig
Configuration for memory behavior, like message history and semantic recall.
maxRetries?:
number
= 2
Maximum number of retries. Set to 0 to disable retries.
memoryOptions?:
MemoryConfig
**Deprecated.** Use `memory.options` instead. Configuration options for memory management.
onFinish?:
StreamTextOnFinishCallback<any> | StreamObjectOnFinishCallback<OUTPUT>
Callback function called when streaming completes. Receives the final result.
onStepFinish?:
StreamTextOnStepFinishCallback<any> | never
Callback function called after each execution step. Receives step details as a JSON string. Unavailable for structured output
resourceId?:
string
**Deprecated.** Use `memory.resource` instead. Identifier for the user or resource interacting with the agent. Must be provided if threadId is provided.
telemetry?:
TelemetrySettings
Settings for telemetry collection during streaming.
isEnabled?:
boolean
Enable or disable telemetry. Disabled by default while experimental.
recordInputs?:
boolean
Enable or disable input recording. Enabled by default. You might want to disable input recording to avoid recording sensitive information.
recordOutputs?:
boolean
Enable or disable output recording. Enabled by default. You might want to disable output recording to avoid recording sensitive information.
functionId?:
string
Identifier for this function. Used to group telemetry data by function.
modelSettings?:
CallSettings
Model-specific settings like temperature, maxTokens, topP, etc. These are passed to the underlying language model.
temperature?:
number
Controls randomness in the model's output. Higher values (e.g., 0.8) make the output more random, lower values (e.g., 0.2) make it more focused and deterministic.
maxTokens?:
number
Maximum number of tokens to generate.
topP?:
number
Nucleus sampling. This is a number between 0 and 1. It is recommended to set either temperature or topP, but not both.
topK?:
number
Only sample from the top K options for each subsequent token. Used to remove 'long tail' low probability responses.
presencePenalty?:
number
Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
frequencyPenalty?:
number
Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases. A number between -1 (increase repetition) and 1 (maximum penalty, decrease repetition).
stopSequences?:
string[]
Stop sequences. If set, the model will stop generating text when one of the stop sequences is generated.
seed?:
number
The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results.
threadId?:
string
**Deprecated.** Use `memory.thread` instead. Identifier for the conversation thread. Allows for maintaining context across multiple interactions. Must be provided if resourceId is provided.
toolChoice?:
'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }
= 'auto'
Controls how the agent uses tools during streaming.
'auto':
string
Let the model decide whether to use tools (default).
'none':
string
Do not use any tools.
'required':
string
Require the model to use at least one tool.
{ type: 'tool'; toolName: string }:
object
Require the model to use a specific tool by name.
toolsets?:
ToolsetsInput
Additional toolsets to make available to the agent during streaming.
clientTools?:
ToolsInput
Tools that are executed on the 'client' side of the request. These tools do not have execute functions in the definition.
savePerStep?:
boolean
Save messages incrementally after each stream step completes (default: false).
providerOptions?:
Record<string, Record<string, JSONValue>>
Additional provider-specific options that are passed through to the underlying LLM provider. The structure is `{ providerName: { optionKey: value } }`. For example: `{ openai: { reasoningEffort: 'high' }, anthropic: { maxTokens: 1000 } }`.
openai?:
Record<string, JSONValue>
OpenAI-specific options. Example: `{ reasoningEffort: 'high' }`
anthropic?:
Record<string, JSONValue>
Anthropic-specific options. Example: `{ maxTokens: 1000 }`
google?:
Record<string, JSONValue>
Google-specific options. Example: `{ safetySettings: [...] }`
[providerName]?:
Record<string, JSONValue>
Other provider-specific options. The key is the provider name and the value is a record of provider-specific options.
runId?:
string
Unique ID for this generation run. Useful for tracking and debugging purposes.
runtimeContext?:
RuntimeContext
Runtime context for dependency injection and contextual information.
experimental_generateMessageId?:
IDGenerator
Generate a unique ID for each message.
stopWhen?:
StopCondition | StopCondition[]
Condition(s) that determine when to stop the agent's execution. Can be a single condition or array of conditions.
headers?:
Record<string, string | undefined>
Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
Returns
stream:
MastraModelOutput<Output> | AISDKV5OutputStream<Output>
Returns a streaming interface based on the format parameter. When format is 'mastra' (default), returns MastraModelOutput. When format is 'aisdk', returns AISDKV5OutputStream for AI SDK v5 compatibility.
Extended usage example
Mastra Format (Default)

import { stepCountIs } from 'ai-v5';
 
const stream = await agent.streamVNext("Tell me a story", {
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  },
});
 
// Access text stream
for await (const chunk of stream.textStream) {
  console.log(chunk);
}
 
// Get full text after streaming
const fullText = await stream.text;
AI SDK v5 Format

import { stepCountIs } from 'ai-v5';
 
const stream = await agent.streamVNext("Tell me a story", {
  format: 'aisdk',
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  },
});
 
// Use with AI SDK v5 compatible interfaces
for await (const part of stream.fullStream) {
  if (part.type === 'text-delta') {
    console.log(part.text);
  }
}
 
// In an API route for frontend integration
return stream.toUIMessageStreamResponse();
Advanced Example with Options

import { z } from "zod";
import { stepCountIs } from 'ai-v5';
 
await agent.streamVNext("message for agent", {
  format: 'aisdk', // Enable AI SDK v5 compatibility
  stopWhen: stepCountIs(3), // Stop after 3 steps
  modelSettings: {
    temperature: 0.7,
  modelSettings: {
    temperature: 0.7,
  },
  memory: {
    thread: "user-123",
    resource: "test-app"
  },
  },
  toolChoice: "auto",
  // Structured output with better DX
  structuredOutput: {
    schema: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number(),
    }),
    model: openai("gpt-4o-mini"),
    errorStrategy: 'warn',
  },
  // Output processors for streaming response validation
  outputProcessors: [
    new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
    new BatchPartsProcessor({ maxBatchSize: 3, maxWaitTime: 100 }),
  ],
});

Agent.getWorkflows()
The .getWorkflows() method retrieves the workflows configured for an agent, resolving them if they’re a function. These workflows enable the agent to execute complex, multi-step processes with defined execution paths.

Usage example

await agent.getWorkflows();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
workflows:
Promise<Record<string, Workflow>>
A promise that resolves to a record of workflow names to their corresponding Workflow instances.
Extended usage example

await agent.getWorkflows({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getTools()
The .getTools() method retrieves the tools configured for an agent, resolving them if they’re a function. These tools extend the agent’s capabilities, allowing it to perform specific actions or access external systems.

Usage example

await agent.getTools();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
tools:
TTools | Promise<TTools>
The tools configured for the agent, either as a direct object or a promise that resolves to the tools.
Extended usage example

await agent.getTools({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getScorers()
The .getScorers() method retrieves the scoring configuration configured for an agent, resolving it if it’s a function. This method provides access to the scoring system used for evaluating agent responses and performance.

Usage example

await agent.getScorers();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
scorers:
MastraScorers | Promise<MastraScorers>
The scoring configuration configured for the agent, either as a direct object or a promise that resolves to the scorers.
Extended usage example

await agent.getScorers({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getModel()
The .getModel() method retrieves the language model configured for an agent, resolving it if it’s a function. This method is used to access the underlying model that powers the agent’s capabilities.

Usage example

await agent.getModel();
Parameters
{ runtimeContext = new RuntimeContext() }?:
{ runtimeContext?: RuntimeContext }
= new RuntimeContext()
Optional configuration object containing runtime context.
Returns
model:
MastraLanguageModel | Promise<MastraLanguageModel>
The language model configured for the agent, either as a direct instance or a promise that resolves to the model.
Extended usage example

await agent.getModel({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= undefined
Runtime context for dependency injection and contextual information.

Agent.getMemory()
The .getMemory() method retrieves the memory system associated with an agent. This method is used to access the agent’s memory capabilities for storing and retrieving information across conversations.

Usage example

await agent.getMemory();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
memory:
Promise<MastraMemory | undefined>
A promise that resolves to the memory system configured for the agent, or undefined if no memory system is configured.
Extended usage example

await agent.getMemory({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getVoice()
The .getVoice() method retrieves the voice provider configured for an agent, resolving it if it’s a function. This method is used to access the agent’s speech capabilities for text-to-speech and speech-to-text functionality.

Usage example

await agent.getVoice();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
voice:
Promise<MastraVoice>
A promise that resolves to the voice provider configured for the agent, or a default voice provider if none was configured.
Extended usage example

await agent.getVoice({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.
Agent.getDescription()
The .getDescription() method retrieves the description configured for an agent. This method returns a simple string description that describes the agent’s purpose and capabilities.

Usage example

agent.getDescription();
Parameters
This method takes no parameters.

Returns
description:
string
The description of the agent, or an empty string if no description was configured.

Agent.getInstructions()
The .getInstructions() method retrieves the instructions configured for an agent, resolving them if they’re a function. These instructions guide the agent’s behavior and define its capabilities and constraints.

Usage example

await agent.getInstructions();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
instructions:
string | Promise<string>
The instructions configured for the agent, either as a direct string or a promise that resolves to the instructions.
Extended usage example

await agent.getInstructions({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= undefined
Runtime context for dependency injection and contextual information.

Agent.getLLM()
The .getLLM() method retrieves the language model instance configured for an agent, resolving it if it’s a function. This method provides access to the underlying LLM that powers the agent’s capabilities.

Usage example

await agent.getLLM();
Parameters
options?:
{ runtimeContext?: RuntimeContext; model?: MastraLanguageModel | DynamicArgument<MastraLanguageModel> }
= {}
Optional configuration object containing runtime context and optional model override.
Returns
llm:
MastraLLMV1 | Promise<MastraLLMV1>
The language model instance configured for the agent, either as a direct instance or a promise that resolves to the LLM.
Extended usage example

await agent.getLLM({
  runtimeContext: new RuntimeContext(),
  model: openai('gpt-4')
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.
model?:
MastraLanguageModel | DynamicArgument<MastraLanguageModel>
Optional model override. If provided, this model will be used used instead of the agent's configured model.

Agent.getDefaultGenerateOptions()
Agents can be configured with default generation options for controlling model behavior, output formatting and tool and workflow calls. The .getDefaultGenerateOptions() method retrieves these defaults, resolving them if they are functions. These options apply to all generate()calls unless overridden and are useful for inspecting an agent’s unknown defaults.

Usage example

await agent.getDefaultGenerateOptions();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
defaultOptions:
AgentGenerateOptions | Promise<AgentGenerateOptions>
The default generation options configured for the agent, either as a direct object or a promise that resolves to the options.
Extended usage example

await agent.getDefaultGenerateOptions({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getDefaultStreamOptions()
Agents can be configured with default streaming options for memory usage, output format, and iteration steps. The .getDefaultStreamOptions() method returns these defaults, resolving them if they are functions. These options apply to all stream() calls unless overridden and are useful for inspecting an agent’s unknown defaults.

Usage example

await agent.getDefaultStreamOptions();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
defaultOptions:
AgentStreamOptions | Promise<AgentStreamOptions>
The default streaming options configured for the agent, either as a direct object or a promise that resolves to the options.
Extended usage example

await agent.getDefaultStreamOptions({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.

Agent.getDefaultVNextStreamOptions()
Agents can be configured with default streaming options for memory usage, output format, and iteration steps. The .getDefaultVNextStreamOptions() method returns these defaults, resolving them if they are functions. These options apply to all streamVNext() calls unless overridden and are useful for inspecting an agent’s unknown defaults.

Usage example

await agent.getDefaultVNextStreamOptions();
Parameters
options?:
{ runtimeContext?: RuntimeContext }
= {}
Optional configuration object containing runtime context.
Returns
defaultOptions:
AgentExecutionOptions<Output, StructuredOutput> | Promise<AgentExecutionOptions<Output, StructuredOutput>>
The default vNext streaming options configured for the agent, either as a direct object or a promise that resolves to the options.
Extended usage example

await agent.getDefaultVNextStreamOptions({
  runtimeContext: new RuntimeContext()
});
Options parameters
runtimeContext?:
RuntimeContext
= new RuntimeContext()
Runtime context for dependency injection and contextual information.