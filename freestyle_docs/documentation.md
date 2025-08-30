TypeError: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resumable$2d$stream$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__.default is not a constructor
    at sendMessageWithStreaming (rsc://React/Server/C:%5CUsers%5Ctest%5Cfresh%5Cfreshchef-main%5C.next%5Cserver%5Cchunks%5Cssr%5C%5Broot-of-the-server%5D__bcd8423d._.js?24:1512:24)
    at createApp (rsc://React/Server/C:%5CUsers%5Ctest%5Cfresh%5Cfreshchef-main%5C.next%5Cserver%5Cchunks%5Cssr%5C%5Broot-of-the-server%5D__bcd8423d._.js?23:1705:199)
    at async NewAppRedirectPage (rsc://React/Server/C:%5CUsers%5Ctest%5Cfresh%5Cfreshchef-main%5C.next%5Cserver%5Cchunks%5Cssr%5C%5Broot-of-the-server%5D__bcd8423d._.js?17:1853:20)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17582:48)
    at getOutlinedModel (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17283:28)
    at parseModelString (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17362:52)
    at Array.<anonymous> (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17839:51)
    at JSON.parse (<anonymous>)
    at resolveConsoleEntry (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17719:32)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17816:17)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17786:9)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17932:102)
    at NewAppRedirectPage (<anonymous>)

