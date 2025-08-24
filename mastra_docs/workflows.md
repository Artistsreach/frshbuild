Workflows overview
Workflows let you define and orchestrate complex sequences of tasks as typed steps connected by data flows. Each step has clearly defined inputs and outputs validated by Zod schemas.

A workflow manages execution order, dependencies, branching, parallelism, and error handling — enabling you to build robust, reusable processes. Steps can be nested or cloned to compose larger workflows.

Workflows overview

You create workflows by:

Defining steps with createStep, specifying input/output schemas and business logic.
Composing steps with createWorkflow to define the execution flow.
Running workflows to execute the entire sequence, with built-in support for suspension, resumption, and streaming results.
This structure provides full type safety and runtime validation, ensuring data integrity across the entire workflow.

📹 Watch: → An introduction to workflows, and how they compare to agents YouTube (7 minutes) 

Getting started
To use workflows, install the required dependencies:

npm install @mastra/core
Import the necessary functions from the workflows subpath:

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
Create step
Steps are the building blocks of workflows. Create a step using createStep:

src/mastra/workflows/test-workflow.ts

const step1 = createStep({...});
See createStep for more information.

Create workflow
Create a workflow using createWorkflow and complete it with .commit().

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
 
export const testWorkflow = createWorkflow({
  id: "test-workflow",
  description: 'Test workflow',
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  })
})
  .then(step1)
  .commit();
See workflow for more information.

Composing steps
Workflow steps can be composed and executed sequentially using .then().

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({
  id: "test-workflow",
  description: 'Test workflow',
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  })
})
  .then(step1)
  .then(step2)
  .commit();
Steps can be composed using a number of different methods. See Control Flow for more information.

Cloning steps
Workflow steps can be cloned using cloneStep(), and used with any workflow method.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep, cloneStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const clonedStep = cloneStep(step1, { id: "cloned-step" });
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({
  id: "test-workflow",
  description: 'Test workflow',
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  })
})
  .then(step1)
  .then(clonedStep)
  .then(step2)
  .commit();
Register workflow
Register a workflow using workflows in the main Mastra instance:

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
 
import { testWorkflow } from "./workflows/test-workflow";
 
export const mastra = new Mastra({
  workflows: { testWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:"
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  })
});
Run workflow
There are two ways to run and test workflows.

Mastra Playground
With the Mastra Dev Server running you can run the workflow from the Mastra Playground by visiting http://localhost:4111/workflows  in your browser.

Command line
Create a run instance of any Mastra workflow using createRunAsync and start:

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
  inputData: {
    city: "London"
  }
});
 
// Dump the complete workflow result (includes status, steps and result)
console.log(JSON.stringify(result, null, 2));
 
// Get the workflow output value
if (result.status === 'success') {
  console.log(`output value: ${result.result.output}`);
}
see createRunAsync and start for more information.

To trigger this workflow, run the following:


npx tsx src/test-workflow.ts
Run workflow results
The result of running a workflow using either start() or resume() will look like one of the following, depending on the outcome.

Status success
{
  "status": "success",
  "steps": {
    // ...
    "step-1": {
      // ...
      "status": "success",
    }
  },
  "result": {
    "output": "London + step-1"
  }
}
status: Shows the final state of the workflow execution, either: success, suspended, or error
steps: Lists each step in the workflow, including inputs and outputs
status: Shows the outcome of each individual step
result: Includes the final output of the workflow, typed according to the outputSchema
Status suspended
{
  "status": "suspended",
  "steps": {
    // ...
    "step-1": {
      // ...
      "status": "suspended",
    }
  },
  "suspended": [
    [
      "step-1"
    ]
  ]
}
suspended: An optional array listing any steps currently awaiting input before continuing
Status failed
{
  "status": "failed",
  "steps": {
    // ...
    "step-1": {
      // ...
      "status": "failed",
      "error": "Test error",
    }
  },
  "error": "Test error"
}
error: An optional field that includes the error message if the workflow fails
Stream workflow
Similar to the run method shown above, workflows can also be streamed:

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.stream({
  inputData: {
    city: "London"
  }
});
 
for await (const chunk of result.stream) {
  console.log(chunk);
}
See stream and messages for more information.

