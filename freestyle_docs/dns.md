Create DNS Record
POST
/dns/v1/records
Test
Request Body
application/json
Required
domain
Required
string
record
Required
object
Show Attributes
Response Body
200
record
Required
object
Show Attributes
403
Account does not own the domain

domain
Required
string
account_id
Required
string
500
Error creating DNS record

message
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/dns/v1/records" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "string",
    "record": {
      "kind": "A",
      "name": "string",
      "value": "string",
      "ttl": "string",
      "priority": 0
    }
  }'
200
403
500
Response

{
  "record": {
    "kind": "A",
    "name": "string",
    "value": "string",
    "ttl": "string",
    "priority": 0,
    "managed": true
  }
}

export interface Response {
  record: DnsRecord;
}
export interface DnsRecord {
  kind: "A" | "AAAA" | "CNAME" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: string;
  priority?: number | null;
  managed: boolean;
}
 
Delete DNS Record
DELETE
/dns/v1/records
Test
Query Parameters
domain
Required
string
record
Required
object
Show Attributes
kind
Required
string
Value in: "A" | "AAAA" | "CNAME" | "TXT" | "NS"
name
Required
string
value
Required
string
ttl
Required
string
priority
integer | null
Minimum: 0
Format: "int32"
managed
Required
boolean
Response Body
200
message
Required
string
403
Account does not own the domain

domain
Required
string
account_id
Required
string
500
Error deleting DNS record

domain
Required
string
name
Required
string
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/dns/v1/records?domain=example.com&record=%5Bobject+Object%5D"
200
403
500
Response

{
  "message": "string"
}

export interface Response {
  message: string;
}
 List DNS Records
GET
/dns/v1/records
Test
Query Parameters
domain
Required
string
Response Body
200
records
Required
array<object>
Show Attributes
kind
Required
string
Value in: "A" | "AAAA" | "CNAME" | "TXT" | "NS"
name
Required
string
value
Required
string
ttl
Required
string
priority
integer | null
Minimum: 0
Format: "int32"
managed
Required
boolean
400
message
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/dns/v1/records?domain=example.com"
200
400
Response

{
  "records": [
    {
      "kind": "A",
      "name": "string",
      "value": "string",
      "ttl": "string",
      "priority": 0,
      "managed": true
    }
  ]
}

export interface Response {
  records: DnsRecord[];
}
export interface DnsRecord {
  kind: "A" | "AAAA" | "CNAME" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: string;
  priority?: number | null;
  managed: boolean;
}
 