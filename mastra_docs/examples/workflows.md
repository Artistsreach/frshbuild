Running Workflows
Workflows can be run from different environments. These examples demonstrate how to execute a workflow using a command line script or by calling the Mastra Client SDK from a client-side component.

From the command line
In this example, a run script has been added to the src directory. The inputData matches the inputSchema for the sequentialSteps example.

src/test-run-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("sequentialSteps").createRunAsync();
 
const result = await run.start({
  inputData: {
    value: 10,
  },
});
 
console.log(result);
Run the script
Run the workflow using the following command:

npx tsx src/test-run-workflow.ts
Command line output
The output from this workflow run will look similar to the below:

{
  status: 'success',
  steps: {
    input: { value: 10 },
    'step-1': {
      payload: [Object],
      startedAt: 1753814259885,
      status: 'success',
      output: [Object],
      endedAt: 1753814259885
    },
    'step-2': {
      payload: [Object],
      startedAt: 1753814259885,
      status: 'success',
      output: [Object],
      endedAt: 1753814259885
    }
  },
  result: { value: 10 }
}
Using Mastra Client
In this example, a client-side request is made using the Mastra Client SDK. The inputData matches the inputSchema for the sequentialSteps example.

src/components/test-run-workflow.tsx
import { mastraClient } from "../../lib/mastra-client";
 
export const TestWorkflow = () => {
  async function handleClick() {
    const workflow = await mastraClient.getWorkflow("sequentialSteps");
 
    const run = await workflow.createRunAsync();
 
    const result = await workflow.startAsync({
      runId: run.runId,
      inputData: {
        value: 10
      }
    });
 
    console.log(JSON.stringify(result, null, 2));
  }
 
  return <button onClick={handleClick}>Test Workflow</button>;
};
Mastra Client output
The output from this workflow run will look similar to the below:

{
  "status": "success",
  "steps": {
    "input": {
      "value": 10
    },
    "step-1": {
      "payload": {
        "value": 10
      },
      "startedAt": 1753816719202,
      "status": "success",
      "output": {
        "value": 10
      },
      "endedAt": 1753816719203
    },
    "step-2": {
      "payload": {
        "value": 10
      },
      "startedAt": 1753816719203,
      "status": "success",
      "output": {
        "value": 10
      },
      "endedAt": 1753816719203
    }
  },
  "result": {
    "value": 10
  }
}

Sequential Execution
Many workflows involve executing steps one after another in a defined order. This example demonstrates how to use .then() to build a simple sequential workflow where the output of one step becomes the input of the next.

Sequential execution using steps
In this example, the workflow runs step1 and step2 in sequence, passing the input through each step and returning the final result from step2.

