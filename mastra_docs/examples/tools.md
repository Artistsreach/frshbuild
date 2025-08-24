Calling Tools
There are multiple ways to interact with tools created using Mastra. Below you will find examples of how to call tools using workflow steps, agents, and the command line for quick local testing.

From a workflow step
Import the tool and call execute() with the required context and runtimeContext parameters. The runtimeContext is available as an argument to the step’s execute function.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
import { testTool } from "../tools/test-tool";
 
const step1 = createStep({
  // ...
  execute: async ({ inputData, runtimeContext }) => {
    const { value } = inputData
 
    const response = await testTool.execute({
      context: {
        value
      },
      runtimeContext
    })
  }
});
 
export const testWorkflow = createWorkflow({
  // ...
})
  .then(step1)
  .commit();
From an agent
Tools are registered with an agent during configuration. The agent can then call these tools automatically based on user requests, or you can access them directly through the agent’s tools property. Tools are executed with the required context and runtime context.

src/mastra/agents/test-agent.ts

import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
import { testTool } from "../tools/test-tool";
 
export const testAgent = new Agent({
  // ...
  tools: {
    testTool,
  },
});
From the command line
You can create a simple script to test your tool locally. Import the tool directly and create a runtime context. Call execute() with the required context and runtimeContext for testing the tools functionality.

src/test-tool.ts

import { RuntimeContext } from "@mastra/core/runtime-context";
import { testTool } from "../src/mastra/tools/test-tool";
 
const runtimeContext = new RuntimeContext();
 
const result = await testTool.execute({
  context: {
    value: 'foo'
  },
  runtimeContext
});
 
console.log(result);

Dynamic Tools
Dynamic tools adapt their behavior and capabilities at runtime based on contextual input. Instead of relying on fixed configurations, they adjust to users, environments, or scenarios, enabling a single agent to serve personalized, context-aware responses.

Creating an tool
Create a tool that fetches exchange rate data using a dynamic value provided via runtimeContext.

src/mastra/tools/example-exchange-rates-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const getExchangeRatesTool = createTool({
  id: "get-exchange-rates-tool",
  description: "Gets exchanges rates for a currency",
  inputSchema: z.null(),
  outputSchema: z.object({
    base: z.string(),
    date: z.string(),
    rates: z.record(z.number())
  }),
  execute: async ({ runtimeContext }) => {
    const currency = runtimeContext.get("currency");
 
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
 
    const { base, date, rates } = await response.json();
 
    return { base, date, rates };
  }
});
See createTool() for a full list of configuration options.

Example usage
Set RuntimeContext using set(), then call execute() passing in the runtimeContext.

src/test-exchange-rate.ts

import { RuntimeContext } from "@mastra/core/runtime-context";
import { getExchangeRatesTool } from "../src/mastra/tools/example-exchange-rates-tool";
 
const runtimeContext = new RuntimeContext();
 
runtimeContext.set("currency", "USD");
 
const result = await getExchangeRatesTool.execute({
  context: null,
  runtimeContext
});
 
console.log(result);

Tools with Workflows
You can use workflows with tools to create reusable, multi-step processes that behave like standard tools. This is useful when you want to encapsulate complex logic behind a simple interface.

Creating a workflow
This example defines a two-step workflow:

getCityCoordinates: Looks up geolocation data for a given city.
getCityTemperature: Uses the coordinates to fetch the current temperature.
The workflow takes a city as input and outputs the temperature.

src/mastra/workflows/example-temperature-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const getCityCoordinates = createStep({
  id: "get-city-coordinates",
  description: "Get geocoding details for a city",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    longitude: z.number(),
    latitude: z.number()
  }),
  execute: async ({ inputData }) => {
    const { city } = inputData;
 
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
 
    const { results } = await response.json();
    const { latitude, longitude } = results[0];
 
    return {
      latitude,
      longitude
    };
  }
});
 
const getCityTemperature = createStep({
  id: "get-city-temperature",
  description: "Get temperature for latitude/longitude",
  inputSchema: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  outputSchema: z.object({
    temperature: z.string()
  }),
  execute: async ({ inputData }) => {
    const { latitude, longitude } = inputData;
 
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
 
    const { current_weather, current_weather_units } = await response.json();
 
    return {
      temperature: `${current_weather.temperature} ${current_weather_units.temperature}`
    };
  }
});
 
export const temperatureWorkflow = createWorkflow({
  id: "temperature-workflow",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    temperature: z.string()
  })
})
  .then(getCityCoordinates)
  .then(getCityTemperature)
  .commit();
Running a workflow from a tool
This tool wraps the workflow and exposes it through a standard tool interface. It takes a city as input, runs the underlying workflow, and returns the resulting temperature.

src/mastra/tools/temperature-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const getTemperatureTool = createTool({
  id: "get-temperature-tool",
  description: "Gets the temperature for a city",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    temperature: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const { city } = context;
    const workflow = mastra!.getWorkflow("temperatureWorkflow");
    const run = await workflow!.createRunAsync({});
 
    const runResult = await run!.start({
      inputData: {
        city
      }
    });
 
    const { temperature } = (runResult as any).result;
 
    return {
      temperature
    };
  }
});