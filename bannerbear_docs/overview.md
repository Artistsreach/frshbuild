Bannerbear API Reference
Bannerbear is a service that auto generates images and videos.

Your designer designs a template in Bannerbear
We turn it into an API
You use this API to generate Images and Videos
See examples in Image Examples and Video Examples.

Base URL
https://api.bannerbear.com
Client Libraries

Ruby

Node

PHP
$npm install bannerbear

Node
Authentication
Bannerbear uses API keys to allow access to the API. You can get an API key by creating a project in Bannerbear.

Bannerbear expects the API key to be included in all API requests to the server in a header that looks like the following:

Authorization: Bearer API_KEY

All API requests on Bannerbear are scoped to a Project.

Project API Key

This key enables you to interact with a specific project via API.

You can find the Project API Key in your Project → Settings page.

Master API Key

You can optionally create a Master API Key which allows higher level access at the account level.

There are two types of Master API Key:

Limited Access: create and list Projects
Full Access: create and list Projects as well as interact with any Project (e.g. create Images, Videos etc)
When using a Full Access Master API Key to interact with a Project using any of the standard endpoints below, you must add a project_id parameter to your payload.

Endpoint
get	/v2/auth
Sample Response
{
  "message": "Authorized",
  "project": "My Project Name"
}
Account
To check your account status at any time you can use this endpoint. It will respond with your quota levels and current usage levels. Usage resets at the start of every month.

Endpoint
get	/v2/account
Sample Response
{
  "created_at": "2019-10-22T09:49:45.265Z",
  "uid": "jJWBKNELpQPvbX5R93Gk",
  "paid_plan_name": "Bannerbear Automate",
  "api_usage": 391,
  "api_quota": 1000,
  "current_project": {
    "name": "My Project Name",
    "templates": 42,
  }
}
Errors
The Bannerbear API uses the following status / error codes. The Bannerbear API rate limit is 30 requests per 10 seconds.

202	Accepted -- Your request is has been accepted for processing
200	OK
400	Bad Request -- Your request is invalid.
401	Unauthorized -- Your API key is wrong.
402	Payment Required -- Your have run out of image and/or video quota.
404	Not Found -- The specified request could not be found.
429	Too Many Requests -- Slow down!
500	Internal Server Error -- We had a problem with our server. Try again later.
503	Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
Debugging
You can turn on additional debugging in Project Settings > Advanced > Additional Debugging Info.

When enabled, this enhances webhook data with info on whether Bannerbear was able to successfully load external media.

Attempt	The external media is queued for loading
Success	The external media loaded successfully
Slow Image	The external media is loading slowly and will be retried
Fail	The external media failed to load and will be retried
Could Not Load	The external media failed to load after multiple retries
Error	One or more external media failed to load after multiple retries, causing a timeout
Async / Sync
The Bannerbear API is primarily asynchronous. When generating a new image, collection etc you POST a request, the API responds immediately with 202 Accepted and you either receive the generated result via webhook or via polling.

This is the preferred pattern as it keeps the request / response cycle predictable.

However, there is a synchronous option if you would simply like to wait for the response in the initial request.

To make a synchronous request use the synchronous base URL. The API required attributes / parameters function the same as normal. Synchronous requests will wait until the media file has finished generating before responding.

There is a timeout of 10 seconds on synchronous requests. Timeouts respond with a 408 status code.

Another option for synchronous image generation is using the signed URLs feature.

Sync Base URL
https://sync.api.bannerbear.com
Sync Endpoints
POST	/v2/images
POST	/v2/collections
POST	/v2/screenshots