TypeError: Cannot read properties of undefined (reading 'state')
    at AppPage (rsc://React/Server/C:%5CUsers%5Ctest%5Cfresh%5Cfreshchef-main%5C.next%5Cserver%5Cchunks%5Cssr%5C%5Broot-of-the-server%5D__db82f987._.js?42:1948:189)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17582:48)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17798:23)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17786:9)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:17932:102)
    at InnerLayoutRouter (http://localhost:3000/_next/static/chunks/node_modules_next_dist_97d1fcc1._.js:2103:55)
    at OuterLayoutRouter (http://localhost:3000/_next/static/chunks/node_modules_next_dist_97d1fcc1._.js:2251:73)

see freestyle.sh documentation. also read @README.md although this project shoul duse firebase auth instead of stack.

Overview
Freestyle Git Service is a hosted Git platform designed specifically for multi-tenant applications, enabling seamless management of repositories across numerous users and organizations without the burden of maintaining your own Git infrastructure. It provides an API for programmatically creating and managing repositories, controlling access through identity-based permissions tailored for diverse roles like CI/CD pipelines or team members, and setting up event-driven automation triggers. The service further enhances workflows with features for CI/CD integration, direct application deployments from repositories, Git objects access for inspection, bidirectional synchronization with GitHub repositories, and compatibility with the GitHub Files API.

Thinking about Source Control
In multi-tenant applications, where you're managing codebases for numerous users and organizations, maintaining a centralized source of truth for code becomes critical to handle version tracking, collaboration, and secure access. A well-designed system delivers reliable version history, seamless collaboration, and robust security, while avoiding issues like data loss, access breaches, or workflow inefficiencies. Key considerations when choosing a system include:

Multi-tenant support for segregated repositories
Fine-grained permissions and identity management
Data accessibility for efficient retrieval, sharing, and manipulation of code across different users and environments
API integration for programmatic control and CI/CD support for automated workflows
"Time travel" capabilities to navigate backward and forward through code history
Debuggability and observability for troubleshooting and monitoring changes
Support for branching and forking to facilitate parallel development and experimentation
Ease of integration with existing tools and services
To help you choose, here are a range of source control techniques commonly applied, highlighting their benefits and shortcomings.

1. The VM as the Source of Truth
A common naive approach is to use a virtual machine (VM) or container as the source of truth for your code. In this model, your users/AI develop directly on the VM, and it serves as the central repository for your customers' code.

This is a simple and straightforward approach from an implementation perspective, but it has several significant drawbacks:

Lack of Version Control: You lose the ability to track changes, revert to previous versions, and collaborate effectively. If something goes wrong, you have no history to fall back on.
Lack of Automation: Developing directly on a VM often leads to missed opportunities for automation, as you may not integrate with CI/CD pipelines effectively.
Security Risks: Sensitive information may be stored directly on the VM, making it harder to manage access and permissions securely.
Lack of Portability: If you need to move your code to a different environment or share it with others, you have to manually copy files, which is error-prone and cumbersome.
No Backup: If the VM fails or is lost, you risk losing all your code and data without any backup.
Difficulty in Testing: Testing changes becomes more challenging, as you may not have a clear way to isolate and test specific features or bug fixes.
Complex and Expensive APIs: Building APIs becomes inherently complex, slow, brittle, and expensive since the VM must be awakened for every request, requiring custom scripts for basic operations and creating significant latency and resource overhead.
Hard to Debug: Debugging issues becomes difficult, as you may not have a clear view of the code's history or an easy way to access the code outside of the VM.
1b. Git on the VM as the Source of Truth
Using Git on the VM as the source of truth is a step up from the previous approach, as it introduces version control. However, it still suffers from many of the same drawbacks.

While you can track changes and collaborate better, you still face issues with scalability, portability, and backup. The VM must still be accessed for every Git operation, which can lead to performance bottlenecks and increased runtime cost.

2. S3 + Database as the Source of Truth
A more advanced approach is to use a combination of S3 (or similar object storage) and a database as the source of truth. In this model, your customers' code is stored in S3, and you use a database to track metadata, versions, and changes.

When the VM needs to access the code, it retrieves it from S3, and any changes are written back to S3.

This approach has several advantages compared to using the VM state as the source of truth:

Version Control: You can track changes, revert to previous versions, and collaborate more effectively.
Security: Storing your code in S3 and using a database enhances security by managing access and permissions more effectively.
Portability: Moving or sharing your code is simplified as S3 handles file storage independently.
Durability: Utilizing S3 ensures that your code is highly available and can be backed up and restored in case of data loss.
API Simplicity: Building APIs becomes simpler, as you can directly access code files in S3 and metadata from the database without needing to wake up a VM for every request.
However, this approach has drawbacks of its own:

Data Transfer Overhead: Full files/directories need to be regularly read from and written to S3, which can be slow and costly due to data transfer and storage costs.
Complexity: Managing the interaction between S3, the database, and the VM can introduce complexity, especially when handling concurrent updates.
Manual versioning: You need to implement your own versioning system, which can be error-prone and requires additional development effort.
3. Git as the Source of Truth
Using a hosted Git API service (like GitHub or Freestyle Git) as the source of truth is a popular and effective approach. In this model, your customers' code is stored in Git repositories, and you use Git's built-in version control features to manage changes. The VM maintains a local clone of the repository, which it syncs with the remote repository when changes are made.

Git (hosted) as the source of truth has several advantages:

Easy Integration: Manage Git repositories via API and SDKs, without managing the underlying infrastructure. Faster development cycles and easier integration with existing tools.
Optimized Data Transfer: Git uses efficient data transfer mechanisms, such as delta encoding and compression, to minimize the amount of data transferred during operations.
Stateless Operations: Git operations are stateless, meaning you can perform actions like cloning, pushing, and pulling without needing to maintain a persistent connection to a VM.
3a. GitHub
GitHub is a popular choice for hosting Git repositories, but it has some limitations for AI app builders:

Lack of Ownership: You do not own the infrastructure or the data, which can lead to vendor lock-in and potential data loss if GitHub changes its policies or services.
Cost/Licensing: You are dependent on GitHub's infrastructure and policies, which may not align with your needs.
Complex API: GitHub Apps require managing multi-step authentication flows, handling token expiration, and coordinating installations across different organizations, adding significant complexity for programmatic repository management.
Limited Customization: You may have restricted control over the repository setup and features.
3b. Freestyle Git
Freestyle provides a comprehensive Git API that enables you to manage Git repositories, control access permissions, and set up automation triggers.

Freestyle's Git API offers unique advantages tailored for AI app builders. Key features include:

Natively Multi-Tenant: Freestyle's Git API is designed for multi-tenant applications, allowing you to manage repositories for multiple users and organizations seamlessly.
Robust Identity Management: Freestyle provides built-in identity management, allowing you to create and manage identities for different purposes (e.g., CI/CD, team members) with fine-grained access control.
Seamless Integration: Freestyle's triggers system facilitates easy collaboration with CI/CD systems and external services.
GitHub Sync: Built-in synchronization with GitHub, including app/auth management, allowing you to maintain synchronized code across both platforms while leveraging Freestyle's infrastructure.

Git with Freestyle
Freestyle provides a comprehensive Git API that enables you to manage Git repositories, control access permissions, and set up automation triggers. This document covers everything you need to know about using Git with Freestyle.

Overview
Freestyle's Git support allows you to:

Create and manage Git repositories
Control repository access with identity-based permissions
Set up automation triggers for repository events
Integrate with CI/CD workflows
Deploy applications directly from Git
Git Repositories
Creating a Repository
To create a new Git repository:


import { FreestyleSandboxes } from "freestyle-sandboxes";
const sandboxes = new FreestyleSandboxes({
  apiKey: "your-api-key",
});
// Create a basic repository
sandboxes
  .createGitRepository({
    name: "example-repo",
  })
  .then((res) => {
    console.log(res.repoId);
  });
Note that the name of the repository is optional and is for display purposes only. The actual repository ID is generated by Freestyle.

Create a public repository:


sandboxes
  .createGitRepository({
    name: "public-example",
    public: true,
  })
  .then((res) => {
    console.log(res.repoId);
  });
Create a repository from an existing Git repository


sandboxes.createGitRepository({
  name: 'cloned-example',
  source: {
    type: 'git',
    url: 'https://github.com/freestyle-sh/cloudstate',
    branch: 'main' // Optional: specify branch to checkout
    depth: 0, // Optional: shallow clone
  }
}).then(res => {
  console.log(res.repoId);
});
Note that there is currently no support for private repositories from outside of Freestyle.

After creating a repository, you can push code to it using the standard Git CLI:


# Add the repository as a remote
git remote add freestyle https://git.freestyle.sh/your-repo-id
# Push your code
git push freestyle main
Listing Repositories
You can list all repositories associated with your account:


sandboxes.listGitRepositories().then((repos) => {
  console.log(repos);
});
Deleting Repositories
When you no longer need a repository, you can delete it:


sandboxes
  .deleteGitRepository({
    repoId: "repo-id",
  })
  .then(() => {
    console.log("Repository deleted");
  });
Identity and Access Management
Freestyle uses identity-based access control for Git repositories. This allows you to create separate identities for different purposes (e.g., CI/CD, team members) and grant them specific permissions.

Creating an Identity

sandboxes.createGitIdentity().then((identity) => {
  console.log(identity.id);
});
Managing Access Tokens
Each identity can have one or more access tokens used for authentication:


// Create a token for an identity
sandboxes
  .createGitToken({
    identityId: "identity-id",
  })
  .then((token) => {
    console.log(token.value); // Store this securely
  });
// List tokens for an identity
sandboxes
  .listGitTokens({
    identityId: "identity-id",
  })
  .then((tokens) => {
    console.log(tokens);
  });
// Revoke a token
sandboxes
  .revokeGitToken({
    identityId: "identity-id",
    tokenId: "token-id",
  })
  .then(() => {
    console.log("Token revoked");
  });
Managing Permissions
You can grant identities different levels of access to your repositories:


// Grant read-only access
sandboxes
  .grantPermission({
    identityId: "identity-id",
    repoId: "repo-id",
    permission: "read",
  })
  .then(() => {
    console.log("Read access granted");
  });
// Grant read-write access
sandboxes
  .grantPermission({
    identityId: "identity-id",
    repoId: "repo-id",
    permission: "write",
  })
  .then(() => {
    console.log("Write access granted");
  });
// List permissions for an identity
sandboxes
  .listPermissions({
    identityId: "identity-id",
  })
  .then((permissions) => {
    console.log(permissions);
  });
// Revoke access
sandboxes
  .revokePermission({
    identityId: "identity-id",
    repoId: "repo-id",
  })
  .then(() => {
    console.log("Access revoked");
  });
Git Triggers
Git triggers allow you to automate actions when certain events occur in your repositories, such as a push to a specific branch.

Creating a Trigger

// Create a webhook trigger for all pushes to the main branch
sandboxes
  .createGitTrigger({
    repoId: "repo-id",
    trigger: {
      event: "push",
      branch: ["main"], // Optional: filter by branch
      fileGlob: ["*.js"], // Optional: filter by file patterns
    },
    action: {
      type: "webhook",
      url: "https://your-webhook-url.com",
    },
  })
  .then((result) => {
    console.log(`Trigger created: ${result.triggerId}`);
  });
The action currently only supports webhooks.

The webhook payload includes the following fields:


interface GitTriggerPayload {
  repoId: string;
  // The name of the branch that was updated
  branch: string;
  // The SHA of the commit that triggered the webhook
  commit: string;
}
Local Development
For local development, you can use a tool like tailscale to create a secure tunnel to your localhost, allowing your webhook to receive events from Freestyle.

You can setup Tailscale by following the quickstart guide here.

To set up a tunnel once you have tailscale installed, you can use the following command (Replace 3000 with the port your server is listening on):


tailscale funnel 3000
This exposes your server to the public internet on a url given to you by Tailscale.

The output should look like this:


Available on the internet:
https://<device name>.<tailnet id/name>.ts.net/
|-- proxy http://127.0.0.1:3000
Press Ctrl+C to exit.
Use the provided url as the webhook URL in your trigger configuration.

Listing Triggers

sandboxes
  .listGitTriggers({
    repoId: "repo-id",
  })
  .then((triggers) => {
    console.log(triggers);
  });
Deleting Triggers

sandboxes
  .deleteGitTrigger({
    repoId: "repo-id",
    triggerId: "trigger-id",
  })
  .then(() => {
    console.log("Trigger deleted");
  });
Authentication for Git Operations
To authenticate Git CLI operations with Freestyle, you'll need to configure Git to use your access token:


# Set up credential helper for freestyle domains
git config --global credential.helper store
echo "https://x-access-token:your-token@git.freestyle.sh" >> ~/.git-credentials
For non-standard Git clients that only provide an access token field, just use the token.

The username is your identity ID, and the password is your access token. The access token ID is only used for revoking the token and isn't needed here.

Don't do this on a shared machine, as it will set your git credentials globally. To do this locally, you can use the --local flag with git config.

Continuous Integration Example
Here's an example of how to set up a CI workflow with Freestyle Git:

Create a dedicated Git identity for CI:

const ciIdentity = await sandboxes.createGitIdentity();
const token = await sandboxes.createGitToken({
  identityId: ciIdentity.id,
});
console.log(`CI token: ${token.value}`);
Grant the identity write access to your repository:

await sandboxes.grantPermission({
  identityId: ciIdentity.id,
  repoId: "repo-id",
  permission: "write",
});
Set up a webhook trigger to notify your CI system:

await sandboxes.createGitTrigger({
  repoId: "repo-id",
  trigger: {
    event: "push",
    branch: ["main"],
  },
  action: {
    type: "webhook",
    url: "https://your-ci-system.com/webhook",
  },
});
Configure your CI system to clone the repository, run tests, and deploy if successful.
Deployment with Git
Freestyle makes it easy to deploy applications directly from Git repositories:


// TODO: This is not yet implemented
// Deploy a web application from a Git repository
const yourRepoId = "your-repo-id";
sandboxes
  .deployWeb({
    source: {
      type: "git",
      url: `https://git.freestyle.sh/${yourRepoId}`,
      branch: "main", // Optional: defaults to main
    },
    {
      entrypoint: "index.js", // Optional: defaults to index.js
      domains: ["example.style.dev"], // Optional: specify domains
      build: true // automatically detect your framework and build for you
    }
  })
  .then((deployment) => {
    console.log(`Deployed to: ${deployment.url}`);
  });
Git Objects API
Freestyle provides a Git Objects API that allows you to access and explore Git objects directly from your repositories. This API is useful for building tools that need to understand Git repository structure, inspect files, visualize commit history, and more.

For a detailed guide on working with Git objects, check out our Git Objects API Guide.

GitHub Synchronization
Freestyle provides seamless bidirectional synchronization between your Freestyle repositories and GitHub repositories. This integration allows you to maintain synchronized code across both platforms while leveraging Freestyle's infrastructure.

For complete setup instructions and usage details, see our GitHub Sync Guide.

GitHub Synchronization
Freestyle provides seamless bidirectional synchronization between your Freestyle repositories and GitHub repositories. This integration allows you to maintain synchronized code across both platforms while leveraging Freestyle's infrastructure capabilities alongside GitHub's collaboration features.

Overview
The GitHub sync feature enables you to:

Automatically sync changes between Freestyle and GitHub repositories
Leverage GitHub workflows on the Github side while using Freestyle's infrastructure
Collaborate on GitHub your users' teams can continue to use Github without interruption while you utilize Freestyle's infrastructure
Avoid conflicts with intelligent conflict detection
How It Works
Freestyle's GitHub integration uses GitHub Apps to provide secure, repository-specific access. When you push code to either platform, changes are automatically synchronized to the other, ensuring both repositories stay in sync.

Architecture
GitHub App: You own the custom Github app with repository permissions for secure access to the repositories on Github
Webhook Processing: You get real-time notifications when code changes occur on Github or on Freestyle
Bidirectional Sync: When a change is made on the Github repository, its proactively synced to the Freestyle repository, and vice versa
Conflict Detection: We prevents data loss by detecting diverged branches before applying changes
Setup Process
Step 1: Create a GitHub App
Coming Soon: Bring-your-own GitHub App support will be available soon, allowing you to use your existing GitHub Apps with Freestyle's sync system.

Navigate to the Git > Sync section in your Freestyle Admin Dashboard
Click "Create GitHub App"
Choose a custom name for your GitHub App (this will be visible to users when they install it)
Click "Create App" - you'll be redirected to GitHub to confirm app creation
After confirming on GitHub, you'll be redirected back to Freestyle where your app credentials are automatically encrypted and stored
Step 2: Configure App Settings (Optional)
You can customize your GitHub App settings if needed:

From the sync page, click "Configure on GitHub" or navigate directly to your app on GitHub
Update App Name, Homepage URL, or Description as desired
Important: Do not change the webhook URL or remove any permissions, as this will break synchronization functionality.

Step 3: Install the App
To sync repositories, the GitHub App must be installed on the repositories you want to sync:

For App Builders: You'll need to have your users install your GitHub App on their repositories. Each user must install the app to enable sync with their own repos.

Installation Process:

From the sync page, click "Install on GitHub" or go to your GitHub App's page
Click "Install" (or "Configure", if already installed)
Choose which repositories or organizations to grant access to:
All repositories: Grants access to all current and future repos
Selected repositories: Choose specific repositories to sync
Sharing with Users: You can share your GitHub App's installation page with users by providing them with the app URL from your GitHub App settings.

Repository Configuration
Once your GitHub App is installed on the target repositories, you can configure repository synchronization:

Linking Repositories
Via Admin Dashboard
In your Freestyle admin dashboard, navigate to Git > Repositories
Select the Freestyle repository you want to sync
Click "Configure GitHub Sync"
Choose the corresponding GitHub repository from the repositories where your app is installed
Save the configuration
Via API
To configure sync programmatically, you can use the GitHub sync endpoint or our SDK.

JavaScript
Python

const freestyle = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!,
});
// Configure GitHub sync for a Freestyle repository
// The GitHub repository must have your GitHub App installed
await freestyle.configureGitRepoGitHubSync({
  repoId: "your-freestyle-repo-id", // The ID of the Freestyle repository to sync
  githubRepoName: "user/repo-name", // The full name of the GitHub repository (e.g., "user/repo")
});
For complete API documentation on configuring GitHub sync, see the GitHub Sync Configuration API Reference.

For App Builders: You can only link repositories where your users have installed your GitHub App. Make sure your users have completed the app installation process first.

Sync Behavior
When repositories are linked, synchronization happens automatically:

Automatic Sync Triggers
GitHub → Freestyle: Triggered when you push to GitHub
Freestyle → GitHub: Triggered when you push to your Freestyle repository
Branch Operations: New branches, branch deletions, and updates
What Gets Synced
All branches: Including main, feature branches, and release branches
Commit history: Complete Git history is preserved
Tags: Git tags are synchronized between repositories
Branch deletions: Removing branches on one side removes them on the other
Sync Process Details
Bidirectional Synchronization
Freestyle's sync engine performs intelligent bidirectional synchronization:

Fetch Updates: Retrieves all changes from both repositories
Analyze Branches: Checks each branch for conflicts or divergence
Fast-Forward Merges: Applies updates where branches haven't diverged
Conflict Detection: Identifies branches that have conflicting changes
Safe Updates: Only applies changes that won't cause data loss
Conflict Handling
When conflicts are detected, Freestyle prioritizes data safety:

No Automatic Merges: Conflicting branches are not automatically merged
Conflict Detection: Conflicts can be viewed in the admin dashboard
Manual Resolution: You can resolve conflicts manually in either repository
Resume Sync: Once conflicts are resolved, sync resumes automatically

Git Objects API
The Git Objects API allows you to access and explore Git objects directly from your repositories. This API is useful for building tools that need to understand Git repository structure, inspect files, visualize commit history, and more.

Overview
Git stores all data as objects of four fundamental types:

Blobs - Raw file content
Trees - Directory listings mapping names to blobs or other trees
Commits - Snapshots of the repository at a specific point in time
Tags - References to specific commits with additional metadata
The Git Objects API in Freestyle provides access to all these object types through a consistent REST API.

Usage
Blobs
Blobs represent the content of files in Git. When you retrieve a blob, you get the raw file content (always base64 encoded for binary safety).

Get a Blob

// Using fetch directly with the API
fetch(`https://api.freestyle.sh/git/v1/repo/${repoId}/git/blobs/${blobHash}`, {
  headers: {
    "Authorization": "Bearer your-api-key"
  }
})
.then(response => response.json())
.then(blob => {
  // blob.content is base64 encoded
  const decodedContent = atob(blob.content);
  console.log(decodedContent);
});
Response structure:


interface BlobObject {
  // The blob content (base64 encoded)
  content: string;
  // Always "base64"
  encoding: "base64";
  // The blob's hash
  sha: string;
}
Commits
Commits represent snapshots of your repository at specific points in time.

Get a Commit

fetch(`https://api.freestyle.sh/git/v1/repo/${repoId}/git/commits/${commitHash}`, {
  headers: {
    "Authorization": "Bearer your-api-key"
  }
})
.then(response => response.json())
.then(commit => {
  console.log(commit.message);
  console.log(commit.author);
  console.log(commit.tree.sha);
});
Response structure:


interface CommitObject {
  // The commit author
  author: {
    date: string;
    name: string;
    email: string;
  };
  // The committer (may be different from author)
  committer: {
    date: string;
    name: string;
    email: string;
  };
  // The commit message
  message: string;
  // The tree this commit points to
  tree: {
    sha: string;
  };
  // Parent commits (usually one, multiple for merge commits)
  parents: Array<{
    sha: string;
  }>;
  // The commit's hash
  sha: string;
}
Trees
Trees represent directories in Git. A tree object contains a list of entries, each with a name, type (blob or tree), and hash.

Get a Tree

fetch(`https://api.freestyle.sh/git/v1/repo/${repoId}/git/trees/${treeHash}`, {
  headers: {
    "Authorization": "Bearer your-api-key"
  }
})
.then(response => response.json())
.then(tree => {
  // Inspect files and subdirectories
  tree.tree.forEach(entry => {
    if (entry.type === "blob") {
      console.log(`File: ${entry.path}`);
    } else if (entry.type === "tree") {
      console.log(`Directory: ${entry.path}`);
    }
  });
});
Response structure:


interface TreeObject {
  // The tree's entries (files and subdirectories)
  tree: Array<{
    // The entry's type: "blob" (file) or "tree" (directory)
    type: "blob" | "tree";
    // The entry's path (filename or directory name)
    path: string;
    // The entry's hash
    sha: string;
  }>;
  // The tree's hash
  sha: string;
}
Tags
Tags are references to specific objects (usually commits) with additional metadata like tagger information and a message.

Get a Tag

fetch(`https://api.freestyle.sh/git/v1/repo/${repoId}/git/tags/${tagHash}`, {
  headers: {
    "Authorization": "Bearer your-api-key"
  }
})
.then(response => response.json())
.then(tag => {
  console.log(tag.name);
  console.log(tag.message);
  console.log(tag.target.sha);
});
Response structure:


interface TagObject {
  // The tag name
  name: string;
  // The tagger (may be null for lightweight tags)
  tagger?: {
    date: string;
    name: string;
    email: string;
  };
  // The tag message (may be null for lightweight tags)
  message?: string;
  // The object this tag points to (usually a commit)
  target: {
    sha: string;
  };
  // The tag's hash
  sha: string;
}
Common Use Cases
Processing Files from a Git Trigger
When a Git trigger is invoked by a push to your repository, Freestyle sends a payload containing information about the event, including the commit hash. You can use this to inspect files that were changed in the commit:


// This function would be called by your webhook handler
async function processGitTriggerWebhook(webhookPayload, apiKey) {
  const repoId = webhookPayload.repoId;
  const commitHash = webhookPayload.commit;
  const headers = {
    "Authorization": `Bearer ${apiKey}`
  };
  // Get the commit to find what was changed
  const commitResponse = await fetch(
    `https://api.freestyle.sh/git/v1/repo/${repoId}/git/commits/${commitHash}`,
    { headers }
  );
  const commit = await commitResponse.json();
  console.log(`Processing commit: ${commit.message}`);
  console.log(`Author: ${commit.author.name} <${commit.author.email}>`);
  // Get the tree pointed to by the commit
  const treeResponse = await fetch(
    `https://api.freestyle.sh/git/v1/repo/${repoId}/git/trees/${commit.tree.sha}`,
    { headers }
  );
  const rootTree = await treeResponse.json();
  // Example: Find package.json in the repository
  const packageJsonEntry = treeEntries.find(entry => entry.type === "blob" && entry.path === "package.json")
  if (packageJsonEntry) {
    // Get the content of package.json
    const blobResponse = await fetch(
      `https://api.freestyle.sh/git/v1/repo/${repoId}/git/blobs/${packageJsonEntry.sha}`,
      { headers }
    );
    const blob = await blobResponse.json();
    // Parse the package.json content
    const packageJson = JSON.parse(atob(blob.content));
    console.log(`Project name: ${packageJson.name}`);
    console.log(`Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  }
}
Building a File Browser
You can build a recursive file browser:


async function exploreDirectory(repoId, treeSha, apiKey, currentPath = "") {
  const headers = {
    "Authorization": `Bearer ${apiKey}`
  };
  const treeResponse = await fetch(
    `https://api.freestyle.sh/git/v1/repo/${repoId}/git/trees/${treeSha}`,
    { headers }
  );
  const tree = await treeResponse.json();
  for (const entry of tree.tree) {
    const entryPath = currentPath ? `${currentPath}/${entry.path}` : entry.path;
    if (entry.type === "tree") {
      // Recursively explore subdirectories
      await exploreDirectory(repoId, entry.sha, apiKey, entryPath);
    } else if (entry.type === "blob") {
      // Process files
      console.log(`File: ${entryPath}`);
      // You could fetch the blob content here if needed
    }
  }
}
Viewing File Contents from a Specific Commit

async function viewFileAtCommit(repoId, commitHash, filePath, apiKey) {
  const headers = {
    "Authorization": `Bearer ${apiKey}`
  };
  // Get the commit
  const commitResponse = await fetch(
    `https://api.freestyle.sh/git/v1/repo/${repoId}/git/commits/${commitHash}`,
    { headers }
  );
  const commit = await commitResponse.json();
  // Get the root tree
  let treeResponse = await fetch(
    `https://api.freestyle.sh/git/v1/repo/${repoId}/git/trees/${commit.tree.sha}`,
    { headers }
  );
  let currentTree = await treeResponse.json();
  // Navigate the directory structure
  const pathParts = filePath.split('/');
  const fileName = pathParts.pop();
  for (const directory of pathParts) {
    const dirEntry = currentTree.tree.find(
      entry => entry.type === "tree" && entry.path === directory
    );
    if (!dirEntry) {
      throw new Error(`Directory not found: ${directory}`);
    }

Freestyle VMs are hyper-fast isolated sandboxes, designed as tiny workbenches for AI models or deployments. They provide clean ephemeral environments or can act as lightweight caches that are easily deleted and recreated. Every VM runs in secure isolation, with comprehensive logging and auditing built in for transparency. Sessions are persistent when needed, supporting pause/resume workflows, while cost optimization tools ensure efficiency. Purpose-built for modern AI workflows, Freestyle VMs combine speed, security, and flexibility to fit diverse usage patterns.

We have a system to fork running VMs in <50ms — getting a full copy with the exact same memory and state. We also provide optional configuration to treat VMs as ephemeral, or as caches that can be deleted and recreated frequently; this has huge implications for cost savings and speed.

Unique Functionality
Freestyle VMs are designed for unique usage patterns that set them apart from more traditional virtual machine providers.

Super-fast forking: Create a full copy of a running VM in less than 50ms, preserving memory and state.
Ephemeral or cache modes: Configure VMs to be short-lived or act as lightweight caches. By semantically noting VMs are ephemeral or cache, we can make their startup times faster by running them on specific hardware.
Persistent sessions: Support pause/resume workflows with session persistence.
Auto waking on request: When a request comes in to a stopped VM, it will automatically be started instantly and handle the request.
Web Previews on Multiple Ports: We currently support not just the 443 HTTPS preview that is standard in the industry, but also 8081 on HTTP (this makes us the ideal choice for Mobile App Builders).
Cost optimization: Built-in tools to minimize expenses based on usage patterns.
AI-focused: Tailored for modern AI workloads requiring speed and flexibility.
When to Use Freestyle VMs
Freestyle VMs are best suited for scenarios when you need computers for your AI workloads. They come with a whole filesystem and a full OS, so they are great for:

Workbenches for AI App Builders to run dev servers and iterate on apps
Running Coding AI models like Claude Code, Open Code or Gemini CLI in secure isolated environments
Hosting web apps, APIs and databases with fast startup needs.
Running browser agents that want to fork a browser inside
Running ephemeral jobs with an external source of truth (like Git)
When Not to Use Freestyle VMs
Freestyle has four offerings with some overlap with VMs.

VMs are a best in class VM offering, but Freestyle offers specialized tools for a series of usecases that handle them even better.

Dev Servers are pre-configured development environments that can be started in seconds. They take advantage of cache VMs to create instant, cheap, self healing environments for AI development environments.
Web Deploy is a serverless deployment platform for deploying JavaScript and TypeScript apps. If you can compile your app to just TypeScript or JavaScript, and don't need to iterate on it, this is the API for you. It is incredibly cheap, incredibly fast, and comes with a whole series of advanced featuress that make it the best choice for deploying web apps.
Execute is a serverless code execution platform for running short lived functions. If you can run your code in a few seconds, don't need a full OS and don't need to run binaries, this is the API for you. It is incredibly cheap, incredibly fast, and comes with a whole series of advanced featuress that make it the best choice for running serverless code.
Git is a git hosting platform. If you need to store code, version it and need high reliability high speed storage — this is it. Git is often used for source control alongside our VMs.

Forking a Freestyle VM is not just a filesystem copy. It is a full copy of the entire VM. That means if you have a running process, it will keep going!

We use this capability in our dev server offering to get instant previews by forking already running dev servers rather than starting new ones from scratch.

How it Works
When you fork a VM, we are using a Copy on Write system to make it happen almost instantly. This means the original and the forked VM share the same memory pages until one of them modifies a page, at which point a copy is made. This allows us to create a full copy of the VM, including its memory and state, so fast.

Why this is Cool
Making VM forking so fast and efficient means that your AI can try all of its ideas easily, and iterate on them in multiple directions without having to recreate the state of the base VMs from scratch — which might not be possible.

Here's a few use cases this opens up:

Top K Sampling: From the current state, if your Agent has 3 (or 300) directions it could go in, you can fork the VM for each direction and explore them in parallel.
Multiple Browser Paths: If you want to examine multiple parts of a website but know each action you take has side effects, you can fork the VM at different points to isolate and analyze each path independently.
A/B Testing: Instantly create multiple versions of your application to test different features or configurations without any downtime.
Rapid Prototyping: Quickly spin up new instances of your environment to test changes or new ideas without affecting the original.
If you're interested in where we see this going, we designed this functionality when thinking about The Future of AI Coding Agents.

Freestyle lets you decide how persistent your VMs should be. We currently offer three tiers of persistence:

Ephemeral: Ephemeral VMs exist for the duration you are using them. Once you shut them down, all data is deleted. This means you never pay for keeping the VMs stored.

Cache: Cache VMs are unique to Freestyle. You can define the priority of VMs to keep around, and they will be stored for a period of time after. We will always prioritize deleting at lower priority, before then deleting higher priority VMs with the oldest last access time. We do not guarantee that cache VMs will be stored indefinitely, they may be deleted at any time.

Persistent: Persistent VMs are stored indefinitely until you delete them. This is useful for long-running applications or those that require state to be maintained across restarts.

Why this matters?
Different VMs have different purposes.

While sometimes you just need a workbench, sometimes you want a job to stop and start, while maintaining its past history. It's an easy misconception to think ephemeral VMs can't run long running tasks, however that is not the case. There are lots of long running tasks that don't need to be stored after the fact, and there are uses for persistent VMs that start and stop a ton for lots of quick small tasks.

Cache VMs are ideal when you would prefer to have an existing VM that is pre-setup for fast startup times, but where the VM is not the source of truth. If you're building an AI SWE of any kind, these are likely ideal, as the code source of truth likely lives somewhere else. The VM serves as a workbench/devbox, and while it would be ideal for performance reasons not to have to rebuild the environment, it also doesn't need to be stored reliably forever.

Persistent VMs are for when the VM itself is the source of truth. This is useful for applications that need to maintain state across restarts, or for long-running tasks that need to be resumed. Persistent VMs are stored indefinitely until you delete them.

Dev Servers are instant development and preview environments for your Git Repositories.

They come with everything you need to show a live preview to your users, while giving your agents the ability to work with the code.

Dev Servers on Freestyle Dev Servers:

Automatically keep npm run dev alive — if it crashes we detect that and restart it.
An MCP server that makes connecting your agents to the dev server easy.
A managed Git Identity for your dev server, so it can push/pull code from the repo.
Special Features:

VSCode Web Interface accessible for human collaboration on dev servers.
Chromium + Playwright setup for testing
Coming Soon:

VSCode Server Interface to open Dev Servers in VSCode and Chromium
VSCode Language Server Interface to run LSP commands (which the MCP will have access to)
Creating a Dev Server
In order to create a dev server, you'll need a Git Repository to base it on.

create-repo.ts
create-repo.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const freestyle = new FreestyleSandboxes();
const { repoId } = await freestyle.createGitRepository({
  name: "Test Repository",
  // This will make it easy for us to clone the repo during testing.
  // The repo won't be listed on any public registry, but anybody
  // with the uuid can clone it. You should disable this in production.
  public: true,
  source: {
    url: "https://github.com/freestyle-sh/freestyle-next",
    type: "git",
  },
});
console.log(`Created repo with ID: ${repoId}`);
Then, you can request a dev server for the repo you just created.

request-dev-server.ts
request-dev-server.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const freestyle = new FreestyleSandboxes();
const devServer = await freestyle.requestDevServer({ repoId });
console.log(`Dev Server URL: ${devServer.ephemeralUrl}`);
This will give you a dev server that is automatically running npm run dev. If you don't keep it alive, it will shut itself down.

Working with Dev Servers
When you run a dev server, you get access to the following utilities:

dev-server.ts
dev-server.py

const {
  ephemeralUrl, // URL to the dev server, shows whatever server the dev server is running
  mcpEphemeralUrl, // URL to the MCP server, which lets your AI Agents interact with the dev server
  codeServerUrl, // URL to the VSCode Web Interface
  commitAndPush, // Function to commit and push whatever is on the dev server now to the repo
  fs, // File system interface to the dev server
  process, // Process interface to the dev server to run commands
  isNew, // Boolean indicating if the dev server was just created
  shutdown, // Shutdown handle to stop the dev server
} = await freestyle.requestDevServer({
repoId: repoId,
});
The URLs
Dev Servers provide a series of URLs that you can use to get different interfaces from the dev server. All these URLs are ephemeral, we do not guarantee that they will be available, or the same at any future point. In order to work with them, we recommend re-requesting the dev server every time you want to use them.

URL	Description
ephemeralUrl	This url displays whatever is on port 3000 of the dev server, or a loading indicator until that shows up
mcpEphemeralUrl	This url is an MCP that lets your AI work with the dev server
codeServerUrl	This url opens a VSCode window in the browser that is inside the dev server, useful for letting you/your users collaborate with the AI.
The File System Interface
The dev server provides a file system interface that lets you read and write files in the dev server.

Writing files
You can write files using the fs. The default encoding is utf-8, but you can specify another one (like base64) if you want to upload something like an image.

write-file.ts
write-file.py

await fs.writeFile("src/index.tsx", `console.log("Hello World!");`);
Reading files
You can read files using the fs. The default encoding is utf-8, but you can specify another one (like base64) if you want to download something like an image.

read-file.ts
read-file.py

const content = await fs.readFile("src/index.tsx");
console.log(content);
Listing files
You can list files in a directory using the fs. This is not a recursive listing, it only lists files in the specified directory. If you want to list files recursively, you'll want to use the process interface to run a command like ls -R or find ..

list-files.ts
list-files.py

const files = await fs.ls("src");
console.log(files);
Executing Commands
You can execute any command on the dev server using the process interface.

run-command.ts
run-command.py

const { stdout, stderr } = await process.exec("npm run dev");
console.log(stdout);
console.error(stderr);
Running background tasks
You can run background tasks using the process.exec, by passing a second argument true to the exec function. This will run the task in the background.

run-background-command.ts
run-background-command.py

await process.exec("npm run dev", true);
// This will run in the background so you can continue doing other things
Committing and Pushing Changes
You can commit and push changes to the repo using the commitAndPush function. This will commit all changes in the dev server and push them to the repo. The commit will go to the branch that the dev server is currently on, which is usually main.

commit-and-push.ts
commit-and-push.py

await commitAndPush("Updated index.tsx");
Using in NextJS
When building a web interface for your dev server, we provide a FreestyleDevServer component for NextJS. The component automatically keeps the dev server alive.

To use it, you'll first need to create a server action to handle the request. This action will create a dev server for the repo if one isn't already running or return the status if one is already running.

preview-actions.ts

"use server";
import { freestyle } from "@/lib/freestyle";
export async function requestDevServer({ repoId }: { repoId: string }) {
  const { ephemeralUrl, devCommandRunning, installCommandRunning } =
    await freestyle.requestDevServer({ repoId });
  return { ephemeralUrl, devCommandRunning, installCommandRunning };
}
Then, you can use the FreestyleDevServer component in your NextJS app with the requestDevServer action you just created.


import { FreestyleDevServer } from "freestyle-sandboxes/react/dev-server";
import { requestDevServer } from "./preview-actions";
export function Preview({ repoId }: { repoId: string }) {
  <FreestyleDevServer actions={{ requestDevServer }} repoId={repoId} />;
}
Working in Parallel
You can clone the repo locally and try pushing to it. You should see the dev server update in realtime. Note this will only work if you made the repo public, otherwise, you'll need to create git credentials to access the repo. See the Git Documentation for more information.


git clone https://git.freestyle.sh/<repoId>
For production use in App Builders, we suggest using isomorphic-git to manage git from serverless JavaScript environments.


import git from "isomorphic-git";
import fs from "fs";
import http from "isomorphic-git/http/node";
git.clone({
  fs,
  url: "https://git.freestyle.sh/<repoId>",
  singleBranch: true,
  depth: 1,
  http,
});
Model Context Protocol (MCP)
MCP is a protocol for allowing AI agents to discover and use tools. Dev servers automatically expose a set of tools for interacting with the file system and other core operations such as installing npm modules, running commands, and testing code. You can get the url for this server in the dev server response.

We provide the following tools by default:

readFile: Read a file from the dev server
writeFile: Write a file to the dev server
editFile: Search and replace based file editing
ls: List files in a directory
exec: Execute a command on the dev server
commitAndPush: Commit and push changes to the repo
npmInstall: Install an npm module on the dev server
npmLint: Lint the code on the dev server
Together, these tools make it easy to get your agents started on development. They do not handle everything, but we recommend the MCP as a good starting point for building your own tools.

On Current Limitations
Dev Servers are primarily made to run JavaScript/TypeScript Dev Servers. When we start a dev server, we run npm run dev and expect it to start a server on port 3000. If you want to add more on startup, you can change the script in npm run dev to run whatever you want. We automatically keep track of the process and restart it if it crashes.

This approach makes it theoretically work with other languages, but in practice not well. We are actively working on improving this. For the best experience today, a good rule of thumb is, "Would this be a part of my npm run dev workflow locally?" If the answer is yes, then it will work well on a dev server. If not, let us know, we'd like to make it work better.

Freestyle has full support for other languages in the lower level VM API. This API is language agnostic, and supports running any language or runtime.

Overview
Serverless code execution runs on a simple system — you send your TypeScript code and you get the output back. If the code has a syntax error, you get a nice trace of what that error was back. It is made for you to run code you only want to run once — or very few times.

Why Use it?
It is noticeably faster and cheaper than any VM based systems on the market because it doesn't run on VMs. Instead, it uses Freestyle's Serverless Code Execution Engine. The same technology that Google Chrome uses to isolate code between tabs is what we use to isolate code between users. This means that while other companies start whole VMs to run your code, for us running your code is like opening a tab — except we also always keep lots of tabs pre-opened to make it even faster. The fastest cold start time of any competitors we've seen is 90ms, our average full execution time is <150ms total

It also lets you use arbitrary npm packages without performance impact. You can list the packages you want in the nodeModules field of the configuration of the API call, and we'll cache them for all future uses. This means that sometimes you'll run code with new modules for the first time and it will take >10 seconds, but for all future runs that code would be instant.

When Not to Use it?
For code you want to be called repeatedly, you should deploy it to a Web Deployment.

Serverless code execution is great for code that doesn't need a code, but you cannot run binaries in it. You also cannot run code with persistent state in it, once a script finishes running it's state is lost. For code that needs to run a long time, run binaries, have persistent state, or generally needs a proper VM, you should use a Dev Server.

While we store the execution code for some amount of time after it has been run, it can be deleted at any time. If you want to store the code for a long time, you should do it on your side, or use a Git Repository.

How to Use it?
You can check out the Run Code page for a full example of how to use the API
We also provide a series of integrations with common AI Agent Frameworks to make it easy to run with your AI, including the Vercel AI SDK, Mastra, LangGraphJS, LanggraphPy, the OpenAI Python SDK, and the Gemini Python SDK.

Simple Code Execution
Install the required dependencies
npm
pnpm
bun
yarn
pip

npm i freestyle-sandboxes
Create a Freestyle Client
run.ts
run.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const api = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!, // make sure to set this
});
Run the code
run.ts
run.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const api = new FreestyleSandboxes({
apiKey: process.env.FREESTYLE_API_KEY!, // make sure to set this
});
const code = `export default () => {
// calculate the factorial of 543
return Array.from({ length: 543 }, (_, i) => i + 1).reduce((acc, cur) => acc * cur, 1);
}`;
api.executeScript(code).then((result) => {
console.log("Result: ", result);
});
Advanced Code Execution
Custom Node Modules
run.js
run.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const api = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!, // make sure to set this
});
api
  .executeScript(
    `import axios from 'axios';
    export default async () => {
      // Fetch data from an external API
      const res = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      return res.data;
    }`,
    {
      nodeModules: {
        axios: "0.21.1", // specify the version of the module you want to use
      },
    }
  )
  .then((result) => {
    console.log("Result: ", result);
  });
