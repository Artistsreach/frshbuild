Calling Agents
There are multiple ways to interact with agents created using Mastra. Below you will find examples of how to call agents using workflow steps, tools, the Mastra Client SDK, and the command line for quick local testing.

This page demonstrates how to call the harryPotterAgent described in the Changing the System Prompt example.

From a workflow step
The mastra instance is passed as an argument to a workflow step’s execute function. It provides access to registered agents using getAgent(). Use this method to retrieve your agent, then call generate() with a prompt.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  // ...
  execute: async ({ mastra }) => {
 
    const agent = mastra.getAgent("harryPotterAgent");
    const response = await agent.generate("What is your favorite room in Hogwarts?");
 
    console.log(response.text);
  }
});
 
export const testWorkflow = createWorkflow({
  // ...
})
  .then(step1)
  .commit();
From a tool
The mastra instance is available within a tool’s execute function. Use getAgent() to retrieve a registered agent and call generate() with a prompt.

src/mastra/tools/test-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const testTool = createTool({
  // ...
  execute: async ({ mastra }) => {
 
    const agent = mastra.getAgent("harryPotterAgent");
    const response = await agent.generate("What is your favorite room in Hogwarts?");
 
    console.log(response!.text);
  }
});
From Mastra Client
The mastraClient instance provides access to registered agents. Use getAgent() to retrieve an agent and call generate() with an object containing a messages array of role/content pairs.


import { mastraClient } from "../lib/mastra-client";
 
const agent = mastraClient.getAgent("harryPotterAgent");
const response = await agent.generate({
  messages: [
    {
      role: "user",
      content: "What is your favorite room in Hogwarts?"
    }
  ]
});
 
console.log(response.text);
See Mastra Client SDK for more information.

From the command line
You can create a simple script to test your agent locally. The mastra instance provides access to registered agents using getAgent().

To ensure your model has access to environment variables (like OPENAI_API_KEY), install dotenv and import it at the top of your script.

src/test-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("harryPotterAgent");
const response = await agent.generate("What is your favorite room in Hogwarts?");
 
console.log(response.text);
Run this script from your command line using:

npx tsx src/test-agent.ts
From curl
You can interact with a registered agent by sending a POST request to your Mastra application’s /generate endpoint. Include a messages array of role/content pairs.

curl -X POST http://localhost:4111/api/agents/harryPotterAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is your favorite room in Hogwarts?"
      }
    ]
  }'| jq -r '.text'

  Changing the System Prompt
When creating an agent, the instructions define the general rules for its behavior. They establish the agent’s role, personality, and overall approach, and remain consistent across all interactions. A system prompt can be passed to .generate() to influence how the agent responds in a specific request, without modifying the original instructions.

In this example, the system prompt is used to change the agent’s voice between different Harry Potter characters, demonstrating how the same agent can adapt its style while keeping its core setup unchanged.

Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Creating an agent
Define the agent and provide instructions, which set its default behavior and describe how it should respond when no system prompt is supplied at runtime.

src/mastra/agents/example-harry-potter-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const harryPotterAgent = new Agent({
  name: "harry-potter-agent",
  description: "Provides character-style responses from the Harry Potter universe.",
  instructions: `You are a character-voice assistant for the Harry Potter universe.
    Reply in the speaking style of the requested character (e.g., Harry, Hermione, Ron, Dumbledore, Snape, Hagrid).
    If no character is specified, default to Harry Potter.`,
  model: openai("gpt-4o")
});
See Agent for a full list of configuration options.

Registering an agent
To use an agent, register it in your main Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { harryPotterAgent } from "./agents/example-harry-potter-agent";
 
export const mastra = new Mastra({
  // ...
  agents: { harryPotterAgent }
});
Default character response
Use getAgent() to retrieve the agent and call generate() with a prompt. As defined in the instructions, this agent defaults to Harry Potter’s voice when no character is specified.

src/test-harry-potter-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("harryPotterAgent");
 
const response = await agent.generate("What is your favorite room in Hogwarts?");
 
console.log(response.text);
Changing the character voice
By providing a different system prompt at runtime, the agent’s voice can be switched to another character. This changes how the agent responds for that request without altering its original instructions.

src/test-harry-potter-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("harryPotterAgent");
 
const response = await agent.generate([
  {
    role: "system",
    content: "You are Draco Malfoy."
  },
  {
    role: "user",
    content: "What is your favorite room in Hogwarts?"
  }
]);
 