Watch Workflow
A workflow can also be watched, allowing you to inspect each event that is emitted.

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
run.watch((event) => {
  console.log(event);
});
 
const result = await run.start({
  inputData: {
    city: "London"
  }
});
See watch for more information.

More resources
The Workflow Guide in the Guides section is a tutorial that covers the main concepts.
Parallel Steps workflow example
Conditional Branching workflow example
Inngest workflow example
Suspend and Resume workflow example

Control Flow
When you build a workflow, you typically break down operations into smaller tasks that can be linked and reused. Steps provide a structured way to manage these tasks by defining inputs, outputs, and execution logic.

If the schemas match, the outputSchema from each step is automatically passed to the inputSchema of the next step.
If the schemas don’t match, use Input data mapping to transform the outputSchema into the expected inputSchema.
Chaining steps with .then()
Chain steps to execute sequentially using .then():

Chaining steps with .then()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .then(step2)
  .commit();
This does what you’d expect: it executes step1, then it executes step2.

Simultaneous steps with .parallel()
Execute steps simultaneously using .parallel():

Concurrent steps with .parallel()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
const step3 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .parallel([step1, step2])
  .then(step3)
  .commit();
This executes step1 and step2 concurrently, then continues to step3 after both complete.

See Parallel Execution with Steps for more information.

Conditional logic with .branch()
Execute steps conditionally using .branch():

Conditional branching with .branch()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const lessThanStep = createStep({...});
const greaterThanStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .branch([
    [async ({ inputData: { value } }) => value <= 10, lessThanStep],
    [async ({ inputData: { value } }) => value > 10, greaterThanStep]
  ])
  .commit();
Branch conditions are evaluated sequentially, but steps with matching conditions are executed in parallel.

See Workflow with Conditional Branching for more information.

Looping steps
Workflows support two types of loops. When looping a step, or any step-compatible construct like a nested workflow, the initial inputData is sourced from the output of the previous step.

To ensure compatibility, the loop’s initial input must either match the shape of the previous step’s output, or be explicitly transformed using the map function.

Match the shape of the previous step’s output, or
Be explicitly transformed using the map function.
Repeating with .dowhile()
Executes step repeatedly while a condition is true.

Repeating with .dowhile()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const counterStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .dowhile(counterStep, async ({ inputData: { number } }) => number < 10)
  .commit();
Repeating with .dountil()
Executes step repeatedly until a condition becomes true.

Repeating with .dountil()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const counterStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .dountil(counterStep, async ({ inputData: { number } }) => number > 10)
  .commit();
Repeating with .foreach()
Sequentially executes the same step for each item from the inputSchema.

Repeating with .foreach()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const mapStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .foreach(mapStep)
  .commit();
Setting concurrency limits
Use concurrency to execute steps in parallel with a limit on the number of concurrent executions.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const mapStep = createStep({...})
 
export const testWorkflow = createWorkflow({...})
  .foreach(mapStep, { concurrency: 2 })
  .commit();
Using a nested workflow
Use a nested workflow as a step by passing it to .then(). This runs each of its steps in sequence as part of the parent workflow.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
export const nestedWorkflow = createWorkflow({...})
 
export const testWorkflow = createWorkflow({...})
  .then(nestedWorkflow)
  .commit();
Cloning a workflow
Use cloneWorkflow to duplicate an existing workflow. This lets you reuse its structure while overriding parameters like id.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep, cloneWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const parentWorkflow = createWorkflow({...})
const clonedWorkflow = cloneWorkflow(parentWorkflow, { id: "cloned-workflow" });
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .then(clonedWorkflow)
  .commit();
Exiting early with bail()
Use bail() in a step to exit early with a successful result. This returns the provided payload as the step output and ends workflow execution.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: 'step1',
  execute: async ({ bail }) => {
    return bail({ result: 'bailed' });
  },
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ result: z.string() }),
});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
Exiting early with Error()
Use throw new Error() in a step to exit with an error.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({
  id: 'step1',
  execute: async () => {
    throw new Error('bailed');
  },
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ result: z.string() }),
});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
This throws an error from the step and stops workflow execution, returning the error as the result.

Example Run Instance
The following example demonstrates how to start a run with multiple inputs. Each input will pass through the mapStep sequentially.

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
  inputData: [{ number: 10 }, { number: 100 }, { number: 200 }]
});