This pattern can be used for any node modules, and can be used to connect to any API or service.

Custom Environment Variables
run.js
run.py

import { FreestyleSandboxes } from "freestyle-sandboxes";
const api = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!, // make sure to set this
});
api
  .executeScript(`return process.env.SOME_ENV_VAR;`, {
    envVars: {
      SOME_ENV_VAR: "Hello, World!",
    },
  })
  .then((result) => {
    console.log("Result: ", result);
  });
Environment variables are accessible via the process.env object in the code execution environment.

Running Code with AI
Check out our integrations — we have support for all major AI Agent frameworks. AI models today have gotten incredibly good at writing code, when you give your Agents the ability to run code the scope of problems they can solve. Specifically it makes, data integration and analytical questions. When connecting to an external tool you can build 20 different tools, or you can give your AI the docs and let it figure out how to connect — the ladder is much more adaptable.

Most people who use us start with the prebuilt AI integrations liners, but then move towards a more fine grained approach executing the code themselves with custom d
Install the required dependencies

npm install @mastra/core freestyle-sandboxes
Get your Freestyle API Key from the Freestyle Dashboard

Set up the Code Executor
The simplest code executor looks like this:


import { executeTool } from 'freestyle-sandboxes/mastra';
const codeExecutor = executeTool({
  apiKey: process.env.FREESTYLE_API_KEY!,
});
You can also pass in any nodeModules, environment variables, timeout, or network restrictions you need.

