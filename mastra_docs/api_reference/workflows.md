Workflow Class
The Workflow class enables you to create state machines for complex sequences of operations with conditional branching and data validation.

Usage example
src/mastra/workflows/test-workflow.ts

import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
 
export const workflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    value: z.string(),
  }),
  outputSchema: z.object({
    value: z.string(),
  })
})
Constructor parameters
id:
string
Unique identifier for the workflow
inputSchema:
z.ZodType<any>
Zod schema defining the input structure for the workflow
outputSchema:
z.ZodType<any>
Zod schema defining the output structure for the workflow
Workflow status
A workflow’s status indicates its current execution state. The possible values are:

success:
string
All steps finished executing successfully, with a valid result output
failed:
string
Workflow encountered an error during execution, with error details available
suspended:
string
Workflow execution is paused waiting for resume, with suspended step information
Extended usage example
src/test-run.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("workflow").createRunAsync();
 
const result = await run.start({...});
 
if (result.status === "suspended") {
  const resumedResult = await run.resume({...});
}

Step Class
The Step class defines individual units of work within a workflow, encapsulating execution logic, data validation, and input/output handling. It can take either a tool or an agent as a parameter to automatically create a step from them.

Usage example
src/mastra/workflows/test-workflow.ts

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
Constructor Parameters
id:
string
Unique identifier for the step
description:
string
Optional description of what the step does
inputSchema:
z.ZodType<any>
Zod schema defining the input structure
outputSchema:
z.ZodType<any>
Zod schema defining the output structure
resumeSchema:
z.ZodType<any>
Optional Zod schema for resuming the step
suspendSchema:
z.ZodType<any>
Optional Zod schema for suspending the step
execute:
(params: ExecuteParams) => Promise<any>
Async function containing step logic
ExecuteParams
inputData:
z.infer<TStepInput>
The input data matching the inputSchema
resumeData:
z.infer<TResumeSchema>
The resume data matching the resumeSchema, when resuming the step from a suspended state. Only exists if the step is being resumed.
mastra:
Mastra
Access to Mastra services (agents, tools, etc.)
getStepResult:
(stepId: string) => any
Function to access results from other steps
getInitData:
() => any
Function to access the initial input data of the workflow in any step
suspend:
() => Promise<void>
Function to pause workflow execution
runId:
string
Current run id
runtimeContext?:
RuntimeContext
Runtime context for dependency injection and contextual information.
runCount?:
number
The run count for this specific step, it automatically increases each time the step runs

Workflow.then()
The .then() method creates a sequential dependency between workflow steps, ensuring steps execute in a specific order.

Usage example

workflow.then(step1).then(step2);
Parameters
step:
Step
The step instance that should execute after the previous step completes
Returns
workflow:
NewWorkflow
The workflow instance for method chaining

Workflow.branch()
The .branch() method creates conditional branches between workflow steps, allowing for different paths to be taken based on the result of a previous step.

Usage example

workflow.branch([
  [async ({ context }) => true, step1],
  [async ({ context }) => false, step2],
]);
Parameters
steps:
[() => boolean, Step]
An array of tuples, each containing a condition function and a step to execute if the condition is true
Returns
workflow:
NewWorkflow
The workflow instance for method chaining

Workflow.parallel()
The .parallel() method executes multiple steps in parallel.

Usage example

workflow.parallel([step1, step2]);
Parameters
steps:
Step[]
The step instances to execute in parallel
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.commit()
The .commit() method finalizes the workflow and returns the final result.

Usage example

workflow.then(step1).commit();
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.dowhile()
The .dowhile() method creates a loop that executes a step while a condition is met.

Usage example

workflow.dowhile(step1, async ({ inputData }) => true);
Parameters
step:
Step
The step instance to execute in the loop
condition:
(params : { inputData: any}) => Promise<boolean>
A function that returns a boolean indicating whether to continue the loop
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.dountil()
The .dountil() method creates a loop that executes a step until a condition is met.

