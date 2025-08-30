Get Backup of Cloudstate Project
Get a backup of a cloudstate project

GET
/cloudstate/v1/projects/{id}/backup
Test
Path Parameters
id
Required
string
Response Body
200
successfully backed up

response
Required
array<integer>
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/cloudstate/v1/projects/<string>/backup"
200
500
successfully backed up

Response

[
  0
]

export type Response = number[];
 

 Deploy Cloudstate Project
Deploy a cloudstate project

POST
/cloudstate/v1/deploy
Test
Request Body
application/json
Required
classes
Required
string
config
object
Show Attributes
Response Body
200
successfully deployed

deploymentId
Required
string
Format: "uuid"
cloudstateDatabaseId
Required
string
Format: "uuid"
500
failed to deploy

message
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/cloudstate/v1/deploy" \
  -H "Content-Type: application/json" \
  -d '{
    "classes": "string",
    "config": {
      "domains": null,
      "envVars": {},
      "cloudstateDatabaseId": null
    }
  }'
200
500
successfully deployed

Response

{
  "deploymentId": "a73c85a1-d857-491e-a6b2-51dce05de7a2",
  "cloudstateDatabaseId": "20547d4d-3e6e-448d-8579-800561373fd2"
}

export interface Response {
  deploymentId: string;
  cloudstateDatabaseId: string;
}
 
 Deploy a Website (v1)
Deploy a website. Files is a map of file paths to file contents. Configuration is optional and contains additional information about the deployment.

POST
/web/v1/deploy
Test
Request Body
application/json
Required
files
Required
object
The files to deploy, a map of file paths to file contents, e.g. { "index.js": {"content": "your main", "encoding": "utf-8"}, "file2.js": {"content": "your helper" } }

Do not include node modules in this bundle, they will not work. Instead, includes a package-lock.json, bun.lockb, pnpm-lock.yaml, or yarn.lock, the node modules for the project will be installed from that lock file, or use the node_modules field in the configuration to specify the node modules to install.

Show Attributes
config
object
Show Attributes
Response Body
200
successfully deployed

deploymentId
Required
string
Format: "uuid"
projectId
Required
Deprecated
string
Format: "uuid"
domains
array | null
entrypoint
Required
string
The entrypoint file for the website. If not specified we try to automatically detect it.

400
failed to deploy

message
Required
string
cURL
JavaScript
JS SDK
Vercel AI SDK

curl -X POST "https://api.freestyle.sh/web/v1/deploy" \
  -H "Content-Type: application/json" \
  -d '{
    "files": {
      "index.js": {
        "content": "import http from \'node:http\';\\n// import { resolver } from \'./file2.js\';\\n\\nconsole.log(\'starting server\');\\n\\nconst server = http.createServer(async(req, res) => {\\n  // wait 5 seconds before responding\\n  // await new Promise((resolve) => setTimeout(resolve, 5000));\\n  res.writeHead(200, { \'Content-Type\': \'text/plain\' });\\n  res.end(\'Welcome to New York its been waiting for you\');\\n});\\n\\nserver.listen(3000, () => {\\n  console.log(\'Server is running at http://localhost:3000\');\\n});"
      }
    },
    "config": {
      "entrypoint": "index.js",
      "domains": [
        "subdomain.yourdomain.com"
      ],
      "projectId": null,
      "nodeModules": {
        "resend": "4.0.1"
      },
      "envVars": {
        "RESEND_API_KEY": "re_123456789"
      },
      "serverStartCheck": false,
      "networkPermissions": null,
      "build": null,
      "timeout": "15"
    }
  }'
200
400
successfully deployed

Response

{
  "deploymentId": "a73c85a1-d857-491e-a6b2-51dce05de7a2",
  "projectId": "5a8591dd-4039-49df-9202-96385ba3eff8",
  "domains": [
    "string"
  ],
  "entrypoint": "string"
}

TypeScript

export interface Response {
  deploymentId: string;
  /**
   * @deprecated
   */
  projectId: string;
  domains?: string[] | null;
  /**
   * The entrypoint file for the website. If not specified we try to automatically detect it.
   */
  entrypoint: string;
}
 