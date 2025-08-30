Get logs from the dev server (journalctl -u freestyle-run-dev)
GET
/ephemeral/v1/dev-servers/logs
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
count
integer | null
Number of log lines to return per page (default 200)

Minimum: 0
page
integer | null
1-based page index. page=1 returns the most recent lines (default 1)

Minimum: 0
Response Body
200
Successful

logs
Required
array<string>
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/ephemeral/v1/dev-servers/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    },
    "count": 0,
    "page": 0
  }'
200
500
Successful

Response

{
  "logs": [
    "string"
  ]
}
export interface Response {
  logs: string[];
}
 

 Restart the dev server (systemctl restart freestyle-run-dev)
POST
/ephemeral/v1/dev-servers/restart
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
Response Body
200
Successful

restarted
Required
boolean
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/restart" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    }
  }'
200
500
Successful

Response

{
  "restarted": true
}

export interface Response {
  restarted: boolean;
}
 Get the status of a Dev Server
GET
/ephemeral/v1/dev-servers/status
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
Response Body
200
Successful

installing
Required
boolean
devRunning
Required
boolean
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/ephemeral/v1/dev-servers/status" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    }
  }'
200
500
Successful

Response

{
  "installing": true,
  "devRunning": true
}

export interface Response {
  installing: boolean;
  devRunning: boolean;
}
 

 Request a Dev Server
POST
/ephemeral/v1/dev-servers
Test
Request Body
application/json
Required
devCommand
string | null
installCommand
string | null
preDevCommandOnce
string | null
baseId
Deprecated
string | null
envVars
object | null
Show Attributes
repoId
string | null
computeClass
string | null
Default: "high"
timeout
integer | null
Timeout in seconds

Minimum: 0
Format: "int64"
domain
Deprecated
string | null
repo
Deprecated
string | null
gitRef
string | null
ports
array | null
Optional list of ports to expose externally. If not provided, port 3000 will be exposed on port 443 by default. Pass an empty array to disable external ports. Only ports 8081 and 443 can be configured externally for now. Any target port is allowed.

Response Body
200
Successful

url
Required
Deprecated
string
isNew
Required
boolean
devCommandRunning
Required
boolean
installCommandRunning
Required
boolean
mcpEphemeralUrl
string | null
ephemeralUrl
string | null
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers" \
  -H "Content-Type: application/json" \
  -d '{
    "devCommand": "string",
    "installCommand": "string",
    "preDevCommandOnce": "string",
    "baseId": "string",
    "envVars": {
      "RESEND_API_KEY": "re_123456789"
    },
    "repoId": "string",
    "computeClass": "low",
    "timeout": "30",
    "domain": "string",
    "repo": "string",
    "gitRef": "string",
    "ports": [
      {
        "port": 0,
        "targetPort": 0
      }
    ]
  }'
200
500
Successful

Response

{
  "url": "string",
  "isNew": true,
  "devCommandRunning": true,
  "installCommandRunning": true,
  "mcpEphemeralUrl": "string",
  "ephemeralUrl": "string"
}

export interface Response {
  /**
   * @deprecated
   */
  url: string;
  isNew: boolean;
  devCommandRunning: boolean;
  installCommandRunning: boolean;
  mcpEphemeralUrl?: string | null;
  ephemeralUrl?: string | null;
}
 

 Execute a command on a Dev Server
POST
/ephemeral/v1/dev-servers/exec
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
command
Required
string
background
Required
boolean
Spawn this command as a background process and return immediately

Response Body
200
Successful

id
Required
string
isNew
Required
boolean
stdout
array | null
stderr
array | null
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    },
    "command": "string",
    "background": true
  }'
200
500
Successful

Response

{
  "id": "string",
  "isNew": true,
  "stdout": [
    "string"
  ],
  "stderr": [
    "string"
  ]
}


export interface Response {
  id: string;
  isNew: boolean;
  stdout?: string[] | null;
  stderr?: string[] | null;
}
 

 Commit and push changes to a Dev Server repository
POST
/ephemeral/v1/dev-servers/git/commit-push
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
repoId
Required
string
Format: "uuid"
gitRef
string | null
kind
Required
string
Value in: "repo"
message
Required
string
Response Body
200
Successful

id
Required
string
isNew
Required
boolean
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/git/commit-push" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    },
    "message": "string"
  }'
200
500
Successful

Response

{
  "id": "string",
  "isNew": true
}

export interface Response {
  id: string;
  isNew: boolean;
}
 

 Read a file from a Dev Server
POST
/ephemeral/v1/dev-servers/files/{filepath}
Test
Path Parameters
filepath
Required
string
The path to the file to read from the dev server

Response Body
200
Successful

id
Required
string
isNew
Required
boolean
content
Required
object | object
Object 1
Object 2
404
Not found

id
Required
string
isNew
Required
boolean
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/files/<string>"
200
404
500
Successful

Response

{
  "id": "string",
  "isNew": true,
  "content": {
    "content": "string",
    "encoding": "string",
    "kind": "file"
  }
}

export interface Response {
  id: string;
  isNew: boolean;
  content:
    | {
        content: string;
        encoding: string;
        kind: "file";
      }
    | {
        files: string[];
        kind: "directory";
      };
}
 

 Shut down a dev server
POST
/ephemeral/v1/dev-servers/shutdown
Test
Request Body
application/json
Required
devServer
Required
object
The dev server to shutdown

Show Attributes
Response Body
200
Success

success
Required
boolean
message
Required
string
400
Bad Request

message
Required
string
403
Forbidden

message
Required
string
404
Not Found

message
Required
string
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/shutdown" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    }
  }'
200
400
403
404
500
Success

Response

{
  "success": true,
  "message": "string"
}

export interface Response {
  success: boolean;
  message: string;
}
 Handle_watch_dev_server_files
POST
/ephemeral/v1/dev-servers/watch-files
Test
Request Body
application/json
Required
devServer
Required
object
Show Attributes
repoId
Required
string
Format: "uuid"
gitRef
string | null
kind
Required
string
Value in: "repo"
Response Body
200
Stream of file events

response
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/ephemeral/v1/dev-servers/watch-files" \
  -H "Content-Type: application/json" \
  -d '{
    "devServer": {
      "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7",
      "gitRef": "string",
      "kind": "repo"
    }
  }'
200
Stream of file events

Response

"string"

export type Response = string;
 

 Write a file to a Dev Server
PUT
/ephemeral/v1/dev-servers/files/{filepath}
Test
Path Parameters
filepath
Required
string
The path to the file to read from the dev server

Response Body
200
Successful

id
Required
string
isNew
Required
boolean
500
Internal Server Error

response
Required
string
cURL
JavaScript

curl -X PUT "https://api.freestyle.sh/ephemeral/v1/dev-servers/files/<string>"
200
500
Successful

Response

{
  "id": "string",
  "isNew": true
}

export interface Response {
  id: string;
  isNew: boolean;
}
 