src/mastra/workflows/example-sequential-steps.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: "step-1",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
const step2 = createStep({
  id: "step-2",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
export const sequentialSteps = createWorkflow({
  id: "sequential-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(step1)
  .then(step2)
  .commit();

  Parallel Execution
Workflows often need to run multiple operations at the same time. These examples demonstrate how to use .parallel() to execute steps or workflows concurrently and merge their results.

Parallel execution using steps
In this example, the workflow runs step1 and step2 using .parallel(). Each step receives the same input and runs independently. Their outputs are namespaced by step id and passed together to step3, which combines the results and returns the final value.

src/mastra/workflows/example-parallel-steps.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: "step-1",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
const step2 = createStep({
  id: "step-2",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
const step3 = createStep({
  id: "step-3",
  description: "sums values from step-1 and step-2",
  inputSchema: z.object({
    "step-1": z.object({ value: z.number() }),
    "step-2": z.object({ value: z.number() })
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    return {
      value: inputData["step-1"].value + inputData["step-2"].value
    };
  }
});
 
export const parallelSteps = createWorkflow({
  id: "parallel-workflow",
  description: "A workflow that runs steps in parallel plus a final step",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .parallel([step1, step2])
  .then(step3)
  .commit();
Parallel execution using workflows
In this example, the workflow uses .parallel() to run two workflows—workflow1 and workflow2 at the same time. Each workflow contains a single step that returns the input value. Their outputs are namespaced by workflow id and passed to step3, which combines the results and returns the final value.

src/mastra/workflows/example-parallel-workflows.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: "step-1",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
const step2 = createStep({
  id: "step-2",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
const step3 = createStep({
  id: "step-3",
  description: "sums values from step-1 and step-2",
  inputSchema: z.object({
    "workflow-1": z.object({ value: z.number() }),
    "workflow-2": z.object({ value: z.number() })
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    return {
      value: inputData["workflow-1"].value + inputData["workflow-2"].value
    };
  }
});
 
export const workflow1 = createWorkflow({
  id: "workflow-1",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(step1)
  .commit();
 
export const workflow2 = createWorkflow({
  id: "workflow-2",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(step2)
  .commit();
 
export const parallelWorkflows = createWorkflow({
  id: "parallel-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .parallel([workflow1, workflow2])
  .then(step3)
  .commit();

  Conditional Branching
Workflows often need to follow different paths based on a condition. These examples demonstrate how to use .branch() to create conditional flows using both steps and workflows.

Conditional logic using steps
In this example, the workflow uses .branch() to execute one of two steps based on a condition. If the input value is less than or equal to 10, it runs lessThanStep and returns 0. If the value is greater than 10, it runs greaterThanStep and returns 20. Only the first matching branch is executed, and its output becomes the output of the workflow.

src/mastra/workflows/example-branch-steps.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const lessThanStep = createStep({
  id: "less-than-step",
  description: "if value is <=10, return 0",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async () => {
    return {
      value: 0
    };
  }
});
const greaterThanStep = createStep({
  id: "greater-than-step",
  description: "if value is >10, return 20",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async () => {
    return {
      value: 20
    };
  }
});
 
export const branchSteps = createWorkflow({
  id: "branch-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .branch([
    [async ({ inputData: { value } }) => value <= 10, lessThanStep],
    [async ({ inputData: { value } }) => value > 10, greaterThanStep]
  ])
  .commit();
Run this example with an input value of less than or greater than 10.

Conditional logic using workflows
In this example, the workflow uses .branch() to execute one of two nested workflows based on a condition. If the input value is less than or equal to 10, it runs lessThanWorkflow, which runs the lessThanStep. If the value is greater than 10, it runs greaterThanWorkflow, which runs the greaterThanStep.

src/mastra/workflows/example-branch-workflows.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const lessThanStep = createStep({
  id: "less-than-step",
  description: "if value is <=10, return 0",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async () => {
    return {
      value: 0
    };
  }
});
const greaterThanStep = createStep({
  id: "greater-than-step",
  description: "if value is >10, return 20",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async () => {
    return {
      value: 20
    };
  }
});
 
export const lessThanWorkflow = createWorkflow({
  id: "less-than-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(lessThanStep)
  .commit();
 
export const greaterThanWorkflow = createWorkflow({
  id: "greater-than-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(greaterThanStep)
  .commit();
 
export const branchWorkflows = createWorkflow({
  id: "branch-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .branch([
    [async ({ inputData: { value } }) => value <= 10, lessThanWorkflow],
    [async ({ inputData: { value } }) => value > 10, greaterThanWorkflow]
  ])
  .commit();
Run this example with an input value of less than or greater than 10.

Array as Input
Some workflows need to perform the same operation on every item in an array. This example demonstrates how to use .foreach() to iterate over a list of strings and apply the same step to each one, producing a transformed array as the output.

Repeating with .foreach()
In this example, the workflow uses .foreach() to apply the mapStep step to each string in the input array. For each item, it appends the text " mapStep" to the original value. After all items are processed, step2 runs to pass the updated array to the output.

src/mastra/workflows/example-looping-foreach.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const mapStep = createStep({
  id: "map-step",
  description: "adds mapStep suffix to input value",
  inputSchema: z.string(),
  outputSchema: z.object({
    value: z.string()
  }),
  execute: async ({ inputData }) => {
    return {
      value: `${inputData} mapStep`
    };
  }
});
 
const step2 = createStep({
  id: "step-2",
  description: "passes value from input to output",
  inputSchema: z.array(
    z.object({
      value: z.string()
    })
  ),
  outputSchema: z.array(
    z.object({
      value: z.string()
    })
  ),
  execute: async ({ inputData }) => {
    return inputData.map(({ value }) => ({
      value: value
    }));
  }
});
 
export const loopingForeach = createWorkflow({
  id: "foreach-workflow",
  inputSchema: z.array(z.string()),
  outputSchema: z.array(
    z.object({
      value: z.string()
    })
  )
})
  .foreach(mapStep)
  .then(step2)
  .commit();
 
Run this example with multiple string inputs.

Calling an agent inside a step
Workflows can call agents to generate dynamic responses from within a step. This example shows how to define an agent, register it with the Mastra instance, and invoke it using .generate() inside a workflow step. The workflow takes a city name as input and returns a fact about the corresponding city.

Creating an agent
Create a simple agent that returns facts about a city.

src/mastra/agents/example-city-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const cityAgent = new Agent({
  name: "city-agent",
  description: "Create facts for a city",
  instructions: `Return an interesting fact based on the city provided`,
  model: openai("gpt-4o")
});
Registering an agent
To call an agent from a workflow, the agent must be registered in the Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { cityAgent } from "./agents/example-city-agent";
 
export const mastra = new Mastra({
  // ...
  agents: { cityAgent },
});
Calling an agent
Get a reference to the registered agent using getAgent(), then call .generate() inside the step, passing in the input data.

src/mastra/workflows/example-call-agent.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: "step-1",
  description: "passes value from input to agent",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    facts: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const { city } = inputData;
 
    const agent = mastra.getAgent("cityAgent");
    const response = await agent.generate(`Create an interesting fact about ${city}`);
 
    return {
      facts: response.text
    };
  }
});
 
export const callAgent = createWorkflow({
  id: "agent-workflow",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    facts: z.string()
  })
})
  .then(step1)
  .commit();

  Agent as a step
Workflows can include agents as steps. This example shows how to define an agent as a step using createStep().

Creating an agent
Create a simple agent that returns facts about a city.

src/mastra/agents/example-city-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const cityAgent = new Agent({
  name: "city-agent",
  description: "Create facts for a city",
  instructions: "Return an interesting fact based on the city provided",
  model: openai("gpt-4o")
});
Agent input/output schema
Mastra agents use a default schema that expects a prompt string as input and returns a text string as output.

{
  inputSchema: {
    prompt: string
  },
  outputSchema: {
    text: string
  }
}
Agent as step
To use an agent as a step, pass it directly to createStep(). Use the .map() method to transform the workflow input into the shape the agent expects.

In this example, the workflow receives a city input, maps it to a prompt, then calls the agent. The agent returns a text string, which is passed directly to the workflow output. Although the output schema expects a facts field, no additional mapping is required.

src/mastra/workflows/example-agent-step.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
import { cityAgent } from "../agents/example-city-agent";
 
const step1 = createStep(cityAgent);
 
export const agentAsStep = createWorkflow({
  id: "agent-step-workflow",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    facts: z.string()
  })
})
  .map(async ({ inputData }) => {
    const { city } = inputData;
    return {
      prompt: `Create an interesting fact about ${city}`
    };
  })
 
  .then(step1)
  .commit();

  Tool as a step
Workflows can include tools as steps. This example shows how to define an tool as a step using createStep().

Creating a tool
Create a simple tool that takes a string input and returns the reversed version.

src/mastra/tools/example-reverse-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
 
export const reverseTool = createTool({
  id: "reverse-tool",
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
Tool as step
Use a tool as a step by passing it directly to createStep(). Using .map() is optional because tools define their own input and output schemas, but can be helpful when the workflow inputSchema doesn’t match the tool’s inputSchema.

In this example, the workflow accepts a word, which is mapped to the tool’s input. The tool returns an output string, which is passed directly to the workflow’s reversed output without any extra transformation.

src/mastra/workflows/example-tool-step.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
import { reverseTool } from "../tools/example-reverse-tool";
 
const step1 = createStep(reverseTool);
 
export const toolAsStep = createWorkflow({
  id: "tool-step-workflow",
  inputSchema: z.object({
    word: z.string()
  }),
  outputSchema: z.object({
    reversed: z.string()
  })
})
  .map(async ({ inputData }) => {
    const { word } = inputData;
 
    return {
      input: word
    };
  })
  .then(step1)
  .commit();

  Human in-the-loop Workflow
Use human-in-the-loop workflows to pause execution at specific steps for human input, decision-making, or tasks that require judgment beyond automation.

Suspend workflow
In this example, the workflow pauses until user input is received. Execution is suspended at a specific step and only resumes once the required confirmation is provided.

src/mastra/workflows/example-human-in-loop.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: "step-1",
  description: "passes value from input to output",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  }),
  execute: async ({ inputData }) => {
    const { value } = inputData;
    return {
      value
    };
  }
});
 
const step2 = createStep({
  id: "step-2",
  description: "pauses until user confirms",
  inputSchema: z.object({
    value: z.number()
  }),
  resumeSchema: z.object({
    confirm: z.boolean()
  }),
  outputSchema: z.object({
    value: z.number(),
    confirmed: z.boolean().optional()
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { value } = inputData;
    const { confirm } = resumeData ?? {};
 
    if (!confirm) {
      await suspend({});
      return { value: value };
    }
 
    return { value: value, confirmed: confirm };
  }
});
 
export const humanInLoopWorkflow = createWorkflow({
  id: "human-in-loop-workflow",
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    value: z.number()
  })
})
  .then(step1)
  .then(step2)
  .commit();

  Inngest Workflow
This example demonstrates how to build an Inngest workflow with Mastra.

Setup

npm install @mastra/inngest inngest @mastra/core @mastra/deployer @hono/node-server @ai-sdk/openai
 
docker run --rm -p 8288:8288 \
  inngest/inngest \
  inngest dev -u http://host.docker.internal:3000/inngest/api
Alternatively, you can use the Inngest CLI for local development by following the official Inngest Dev Server guide .

Define the Planning Agent
Define a planning agent which leverages an LLM call to plan activities given a location and corresponding weather conditions.

agents/planning-agent.ts

import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
// Create a new planning agent that uses the OpenAI model
const planningAgent = new Agent({
  name: "planningAgent",
  model: openai("gpt-4o"),
  instructions: `
        You are a local activities and travel expert who excels at weather-based planning. Analyze the weather data and provide practical activity recommendations.
 
        📅 [Day, Month Date, Year]
        ═══════════════════════════
 
        🌡️ WEATHER SUMMARY
        • Conditions: [brief description]
        • Temperature: [X°C/Y°F to A°C/B°F]
        • Precipitation: [X% chance]
 
        🌅 MORNING ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]
 
        🌞 AFTERNOON ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]
 
        🏠 INDOOR ALTERNATIVES
        • [Activity Name] - [Brief description including specific venue]
          Ideal for: [weather condition that would trigger this alternative]
 
        ⚠️ SPECIAL CONSIDERATIONS
        • [Any relevant weather warnings, UV index, wind conditions, etc.]
 
        Guidelines:
        - Suggest 2-3 time-specific outdoor activities per day
        - Include 1-2 indoor backup options
        - For precipitation >50%, lead with indoor activities
        - All activities must be specific to the location
        - Include specific venues, trails, or locations
        - Consider activity intensity based on temperature
        - Keep descriptions concise but informative
 
        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      `,
});
 
export { planningAgent };
Define the Activity Planner Workflow
Define the activity planner workflow with 3 steps: one to fetch the weather via a network call, one to plan activities, and another to plan only indoor activities.

workflows/inngest-workflow.ts

import { init } from "@mastra/inngest";
import { Inngest } from "inngest";
import { z } from "zod";
 
const { createWorkflow, createStep } = init(
  new Inngest({
    id: "mastra",
    baseUrl: `http://localhost:8288`,
  }),
);
 
// Helper function to convert weather codes to human-readable descriptions
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
  };
  return conditions[code] || "Unknown";
}
 
const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
});
Step 1: Fetch weather data for a given city
workflows/inngest-workflow.ts

const fetchWeather = createStep({
  id: "fetch-weather",
  description: "Fetches weather forecast for a given city",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Trigger data not found");
    }
 
    // Get latitude and longitude for the city
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };
 
    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }
 
    const { latitude, longitude, name } = geocodingData.results[0];
 
    // Fetch weather data using the coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      current: {
        time: string;
        precipitation: number;
        weathercode: number;
      };
      hourly: {
        precipitation_probability: number[];
        temperature_2m: number[];
      };
    };
 
    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      location: name,
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0,
      ),
    };
 
    return forecast;
  },
});
Step 2: Suggest activities (indoor or outdoor) based on weather
workflows/inngest-workflow.ts