console.log(response.text);

Adding a tool
When building AI agents, you often need to extend their capabilities with external data or functionality. Mastra lets you pass tools to an agent using the tools parameter. Tools give agents a way to call specific functions, such as fetching data or performing calculations, to help answer a user’s query.

Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Creating a tool
This tool provides historical weather data for London, returning arrays of daily temperature, precipitation, wind speed, snowfall, and weather conditions from January 1st of the current year up to today. This structure makes it easy for agents to access and reason about recent weather trends.

src/mastra/tools/example-london-weather-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const londonWeatherTool = createTool({
  id: "london-weather-tool",
  description: "Returns year-to-date historical weather data for London",
  outputSchema: z.object({
    date: z.array(z.string()),
    temp_max: z.array(z.number()),
    temp_min: z.array(z.number()),
    rainfall: z.array(z.number()),
    windspeed: z.array(z.number()),
    snowfall: z.array(z.number())
  }),
  execute: async () => {
    const startDate = `${new Date().getFullYear()}-01-01`;
    const endDate = new Date().toISOString().split("T")[0];
 
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=51.5072&longitude=-0.1276&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,snowfall_sum&timezone=auto`
    );
 
    const { daily } = await response.json();
 
    return {
      date: daily.time,
      temp_max: daily.temperature_2m_max,
      temp_min: daily.temperature_2m_min,
      rainfall: daily.precipitation_sum,
      windspeed: daily.windspeed_10m_max,
      snowfall: daily.snowfall_sum
    };
  }
});
Adding a tool to an agent
This agent uses the londonWeatherTool to answer questions about historical weather in London. It has clear instructions that guide it to use the tool for every query and limit its responses to data available for the current calendar year.

src/mastra/agents/example-london-weather-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
import { londonWeatherTool } from "../tools/example-london-weather-tool";
 
export const londonWeatherAgent = new Agent({
  name: "london-weather-agent",
  description: "Provides historical information about London weather",
  instructions: `You are a helpful assistant with access to historical weather data for London.
    - The data is limited to the current calendar year, from January 1st up to today's date.
    - Use the provided tool (londonWeatherTool) to retrieve relevant data.
    - Answer the user's question using that data.
    - Keep responses concise, factual, and informative.
    - If the question cannot be answered with available data, say so clearly.`,
  model: openai("gpt-4o"),
  tools: { londonWeatherTool }
});
Example usage
Use getAgent() to retrieve a reference to the agent, then call generate() with a prompt.

src/test-london-weather-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("londonWeatherAgent");
 
const response = await agent.generate("How many times has it rained this year?");
 
console.log(response.text);

Adding a workflow
When building AI agents, it can be useful to combine them with workflows that perform multi-step tasks or fetch structured data. Mastra lets you pass workflows to an agent using the workflows parameter. Workflows provide a way for agents to trigger predefined sequences of steps, giving them access to more complex operations than a single tool can provide.

Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Creating a workflow
This workflow retrieves English Premier League fixtures for a given date. Clear input and output schemas keep the data predictable and easy for the agent to use.

src/mastra/workflows/example-soccer-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const getFixtures = createStep({
  id: "get-fixtures",
  description: "Fetch match fixtures English Premier League matches",
  inputSchema: z.object({
    date: z.string()
  }),
  outputSchema: z.object({
    fixtures: z.any()
  }),
  execute: async ({ inputData }) => {
    const { date } = inputData;
 
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${date}&l=English_Premier_League`);
    const { events } = await response.json();
 
    return {
      fixtures: events
    };
  }
});
 
export const soccerWorkflow = createWorkflow({
  id: "soccer-workflow",
  inputSchema: z.object({
    date: z.string()
  }),
  outputSchema: z.object({
    fixtures: z.any()
  })
})
  .then(getFixtures)
  .commit();
Adding a workflow to an agent
This agent uses soccerWorkflow to answer fixture questions. The instructions tell it to compute the date, pass it in YYYY-MM-DD format, and return team names, match times, and dates.

src/mastra/agents/example-soccer-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
import { soccerWorkflow } from "../workflows/example-soccer-workflow";
 
