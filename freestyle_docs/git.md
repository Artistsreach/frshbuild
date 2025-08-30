API Reference
/
Git
Configure GitHub sync for repository
Configure GitHub synchronization for an existing Freestyle repository. This links your Freestyle repository to a GitHub repository for automatic syncing. Requires the GitHub repository name in 'owner/repo' format.

POST
/git/v1/repo/{repo_id}/github-sync
Test
Request Body
application/json
Required
githubRepoName
Required
string
The GitHub repository name in "owner/repo" format

Path Parameters
repo_id
Required
string
Repository ID

Format: "uuid"
Response Body
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/github-sync" \
  -H "Content-Type: application/json" \
  -d '{
    "githubRepoName": "string"
  }'

  Get GitHub sync configuration
Get the GitHub sync configuration for a repository, if configured.

GET
/git/v1/repo/{repo_id}/github-sync
Test
Path Parameters
repo_id
Required
string
Repository ID

Format: "uuid"
Response Body
200
GitHub sync configuration

githubRepoName
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/github-sync"
200
404
500
GitHub sync configuration

Response

{
  "githubRepoName": "string"
}

export interface Response {
  githubRepoName: string;
}
 Create an access token for a Git identity
Create an access token for a Git identity

POST
/git/v1/identity/{identity}/tokens
Test
Path Parameters
identity
Required
string
Format: "uuid"
Response Body
200
Token created successfully

id
Required
string
Format: "uuid"
token
Required
string
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X POST "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/tokens"
200
401
403
404
500
Token created successfully

Response

{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "token": "string"
}

export interface Response {
  id: string;
  token: string;
}
 

Create a git trigger
Create a git trigger for the given repository.

POST
/git/v1/repo/{repo}/trigger
Test
Request Body
application/json
Required
trigger
Required
object
Show Attributes
action
Required
object
Show Attributes
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
Response Body
200
Trigger created successfully

triggerId
Required
string
Format: "uuid"
400
Invalid request

message
Required
string
403
User does not have permission to create a trigger on this repository

message
Required
string
404
Repository does not exist

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

curl -X POST "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": {
      "branches": [
        "string"
      ],
      "globs": [
        "string"
      ],
      "event": "push"
    },
    "action": {
      "endpoint": "string",
      "action": "webhook"
    }
  }'
200
400
403
404
500
Trigger created successfully

Response

{
  "triggerId": "b89c9c0a-30c6-475a-b185-93813e22ffcf"
}

export interface Response {
  triggerId: string;
}
 
Create a Git identity
Create a Git identity. This identity will be used to authenticate with the Git server.

POST
/git/v1/identity
Test
Response Body
200
Identity created successfully

id
Required
string
Format: "uuid"
managed
Required
boolean
500
Internal server error

message
Required
string
cURL
JavaScript

curl -X POST "https://api.freestyle.sh/git/v1/identity"
200
500
Identity created successfully

Response

{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "managed": true
}

export interface Response {
  id: string;
  managed: boolean;
}

Create a repository
Create a repository. Once the repository is created, it will also be created on the Git server. The repository name must be unique within your account. Once created, you can then push your code to this repository. The repo will be available at `git.freestyle.sh/{repo-id}`

POST
/git/v1/repo
Test
Request Body
application/json
Required
name
string | null
This name is not visible to users, and is only accessible to you via API and in the dashboard. Mostly useful for observability.

public
boolean
Default: false
defaultBranch
string | null
The default branch name for the repository. Defaults to "main" if not specified.

source
object
Fork from another Git repository. Cannot be used with import.

Show Attributes
import
Files | Tar | Zip | Git
Import static content with an initial commit. Cannot be used with source.

Files
Tar
Zip
Git
Response Body
200
Repository created successfully

repoId
Required
string
Format: "uuid"
400
Invalid request

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

curl -X POST "https://api.freestyle.sh/git/v1/repo" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "string",
    "public": false,
    "defaultBranch": "string",
    "source": {
      "url": "http://example.com",
      "branch": "string",
      "depth": 0
    },
    "import": {
      "files": {
        "property1": "string",
        "property2": "string"
      },
      "commitMessage": "string",
      "authorName": "string",
      "authorEmail": "string",
      "type": "files"
    }
  }'
200
400
500
Repository created successfully

Response

{
  "repoId": "c7c90052-c566-40b6-94a5-a1e9a44bfdc7"
}

export interface Response {
  repoId: string;
}
 
Delete a git trigger
Delete a git trigger. This is irreversible.

