Create_vm
Create VM

POST
/v1/vms
Test
Request Body
application/json
Required
idleTimeoutSeconds
integer | null
Format: "int64"
ports
array | null
Optional list of ports to expose externally. If not provided, port 3000 will be exposed on port 443 by default. Pass an empty array to disable external ports. Only ports 8081 and 443 can be configured externally for now. Any target port is allowed.

waitForReadySignal
boolean | null
Whether the api request should wait for the VM to be ready before returning. By default, the VM is considered ready when the serial console is ready for login.

Default: true
readySignalTimeoutSeconds
integer | null
How long to wait for the ready signal before timing out. Defaults to 120 seconds if not provided.

Format: "int64"
workdir
string | null
Optional working directory for the VM. File system and shell commands will be executed in this directory.

persistence
object | object | object
Show Attributes
Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms" \
  -H "Content-Type: application/json" \
  -d '{
    "idleTimeoutSeconds": 0,
    "ports": [
      {
        "port": 443,
        "targetPort": 3000
      }
    ],
    "waitForReadySignal": true,
    "readySignalTimeoutSeconds": 0,
    "workdir": "string",
    "persistence": {}
  }'

  Delete_vm
Delete VM

DELETE
/v1/vms/{vm_id}
Test
Path Parameters
vm_id
Required
string
The ID of the VM to delete

Response Body
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/v1/vms/<string>"

Exec_await
Execute command in VM and await result

POST
/v1/vms/{vm_id}/exec-await
Test
Request Body
application/json
Required
command
Required
string
terminal
string | null
Path Parameters
vm_id
Required
string
The ID of the VM to execute the command in

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/exec-await" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "string",
    "terminal": "string"
  }'

Fork_vm
Fork VM

POST
/v1/vms/{vm_id}/fork
Test
Request Body
application/json
Required
idleTimeoutSeconds
integer | null
Format: "int64"
ports
array | null
Optional list of ports to expose externally. If not provided, port 3000 will be exposed on port 443 by default. Pass an empty array to disable external ports. Only ports 8081 and 443 can be configured externally for now. Any target port is allowed.

readySignalTimeoutSeconds
integer | null
Whether the api request should wait for the VM to be ready before returning. By default, the VM is considered ready when the serial console is ready for login.

Default: true
Format: "int64"
waitForReadySignal
boolean | null
How long to wait for the ready signal before timing out. Defaults to 120 seconds if not provided.

workdir
string | null
Optional working directory for the VM. File system and shell commands will be executed in this directory.

persistence
object | object | object
Show Attributes
Path Parameters
vm_id
Required
string
Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/fork" \
  -H "Content-Type: application/json" \
  -d '{
    "idleTimeoutSeconds": 0,
    "ports": [
      {
        "port": 443,
        "targetPort": 3000
      }
    ],
    "readySignalTimeoutSeconds": true,
    "waitForReadySignal": true,
    "workdir": "string",
    "persistence": {}
  }'

  Get_file
Get file from VM

GET
/v1/vms/{vm_id}/files/{filepath}
Test
Path Parameters
vm_id
Required
string
The ID of the VM to get the file from

filepath
Required
string
The path of the file to get

Response Body
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/v1/vms/<string>/files/<string>"

Get_terminal_logs
Get terminal logs as plain text array

GET
/v1/vms/{vm_id}/terminals/{terminal_id}/logs
Test
Path Parameters
vm_id
Required
string
The ID of the VM

terminal_id
Required
string
The ID of the terminal session

Response Body
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/v1/vms/<string>/terminals/<string>/logs"

Get_terminal_xterm
Get terminal output with xterm formatting

GET
/v1/vms/{vm_id}/terminals/{terminal_id}/xterm-256color
Test
Path Parameters
vm_id
Required
string
The ID of the VM

terminal_id
Required
string
The ID of the terminal session

Response Body
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/v1/vms/<string>/terminals/<string>/xterm-256color"


Get_vm
Get VM

GET
/v1/vms/{vm_id}
Test
Path Parameters
vm_id
Required
string
Response Body
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/v1/vms/<string>"


List_vms
List VMs

GET
/v1/vms
Test
Response Body
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/v1/vms"


Optimize_vm
Suspends a VM and reallocates storage for more efficent copy.

POST
/v1/vms/{vm_id}/optimize
Test
Path Parameters
vm_id
Required
string
The ID of the VM to optimize

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/optimize"


Put_file
Put file to VM

PUT
/v1/vms/{vm_id}/files/{filepath}
Test
Request Body
application/json
Required
content
Required
string
Path Parameters
vm_id
Required
string
The ID of the VM to put the file to

filepath
Required
string
The path of the file to put

Response Body
cURL
JavaScript

curl -X PUT "https://api.freestyle.sh/v1/vms/<string>/files/<string>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "string"
  }'

  API Reference
/
V m
Resize_vm
Resize VM

POST
/v1/vms/{id}/resize
Test
Request Body
application/json
Required
sizeMb
Required
integer
Minimum: 0
Format: "int64"
Path Parameters
id
Required
string
Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/resize" \
  -H "Content-Type: application/json" \
  -d '{
    "sizeMb": 0
  }'

  Start_vm
Start VM

POST
/v1/vms/{vm_id}/start
Test
Request Body
application/json
Required
idleTimeoutSeconds
integer | null
Format: "int64"
readySignalTimeoutSeconds
integer | null
Format: "int64"
waitForReadySignal
boolean | null
Path Parameters
vm_id
Required
string
Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/start" \
  -H "Content-Type: application/json" \
  -d '{
    "idleTimeoutSeconds": 0,
    "readySignalTimeoutSeconds": 0,
    "waitForReadySignal": true
  }'

  Stop_vm
Stop VM

POST
/v1/vms/{vm_id}/stop
Test
Path Parameters
vm_id
Required
string
The ID of the VM to stop

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/stop"

Suspend_vm
Suspend VM

POST
/v1/vms/{vm_id}/suspend
Test
Path Parameters
vm_id
Required
string
The ID of the VM to suspend

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/suspend"


Wait_vm
Wait for VM to stop

POST
/v1/vms/{vm_id}/await
Test
Path Parameters
vm_id
Required
string
The ID of the VM to wait for

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/await"


Watch_files
Watch VM Files

POST
/v1/vms/{vm_id}/watch-files
Test
Path Parameters
vm_id
Required
string
The ID of the VM to watch files for

Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/v1/vms/<string>/watch-files"
  