export const soccerAgent = new Agent({
  name: "soccer-agent",
  description: "A premier league soccer specialist",
  instructions: `You are a premier league soccer specialist. Use the soccerWorkflow to fetch match data.
 
  Calculate dates from ${new Date()} and pass to workflow in YYYY-MM-DD format.
 
  Only show team names, match times, and dates.`,
  model: openai("gpt-4o"),
  workflows: { soccerWorkflow }
});
Example usage
Use getAgent() to retrieve a reference to the agent, then call generate() with a prompt.

src/test-soccer-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("soccerAgent");
 
const response = await agent.generate("What matches are being played this weekend?");
 
console.log(response.text);

Supervisor Agent
When building complex AI applications, you often need multiple specialized agents to collaborate on different aspects of a task. A supervisor agent enables one agent to act as a supervisor, coordinating the work of other agents, each focused on their own area of expertise. This structure allows agents to delegate, collaborate, and produce more advanced outputs than any single agent alone.

In this example, this system consists of three agents:

A 
Copywriter agent
 that writes the initial content.
A 
Editor agent
 that refines the content.
A 
Publisher agent
 that supervises and coordinates the other agents.
Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Copywriter agent
This copywriterAgent is responsible for writing the initial blog post content based on a given topic.

src/mastra/agents/example-copywriter-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const copywriterAgent = new Agent({
  name: "copywriter-agent",
  instructions: "You are a copywriter agent that writes blog post copy.",
  model: openai("gpt-4o")
});
Copywriter tool
The copywriterTool provides an interface to call the copywriterAgent and passes in the topic.