DELETE
/git/v1/repo/{repo}/trigger/{trigger}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
trigger
Required
string
The trigger id

Response Body
200
Trigger deleted successfully

response
Required
object
400
Invalid request

message
Required
string
403
User does not have permission to delete a trigger on this repository

message
Required
string
404
Trigger does not exist

response
Required
object
500
Internal server error

message
Required
string
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/trigger/<string>"
200
400
403
404
500
Trigger deleted successfully

Response

{}

export interface Response {}
Delete a Git identity
Delete a Git identity. This will revoke all permissions granted to this identity.

DELETE
/git/v1/identity/{identity}
Test
Path Parameters
identity
Required
string
Format: "uuid"
Response Body
200
Identity deleted

response
Required
object
400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Identity not found

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

curl -X DELETE "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08"
200
400
403
404
500
Identity deleted

Response

{} 

export interface Response {}
 Delete a repository
Delete a repository. This is irreversible, and will also delete the repository on the Git server.

DELETE
/git/v1/repo/{repo}
Test
Path Parameters
repo
Required
string
The repository id

Response Body
200
Repository deleted successfully

response
Required
object
400
Invalid request

message
Required
string
403
User does not have permission to delete this repository

message
Required
string
404
Repository does not exist

response
Required
object
500
Internal server error

message
Required
string
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/git/v1/repo/<string>"
200
400
403
404
500
Repository deleted successfully

Response

{}
export interface Response {}

Get the permission of an identity on a repository
Get the permission of an identity on a repository. This will return the access level of the identity on the repository.

GET
/git/v1/identity/{identity}/permissions/{repo}
Test
Path Parameters
identity
Required
string
Format: "uuid"
repo
Required
string
Format: "uuid"
Response Body
200
Permission info

identity
Required
string
Format: "uuid"
repo
Required
string
Format: "uuid"
accessLevel
string
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X GET "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/permissions/497f6eca-6276-4993-bfeb-53cbbbba6f08"
200
401
403
404
500
Permission info

Response

{
  "identity": "10a80a7a-1a32-4a74-b592-aa2a4ef691c5",
  "repo": "2a069b2f-9d5f-47ed-b067-aeca843a01ba",
  "accessLevel": {}
}

export interface Response {
  identity: string;
  repo: string;
  accessLevel?: null | ("read" | "write");
}
 
Download a tarball of a repo.
Download the contents of a repo as a tarball.

GET
/git/v1/repo/{repo}/tarball
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
Query Parameters
ref
string
The git reference (branch name, commit SHA, etc.). Defaults to HEAD.

Response Body
400
Bad Request

message
Required
string
401
Unauthorized

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

message
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/tarball?ref=%3Cstring%3E"
200
400
401
403
404
500
Success (byte stream)Download a zip of a repo
Download the contents of a repo as a zip.

GET
/git/v1/repo/{repo}/zip
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
Query Parameters
ref
string
The git reference (branch name, commit SHA, etc.). Defaults to HEAD.

Response Body
400
Bad Request

message
Required
string
401
Unauthorized

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

message
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/zip?ref=%3Cstring%3E"
200
400
401
403
404
500
Success (byte stream)

Get a blob object
Get a blob from the Git database. The contents will always be base64 encoded.

GET
/git/v1/repo/{repo}/git/blobs/{hash}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
hash
Required
string
The object's hash

Response Body
200
Blob retrieved successfully

content
Required
string
The content of the blob, base64 encoded.

encoding
Required
string
The encoding of the blob. Always base64.

Value in: "base64"
sha
Required
string
The object's hash.

400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Blob not found

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/blobs/<string>"
200
400
403
404
500
Blob retrieved successfully

Response

{
  "content": "string",
  "encoding": "base64",
  "sha": "string"
}

/**
 * Blob object
 */
export interface Response {
  /**
   * The content of the blob, base64 encoded.
   */
  content: string;
  /**
   * The encoding of the blob. Always `base64`.
   */
  encoding: "base64";
  /**
   * The object's hash.
   */
  sha: string;
}
 Get a commit object
Get a commit from the Git database with detailed information.

GET
/git/v1/repo/{repo}/git/commits/{hash}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
hash
Required
string
The object's hash

Response Body
200
Commit retrieved successfully

author
Required
object
The author of the commit

Show Attributes
committer
Required
object
The committer

Show Attributes
message
Required
string
The commit message

tree
Required
object
The ID of the tree pointed to by this commit