const planActivities = createStep({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;
 
    if (!forecast) {
      throw new Error("Forecast data not found");
    }
 
    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      `;
 
    const agent = mastra?.getAgent("planningAgent");
    if (!agent) {
      throw new Error("Planning agent not found");
    }
 
    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);
 
    let activitiesText = "";
 
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }
 
    return {
      activities: activitiesText,
    };
  },
});
Step 3: Suggest indoor activities only (for rainy weather)
workflows/inngest-workflow.ts

const planIndoorActivities = createStep({
  id: "plan-indoor-activities",
  description: "Suggests indoor activities based on weather conditions",
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const forecast = inputData;
 
    if (!forecast) {
      throw new Error("Forecast data not found");
    }
 
    const prompt = `In case it rains, plan indoor activities for ${forecast.location} on ${forecast.date}`;
 
    const agent = mastra?.getAgent("planningAgent");
    if (!agent) {
      throw new Error("Planning agent not found");
    }
 
    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);
 
    let activitiesText = "";
 
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }
 
    return {
      activities: activitiesText,
    };
  },
});
Define the activity planner workflow
workflows/inngest-workflow.ts

const activityPlanningWorkflow = createWorkflow({
  id: "activity-planning-workflow-step2-if-else",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeather)
  .branch([
    [
      // If precipitation chance is greater than 50%, suggest indoor activities
      async ({ inputData }) => {
        return inputData?.precipitationChance > 50;
      },
      planIndoorActivities,
    ],
    [
      // Otherwise, suggest a mix of activities
      async ({ inputData }) => {
        return inputData?.precipitationChance <= 50;
      },
      planActivities,
    ],
  ]);
 
activityPlanningWorkflow.commit();
 
export { activityPlanningWorkflow };
Register Agent and Workflow instances with Mastra class
Register the agents and workflow with the mastra instance. This allows access to the agents within the workflow.

index.ts

import { Mastra } from "@mastra/core/mastra";
import { serve as inngestServe } from "@mastra/inngest";
import { PinoLogger } from "@mastra/loggers";
import { Inngest } from "inngest";
import { activityPlanningWorkflow } from "./workflows/inngest-workflow";
import { planningAgent } from "./agents/planning-agent";
import { realtimeMiddleware } from "@inngest/realtime";
 
// Create an Inngest instance for workflow orchestration and event handling
const inngest = new Inngest({
  id: "mastra",
  baseUrl: `http://localhost:8288`, // URL of your local Inngest server
  isDev: true,
  middleware: [realtimeMiddleware()], // Enable real-time updates in the Inngest dashboard
});
 
