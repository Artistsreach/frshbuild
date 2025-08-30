Create a domain verification request
This creates a Freestyle Domain Verification Request. It returns a `verificationCode` for your domain. You need to place this code in a TXT record at `_freestyle_custom_hostname.thedomain.com`, then call the [verify domain](/#tag/domains/PUT/domains/v1/verifications) endpoint with the domain to verify it.

POST
/domains/v1/verifications
Test
Request Body
application/json
Required
domain
Required
string
The domain to create a verification code for

Response Body
200
Verification code created

id
Required
string
Format: "uuid"
domain
Required
string
accountId
Required
string
Format: "uuid"
verificationCode
Required
string
createdAt
Required
string
Format: "date-time"
400
Failed to create verification code

message
Required
string
cURL
JavaScript
JS SDK

curl -X POST "https://api.freestyle.sh/domains/v1/verifications" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com"
  }'
200
400
Verification code created

Response

{
  "id": "1234-5678-9012-3456",
  "domain": "example.com",
  "accountId": "1234-5678-9012-3456",
  "verificationCode": "freestyle-verification-v1-1234-5678-9012-3456",
  "createdAt": "1234567890"
}
export interface Response {
  id: string;
  domain: string;
  accountId: string;
  verificationCode: string;
  createdAt: string;
}
 Remove Domain Mapping
DELETE
/domains/v1/mappings/{domain}
Test
Path Parameters
domain
Required
string
Response Body
401
You do not have permission to do this

message
Required
string
500
Failed to insert ownership

message
Required
string
502
Failed to check permissions

message
Required
string
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/domains/v1/mappings/<string>"
200
401
500
502
Successfully removed domain mapping to deployment

Delete a domain verification request
This deletes a Freestyle Domain Verification Request. This does not remove the domain from the account if it has already been verified, however the verification code will no longer be valid.

DELETE
/domains/v1/verifications
Test
Request Body
application/json
Required
domain
Required
string
The domain to create a verification code for

verificationCode
Required
string
The verification code

Response Body
200
Verification code created

verificationCode
Required
string
domain
Required
string
400
Failed to create verification code

message
Required
string
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/domains/v1/verifications" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "verificationCode": "string"
  }'
200
400
Verification code created

Response

{
  "verificationCode": "string",
  "domain": "example.com"
}

export interface Response {
  verificationCode: string;
  domain: string;
}
 Insert Domain Mapping
This will unmap any other deployment to this domain

POST
/domains/v1/mappings/{domain}
Test
Request Body
application/json
Required
deploymentId
Required
string
Format: "uuid"
Path Parameters
domain
Required
string
Response Body
200
Successfully mapped domain to deployment

id
Required
string
Format: "uuid"
domain
Required
string
deploymentId
Required
string
Format: "uuid"
ownershipId
Required
string
Format: "uuid"
createdAt
Required
string
Format: "date-time"
401
You do not have permission to do this

message
Required
string
422
Failed to provision certificate

message
Required
string
500
Failed to insert ownership

message
Required
string
502
Failed to check permissions

message
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/domains/v1/mappings/<string>" \
  -H "Content-Type: application/json" \
  -d '{
    "deploymentId": "a73c85a1-d857-491e-a6b2-51dce05de7a2"
  }'
200
401
422
500
502
Successfully mapped domain to deployment

Response

{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "domain": "string",
  "deploymentId": "a73c85a1-d857-491e-a6b2-51dce05de7a2",
  "ownershipId": "489905e0-55cc-4cf9-b77b-c4db4f323c05",
  "createdAt": "2019-08-24T14:15:22Z"
}

export interface Response {
  id: string;
  domain: string;
  deploymentId: string;
  ownershipId: string;
  createdAt: string;
}
 
 List Domain Mappings
List domain mappings for any query based on exact domain or domain ownership (the domain ownership that gave the right to use the domain)

GET
/domains/v1/mappings
Test
Query Parameters
offset
integer | null
Format: "int64"
limit
integer | null
Format: "int64"
domainOwnership
string | null
Format: "uuid"
domain
string | null
Response Body
200
List of domain mappings