Show Attributes
parents
Required
array<object>
Parent commit(s) of this commit

Show Attributes
sha
Required
string
The commit's hash ID

400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Commit not found

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/commits/<string>"
200
400
403
404
500
Commit retrieved successfully

Response

{
  "author": {
    "date": "2019-08-24T14:15:22Z",
    "name": "string",
    "email": "string"
  },
  "committer": {
    "date": "2019-08-24T14:15:22Z",
    "name": "string",
    "email": "string"
  },
  "message": "string",
  "tree": {
    "sha": "string"
  },
  "parents": [
    {
      "sha": "string"
    }
  ],
  "sha": "string"
}

/**
 * Commit object
 */
export interface Response {
  author: Signature;
  committer: Signature1;
  /**
   * The commit message
   */
  message: string;
  tree: CommitTree;
  /**
   * Parent commit(s) of this commit
   */
  parents: CommitParent[];
  /**
   * The commit's hash ID
   */
  sha: string;
}
/**
 * The author of the commit
 */
export interface Signature {
  /**
   * The date marker for this signature
   */
  date: string;
  name: string;
  email: string;
}
/**
 * The committer
 */
export interface Signature1 {
  /**
   * The date marker for this signature
   */
  date: string;
  name: string;
  email: string;
}
/**
 * The ID of the tree pointed to by this commit
 */
export interface CommitTree {
  /**
   * The tree's hash ID
   */
  sha: string;
}
export interface CommitParent {
  /**
   * The commit's hash ID
   */
  sha: string;
}
 
Get the contents of a file or directory
Get the contents of a file or directory in a repository

GET
/git/v1/repo/{repo}/contents/{path}
Test
Path Parameters
repo
Required
string
The repository ID.

Format: "uuid"
path
Required
string | null
The path to the file or directory. Empty for root.

Query Parameters
ref
string
The git reference (branch name, commit SHA, etc.). Defaults to HEAD.

Response Body
200
Success

response
Required
File | Directory
File
Directory
400
Bad Request

message
Required
string
401
Unauthorized

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

message
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/contents/string?ref=%3Cstring%3E"
200
400
401
403
404
500
Success

Response

{
  "name": "string",
  "path": "string",
  "sha": "string",
  "size": 0,
  "content": "string",
  "type": "file"
}

Get repository default branch
Get the default branch name for a repository.

GET
/git/v1/repo/{repo_id}/default-branch
Test
Path Parameters
repo_id
Required
string
The repository ID

Format: "uuid"
Response Body
200
Success

defaultBranch
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/default-branch"
200
Success

Response

{
  "defaultBranch": "string"
}

export interface Response {
  defaultBranch: string;
}
 
Get a branch reference
Get a reference to a branch in the Git repository. Returns the ref name and SHA of the branch.

GET
/git/v1/repo/{repo}/git/refs/heads/{branch}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
branch
Required
string
The branch's name

Response Body
200
Branch reference object

name
Required
string
The name of the ref (e.g., "refs/heads/main" or "refs/tags/v1.0.0")

sha
Required
string
The SHA-1 hash of the Git object this reference points to

403
Forbidden

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/refs/heads/<string>"
200
400
401
403
404
500
Branch reference object

Response

{
  "name": "string",
  "sha": "string"
}

/**
 * A reference to a Git object
 */
export interface Response {
  /**
   * The name of the ref (e.g., "refs/heads/main" or "refs/tags/v1.0.0")
   */
  name: string;
  /**
   * The SHA-1 hash of the Git object this reference points to
   */
  sha: string;
}
 
Get a tag reference
Get a reference to a tag in the Git repository. Returns the ref name and SHA of the tag.

GET
/git/v1/repo/{repo}/git/refs/tags/{tag}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
tag
Required
string
The tag's name

Response Body
200
Branch reference object

name
Required
string
The name of the ref (e.g., "refs/heads/main" or "refs/tags/v1.0.0")

sha
Required
string
The SHA-1 hash of the Git object this reference points to

403
Forbidden

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/refs/tags/<string>"
200
400
401
403
404
500
Branch reference object

Response

{
  "name": "string",
  "sha": "string"
}

/**
 * A reference to a Git object
 */
export interface Response {
  /**
   * The name of the ref (e.g., "refs/heads/main" or "refs/tags/v1.0.0")
   */
  name: string;
  /**
   * The SHA-1 hash of the Git object this reference points to
   */
  sha: string;
}
 

Get repository information
Retrieve information about a specific repository, including its ID, name, and default branch.