Usage example

workflow.dountil(step1, async ({ inputData }) => true);
Parameters
step:
Step
The step instance to execute in the loop
condition:
(params : { inputData: any}) => Promise<boolean>
A function that returns a boolean indicating whether to continue the loop
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.foreach()
The .foreach() method creates a loop that executes a step for each item in an array.

Usage example

workflow.foreach(step1, { concurrency: 2 });
Parameters
step:
Step
The step instance to execute in the loop. The previous step must return an array type.
opts?:
object
Optional configuration for the loop. The concurrency option controls how many iterations can run in parallel (default: 1)
number
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.map()
The .map() method maps output data from a previous step to the input of a subsequent step, allowing you to transform data between steps.

Usage example

workflow.map(async ({ inputData }) => `${inputData.value} - map`
Parameters
mappingFunction:
(params: { inputData: any }) => any
Function that transforms input data and returns the mapped result
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.sleep()
The .sleep() method pauses execution for a specified number of milliseconds.

Usage example

workflow.sleep(5000);
Parameters
milliseconds:
number
The number of milliseconds to pause execution
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.sleepUntil()
The .sleepUntil() method pauses execution until a specified date.

Usage example

workflow.sleepUntil(new Date(Date.now() + 5000));
Parameters
dateOrCallback:
Date | ((params: ExecuteFunctionParams) => Promise<Date>)
Either a Date object or a callback function that returns a Date. The callback receives execution context and can compute the target time dynamically based on input data.
Returns
workflow:
Workflow
The workflow instance for method chaining
Extended usage example

workflow.sleepUntil(async ({ inputData }) => {
  return new Date(Date.now() + inputData.value);
});

Workflow.waitForEvent()
The .waitForEvent() method pauses execution until an event is received.

Usage example

workflow.waitForEvent('event-name', step1);
Parameters
eventName:
string
The name of the event to wait for
step:
Step
The step to resume after the event is received
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.sendEvent()
The .sendEvent() resumes execution when an event is sent.

Usage example

workflow.sendEvent('event-name', step1);
Parameters
eventName:
string
The name of the event to send
step:
Step
The step to resume after the event is sent
Returns
workflow:
Workflow
The workflow instance for method chaining

Workflow.execute()
The .execute() method executes a workflow directly and returns the output, allowing you to run a workflow without creating a separate run instance.

Usage example

await workflow.execute({
  inputData: {
    value: "hello world"
  }
});
Parameters
inputData:
z.infer<TInput>
Input data that matches the workflow's input schema
resumeData?:
any
Data for resuming a suspended workflow
suspend:
(suspendPayload: any) => Promise<any>
Function to suspend workflow execution
resume?:
object
Configuration for resuming workflow execution
string[]
any
string
emitter:
object
Event emitter object for workflow events
(event: string, data: any) => void
mastra:
Mastra
Mastra instance
runtimeContext?:
RuntimeContext
Runtime context data to use during workflow execution
abort:
() => any
Function to abort workflow execution
abortSignal:
AbortSignal
Abort signal for workflow execution
runCount?:
number
Number of times the workflow has been run
Returns
result:
Promise<z.infer<TOutput>>
A promise that resolves to the output of the executed workflow

Workflow.createRunAsync()
The .createRunAsync() method creates a new workflow run instance, allowing you to execute the workflow with specific input data. This is the current API that returns a Run instance.

For the legacy createRun() method that returns an object with methods, see the Legacy Workflows section.

Usage example

await workflow.createRunAsync();
Parameters
runId?:
string
Optional custom identifier for the workflow run
Returns
run:
Run
A new workflow run instance that can be used to execute the workflow
Extended usage example

const workflow = mastra.getWorkflow("workflow");
 
const run = await workflow.createRunAsync();
 
const result = await run.start({
  inputData: {
    value: 10,
  },
});