Suspend & Resume
Workflows can be paused at any step, with their current state persisted as a snapshot in storage. Execution can then be resumed from this saved snapshot when ready. Persisting the snapshot ensures the workflow state is maintained across sessions, deployments, and server restarts, essential for workflows that may remain suspended while awaiting external input or resources.

Common scenarios for suspending workflows include:

Waiting for human approval or input
Pausing until external API resources become available
Collecting additional data needed for later steps
Rate limiting or throttling expensive operations
Handling event-driven processes with external triggers
Workflow status types
When running a workflow, its status can be one of the following:

running - The workflow is currently running
suspended - The workflow is suspended
success - The workflow has completed
failed - The workflow has failed
Suspending a workflow with suspend()
To pause execution at a specific step until user input is received, use the ⁠suspend function to temporarily halt the workflow, allowing it to resume only when the necessary data is provided.

Suspending a workflow with suspend()

src/mastra/workflows/test-workflow.ts

const step1 = createStep({
  id: "step-1",
  description: "Test suspend",
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
  suspendSchema: z.object({}),
  resumeSchema: z.object({
    city: z.string()
  }),
  execute: async ({ resumeData, suspend }) => {
    const { city } = resumeData ?? {};
 
    if (!city) {
      await suspend({});
      return { output: "" };
    }
 
    return { output: "" };
  }
});
 
export const testWorkflow = createWorkflow({})
  .then(step1)
  .commit();
For more details, check out the Suspend workflow example.

Identifying suspended steps
To resume a suspended workflow, inspect the suspended array in the result to determine which step needs input:

src/mastra/workflows/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
  inputData: {
    city: "London"
  }
});
 
console.log(JSON.stringify(result, null, 2));
 
if (result.status === "suspended") {
  const resumedResult = await run.resume({
    step: result.suspended[0],
    resumeData: {
      city: "Berlin"
    }
  });
}
 
In this case, the logic resumes the first step listed in the suspended array. A step can also be defined using it’s id, for example: ‘step-1’.

{
  "status": "suspended",
  "steps": {
    // ...
    "step-1": {
      // ...
      "status": "suspended",
    }
  },
  "suspended": [
    [
      "step-1"
    ]
  ]
}
See Run Workflow Results for more details.

Resuming a workflow with resume()
A workflow can be resumed by calling resume and providing the required resumeData. You can either explicitly specify which step to resume from, or when exactly one step is suspended, omit the step parameter and the workflow will automatically resume that step.

src/mastra/workflows/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
   inputData: {
    city: "London"
  }
});
 
console.log(JSON.stringify(result, null, 2));
 
if (result.status === "suspended") {
  const resumedResult = await run.resume({
    step: 'step-1',
    resumeData: {
      city: "Berlin"
    }
  });
 
  console.log(JSON.stringify(resumedResult, null, 2));
}
You can also omit the step parameter when exactly one step is suspended:

src/mastra/workflows/test-workflow.ts

const resumedResult = await run.resume({
  resumeData: {
    city: "Berlin"
  },
  // step parameter omitted - automatically resumes the single suspended step
});
Resuming nested workflows
To resume a suspended nested workflow pass the workflow instance to the step parameter of the resume function.

src/mastra/workflows/test-workflow.ts

const dowhileWorkflow = createWorkflow({
  id: 'dowhile-workflow',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ value: z.number() }),
})
  .dountil(
    createWorkflow({
      id: 'simple-resume-workflow',
      inputSchema: z.object({ value: z.number() }),
      outputSchema: z.object({ value: z.number() }),
      steps: [incrementStep, resumeStep],
    })
      .then(incrementStep)
      .then(resumeStep)
      .commit(),
    async ({ inputData }) => inputData.value >= 10,
  )
  .then(
    createStep({
      id: 'final',
      inputSchema: z.object({ value: z.number() }),
      outputSchema: z.object({ value: z.number() }),
      execute: async ({ inputData }) => ({ value: inputData.value }),
    }),
  )
  .commit();
 
const run = await dowhileWorkflow.createRunAsync();
const result = await run.start({ inputData: { value: 0 } });
 
