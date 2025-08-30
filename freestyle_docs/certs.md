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
TypeScript

export interface Response {
  domain: string;
}
 