src/mastra/tools/example-copywriter-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const copywriterTool = createTool({
  id: "copywriter-agent",
  description: "Calls the copywriter agent to write blog post copy.",
  inputSchema: z.object({
    topic: z.string()
  }),
  outputSchema: z.object({
    copy: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const { topic } = context;
 
    const agent = mastra!.getAgent("copywriterAgent");
    const result = await agent!.generate(`Create a blog post about ${topic}`);
 
    return {
      copy: result.text
    };
  }
});
Editor agent
This editorAgent takes the initial copy and refines it to improve quality and readability.

src/mastra/agents/example-editor-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const editorAgent = new Agent({
  name: "Editor",
  instructions: "You are an editor agent that edits blog post copy.",
  model: openai("gpt-4o-mini")
});
Editor tool
The editorTool provides an interface to call the editorAgent and passes in the copy.

src/mastra/tools/example-editor-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const editorTool = createTool({
  id: "editor-agent",
  description: "Calls the editor agent to edit blog post copy.",
  inputSchema: z.object({
    copy: z.string()
  }),
  outputSchema: z.object({
    copy: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const { copy } = context;
 
    const agent = mastra!.getAgent("editorAgent");
    const result = await agent.generate(`Edit the following blog post only returning the edited copy: ${copy}`);
 
    return {
      copy: result.text
    };
  }
});
Publisher agent
This publisherAgent coordinates the entire process by calling the copywriterTool first, then the editorTool.

src/mastra/agents/example-publisher-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
import { copywriterTool } from "../tools/example-copywriter-tool";
import { editorTool } from "../tools/example-editor-tool";
 
export const publisherAgent = new Agent({
  name: "publisherAgent",
  instructions:
    "You are a publisher agent that first calls the copywriter agent to write blog post copy about a specific topic and then calls the editor agent to edit the copy. Just return the final edited copy.",
  model: openai("gpt-4o-mini"),
  tools: { copywriterTool, editorTool }
});
Registering the agents
All three agents are registered in the main Mastra instance so they can be accessed by each other.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { publisherAgent } from "./agents/example-publisher-agent";
import { copywriterAgent } from "./agents/example-copywriter-agent";
import { editorAgent } from "./agents/example-editor-agent";
 
export const mastra = new Mastra({
  agents: { copywriterAgent, editorAgent, publisherAgent }
});
Example usage
Use getAgent() to retrieve a reference to the agent, then call generate() with a prompt.

src/test-publisher-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
 
const agent = mastra.getAgent("publisherAgent");
 
const response = await agent.generate("Write a blog post about React JavaScript frameworks. Only return the final edited copy.");
 
console.log(response.text);

Image Analysis
AI agents can analyze and understand images by processing visual content alongside text instructions. This capability allows agents to identify objects, describe scenes, answer questions about images, and perform complex visual reasoning tasks.

Prerequisites
Unsplash  Developer Account, Application and API Key
OpenAI API Key
This example uses the openai model. Add both OPENAI_API_KEY and UNSPLASH_ACCESS_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
Creating an agent
Create a simple agent that analyzes images to identify objects, describe scenes, and answer questions about visual content.

src/mastra/agents/example-image-analysis-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const imageAnalysisAgent = new Agent({
  name: "image-analysis",
  description: "Analyzes images to identify objects and describe scenes",
  instructions: `
    You can view an image and identify objects, describe scenes, and answer questions about the content.
    You can also determine species of animals and describe locations in the image.
   `,
  model: openai("gpt-4o")
});
See Agent for a full list of configuration options.

Registering an agent
To use an agent, register it in your main Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { imageAnalysisAgent } from "./agents/example-image-analysis-agent";
 
export const mastra = new Mastra({
  // ...
  agents: { imageAnalysisAgent }
});
Creating a function
This function retrieves a random image from Unsplash to pass to the agent for analysis.

src/mastra/utils/get-random-image.ts

export const getRandomImage = async (): Promise<string> => {
  const queries = ["wildlife", "feathers", "flying", "birds"];
  const query = queries[Math.floor(Math.random() * queries.length)];
  const page = Math.floor(Math.random() * 20);
  const order_by = Math.random() < 0.5 ? "relevant" : "latest";
 
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&page=${page}&order_by=${order_by}`, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1"
    },
    cache: "no-store"
  });
 
  const { results } = await response.json();
  return results[Math.floor(Math.random() * results.length)].urls.regular;
};
Example usage
Use getAgent() to retrieve a reference to the agent, then call generate() with a prompt. Provide a content array that includes the image type, imageUrl, mimeType, and clear instructions for how the agent should respond.

src/test-image-analysis.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
import { getRandomImage } from "./mastra/utils/get-random-image";
 
const imageUrl = await getRandomImage();
const agent = mastra.getAgent("imageAnalysisAgent");
 
const response = await agent.generate([
  {
    role: "user",
    content: [
      {
        type: "image",
        image: imageUrl,
        mimeType: "image/jpeg"
      },
      {
        type: "text",
        text: `Analyze this image and identify the main objects or subjects. If there are animals, provide their common name and scientific name. Also describe the location or setting in one or two short sentences.`
      }
    ]
  }
]);
 
console.log(response.text);

Giving your Agent a Voice
Mastra agents can be enhanced with voice capabilities, enabling them to speak and listen. This example demonstrates two ways to configure voice functionality:

Using a composite voice setup that separates input and output streams,
Using a unified voice provider that handles both.
Both examples use the OpenAIVoice provider for demonstration purposes.

Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Installation
npm install @mastra/voice-openai
Hybrid voice agent
This agent uses a composite voice setup that separates speech-to-text and text-to-speech functionality. The CompositeVoice allows you to configure different providers for listening (input) and speaking (output). However, in this example, both are handled by the same provider: OpenAIVoice.

src/mastra/agents/example-hybrid-voice-agent.ts

import { Agent } from "@mastra/core/agent";
import { CompositeVoice } from "@mastra/core/voice";
import { OpenAIVoice } from "@mastra/voice-openai";
import { openai } from "@ai-sdk/openai";
 
export const hybridVoiceAgent = new Agent({
  name: "hybrid-voice-agent",
  model: openai("gpt-4o"),
  instructions: "You can speak and listen using different providers.",
  voice: new CompositeVoice({
    input: new OpenAIVoice(),
    output: new OpenAIVoice()
  })
});
See Agent for a full list of configuration options.

Unified voice agent
This agent uses a single voice provider for both speech-to-text and text-to-speech. If you plan to use the same provider for both listening and speaking, this is a simpler setup. In this example, the OpenAIVoice provider handles both functions.

src/mastra/agents/example-unified-voice-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { OpenAIVoice } from "@mastra/voice-openai";
 
export const unifiedVoiceAgent = new Agent({
  name: "unified-voice-agent",
  instructions: "You are an agent with both STT and TTS capabilities.",
  model: openai("gpt-4o"),
  voice: new OpenAIVoice()
});
See Agent for a full list of configuration options.

Registering agents
To use these agents, register them in your main Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { hybridVoiceAgent } from "./agents/example-hybrid-voice-agent";
import { unifiedVoiceAgent } from "./agents/example-unified-voice-agent";
 
export const mastra = new Mastra({
  // ...
  agents: { hybridVoiceAgent, unifiedVoiceAgent }
});
Functions
These helper functions handle audio file operations and text conversion for the voice interaction example.

saveAudioToFile
This function saves an audio stream to a file in the audio directory, creating the directory if it doesn’t exist.

src/mastra/utils/save-audio-to-file.ts

import fs, { createWriteStream } from "fs";
import path from "path";
 
export const saveAudioToFile = async (audio: NodeJS.ReadableStream, filename: string): Promise<void> => {
  const audioDir = path.join(process.cwd(), "audio");
  const filePath = path.join(audioDir, filename);
 
  await fs.promises.mkdir(audioDir, { recursive: true });
 
  const writer = createWriteStream(filePath);
  audio.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
convertToText
This function converts either a string or a readable stream to text, handling both input types for voice processing.

src/mastra/utils/convert-to-text.ts

export const convertToText = async (input: string | NodeJS.ReadableStream): Promise<string> => {
  if (typeof input === "string") {
    return input;
  }
 
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    input.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    input.on("error", reject);
    input.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};
 
Example usage
This example demonstrates a voice interaction between two agents. The hybrid voice agent speaks a question, which is saved as an audio file. The unified voice agent listens to that file, processes the question, generates a response, and speaks it back. Both audio outputs are saved to the audio directory.

The following files are created:

hybrid-question.mp3 – Hybrid agent’s spoken question.
unified-response.mp3 – Unified agent’s spoken response.
src/test-voice-agents.ts

import "dotenv/config";
 
import path from "path";
import { createReadStream } from "fs";
import { mastra } from "./mastra";
 
import { saveAudioToFile } from "./mastra/utils/save-audio-to-file";
import { convertToText } from "./mastra/utils/convert-to-text";
 
const hybridVoiceAgent = mastra.getAgent("hybridVoiceAgent");
const unifiedVoiceAgent = mastra.getAgent("unifiedVoiceAgent");
 
const question = "What is the meaning of life in one sentence?";
 
const hybridSpoken = await hybridVoiceAgent.voice.speak(question);
 
await saveAudioToFile(hybridSpoken!, "hybrid-question.mp3");
 
const audioStream = createReadStream(path.join(process.cwd(), "audio", "hybrid-question.mp3"));
const unifiedHeard = await unifiedVoiceAgent.voice.listen(audioStream);
 
const inputText = await convertToText(unifiedHeard!);
 
const unifiedResponse = await unifiedVoiceAgent.generate(inputText);
const unifiedSpoken = await unifiedVoiceAgent.voice.speak(unifiedResponse.text);
 
await saveAudioToFile(unifiedSpoken!, "unified-response.mp3");

Dynamic Context
Dynamic agents adapt their behavior and capabilities at runtime based on contextual input. Instead of relying on fixed configurations, they adjust to users, environments, or scenarios, enabling a single agent to serve personalized, context-aware responses.

Prerequisites
This example uses the openai model. Make sure to add OPENAI_API_KEY to your .env file.

.env

OPENAI_API_KEY=<your-api-key>
Creating an agent
Create an agent that returns technical support for mastra cloud using dynamic values provided via runtimeContext.

src/mastra/agents/example-support-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const supportAgent = new Agent({
  name: "support-agent",
  description: "Returns technical support for mastra cloud based on runtime context",
  instructions: async ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");
    const language = runtimeContext.get("language");
 
    return `You are a customer support agent for [Mastra Cloud](https://mastra.ai/en/docs/mastra-cloud/overview).
    The current user is on the ${userTier} tier.
 
    Support guidance:
    ${userTier === "free" ? "- Give basic help and link to documentation." : ""}
    ${userTier === "pro" ? "- Offer detailed technical support and best practices." : ""}
    ${userTier === "enterprise" ? "- Provide priority assistance with tailored solutions." : ""}
 
    Always respond in ${language}.`;
  },
  model: openai("gpt-4o")
});
See Agent for a full list of configuration options.

Registering an agent
To use an agent, register it in your main Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { supportAgent } from "./agents/example-support-agent";
 
export const mastra = new Mastra({
  // ...
  agents: { supportAgent }
});
Example usage
Set RuntimeContext using set(), then use getAgent() to retrieve a reference to the agent, then call generate() with a prompt passing in the runtimeContext.

src/test-support-agent.ts

import "dotenv/config";
 
import { mastra } from "./mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";
 
type SupportRuntimeContext = {
  "user-tier": "free" | "pro" | "enterprise";
  language: "en" | "es" | "ja";
};
 
const runtimeContext = new RuntimeContext<SupportRuntimeContext>();
runtimeContext.set("user-tier", "free");
runtimeContext.set("language", "ja");
 
const agent = mastra.getAgent("supportAgent");
 
const response = await agent.generate("Can Mastra Cloud handle long-running requests?", {
  runtimeContext
});
 
console.log(response.text);

Example: Deploying an MCPServer
This example guides you through setting up a basic Mastra MCPServer using the stdio transport, building it, and preparing it for deployment, such as publishing to NPM.

Install Dependencies
Install the necessary packages:

pnpm add @mastra/mcp @mastra/core tsup
Set up MCP Server
Create a file for your stdio server, for example, /src/mastra/stdio.ts.

Add the following code to the file. Remember to import your actual Mastra tools and name the server appropriately.

src/mastra/stdio.ts

#!/usr/bin/env node
import { MCPServer } from "@mastra/mcp";
import { weatherTool } from "./tools";
 
const server = new MCPServer({
  name: "my-mcp-server",
  version: "1.0.0",
  tools: { weatherTool },
});
 
server.startStdio().catch((error) => {
  console.error("Error running MCP server:", error);
  process.exit(1);
});
Update your package.json to include the bin entry pointing to your built server file and a script to build the server.

package.json

{
  "bin": "dist/stdio.js",
  "scripts": {
    "build:mcp": "tsup src/mastra/stdio.ts --format esm --no-splitting --dts && chmod +x dist/stdio.js"
  }
}
Run the build command:

pnpm run build:mcp
This will compile your server code and make the output file executable.

Deploying to NPM
To make your MCP server available for others (or yourself) to use via npx or as a dependency, you can publish it to NPM.

Ensure you have an NPM account and are logged in (npm login).

Make sure your package name in package.json is unique and available.

Run the publish command from your project root after building:

npm publish --access public
For more details on publishing packages, refer to the NPM documentation .

Use the Deployed MCP Server
Once published, your MCP server can be used by an MCPClient by specifying the command to run your package. You can also use any other MCP client like Claude desktop, Cursor, or Windsurf.

import { MCPClient } from "@mastra/mcp";
 
const mcp = new MCPClient({
  servers: {
    // Give this MCP server instance a name
    yourServerName: {
      command: "npx",
      args: ["-y", "@your-org-name/your-package-name@latest"], // Replace with your package name
    },
  },
});
 
// You can then get tools or toolsets from this configuration to use in your agent
const tools = await mcp.getTools();
const toolsets = await mcp.getToolsets();
Note: If you published without an organization scope, the args might just be ["-y", "your-package-name@latest"].

Example: AI SDK v5 Integration
This example demonstrates how to integrate Mastra agents with AI SDK v5  to build modern streaming chat interfaces. It showcases a complete Next.js application with real-time conversation capabilities, persistent memory, and tool integration using the experimental streamVNext method with AI SDK v5 format support.

Key Features
Streaming Chat Interface: Uses AI SDK v5’s useChat hook for real-time conversations
Mastra Agent Integration: Weather agent with custom tools and OpenAI GPT-4o
Persistent Memory: Conversation history stored with LibSQL
Compatibility Layer: Seamless integration between Mastra and AI SDK v5 streams
Tool Integration: Custom weather tool for real-time data fetching
Mastra Configuration
First, set up your Mastra agent with memory and tools:

src/mastra/index.ts

import { ConsoleLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents";
 
export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: new ConsoleLogger(),
  // aiSdkCompat: "v4", // Optional: for additional compatibility
});
src/mastra/agents/index.ts

import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { weatherTool } from "../tools";
 
export const memory = new Memory({
  storage: new LibSQLStore({
    url: `file:./mastra.db`,
  }),
  options: {
    semanticRecall: false,
    workingMemory: {
      enabled: false,
    },
    lastMessages: 5
  },
});
 
export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
    You are a helpful weather assistant that provides accurate weather information.
 
    Your primary function is to help users get weather details for specific locations. When responding:
    - Always ask for a location if none is provided
    - Include relevant details like humidity, wind conditions, and precipitation
    - Keep responses concise but informative
 
    Use the weatherTool to fetch current weather data.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    weatherTool,
  },
  memory,
});
Custom Weather Tool
Create a tool that fetches real-time weather data:

src/mastra/tools/index.ts

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
 
export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});
 
const getWeather = async (location: string) => {
  // Geocoding API call
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = await geocodingResponse.json();
 
  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }
 
  const { latitude, longitude, name } = geocodingData.results[0];
 
  // Weather API call
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
  const response = await fetch(weatherUrl);
  const data = await response.json();
 
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};
Next.js API Routes
Streaming Chat Endpoint
Create an API route that streams responses from your Mastra agent using the experimental streamVNext with AI SDK v5 format:

app/api/chat/route.ts

import { mastra } from "@/src/mastra";
 
const myAgent = mastra.getAgent("weatherAgent");
 
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  // Use streamVNext with AI SDK v5 format (experimental)
  const stream = await myAgent.streamVNext(messages, {
    format: 'aisdk',  // Enable AI SDK v5 compatibility
    memory: {
      thread: "user-session", // Use actual user/session ID
      resource: "weather-chat",
    },
  });
 
  // Stream is already in AI SDK v5 format
  return stream.toUIMessageStreamResponse();
}
Initial Chat History
Load conversation history from Mastra Memory:

app/api/initial-chat/route.ts

import { mastra } from "@/src/mastra";
import { NextResponse } from "next/server";
 
const myAgent = mastra.getAgent("weatherAgent");
 
export async function GET() {
  const result = await myAgent.getMemory()?.query({
    threadId: "user-session",
  });
 
  return NextResponse.json(result?.uiMessages || []);
}
React Chat Interface
Build the frontend using AI SDK v5’s useChat hook:

app/page.tsx

"use client";
 
import { Message, useChat } from "@ai-sdk/react";
import useSWR from "swr";
 
const fetcher = (url: string) => fetch(url).then((res) => res.json());
 
export default function Chat() {
  // Load initial conversation history
  const { data: initialMessages = [] } = useSWR<Message[]>(
    "/api/initial-chat",
    fetcher,
  );
 
  // Set up streaming chat with AI SDK v5
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages,
  });
 
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div
          key={m.id}
          className="whitespace-pre-wrap"
          style={{ marginTop: "1em" }}
        >
          <h3
            style={{
              fontWeight: "bold",
              color: m.role === "user" ? "green" : "yellow",
            }}
          >
            {m.role === "user" ? "User: " : "AI: "}
          </h3>
          {m.parts.map((p) => p.type === "text" && p.text).join("\n")}
        </div>
      ))}
 
      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Ask about the weather..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
Package Configuration
Install the required dependencies:

NOTE: ai-sdk v5 is still in beta, while it is in beta you’ll have to install the beta ai-sdk versions and the beta mastra versions. See here  for more information

package.json

{
  "dependencies": {
    "@ai-sdk/openai": "2.0.0-beta.1",
    "@ai-sdk/react": "2.0.0-beta.1",
    "@mastra/core": "0.0.0-ai-v5-20250625173645",
    "@mastra/libsql": "0.0.0-ai-v5-20250625173645",
    "@mastra/memory": "0.0.0-ai-v5-20250625173645",
    "next": "15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "swr": "^2.3.3",
    "zod": "^3.25.67"
  }
}
Key Integration Points
Experimental streamVNext Format Support
The experimental streamVNext method with format: 'aisdk' provides native AI SDK v5 compatibility:

// Use streamVNext with AI SDK v5 format
const stream = await agent.streamVNext(messages, {
  format: 'aisdk'  // Returns AISDKV5OutputStream
});
 
// Direct compatibility with AI SDK v5 interfaces
return stream.toUIMessageStreamResponse();
Note: The streamVNext method with format support is experimental and may change as we refine the feature based on feedback. See the Agent Streaming documentation for more details.

Memory Persistence
Conversations are automatically persisted using Mastra Memory:

Each conversation uses a unique threadId
History is loaded on page refresh via /api/initial-chat
New messages are automatically stored by the agent
Tool Integration
The weather tool is seamlessly integrated:

Agent automatically calls the tool when weather information is needed
Real-time data is fetched from external APIs
Structured output ensures consistent responses
Running the Example
Set your OpenAI API key:
echo "OPENAI_API_KEY=your_key_here" > .env.local
Start the development server:
pnpm dev
Visit http://localhost:3000 and ask about weather in different cities!