if (result.status === "suspended") {
  const resumedResult = await run.resume({
    resumeData: { value: 2 },
    step: ['simple-resume-workflow', 'resume'],
  });
 
  console.log(JSON.stringify(resumedResult, null, 2));
}
Using RuntimeContext with suspend/resume
When using suspend/resume with RuntimeContext, you can create the instance yourself, and pass it to the start and resume functions. RuntimeContext is not automatically shared on a workflow run.

src/mastra/workflows/test-workflow.tss

import { RuntimeContext } from "@mastra/core/di";
import { mastra } from "./mastra";
 
const runtimeContext = new RuntimeContext();
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
  inputData: { suggestions: ["London", "Paris", "New York"] },
  runtimeContext
});
 
if (result.status === "suspended") {
  const resumedResult = await run.resume({
    step: 'step-1',
    resumeData: { city: "New York" },
    runtimeContext
  });
}

Sleep & Events
Mastra lets you pause workflow execution when waiting for external input or timing conditions. This can be useful for things like polling, delayed retries, or waiting on user actions.

You can pause execution using:

sleep(): Pause for a set number of milliseconds
sleepUntil(): Pause until a specific timestamp
waitForEvent(): Pause until an external event is received
sendEvent(): Send an event to resume a waiting workflow
When using any of these methods, the workflow status is set to waiting until execution resumes.

Pausing with .sleep()
The sleep() method pauses execution between steps for a specified number of milliseconds.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .sleep(1000)
  .then(step2)
  .commit();
Pausing with .sleep(callback)
The sleep() method also accepts a callback that returns the number of milliseconds to pause. The callback receives inputData, allowing the delay to be computed dynamically.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .sleep(async ({ inputData }) => {
    const { delayInMs }  = inputData
    return delayInMs;
  })
  .then(step2)
  .commit();
Pausing with .sleepUntil()
The sleepUntil() method pauses execution between steps until a specified date.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .sleepUntil(new Date(Date.now() + 5000))
  .then(step2)
  .commit();
Pausing with .sleepUntil(callback)
The sleepUntil() method also accepts a callback that returns a Date object. The callback receives inputData, allowing the target time to be computed dynamically.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .sleepUntil(async ({ inputData }) => {
    const { delayInMs }  = inputData
    return new Date(Date.now() + delayInMs);
  })
  .then(step2)
  .commit();
Date.now() is evaluated when the workflow starts, not at the moment the sleepUntil() method is called.

Pausing with .waitForEvent()
The waitForEvent() method pauses execution until a specific event is received. Use run.sendEvent() to send the event. You must provide both the event name and the step to resume.

Pausing with .waitForEvent()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
const step3 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .waitForEvent("my-event-name", step2)
  .then(step3)
  .commit();
Sending an event with .sendEvent()
The .sendEvent() method sends an event to the workflow. It accepts the event name and optional event data, which can be any JSON-serializable value.

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = run.start({
  inputData: {
    value: "hello"
  }
});
 
setTimeout(() => {
  run.sendEvent("my-event-name", { value: "from event" });
}, 3000);
 
console.log(JSON.stringify(await result, null, 2));
In this example, avoid using await run.start() directly, it would block sending the event before the workflow reaches its waiting state.

Input Data Mapping
Input data mapping allows explicit mapping of values for the inputs of the next step. These values can come from a number of sources:

The outputs of a previous step
The runtime context
A constant value
The initial input of the workflow
Mapping with .map()
In this example the output from step1 is transformed to match the inputSchema required for the step2. The value from step1 is available using the inputData parameter of the .map function.

Mapping with .map()

src/mastra/workflows/test-workflow.ts

const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .map(async ({ inputData }) => {
    const { value } = inputData;
    return {
      output: `new ${value}`
    };
  })
  .then(step2)
  .commit();
Using inputData
Use inputData to access the full output of the previous step:

src/mastra/workflows/test-workflow.ts

  .then(step1)
  .map(({ inputData }) => {
    console.log(inputData);
  })
Using getStepResult()
Use getStepResult to access the full output of a specific step by referencing the step’s instance:

src/mastra/workflows/test-workflow.ts

  .then(step1)
  .map(async ({ getStepResult }) => {
    console.log(getStepResult(step1));
  })
Using getInitData()
Use getInitData to access the initial input data provided to the workflow:

src/mastra/workflows/test-workflow.ts

  .then(step1)
  .map(async ({ getInitData }) => {
      console.log(getInitData());
  })