GET
/git/v1/repo/{repo}
Test
Path Parameters
repo
Required
string
The repository id

Response Body
200
Repository information retrieved successfully

id
Required
string
Format: "uuid"
name
string | null
accountId
Required
string
Format: "uuid"
visibility
Required
string
Value in: "public" | "private"
defaultBranch
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/repo/<string>"
200
400
403
404
500
Repository information retrieved successfully

Response

{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "name": "my-repo",
  "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
  "visibility": "public",
  "defaultBranch": "string"
}
export interface Response {
  id: string;
  name?: string | null;
  accountId: string;
  visibility: "public" | "private";
  defaultBranch: string;
}
 
Get a tag object
Get a tag from the Git database.

GET
/git/v1/repo/{repo}/git/tags/{hash}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
hash
Required
string
The object's hash

Response Body
200
Tag retrieved successfully

name
Required
string
The tag name

tagger
object
Show Attributes
message
string | null
The tag message

target
Required
object
The object this tag points to

Show Attributes
sha
Required
string
The tag's hash ID

400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Tag not found

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/tags/<string>"
200
400
403
404
500
Tag retrieved successfully

Response

{
  "name": "string",
  "tagger": {},
  "message": "string",
  "target": {
    "sha": "string"
  },
  "sha": "string"
}
/**
 * Tag object
 */
export interface Response {
  /**
   * The tag name
   */
  name: string;
  tagger?: null | Signature;
  /**
   * The tag message
   */
  message?: string | null;
  target: TagTarget;
  /**
   * The tag's hash ID
   */
  sha: string;
}
/**
 * The tagger who created the tag
 */
export interface Signature {
  /**
   * The date marker for this signature
   */
  date: string;
  name: string;
  email: string;
}
/**
 * The object this tag points to
 */
export interface TagTarget {
  /**
   * The target object's hash ID
   */
  sha: string;
}
 
Get a tree object
Get a tree from the Git database with its entries.

GET
/git/v1/repo/{repo}/git/trees/{hash}
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
hash
Required
string
The object's hash

Response Body
200
Tree retrieved successfully

tree
Required
array<Blob | Tree>
The tree's entries

Show Attributes
sha
Required
string
The tree's hash ID

400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Tree not found

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/trees/<string>"
200
400
403
404
500
Tree retrieved successfully

Response

{
  "tree": [
    {
      "path": "string",
      "sha": "string",
      "type": "blob"
    }
  ],
  "sha": "string"
}
/**
 * Tree object
 */
export interface Response {
  /**
   * The tree's entries
   */
  tree: (Blob | Tree)[];
  /**
   * The tree's hash ID
   */
  sha: string;
}
export interface Blob {
  path: string;
  sha: string;
  type: "blob";
}
export interface Tree {
  path: string;
  sha: string;
  type: "tree";
}
 
Grant a permission to a Git identity
Grant a permission to a Git identity on a repository

POST
/git/v1/identity/{identity}/permissions/{repo}
Test
Request Body
application/json
Required
permission
Required
string
Value in: "read" | "write"
Path Parameters
identity
Required
string
Format: "uuid"
repo
Required
string
Format: "uuid"
Response Body
200
Permission granted successfully

response
Required
object
401
Unauthorized

message
Required
string
403
Forbidden

message
Required
string
404
Repository not found

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

curl -X POST "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/permissions/497f6eca-6276-4993-bfeb-53cbbbba6f08" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "read"
  }'
200
401
403
404
500
Permission granted successfully

Response

{}

export interface Response {}
 
List commits for a repository
List commits from the Git database for a specific repository and branch.

GET
/git/v1/repo/{repo}/git/commits
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
Query Parameters
branch
string | null
Branch name (defaults to HEAD)

limit
integer | null
Maximum number of commits to return (default: 50, max: 500)

Minimum: 0
offset
integer | null
Number of commits to skip (default: 0)

Minimum: 0
Response Body
200
Commits retrieved successfully

commits
Required
array<object>
List of commits

Show Attributes
count
Required
integer
Number of commits returned in this page

Minimum: 0
offset
Required
integer
Number of commits skipped (offset)

Minimum: 0
limit
Required
integer
Maximum number of commits requested (limit)

Minimum: 0
total
Required
integer
Total number of commits available in the branch

Minimum: 0
400
Invalid request

message
Required
string
403
Forbidden

message
Required
string
404
Repository or branch not found

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/git/commits?branch=main&limit=50&offset=0"
200
400
403
404
500
Commits retrieved successfully