// Create and configure the main Mastra instance
export const mastra = new Mastra({
  workflows: {
    activityPlanningWorkflow,
  },
  agents: {
    planningAgent,
  },
  server: {
    host: "0.0.0.0",
    apiRoutes: [
      {
        path: "/api/inngest", // API endpoint for Inngest to send events to
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
      },
    ],
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
Execute the activity planner workflow
Here, we’ll get the activity planner workflow from the mastra instance, then create a run and execute the created run with the required inputData.

exec.ts

import { mastra } from "./";
import { serve } from "@hono/node-server";
import {
  createHonoServer,
  getToolExports,
} from "@mastra/deployer/server";
import { tools } from "#tools";
 
const app = await createHonoServer(mastra, {
  tools: getToolExports(tools),
});
 
// Start the server on port 3000 so Inngest can send events to it
const srv = serve({
  fetch: app.fetch,
  port: 3000,
});
 
const workflow = mastra.getWorkflow("activityPlanningWorkflow");
const run = await workflow.createRunAsync();
 
// Start the workflow with the required input data (city name)
// This will trigger the workflow steps and stream the result to the console
const result = await run.start({ inputData: { city: "New York" } });
console.dir(result, { depth: null });
 
// Close the server after the workflow run is complete
srv.close();
After running the workflow, you can view and monitor your workflow runs in real time using the Inngest dashboard at http://localhost:8288 .