Using mapVariable()
To use mapVariable import the necessary function from the workflows module:

src/mastra/workflows/test-workflow.ts

import { mapVariable } from "@mastra/core/workflows";
Renaming step with mapVariable()
You can rename step outputs using the object syntax in .map(). In the example below, the value output from step1 is renamed to details:

src/mastra/workflows/test-workflow.ts

  .then(step1)
  .map({
    details: mapVariable({
      step: step,
      path: "value"
    })
  })
Renaming workflows with mapVariable()
You can rename workflow outputs by using referential composition. This involves passing the workflow instance as the initData.

src/mastra/workflows/test-workflow.ts

export const testWorkflow = createWorkflow({...});
 
testWorkflow
  .then(step1)
  .map({
    details: mapVariable({
      initData: testWorkflow,
      path: "value"
    })
  })

  Agents and Tools
Workflow steps are composable and typically run logic directly within the execute function. However, there are cases where calling an agent or tool is more appropriate. This pattern is especially useful when:

Generating natural language responses from user input using an LLM.
Abstracting complex or reusable logic into a dedicated tool.
Interacting with third-party APIs in a structured or reusable way.
Workflows can use Mastra agents or tools directly as steps, for example: createStep(testAgent) or createStep(testTool).

Using agents in workflows
To include an agent in a workflow, define it in the usual way, then either add it directly to the workflow using createStep(testAgent) or, invoke it from within a step’s execute function using .generate().

Example agent
This agent uses OpenAI to generate a fact about a city, country, and timezone.

src/mastra/agents/test-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const testAgent = new Agent({
  name: "test-agent",
  description: "Create facts for a country based on the city",
  instructions: `Return an interesting fact about the country based on the city provided`,
  model: openai("gpt-4o")
});
Adding an agent as a step
In this example, step1 uses the testAgent to generate an interesting fact about the country based on a given city.

The .map method transforms the workflow input into a prompt string compatible with the testAgent.

The step is composed into the workflow using .then(), allowing it to receive the mapped input and return the agent’s structured output. The workflow is finalized with .commit().

Agent as step

src/mastra/workflows/test-workflow.ts

import { testAgent } from "../agents/test-agent";
 
const step1 = createStep(testAgent);
 
export const testWorkflow = createWorkflow({
  id: "test-workflow",
  description: 'Test workflow',
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  })
})
  .map(({ inputData }) => {
    const { input } = inputData;
    return {
      prompt: `Provide facts about the city: ${input}`
    };
  })
  .then(step1)
  .commit();
Calling an agent with .generate()
In this example, the step1 builds a prompt using the provided input and passes it to the testAgent, which returns a plain-text response containing facts about the city and its country.

The step is added to the workflow using the sequential .then() method, allowing it to receive input from the workflow and return structured output. The workflow is finalized with .commit().

src/mastra/workflows/test-workflow.ts

import { testAgent } from "../agents/test-agent";
 
const step1 = createStep({
  id: "step-1",
  description: "Create facts for a country based on the city",
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
 
  execute: async ({ inputData }) => {
    const { input } = inputData;
 
    const  prompt = `Provide facts about the city: ${input}`
 
    const { text } = await testAgent.generate([
      { role: "user", content: prompt }
    ]);
 
    return {
      output: text
    };
  }
});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
Using tools in workflows
To use a tool within a workflow, define it in the usual way, then either add it directly to the workflow using createStep(testTool) or, invoke it from within a step’s execute function using .execute().

Example tool
The example below uses the Open Meteo API to retrieve geolocation details for a city, returning its name, country, and timezone.

src/mastra/tools/test-tool.ts

import { createTool } from "@mastra/core";
import { z } from "zod";
 