Response

{
  "commits": [
    {
      "author": {
        "date": "2019-08-24T14:15:22Z",
        "name": "string",
        "email": "string"
      },
      "committer": {
        "date": "2019-08-24T14:15:22Z",
        "name": "string",
        "email": "string"
      },
      "message": "string",
      "tree": {
        "sha": "string"
      },
      "parents": [
        {
          "sha": "string"
        }
      ],
      "sha": "string"
    }
  ],
  "count": 0,
  "offset": 0,
  "limit": 0,
  "total": 0
}


export interface Response {
  /**
   * List of commits
   */
  commits: CommitObject[];
  /**
   * Number of commits returned in this page
   */
  count: number;
  /**
   * Number of commits skipped (offset)
   */
  offset: number;
  /**
   * Maximum number of commits requested (limit)
   */
  limit: number;
  /**
   * Total number of commits available in the branch
   */
  total: number;
}
/**
 * Commit object
 */
export interface CommitObject {
  author: Signature;
  committer: Signature1;
  /**
   * The commit message
   */
  message: string;
  tree: CommitTree;
  /**
   * Parent commit(s) of this commit
   *
   * @minItems 0
   */
  parents: CommitParent[];
  /**
   * The commit's hash ID
   */
  sha: string;
}
/**
 * The author of the commit
 */
export interface Signature {
  /**
   * The date marker for this signature
   */
  date: string;
  name: string;
  email: string;
}
/**
 * The committer
 */
export interface Signature1 {
  /**
   * The date marker for this signature
   */
  date: string;
  name: string;
  email: string;
}
/**
 * The ID of the tree pointed to by this commit
 */
export interface CommitTree {
  /**
   * The tree's hash ID
   */
  sha: string;
}
export interface CommitParent {
  /**
   * The commit's hash ID
   */
  sha: string;
}
 
List access tokens for a Git identity
List access tokens for a Git identity

GET
/git/v1/identity/{identity}/tokens
Test
Path Parameters
identity
Required
string
Format: "uuid"
Response Body
200
Token list

tokens
Required
array<object>
Show Attributes
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X GET "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/tokens"
200
401
403
404
500
Token list

Response

{
  "tokens": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08"
    }
  ]
}


export interface Response {
  tokens: AccessTokenInfo[];
}
export interface AccessTokenInfo {
  id: string;
}
 

List git triggers for a repository
List git triggers for the given repository.

GET
/git/v1/repo/{repo}/trigger
Test
Path Parameters
repo
Required
string
The repository id

Format: "uuid"
Response Body
200
Success

triggers
Required
array<object>
Show Attributes
400
Invalid request

message
Required
string
403
User does not have permission to access this repository

message
Required
string
404
Repository does not exist

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

curl -X GET "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/trigger"
200
400
403
404
500
Success

Response

{
  "triggers": [
    {
      "repositoryId": "5aa3e9fa-2d0a-4c21-ad54-43217e2bc9c0",
      "trigger": {
        "branches": [
          "string"
        ],
        "globs": [
          "string"
        ],
        "event": "push"
      },
      "action": {
        "endpoint": "string",
        "action": "webhook"
      },
      "managed": true,
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ]
}

export interface Response {
  triggers: GitRepositoryTrigger[];
}
export interface GitRepositoryTrigger {
  repositoryId: string;
  trigger: {
    branches?: string[] | null;
    globs?: string[] | null;
    event: "push";
  };
  action: {
    endpoint: string;
    action: "webhook";
  };
  managed: boolean;
  id: string;
  createdAt: string;
}
 
List Git identities
List Git identities created by your account.

GET
/git/v1/identity
Test
Query Parameters
limit
integer | null
Minimum: 0
Format: "int64"
offset
integer | null
Minimum: 0
Format: "int64"
includeManaged
boolean | null
Response Body
200
identities
Required
array<object>
Show Attributes
offset
Required
integer
Minimum: 0
Format: "int64"
total
Required
integer
Minimum: 0
Format: "int64"
500
Internal server error

message
Required
string
cURL
JavaScript

curl -X GET "https://api.freestyle.sh/git/v1/identity?limit=0&offset=0&includeManaged=true"
200
500
Response

{
  "identities": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "managed": true
    }
  ],
  "offset": 0,
  "total": 0
}


List repository permissions for an identity
List repository permissions for an identity. This will return a list of repositories that the identity has access to.

