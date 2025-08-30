Execute Code
Send a TypeScript or JavaScript module, get the result

POST
/execute/v1/script
Test
Request Body
application/json
Required
script
Required
string
The JavaScript or TypeScript script to execute

config
object
Show Attributes
envVars
object
The environment variables to set for the script

Default: {}
Show Attributes
[key: string]
string
nodeModules
object
The node modules to install for the script

Default: {}
Show Attributes
[key: string]
string
tags
array<string>
Tags for you to organize your scripts, useful for tracking what you're running

Default: []
timeout
integer | null
The script timeout

Default: null
Minimum: 0
Format: "int32"
peerDependencyResolution
boolean
If false, we'll not resolve peer dependencies for the packages given, this can speed up execute performance, but will break packages with peers unless the peers are manually specified.

Default: true
networkPermissions
array | null
Default: null
customHeaders
object
These headers will be added to every fetch request made through the script

Default: {}
Show Attributes
[key: string]
string
proxy
string | null
Proxy all outgoing requests through this URL

Default: null
Response Body
200
Success

result
Required
unknown
The return value of the default export of the script

logs
Required
array<object>
Show Attributes
message
Required
string
The log message

type
Required
string
The log level

400
Error

error
Required
string
logs
array | null
500
Internal server error

error
Required
string
logs
array | null
cURL
JavaScript
JS SDK
Vercel AI SDK
Mastra AI SDK
LangGraph AI SDK
Python SDK
Gemini Python SDK
OpenAI Python SDK

import { executeTool } from 'freestyle-sandboxes/mastra';
 
const mastra = new Mastra();
 
const modelConfig: ModelConfig = {
  provider: 'OPEN_AI',
  name: 'gpt-4',
};
 
const llm = mastra.LLM(modelConfig);
 
const response = await llm.generate(
  'Calculate the sum of every number between 13 and 19 divided by the sum of every number between 8 and 13',
  {
    tools: {
      executor: executeTool({
        apiKey: process.env.FREESTYLE_API_KEY!,
      }),
    },
  }
);
 
console.log('Response Steps:', response.steps);
console.log('Response:', response.text);
200
400
500
Success

Response

{
  "result": null,
  "logs": [
    {
      "message": "I'm a log!",
      "type": "log"
    }
  ]
}

export interface Response {
  /**
   * The return value of the default export of the script
   */
  result: {
    [k: string]: unknown;
  };
  logs: FreestyleJavaScriptLog[];
}
export interface FreestyleJavaScriptLog {
  /**
   * The log message
   */
  message: string;
  /**
   * The log level
   */
  type: string;
}

Get information on execute run
Get information on execute run

GET
/execute/v1/deployments/{deployment}
Test
Path Parameters
deployment
Required
string
Format: "uuid"
Response Body
200
Success

metadata
Required
object
Show Attributes
deployment
Required
string
Format: "uuid"
accountId
Required
string
Format: "uuid"
provisionedAt
Required
string
Format: "date-time"
startedAt
string | null
Format: "date-time"
duration
string | null
state
Required
string
Value in: "starting" | "running" | "complete"
envVars
Required
object
Show Attributes
[key: string]
string
code
object
Show Attributes
code
Required
string
nodeModules
Required
object
Show Attributes
[key: string]
string
401
Unauthorized access

message
Required
string
404
Not found

message
Required
string
500
Internal server error

message
Required
string
cURL
JavaScript
JS SDK

curl -X GET "https://api.freestyle.sh/execute/v1/deployments/497f6eca-6276-4993-bfeb-53cbbbba6f08"
200
401
404
500
Success

Response

{
  "metadata": {
    "deployment": "4825a274-96eb-4018-afaa-fc6fe70eaeed",
    "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
    "provisionedAt": "2019-08-24T14:15:22Z",
    "startedAt": "2019-08-24T14:15:22Z",
    "duration": "string",
    "state": "starting",
    "envVars": {
      "property1": "string",
      "property2": "string"
    }
  },
  "code": {}
}

export interface Response {
  metadata: ExecuteLogEntry;
  code?: null | ExecuteRunInfo;
}
export interface ExecuteLogEntry {
  deployment: string;
  accountId: string;
  provisionedAt: string;
  startedAt?: string | null;
  duration?: string | null;
  state: "starting" | "running" | "complete";
  envVars: {
    [k: string]: string;
  };
}
export interface ExecuteRunInfo {
  code: string;
  nodeModules: {
    [k: string]: string;
  };
}
 
List execute runs
List execute runs.

GET
/execute/v1/deployments
Test
Query Parameters
limit
integer | null
Minimum: 0
offset
integer | null
Minimum: 0
Response Body
200
entries
Required
array<object>
Show Attributes
total
Required
integer
Minimum: 0
Format: "int64"
offset
Required
integer
Minimum: 0
Format: "int64"
500
message
Required
string
cURL
JavaScript
JS SDK

curl -X GET "https://api.freestyle.sh/execute/v1/deployments?limit=0&offset=0"
200
500
Response

{
  "entries": [
    {
      "deployment": "4825a274-96eb-4018-afaa-fc6fe70eaeed",
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
      "provisionedAt": "2019-08-24T14:15:22Z",
      "startedAt": "2019-08-24T14:15:22Z",
      "duration": "string",
      "state": "starting",
      "envVars": {
        "property1": "string",
        "property2": "string"
      }
    }
  ],
  "total": 0,
  "offset": 0
}
export interface Response {
  entries: ExecuteLogEntry[];
  total: number;
  offset: number;
}
export interface ExecuteLogEntry {
  deployment: string;
  accountId: string;
  provisionedAt: string;
  startedAt?: string | null;
  duration?: string | null;
  state: "starting" | "running" | "complete";
  envVars: {
    [k: string]: string;
  };
}
 