export const testTool = createTool({
  id: "test-tool",
  description: "Gets country for a city",
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    country_name: z.string()
  }),
  execute: async ({ context }) => {
    const { input } = context;
    const geocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${input}`);
    const geocodingData = await geocodingResponse.json();
 
    const { country } = geocodingData.results[0];
 
    return {
      country_name: country
    };
  }
});
Adding a tool as a step
In this example, step1 uses the testTool, which performs a geocoding lookup using the provided city and returns the resolved country.

The step is added to the workflow using the sequential .then() method, allowing it to receive input from the workflow and return structured output. The workflow is finalized with .commit().

Tool as step

src/mastra/workflows/test-workflow.ts

import { testTool } from "../tools/test-tool";
 
const step1 = createStep(testTool);
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
Calling a tool with .execute()
In this example, step1 directly invokes testTool using its .execute() method. The tool performs a geocoding lookup with the provided city and returns the corresponding country.

The result is returned as structured output from the step. The step is composed into the workflow using .then(), enabling it to process workflow input and produce typed output. The workflow is finalized with .commit()

src/mastra/workflows/test-workflow.ts

import { RuntimeContext } from "@mastra/core/di";
 
import { testTool } from "../tools/test-tool";
 
const runtimeContext = new RuntimeContext();
 
const step1 = createStep({
  id: "step-1",
  description: "Gets country for a city",
  inputSchema: z.object({
    input: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
 
  execute: async ({ inputData }) => {
    const { input } = inputData;
 
    const { country_name } = await testTool.execute({
      context: { input },
      runtimeContext
    });
 
    return {
      output: country_name
    };
  }
});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
Using workflows as tools
In this example the cityStringWorkflow workflow has been added to the main Mastra instance.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
 
import { testWorkflow, cityStringWorkflow } from "./workflows/test-workflow";
 
export const mastra = new Mastra({
  ...
  workflows: { testWorkflow, cityStringWorkflow },
});
Once a workflow has been registered it can be referenced using getWorkflow from withing a tool.

src/mastra/tools/test-tool.ts

export const cityCoordinatesTool = createTool({
  id: "city-tool",
  description: "Convert city details",
  inputSchema: z.object({
    city: z.string()
  }),
  outputSchema: z.object({
    outcome: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const { city } = context;
    const geocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geocodingData = await geocodingResponse.json();
 
    const { name, country, timezone } = geocodingData.results[0];
 
    const workflow = mastra?.getWorkflow("cityStringWorkflow");
 
    const run = await workflow?.createRunAsync();
 
    const { result } = await run?.start({
      inputData: {
        city_name: name,
        country_name: country,
        country_timezone: timezone
      }
    });
 
    return {
      outcome: result.outcome
    };
  }
});
Using workflows in agents
You can also use Workflows in Agents. This agent is able to choose between using the test tool or the test workflow.

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { testTool } from "../tools/test-tool";
import { testWorkflow } from "../workflows/test-workflow";
 
export const testAgent = new Agent({
  name: "test-agent",
  description: "Create facts for a country based on the city",
  instructions: `Return an interesting fact about the country based on the city provided`,
  model: openai("gpt-4o"),
  workflows: {
    test_workflow: testWorkflow
  },
  tools: {
    test_tool: testTool
  },
});
Exposing workflows with MCPServer
You can convert your workflows into tools by passing them into an instance of a Mastra MCPServer. This allows any MCP-compatible client to access your workflow.

The workflow description becomes the tool description and the input schema becomes the tool’s input schema.

When you provide workflows to the server, each workflow is automatically exposed as a callable tool for example:

run_testWorkflow.
src/test-mcp-server.ts

import { MCPServer } from "@mastra/mcp";
 
import { testAgent } from "./mastra/agents/test-agent";
import { testTool } from "./mastra/tools/test-tool";
import { testWorkflow } from "./mastra/workflows/test-workflow";
 
async function startServer() {
  const server = new MCPServer({
    name: "test-mcp-server",
    version: "1.0.0",
    workflows: {
      testWorkflow
    }
  });
 
  await server.startStdio();
  console.log("MCPServer started on stdio");
}
 
startServer().catch(console.error);
To verify that your workflow is available on the server, you can connect with an MCPClient.

src/test-mcp-client.ts

import { MCPClient } from "@mastra/mcp";
 
async function main() {
  const mcp = new MCPClient({
    servers: {
      local: {
        command: "npx",
        args: ["tsx", "src/test-mcp-server.ts"]
      }
    }
  });
 
  const tools = await mcp.getTools();
  console.log(tools);
}
 
main().catch(console.error);
Run the client script to see your workflow tool.

npx tsx src/test-mcp-client.ts

Workflow Streaming
Workflows in Mastra have access to a powerful streaming protocol! With seamless integration into tools or agents as a step, you can stream responses directly back to your clients, creating a more interactive and engaging experience.

Usage
To use the new protocol, you can use the streamVNext method on an workflow. This method will return a custom MatraWorkflowStream. This stream extends a ReadableStream, so all basic stream methods are available.

const run = await myWorkflow.createRunAsync();
const stream = await run.streamVNext({ inputData: { city: 'New York' } });
 
for await (const chunk of stream) {
  console.log(chunk);
}
Each chunk is a JSON object with the following properties:

{
  type: string;
  runId: string;
  from: string;
  payload: Record<string, any>;
}
We have a couple of utility functions on the stream to help you with the streaming process.

stream.status - The status of the workflow run.
stream.result - The result of the workflow run.
stream.usage - The total token usage of the workflow run.
How to use the stream in a tool
Each tool gets a writer argument, which is a writable stream with a custom write function. This write function is used to write the tool’s response to the stream.

src/mastra/workflows/weather.ts

import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
export const weatherInfo = createStep({
  id: "weather-info",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    conditions: z.string(),
    temperature: z.number(),
  }),
  description: `Fetches the current weather information for a given city`,
  execute: async ({ inputData: { city }, writer }) => {
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
If you want to use the stream in an agent, you can use the streamVNext method on the agent and pipe it to the agent’s input stream.

src/mastra/workflows/weather.ts

import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
export const weatherInfo = createStep({
  id: "weather-info",
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  description: `Fetches the current weather information for a given city`,
  execute: async ({ inputData: { city }, writer, mastra }) => {
    const agent = mastra.getAgent('weatherAgent')
    const stream = await agent.streamVNext(`What is the weather in ${city}?`);
 
    await stream.pipeTo(writer);
 
    return {
      text: await stream.text,
    }
  },
});
Piping the stream to the agent’s input stream will allow us to automatically sum up the usage of the agent so the total usage count can be calculated.

Inngest Workflow
Inngest  is a developer platform for building and running background workflows, without managing infrastructure.

How Inngest Works with Mastra
Inngest and Mastra integrate by aligning their workflow models: Inngest organizes logic into functions composed of steps, and Mastra workflows defined using createWorkflow and createStep map directly onto this paradigm. Each Mastra workflow becomes an Inngest function with a unique identifier, and each step within the workflow maps to an Inngest step.

The serve function bridges the two systems by registering Mastra workflows as Inngest functions and setting up the necessary event handlers for execution and monitoring.

When an event triggers a workflow, Inngest executes it step by step, memoizing each step’s result. This means if a workflow is retried or resumed, completed steps are skipped, ensuring efficient and reliable execution. Control flow primitives in Mastra, such as loops, conditionals, and nested workflows are seamlessly translated into the same Inngest’s function/step model, preserving advanced workflow features like composition, branching, and suspension.

Real-time monitoring, suspend/resume, and step-level observability are enabled via Inngest’s publish-subscribe system and dashboard. As each step executes, its state and output are tracked using Mastra storage and can be resumed as needed.

Setup
npm install @mastra/inngest @mastra/core @mastra/deployer
Building an Inngest Workflow
This guide walks through creating a workflow with Inngest and Mastra, demonstrating a counter application that increments a value until it reaches 10.

Inngest Initialization
Initialize the Inngest integration to obtain Mastra-compatible workflow helpers. The createWorkflow and createStep functions are used to create workflow and step objects that are compatible with Mastra and inngest.

In development

src/mastra/inngest/index.ts

import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";
 
export const inngest = new Inngest({
  id: "mastra",
  baseUrl:"http://localhost:8288",
  isDev: true,
  middleware: [realtimeMiddleware()],
});
In production

src/mastra/inngest/index.ts

import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";
 
export const inngest = new Inngest({
  id: "mastra",
  middleware: [realtimeMiddleware()],
});
Creating Steps
Define the individual steps that will compose your workflow:

src/mastra/workflows/index.ts

import { z } from "zod";
import { inngest } from "../inngest";
import { init } from "@mastra/inngest";
 
// Initialize Inngest with Mastra, pointing to your local Inngest server
const { createWorkflow, createStep } = init(inngest);
 
// Step: Increment the counter value
const incrementStep = createStep({
  id: "increment",
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
  execute: async ({ inputData }) => {
    return { value: inputData.value + 1 };
  },
});
Creating the Workflow
Compose the steps into a workflow using the dountil loop pattern. The createWorkflow function creates a function on inngest server that is invocable.

src/mastra/workflows/index.ts

// workflow that is registered as a function on inngest server
const workflow = createWorkflow({
  id: "increment-workflow",
  inputSchema: z.object({
    value: z.number(),
  }),
  outputSchema: z.object({
    value: z.number(),
  }),
}).then(incrementStep);
 
workflow.commit();
 
export { workflow as incrementWorkflow };
Configuring the Mastra Instance and Executing the Workflow
Register the workflow with Mastra and configure the Inngest API endpoint:

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { serve as inngestServe } from "@mastra/inngest";
import { incrementWorkflow } from "./workflows";
import { inngest } from "./inngest";
import { PinoLogger } from "@mastra/loggers";
 
// Configure Mastra with the workflow and Inngest API endpoint
export const mastra = new Mastra({
  workflows: {
    incrementWorkflow,
  },
  server: {
    // The server configuration is required to allow local docker container can connect to the mastra server
    host: "0.0.0.0",
    apiRoutes: [
      // This API route is used to register the Mastra workflow (inngest function) on the inngest server
      {
        path: "/api/inngest",
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
        // The inngestServe function integrates Mastra workflows with Inngest by:
        // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
        // 2. Setting up event handlers that:
        //    - Generate unique run IDs for each workflow execution
        //    - Create an InngestExecutionEngine to manage step execution
        //    - Handle workflow state persistence and real-time updates
        // 3. Establishing a publish-subscribe system for real-time monitoring
        //    through the workflow:${workflowId}:${runId} channel
      },
    ],
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
Running the Workflow locally
Prerequisites:

Docker installed and running
Mastra project set up
Dependencies installed (npm install)
Run npx mastra dev to start the Mastra server on local to serve the server on port 4111.
Start the Inngest Dev Server (via Docker) In a new terminal, run:
docker run --rm -p 8288:8288 \
  inngest/inngest \
  inngest dev -u http://host.docker.internal:4111/api/inngest
Note: The URL after -u tells the Inngest dev server where to find your Mastra /api/inngest endpoint.

Open the Inngest Dashboard
Visit http://localhost:8288  in your browser.
Go to the Apps section in the sidebar.
You should see your Mastra workflow registered.Inngest Dashboard
Invoke the Workflow
Go to the Functions section in the sidebar.
Select your Mastra workflow.
Click Invoke and use the following input:
{
  "data": {
    "inputData": {
      "value": 5
    }
  }
}
Inngest Function

Monitor the Workflow Execution
Go to the Runs tab in the sidebar.
Click on the latest run to see step-by-step execution progress.Inngest Function Run
Running the Workflow in Production
Prerequisites:

Vercel account and Vercel CLI installed (npm i -g vercel)
Inngest account
Vercel token (recommended: set as environment variable)
Add Vercel Deployer to Mastra instance
src/mastra/index.ts

import { VercelDeployer } from "@mastra/deployer-vercel";
 
export const mastra = new Mastra({
  // ...other config
  deployer: new VercelDeployer({
    teamSlug: "your_team_slug",
    projectName: "your_project_name",
    // you can get your vercel token from the vercel dashboard by clicking on the user icon in the top right corner
    // and then clicking on "Account Settings" and then clicking on "Tokens" on the left sidebar.
    token: "your_vercel_token",
  }),
});
Note: Set your Vercel token in your environment:

export VERCEL_TOKEN=your_vercel_token
Build the mastra instance
npx mastra build
Deploy to Vercel
cd .mastra/output
vercel --prod
Tip: If you haven’t already, log in to Vercel CLI with vercel login.

Sync with Inngest Dashboard
Go to the Inngest dashboard .
Click Sync new app with Vercel and follow the instructions.
You should see your Mastra workflow registered as an app.Inngest Dashboard
Invoke the Workflow
In the Functions section, select workflow.increment-workflow.
Click All actions (top right) > Invoke.
Provide the following input:
{
  "data": {
    "inputData": {
      "value": 5
    }
  }
}
Inngest Function Run

Monitor Execution
Go to the Runs tab.
Click the latest run to see step-by-step execution progress.