Deployment Logs
Get the logs for a deployment

GET
/observability/v1/logs
Test
Query Parameters
deploymentId
string | null
domain
string | null
Response Body
200
logs
Required
array<object>
Show Attributes
cURL
JavaScript
JS SDK

curl -X GET "https://api.freestyle.sh/observability/v1/logs?deploymentId=string&domain=string"
200
Response

{
  "logs": [
    {
      "message": "string",
      "timestamp": "string"
    }
  ]
}

export interface Response {
  logs: FreestyleLogResponseObject[];
}
export interface FreestyleLogResponseObject {
  message: string;
  timestamp: string;
}
 