GET
/git/v1/identity/{identity}/permissions
Test
Path Parameters
identity
Required
string
Format: "uuid"
Query Parameters
limit
integer
Maximum number of repositories to return

Minimum: 0
Format: "int64"
offset
integer
Offset for the list of repositories

Minimum: 0
Format: "int64"
Response Body
200
Permission list

repositories
Required
array<object>
Show Attributes
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X GET "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/permissions?limit=0&offset=0"
200
401
403
404
500
Permission list

Response

{
  "repositories": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "name": "string",
      "accountId": "3d07c219-0a88-45be-9cfc-91e9d095a1e9",
      "permissions": "read",
      "visibility": "public"
    }
  ]
}

List repositories
List repositories with metadata.

GET
/git/v1/repo
Test
Query Parameters
limit
integer
Maximum number of repositories to return

Minimum: 0
Format: "int64"
offset
integer
Offset for the list of repositories

Minimum: 0
Format: "int64"
Response Body
200
List of repositories

repositories
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
400
Invalid request

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

curl -X GET "https://api.freestyle.sh/git/v1/repo?limit=0&offset=0"
200
400
500
List of repositories

Response

{
  "repositories": [
    {
      "branches": {
        "property1": {
          "default": true,
          "name": "string",
          "target": "string"
        },
        "property2": {
          "default": true,
          "name": "string",
          "target": "string"
        }
      },
      "tags": {
        "property1": {
          "name": "string",
          "target": "string",
          "message": "string"
        },
        "property2": {
          "name": "string",
          "target": "string",
          "message": "string"
        }
      },
      "defaultBranch": "string"
    }
  ],
  "total": 0,
  "offset": 0
}

Revoke an access token for a Git identity
Revoke an access token for a Git identity

DELETE
/git/v1/identity/{identity}/tokens
Test
Request Body
application/json
Required
tokenId
Required
string
Format: "uuid"
Path Parameters
identity
Required
string
Format: "uuid"
Response Body
200
Token revoked

response
Required
object
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X DELETE "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/tokens" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "07dfef4c-e677-4ce6-87a3-cd348338445f"
  }'
200
401
403
404
500
Token revoked

Response

{}

export interface Response {}
 
Revoke permissions from a Git identity
Revoke a permission to a Git identity on a repository

DELETE
/git/v1/identity/{identity}/permissions/{repo}
Test
Path Parameters
identity
Required
string
Format: "uuid"
repo
Required
string
Format: "uuid"
Response Body
200
Permission revoked successfully

response
Required
object
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X DELETE "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/permissions/497f6eca-6276-4993-bfeb-53cbbbba6f08"
200
401
403
404
500
Permission revoked successfully

Response

{}

export interface Response {}
 
 Set repository default branch
Set the default branch name for a repository. This will update the HEAD reference to point to the new default branch.

PUT
/git/v1/repo/{repo_id}/default-branch
Test
Request Body
application/json
Required
defaultBranch
Required
string
Path Parameters
repo_id
Required
string
The repository ID

Format: "uuid"
Response Body
200
Success

response
Required
object
cURL
JavaScript

curl -X PUT "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/default-branch" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultBranch": "string"
  }'
200
Success

Response

{}
export interface Response {}
 
Update a permission for a Git identity
Update a permission for a Git identity on a repository

PATCH
/git/v1/identity/{identity}/permissions/{repo}
Test
Request Body
application/json
Required
permission
Required
string
Value in: "read" | "write"
Path Parameters
identity
Required
string
Format: "uuid"
repo
Required
string
Format: "uuid"
Response Body
200
Permission updated successfully

response
Required
object
401
Unauthorized

message
Required
string
403
Forbidden

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

curl -X PATCH "https://api.freestyle.sh/git/v1/identity/497f6eca-6276-4993-bfeb-53cbbbba6f08/permissions/497f6eca-6276-4993-bfeb-53cbbbba6f08" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "read"
  }'
200
401
403
404
500
Permission updated successfully

Response

{}

export interface Response {}
 
Remove GitHub sync configuration
Remove GitHub sync configuration from a repository. This stops automatic syncing but doesn't affect the repository content.

DELETE
/git/v1/repo/{repo_id}/github-sync
Test
Path Parameters
repo_id
Required
string
Repository ID

Format: "uuid"
Response Body
cURL
JavaScript

curl -X DELETE "https://api.freestyle.sh/git/v1/repo/497f6eca-6276-4993-bfeb-53cbbbba6f08/github-sync"
200
404
500
GitHub sync configuration removed successfully