Here's an example with access to the resend and octokit node modules, and environment variables for RESEND_API_KEY and GITHUB_PERSONAL_ACCESS_TOKEN


import { executeTool } from "freestyle-sandboxes/mastra";
const codeExecutor = executeTool({
  apiKey: process.env.FREESTYLE_API_KEY!,
  nodeModules: {
    resend: "4.0.1",
    octokit: "4.1.0",
  },
  envVars: {
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
  },
});
Set up the Mastra AI SDK Agent

import { createMastra } from "@mastra/core";
const mastra = new Mastra();
const modelConfig: ModelConfig = {
  provider: "OPEN_AI",
  name: "gpt-4",
};
const llm = mastra.LLM(modelConfig);
const response = await llm.generate(
  "Calculate the sum of every number between 13 and 19 divided by the sum of every number between 8 and 13",
  {
    tools: {
      codeExecutor,
    },
  }
);

Freestyle is the platform for building AI Mobile App Builders. There are many AI Mobile App Builder companies already on the platform, and we have specialized utilities to help you.

Pre-requisites
This guide is a follow up to the generic AI App Builder guide. Everything about managing code, dev servers and deployments for web servers applies for mobile app builders too.

Intro
This guide goes over the utilities we have for AI Mobile App Builders and best practices we've seen for building them.

