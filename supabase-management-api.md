# Supabase Management API

## Authentication

All API requests require an access token to be included in the `Authorization` header: `Authorization Bearer <access_token>`.

There are two ways to generate an access token:

*   **Personal access token (PAT):** PATs are long-lived tokens that you manually generate to access the Management API. They are useful for automating workflows or developing against the Management API. PATs carry the same privileges as your user account, so be sure to keep it secret.
*   **OAuth2:** OAuth2 allows your application to generate tokens on behalf of a Supabase user, providing secure and limited access to their account without requiring their credentials. Use this if you're building a third-party app that needs to create or manage Supabase projects on behalf of your users. Tokens generated via OAuth2 are short-lived and tied to specific scopes to ensure your app can only perform actions that are explicitly approved by the user.

## Rate limits

The rate limit for Management API is 60 requests per one minute per user, and applies cumulatively across all requests made with your personal access tokens.

If you exceed this limit, all Management API calls for the next minute will be blocked, resulting in a HTTP 429 response.

## Endpoints

### Projects

*   `GET /v1/projects/{ref}/advisors/performance`: Gets project performance advisors. (DEPRECATED)
*   `GET /v1/projects/{ref}/advisors/security`: Gets project security advisors. (DEPRECATED)
*   `GET /v1/projects/{ref}/analytics/endpoints/logs.all`: Gets project's logs.
*   `GET /v1/projects/{ref}/analytics/endpoints/usage.api-counts`: Gets project's usage api counts.
*   `GET /v1/projects/{ref}/analytics/endpoints/usage.api-requests-count`: Gets project's usage api requests count.
*   `POST /v1/projects/{ref}/config/auth/sso/providers`: Creates a new SSO provider.
*   `POST /v1/projects/{ref}/config/auth/signing-keys/legacy`: Set up the project's existing JWT secret as an in_use JWT signing key.
*   `POST /v1/projects/{ref}/config/auth/signing-keys`: Create a new signing key for the project in standby status.
*   `POST /v1/projects/{ref}/config/auth/third-party-auth`: Creates a new third-party auth integration.
*   `DELETE /v1/projects/{ref}/config/auth/sso/providers/{provider_id}`: Removes a SSO provider by its UUID.
*   `DELETE /v1/projects/{ref}/config/auth/third-party-auth/{tpa_id}`: Removes a third-party auth integration.
*   `GET /v1/projects/{ref}/config/auth/sso/providers/{provider_id}`: Gets a SSO provider by its UUID.
*   `GET /v1/projects/{ref}/config/auth`: Gets project's auth config.
*   `GET /v1/projects/{ref}/config/auth/signing-keys/legacy`: Get the signing key information for the JWT secret imported as signing key for this project.
*   `GET /v1/projects/{ref}/config/auth/signing-keys/{id}`: Get information about a signing key.
*   `GET /v1/projects/{ref}/config/auth/signing-keys`: List all signing keys for the project.
*   `GET /v1/projects/{ref}/config/auth/third-party-auth/{tpa_id}`: Get a third-party integration.
*   `GET /v1/projects/{ref}/config/auth/sso/providers`: Lists all SSO providers.
*   `GET /v1/projects/{ref}/config/auth/third-party-auth`: Lists all third-party auth integrations.
*   `DELETE /v1/projects/{ref}/config/auth/signing-keys/{id}`: Remove a signing key from a project.
*   `PUT /v1/projects/{ref}/config/auth/sso/providers/{provider_id}`: Updates a SSO provider by its UUID.
*   `PATCH /v1/projects/{ref}/config/auth`: Updates a project's auth config.
*   `PATCH /v1/projects/{ref}/config/auth/signing-keys/{id}`: Update a signing key, mainly its status.
*   `PATCH /v1/projects/{ref}/billing/addons`: Applies project addon.
*   `GET /v1/projects/{ref}/billing/addons`: Lists project addons.
*   `DELETE /v1/projects/{ref}/billing/addons/{addon_variant}`: Removes project addon.
*   `POST /v1/projects/{ref}/database/migrations`: [Beta] Apply a database migration.
*   `POST /v1/projects/{ref}/database/backups/restore-point`: Initiates a creation of a restore point for a database.
*   `POST /v1/projects/{ref}/readonly/temporary-disable`: Disables project's readonly mode for the next 15 minutes.
*   `POST /v1/projects/{ref}/database/webhooks/enable`: [Beta] Enables Database Webhooks on the project.
*   `GET /v1/projects/{ref}/types/typescript`: Generate TypeScript types.
*   `GET /v1/snippets/{id}`: Gets a specific SQL snippet.
*   `GET /v1/projects/{ref}/database/context`: Gets database metadata for the given project. (DEPRECATED)
*   `GET /v1/projects/{ref}/config/database/pooler`: Gets project's supavisor config.
*   `GET /v1/projects/{ref}/config/database/postgres`: Gets project's Postgres config.
*   `GET /v1/projects/{ref}/config/database/pgbouncer`: Get project's pgbouncer config.
*   `GET /v1/projects/{ref}/readonly`: Returns project's readonly mode status.
*   `GET /v1/projects/{ref}/database/backups/restore-point`: Get restore points for project.
*   `GET /v1/projects/{ref}/ssl-enforcement`: [Beta] Get project's SSL enforcement configuration.
*   `GET /v1/projects/{ref}/database/backups`: Lists all backups.
*   `GET /v1/snippets`: Lists SQL snippets for the logged in user.
*   `GET /v1/projects/{ref}/database/migrations`: [Beta] List applied migration versions.
*   `POST /v1/projects/{ref}/read-replicas/remove`: [Beta] Remove a read replica.
*   `POST /v1/projects/{ref}/database/backups/restore-pitr`: Restores a PITR backup for a database.
*   `POST /v1/projects/{ref}/database/query`: [Beta] Run sql query.
*   `POST /v1/projects/{ref}/read-replicas/setup`: [Beta] Set up a read replica.
*   `POST /v1/projects/{ref}/database/backups/undo`: Initiates an undo to a given restore point.
*   `PATCH /v1/projects/{ref}/config/database/pooler`: Updates project's supavisor config.
*   `PUT /v1/projects/{ref}/config/database/postgres`: Updates project's Postgres config.
*   `PUT /v1/projects/{ref}/ssl-enforcement`: [Beta] Update project's SSL enforcement configuration.
*   `PUT /v1/projects/{ref}/database/migrations`: [Beta] Upsert a database migration without applying.
*   `POST /v1/projects/{ref}/custom-hostname/activate`: [Beta] Activates a custom hostname for a project.