response
Required
array<object>
Show Attributes
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/domains/v1/mappings?offset=0&limit=0&domainOwnership=497f6eca-6276-4993-bfeb-53cbbbba6f08&domain=string"
200
401
List of domain mappings

Response

[
  {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "domain": "string",
    "deploymentId": "a73c85a1-d857-491e-a6b2-51dce05de7a2",
    "ownershipId": "489905e0-55cc-4cf9-b77b-c4db4f323c05",
    "createdAt": "2019-08-24T14:15:22Z"
  }
]

export type Response = FreestyleSandboxDomainMapping[];
 
export interface FreestyleSandboxDomainMapping {
  id: string;
  domain: string;
  deploymentId: string;
  ownershipId: string;
  createdAt: string;
}
 List domain verification requests for an account
Lists domain verification requests for the current account.

GET
/domains/v1/verifications
Test
Response Body
200
List of verification codes

response
Required
array<object>
Show Attributes
400
Failed to get verification codes

message
Required
string
cURL
JavaScript
JS SDK

curl -X GET "https://api.freestyle.sh/domains/v1/verifications"
200
400
List of verification codes

Response

[
  {
    "verificationCode": "string",
    "domain": "string",
    "createdAt": "2019-08-24T14:15:22Z"
  }
]

export type Response = {
  verificationCode: string;
  domain: string;
  createdAt: string;
}[];
 List domains for an account
This lists the domains that an account has verified ownership of. This includes the *.style.dev domains the account has claimed.

GET
/domains/v1/domains
Test
Query Parameters
limit
integer | null
Format: "int64"
offset
integer | null
Format: "int64"
implicitlyOwned
boolean | null
Response Body
200
List of domains

response
Required
array<object>
Show Attributes
400
Failed to get domains

message
Required
string
cURL
JavaScript
JS SDK

curl -X GET "https://api.freestyle.sh/domains/v1/domains?limit=0&offset=0&implicitlyOwned=true"
200
400
List of domains

Response

[
  {
    "domain": "string",
    "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
    "createdAt": "2019-08-24T14:15:22Z",
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "verifiedDns": true,
    "implicitlyOwned": true,
    "deployToDomain": true,
    "manageDns": true,
    "deployToSubdomains": true
  }
]

export type Response = {
  domain: string;
  accountId: string;
  createdAt: string;
  id: string;
  verifiedDns: boolean;
  implicitlyOwned: boolean;
  deployToDomain: boolean;
  manageDns: boolean;
  deployToSubdomains: boolean;
}[];
 Verify a domain verification request
This checks a pre-existing verification request for a domain. To create a verification request, call the [create domain verification](/#tag/domains/POST/domains/v1/verifications) endpoint. This endpoint will check if the domain has a TXT record with the verification code. If it does, the domain will be verified.

PUT
/domains/v1/verifications
Test
Request Body
application/json
Required
body
Required
object | object
Verify a domain verification request, can either be done for a domain, or for a specific request

Object 1
Object 2
Response Body
200
Domain verified

domain
Required
string
400
Failed to verify domain

message
Required
string
404
Domain verification request not found

message
Required
string
cURL
JavaScript
JS SDK

curl -X PUT "https://api.freestyle.sh/domains/v1/verifications" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com"
  }'
200
400
404
Domain verified

Response

{
  "domain": "example.com"
}
export interface Response {
  domain: string;
}
 
Provision a wildcard certificate
Provisions a wildcard certificate for a verified domain This speeds up deploys on all subdomains of the domain. In order to use it, you must add the following record to your DNS config: `_acme-challenge.yourdomain.com` NS `dns.freestyle.sh`

POST
/domains/v1/certs/{domain}/wildcard
Test
Path Parameters
domain
Required
string
Response Body
200
Domain verified

domain
Required
string
400
Failed to preverify domain

message
Required
string
cURL
JavaScript
JS SDK

curl -X POST "https://api.freestyle.sh/domains/v1/certs/<string>/wildcard"
200
400
Domain verified

Response

{
  "domain": "example.com"
}


export interface Response {
  domain: string;
}
 