We recommend using Expo as the base for your mobile app. Expo is a framework and platform for universal React applications. It works well for AI App Builders because:

Expo is a React based framework, AI is great at React.
Expo has hot reload, which makes iteration fast.
Expo has web support for both previews and production, this makes previewing and debugging the easy, it also makes sharing the app with your users easy.
Freestyle has thousands of Expo Apps running on it, so we know how to make it work well.
Dev Servers
When using Dev Servers, your users can view the web preview through the FreestyleDevServer.

For viewing on mobile devices, you can use the ephemeralUrl in Expo Go Via a QR Code, or via any Expo Developer Build Client. However, these URL's are ephemeral, so we recommend proxying them through another router server that you can control, to define a permanent URL for the Expo Client to pull from.

Deploy
Freestyle offers an Expo bundling system that makes our builds compatible with the Expo Updates standard, and visible on a website. When enabled, if you deploy to someapp.style.dev (or any domain), your users will be able to view the website at that domain, and if an Expo Client is pointed at that domain it will use it as the bundle source.

To enable this, you should build your app on us with Freestyle Auto Building. You can enable this by adding build: true to your deployment configurations.

Notes
Freestyle Expo Auto Building currently does not support Android or code signing, we're working on it.
Freestyle Expo Auto Builds currently support static or single web apps, we're working on supporting server mode.
We recommend using Expo + Hono/some external server rather than Expo + Expo API Routes — Expo API Routes seem to have shockingly bad performance and not work with hot reloading. This can be deployed separately from the app and used by it.