### Functions

*   `PUT /v1/projects/{ref}/functions`: Bulk update functions.
*   `POST /v1/projects/{ref}/functions`: Create a function. (DEPRECATED)
*   `DELETE /v1/projects/{ref}/functions/{function_slug}`: Delete a function.
*   `POST /v1/projects/{ref}/functions/deploy`: Deploy a function.
*   `GET /v1/projects/{ref}/functions/{function_slug}`: Retrieve a function.
*   `GET /v1/projects/{ref}/functions/{function_slug}/body`: Retrieve a function body.
*   `GET /v1/projects/{ref}/functions`: List all functions.
*   `PATCH /v1/projects/{ref}/functions/{function_slug}`: Update a function.

### Database Branches

*   `POST /v1/projects/{ref}/branches`: Create a database branch.
*   `DELETE /v1/branches/{branch_id}`: Delete a database branch.
*   `GET /v1/branches/{branch_id}/diff`: [Beta] Diffs a database branch.
*   `DELETE /v1/projects/{ref}/branches`: Disables preview branching.
*   `GET /v1/projects/{ref}/branches/{name}`: Get a database branch.
*   `GET /v1/branches/{branch_id}`: Get database branch config.
*   `GET /v1/projects/{ref}/branches`: List all database branches.
*   `POST /v1/branches/{branch_id}/merge`: Merges a database branch.
*   `POST /v1/branches/{branch_id}/push`: Pushes a database branch.
*   `POST /v1/branches/{branch_id}/reset`: Resets a database branch.
*   `PATCH /v1/branches/{branch_id}`: Update database branch config.

### OAuth

*   `GET /v1/oauth/authorize`: [Beta] Authorize user through oauth.
*   `POST /v1/oauth/token`: [Beta] Exchange auth code for user's access and refresh token.
*   `GET /v1/oauth/authorize/project-claim`: Authorize user through oauth and claim a project.
*   `POST /v1/oauth/revoke`: [Beta] Revoke oauth app authorization and it's corresponding tokens.

### Organizations

*   `POST /v1/organizations/{slug}/project-claim/{token}`: Claims project for the specified organization.
*   `POST /v1/organizations`: Create an organization.
*   `GET /v1/organizations/{slug}`: Gets information about the organization.
*   `GET /v1/organizations/{slug}/project-claim/{token}`: Gets project details for the specified organization and claim token.
*   `GET /v1/organizations`: List all organizations.
*   `GET /v1/organizations/{slug}/members`: List members of an organization.

### Projects (continued)

*   `POST /v1/projects/{ref}/restore/cancel`: Cancels the given project restoration.
*   `POST /v1/projects`: Create a project.
*   `POST /v1/projects/{ref}/claim-token`: Creates project claim token.
*   `DELETE /v1/projects/{ref}`: Deletes the given project.
*   `DELETE /v1/projects/{ref}/network-bans`: [Beta] Remove network bans.
*   `DELETE /v1/projects/{ref}/claim-token`: Revokes project claim token.
*   `GET /v1/projects/{ref}/network-restrictions`: [Beta] Gets project's network restrictions.
*   `GET /v1/projects/{ref}/upgrade/eligibility`: [Beta] Returns the project's eligibility for upgrades.
*   `GET /v1/projects/{ref}/upgrade/status`: [Beta] Gets the latest status of the project's upgrade.
*   `GET /v1/projects/{ref}`: Gets a specific project that belongs to the authenticated user.
*   `GET /v1/projects/{ref}/claim-token`: Gets project claim token.
*   `GET /v1/projects/{ref}/health`: Gets project's service health status.
*   `POST /v1/projects/{ref}/network-bans/retrieve`: [Beta] Gets project's network bans.
*   `POST /v1/projects/{ref}/network-bans/retrieve/enriched`: [Beta] Gets project's network bans with additional information about which databases they affect.
*   `GET /v1/projects`: List all projects.
*   `GET /v1/projects/{ref}/restore`: Lists available restore versions for the given project.
