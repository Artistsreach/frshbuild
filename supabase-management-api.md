Management API
Manage your Supabase organizations and projects programmatically.

Authentication#
All API requests require an access token to be included in the Authorization header: Authorization Bearer <access_token>.

There are two ways to generate an access token:

Personal access token (PAT):
PATs are long-lived tokens that you manually generate to access the Management API. They are useful for automating workflows or developing against the Management API. PATs carry the same privileges as your user account, so be sure to keep it secret.

To generate or manage your personal access tokens, visit your account page.

OAuth2:
OAuth2 allows your application to generate tokens on behalf of a Supabase user, providing secure and limited access to their account without requiring their credentials. Use this if you're building a third-party app that needs to create or manage Supabase projects on behalf of your users. Tokens generated via OAuth2 are short-lived and tied to specific scopes to ensure your app can only perform actions that are explicitly approved by the user.

See Build a Supabase Integration to set up OAuth2 for your application.

curl https://api.supabase.com/v1/projects \
  -H "Authorization: Bearer sbp_bdd0••••••••••••••••••••••••••••••••4f23"
All API requests must be authenticated and made over HTTPS.

Rate limits#
The rate limit for Management API is 60 requests per one minute per user, and applies cumulatively across all requests made with your personal access tokens.

If you exceed this limit, all Management API calls for the next minute will be blocked, resulting in a HTTP 429 response.

The Management API is subject to our fair-use policy.
All resources created via the API are subject to the pricing detailed on our Pricing pages.

Additional links

OpenAPI Docs
OpenAPI Spec
Report bugs and issues
Gets project performance advisors.deprecated
get
/v1/projects/{ref}/advisors/performance
This is an experimental endpoint. It is subject to change or removal in future versions. Use it with caution, as it may not remain supported or stable.

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "lints": [
    {
      "name": "unindexed_foreign_keys",
      "title": "lorem",
      "level": "ERROR",
      "facing": "EXTERNAL",
      "categories": [
        "PERFORMANCE"
      ],
      "description": "lorem",
      "detail": "lorem",
      "remediation": "lorem",
      "metadata": {
        "schema": "lorem",
        "name": "lorem",
        "entity": "lorem",
        "type": "table",
        "fkey_name": "lorem",
        "fkey_columns": [
          42
        ]
      },
      "cache_key": "lorem"
    }
  ]
}
Gets project security advisors.deprecated
get
/v1/projects/{ref}/advisors/security
This is an experimental endpoint. It is subject to change or removal in future versions. Use it with caution, as it may not remain supported or stable.

Path parameters
ref
Required
string
Project ref

Details
Query parameters
lint_type
Optional
enum
Accepted values
Response codes
200
403
Response (200)

example

schema
{
  "lints": [
    {
      "name": "unindexed_foreign_keys",
      "title": "lorem",
      "level": "ERROR",
      "facing": "EXTERNAL",
      "categories": [
        "PERFORMANCE"
      ],
      "description": "lorem",
      "detail": "lorem",
      "remediation": "lorem",
      "metadata": {
        "schema": "lorem",
        "name": "lorem",
        "entity": "lorem",
        "type": "table",
        "fkey_name": "lorem",
        "fkey_columns": [
          42
        ]
      },
      "cache_key": "lorem"
    }
  ]
}
Gets project's logs
get
/v1/projects/{ref}/analytics/endpoints/logs.all
Executes a SQL query on the project's logs.

Either the 'iso_timestamp_start' and 'iso_timestamp_end' parameters must be provided.
If both are not provided, only the last 1 minute of logs will be queried.
The timestamp range must be no more than 24 hours and is rounded to the nearest minute. If the range is more than 24 hours, a validation error will be thrown.

Path parameters
ref
Required
string
Project ref

Details
Query parameters
sql
Optional
string
iso_timestamp_start
Optional
string
iso_timestamp_end
Optional
string
Response codes
200
403
Response (200)

example

schema
{
  "result": [
    null
  ],
  "error": "lorem"
}
Gets project's usage api counts
get
/v1/projects/{ref}/analytics/endpoints/usage.api-counts
Path parameters
ref
Required
string
Project ref

Details
Query parameters
interval
Optional
enum
Accepted values
Response codes
200
403
500
Response (200)

example

schema
{
  "result": [
    null
  ],
  "error": "lorem"
}
Gets project's usage api requests count
get
/v1/projects/{ref}/analytics/endpoints/usage.api-requests-count
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
500
Response (200)

example

schema
{
  "result": [
    null
  ],
  "error": "lorem"
}
Creates a new SSO provider
post
/v1/projects/{ref}/config/auth/sso/providers
Path parameters
ref
Required
string
Project ref

Details
minLength
20
maxLength
20
pattern
^[a-z]+$
Body

application/json
type
Required
enum
Accepted values
saml
metadata_xml
Optional
string
metadata_url
Optional
string
domains
Optional
Array<string>
attribute_mapping
Optional
object
Object schema

example

schema
{
  "keys": {
    "property1": {
      "name": "lorem",
      "names": [
        "lorem"
      ],
      "default": {},
      "array": true
    },
    "property2": {
      "name": "lorem",
      "names": [
        "lorem"
      ],
      "default": {},
      "array": true
    }
  }
}
Response codes
201
403
404
Response (201)

example

schema
{
  "id": "lorem",
  "saml": {
    "id": "lorem",
    "entity_id": "lorem",
    "metadata_url": "lorem",
    "metadata_xml": "lorem",
    "attribute_mapping": {
      "keys": {
        "property1": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        },
        "property2": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        }
      }
    }
  },
  "domains": [
    {
      "id": "lorem",
      "domain": "lorem",
      "created_at": "lorem",
      "updated_at": "lorem"
    }
  ],
  "created_at": "lorem",
  "updated_at": "lorem"
}
Set up the project's existing JWT secret as an in_use JWT signing key. This endpoint will be removed in the future always check for HTTP 404 Not Found.
post
/v1/projects/{ref}/config/auth/signing-keys/legacy
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
Response (201)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Create a new signing key for the project in standby status
post
/v1/projects/{ref}/config/auth/signing-keys
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
algorithm
Required
enum
Accepted values
status
Optional
enum
Accepted values
private_jwk
Optional
one of the following options
Options
Response codes
201
403
Response (201)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Creates a new third-party auth integration
post
/v1/projects/{ref}/config/auth/third-party-auth
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
oidc_issuer_url
Optional
string
jwks_url
Optional
string
custom_jwks
Optional
Details
Response codes
201
403
Response (201)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "type": "lorem",
  "oidc_issuer_url": "lorem",
  "jwks_url": "lorem",
  "custom_jwks": null,
  "resolved_jwks": null,
  "inserted_at": "lorem",
  "updated_at": "lorem",
  "resolved_at": "lorem"
}
Removes a SSO provider by its UUID
delete
/v1/projects/{ref}/config/auth/sso/providers/{provider_id}
Path parameters
ref
Required
string
Project ref

Details
provider_id
Required
string
Response codes
200
403
404
Response (200)

example

schema
{
  "id": "lorem",
  "saml": {
    "id": "lorem",
    "entity_id": "lorem",
    "metadata_url": "lorem",
    "metadata_xml": "lorem",
    "attribute_mapping": {
      "keys": {
        "property1": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        },
        "property2": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        }
      }
    }
  },
  "domains": [
    {
      "id": "lorem",
      "domain": "lorem",
      "created_at": "lorem",
      "updated_at": "lorem"
    }
  ],
  "created_at": "lorem",
  "updated_at": "lorem"
}
Removes a third-party auth integration
delete
/v1/projects/{ref}/config/auth/third-party-auth/{tpa_id}
Path parameters
ref
Required
string
Project ref

Details
tpa_id
Required
string
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "type": "lorem",
  "oidc_issuer_url": "lorem",
  "jwks_url": "lorem",
  "custom_jwks": null,
  "resolved_jwks": null,
  "inserted_at": "lorem",
  "updated_at": "lorem",
  "resolved_at": "lorem"
}
Gets a SSO provider by its UUID
get
/v1/projects/{ref}/config/auth/sso/providers/{provider_id}
Path parameters
ref
Required
string
Project ref

Details
minLength
20
maxLength
20
pattern
^[a-z]+$
provider_id
Required
string
Response codes
200
403
404
Response (200)

example

schema
{
  "id": "lorem",
  "saml": {
    "id": "lorem",
    "entity_id": "lorem",
    "metadata_url": "lorem",
    "metadata_xml": "lorem",
    "attribute_mapping": {
      "keys": {
        "property1": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        },
        "property2": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        }
      }
    }
  },
  "domains": [
    {
      "id": "lorem",
      "domain": "lorem",
      "created_at": "lorem",
      "updated_at": "lorem"
    }
  ],
  "created_at": "lorem",
  "updated_at": "lorem"
}
Gets project's auth config
get
/v1/projects/{ref}/config/auth
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "api_max_request_duration": 42,
  "db_max_pool_size": 42,
  "disable_signup": true,
  "external_anonymous_users_enabled": true,
  "external_apple_additional_client_ids": "lorem",
  "external_apple_client_id": "lorem",
  "external_apple_enabled": true,
  "external_apple_secret": "lorem",
  "external_azure_client_id": "lorem",
  "external_azure_enabled": true,
  "external_azure_secret": "lorem",
  "external_azure_url": "lorem",
  "external_bitbucket_client_id": "lorem",
  "external_bitbucket_enabled": true,
  "external_bitbucket_secret": "lorem",
  "external_discord_client_id": "lorem",
  "external_discord_enabled": true,
  "external_discord_secret": "lorem",
  "external_email_enabled": true,
  "external_facebook_client_id": "lorem",
  "external_facebook_enabled": true,
  "external_facebook_secret": "lorem",
  "external_figma_client_id": "lorem",
  "external_figma_enabled": true,
  "external_figma_secret": "lorem",
  "external_github_client_id": "lorem",
  "external_github_enabled": true,
  "external_github_secret": "lorem",
  "external_gitlab_client_id": "lorem",
  "external_gitlab_enabled": true,
  "external_gitlab_secret": "lorem",
  "external_gitlab_url": "lorem",
  "external_google_additional_client_ids": "lorem",
  "external_google_client_id": "lorem",
  "external_google_enabled": true,
  "external_google_secret": "lorem",
  "external_google_skip_nonce_check": true,
  "external_kakao_client_id": "lorem",
  "external_kakao_enabled": true,
  "external_kakao_secret": "lorem",
  "external_keycloak_client_id": "lorem",
  "external_keycloak_enabled": true,
  "external_keycloak_secret": "lorem",
  "external_keycloak_url": "lorem",
  "external_linkedin_oidc_client_id": "lorem",
  "external_linkedin_oidc_enabled": true,
  "external_linkedin_oidc_secret": "lorem",
  "external_slack_oidc_client_id": "lorem",
  "external_slack_oidc_enabled": true,
  "external_slack_oidc_secret": "lorem",
  "external_notion_client_id": "lorem",
  "external_notion_enabled": true,
  "external_notion_secret": "lorem",
  "external_phone_enabled": true,
  "external_slack_client_id": "lorem",
  "external_slack_enabled": true,
  "external_slack_secret": "lorem",
  "external_spotify_client_id": "lorem",
  "external_spotify_enabled": true,
  "external_spotify_secret": "lorem",
  "external_twitch_client_id": "lorem",
  "external_twitch_enabled": true,
  "external_twitch_secret": "lorem",
  "external_twitter_client_id": "lorem",
  "external_twitter_enabled": true,
  "external_twitter_secret": "lorem",
  "external_workos_client_id": "lorem",
  "external_workos_enabled": true,
  "external_workos_secret": "lorem",
  "external_workos_url": "lorem",
  "external_web3_solana_enabled": true,
  "external_zoom_client_id": "lorem",
  "external_zoom_enabled": true,
  "external_zoom_secret": "lorem",
  "hook_custom_access_token_enabled": true,
  "hook_custom_access_token_uri": "lorem",
  "hook_custom_access_token_secrets": "lorem",
  "hook_mfa_verification_attempt_enabled": true,
  "hook_mfa_verification_attempt_uri": "lorem",
  "hook_mfa_verification_attempt_secrets": "lorem",
  "hook_password_verification_attempt_enabled": true,
  "hook_password_verification_attempt_uri": "lorem",
  "hook_password_verification_attempt_secrets": "lorem",
  "hook_send_sms_enabled": true,
  "hook_send_sms_uri": "lorem",
  "hook_send_sms_secrets": "lorem",
  "hook_send_email_enabled": true,
  "hook_send_email_uri": "lorem",
  "hook_send_email_secrets": "lorem",
  "hook_before_user_created_enabled": true,
  "hook_before_user_created_uri": "lorem",
  "hook_before_user_created_secrets": "lorem",
  "jwt_exp": 42,
  "mailer_allow_unverified_email_sign_ins": true,
  "mailer_autoconfirm": true,
  "mailer_otp_exp": 42,
  "mailer_otp_length": 42,
  "mailer_secure_email_change_enabled": true,
  "mailer_subjects_confirmation": "lorem",
  "mailer_subjects_email_change": "lorem",
  "mailer_subjects_invite": "lorem",
  "mailer_subjects_magic_link": "lorem",
  "mailer_subjects_reauthentication": "lorem",
  "mailer_subjects_recovery": "lorem",
  "mailer_templates_confirmation_content": "lorem",
  "mailer_templates_email_change_content": "lorem",
  "mailer_templates_invite_content": "lorem",
  "mailer_templates_magic_link_content": "lorem",
  "mailer_templates_reauthentication_content": "lorem",
  "mailer_templates_recovery_content": "lorem",
  "mfa_max_enrolled_factors": 42,
  "mfa_totp_enroll_enabled": true,
  "mfa_totp_verify_enabled": true,
  "mfa_phone_enroll_enabled": true,
  "mfa_phone_verify_enabled": true,
  "mfa_web_authn_enroll_enabled": true,
  "mfa_web_authn_verify_enabled": true,
  "mfa_phone_otp_length": 42,
  "mfa_phone_template": "lorem",
  "mfa_phone_max_frequency": 42,
  "password_hibp_enabled": true,
  "password_min_length": 42,
  "password_required_characters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789",
  "rate_limit_anonymous_users": 42,
  "rate_limit_email_sent": 42,
  "rate_limit_sms_sent": 42,
  "rate_limit_token_refresh": 42,
  "rate_limit_verify": 42,
  "rate_limit_otp": 42,
  "rate_limit_web3": 42,
  "refresh_token_rotation_enabled": true,
  "saml_enabled": true,
  "saml_external_url": "lorem",
  "saml_allow_encrypted_assertions": true,
  "security_captcha_enabled": true,
  "security_captcha_provider": "turnstile",
  "security_captcha_secret": "lorem",
  "security_manual_linking_enabled": true,
  "security_refresh_token_reuse_interval": 42,
  "security_update_password_require_reauthentication": true,
  "sessions_inactivity_timeout": 42,
  "sessions_single_per_user": true,
  "sessions_tags": "lorem",
  "sessions_timebox": 42,
  "site_url": "lorem",
  "sms_autoconfirm": true,
  "sms_max_frequency": 42,
  "sms_messagebird_access_key": "lorem",
  "sms_messagebird_originator": "lorem",
  "sms_otp_exp": 42,
  "sms_otp_length": 42,
  "sms_provider": "messagebird",
  "sms_template": "lorem",
  "sms_test_otp": "lorem",
  "sms_test_otp_valid_until": "2021-12-31T23:34:00Z",
  "sms_textlocal_api_key": "lorem",
  "sms_textlocal_sender": "lorem",
  "sms_twilio_account_sid": "lorem",
  "sms_twilio_auth_token": "lorem",
  "sms_twilio_content_sid": "lorem",
  "sms_twilio_message_service_sid": "lorem",
  "sms_twilio_verify_account_sid": "lorem",
  "sms_twilio_verify_auth_token": "lorem",
  "sms_twilio_verify_message_service_sid": "lorem",
  "sms_vonage_api_key": "lorem",
  "sms_vonage_api_secret": "lorem",
  "sms_vonage_from": "lorem",
  "smtp_admin_email": "jon.snow@targaryen.com",
  "smtp_host": "lorem",
  "smtp_max_frequency": 42,
  "smtp_pass": "lorem",
  "smtp_port": "lorem",
  "smtp_sender_name": "lorem",
  "smtp_user": "lorem",
  "uri_allow_list": "lorem"
}
Get the signing key information for the JWT secret imported as signing key for this project. This endpoint will be removed in the future, check for HTTP 404 Not Found.
get
/v1/projects/{ref}/config/auth/signing-keys/legacy
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Get information about a signing key
get
/v1/projects/{ref}/config/auth/signing-keys/{id}
Path parameters
id
Required
string
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
List all signing keys for the project
get
/v1/projects/{ref}/config/auth/signing-keys
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "keys": [
    {
      "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
      "algorithm": "EdDSA",
      "status": "in_use",
      "public_jwk": null,
      "created_at": "2021-12-31T23:34:00Z",
      "updated_at": "2021-12-31T23:34:00Z"
    }
  ]
}
Get a third-party integration
get
/v1/projects/{ref}/config/auth/third-party-auth/{tpa_id}
Path parameters
ref
Required
string
Project ref

Details
tpa_id
Required
string
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "type": "lorem",
  "oidc_issuer_url": "lorem",
  "jwks_url": "lorem",
  "custom_jwks": null,
  "resolved_jwks": null,
  "inserted_at": "lorem",
  "updated_at": "lorem",
  "resolved_at": "lorem"
}
Lists all SSO providers
get
/v1/projects/{ref}/config/auth/sso/providers
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
404
Response (200)

example

schema
{
  "items": [
    {
      "id": "lorem",
      "saml": {
        "id": "lorem",
        "entity_id": "lorem",
        "metadata_url": "lorem",
        "metadata_xml": "lorem",
        "attribute_mapping": {
          "keys": {
            "property1": {
              "name": "lorem",
              "names": [
                "lorem"
              ],
              "default": {},
              "array": true
            },
            "property2": {
              "name": "lorem",
              "names": [
                "lorem"
              ],
              "default": {},
              "array": true
            }
          }
        }
      },
      "domains": [
        {
          "id": "lorem",
          "domain": "lorem",
          "created_at": "lorem",
          "updated_at": "lorem"
        }
      ],
      "created_at": "lorem",
      "updated_at": "lorem"
    }
  ]
}
Lists all third-party auth integrations
get
/v1/projects/{ref}/config/auth/third-party-auth
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
[
  {
    "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
    "type": "lorem",
    "oidc_issuer_url": "lorem",
    "jwks_url": "lorem",
    "custom_jwks": null,
    "resolved_jwks": null,
    "inserted_at": "lorem",
    "updated_at": "lorem",
    "resolved_at": "lorem"
  }
]
Remove a signing key from a project. Only possible if the key has been in revoked status for a while.
delete
/v1/projects/{ref}/config/auth/signing-keys/{id}
Path parameters
id
Required
string
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Updates a SSO provider by its UUID
put
/v1/projects/{ref}/config/auth/sso/providers/{provider_id}
Path parameters
ref
Required
string
Project ref

Details
provider_id
Required
string
Body

application/json
metadata_xml
Optional
string
metadata_url
Optional
string
domains
Optional
Array<string>
attribute_mapping
Optional
object
Object schema
Response codes
200
403
404
Response (200)

example

schema
{
  "id": "lorem",
  "saml": {
    "id": "lorem",
    "entity_id": "lorem",
    "metadata_url": "lorem",
    "metadata_xml": "lorem",
    "attribute_mapping": {
      "keys": {
        "property1": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        },
        "property2": {
          "name": "lorem",
          "names": [
            "lorem"
          ],
          "default": {},
          "array": true
        }
      }
    }
  },
  "domains": [
    {
      "id": "lorem",
      "domain": "lorem",
      "created_at": "lorem",
      "updated_at": "lorem"
    }
  ],
  "created_at": "lorem",
  "updated_at": "lorem"
}
Updates a project's auth config
patch
/v1/projects/{ref}/config/auth
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
site_url
Optional
string
Details
disable_signup
Optional
boolean
jwt_exp
Optional
integer
smtp_admin_email
Optional
string
smtp_host
Optional
string
smtp_port
Optional
string
smtp_user
Optional
string
smtp_pass
Optional
string
smtp_max_frequency
Optional
integer
smtp_sender_name
Optional
string
mailer_allow_unverified_email_sign_ins
Optional
boolean
mailer_autoconfirm
Optional
boolean
mailer_subjects_invite
Optional
string
mailer_subjects_confirmation
Optional
string
mailer_subjects_recovery
Optional
string
mailer_subjects_email_change
Optional
string
mailer_subjects_magic_link
Optional
string
mailer_subjects_reauthentication
Optional
string
mailer_templates_invite_content
Optional
string
mailer_templates_confirmation_content
Optional
string
mailer_templates_recovery_content
Optional
string
mailer_templates_email_change_content
Optional
string
mailer_templates_magic_link_content
Optional
string
mailer_templates_reauthentication_content
Optional
string
mfa_max_enrolled_factors
Optional
integer
uri_allow_list
Optional
string
external_anonymous_users_enabled
Optional
boolean
external_email_enabled
Optional
boolean
external_phone_enabled
Optional
boolean
saml_enabled
Optional
boolean
saml_external_url
Optional
string
Details
security_captcha_enabled
Optional
boolean
security_captcha_provider
Optional
enum
Accepted values
security_captcha_secret
Optional
string
sessions_timebox
Optional
integer
sessions_inactivity_timeout
Optional
integer
sessions_single_per_user
Optional
boolean
sessions_tags
Optional
string
Details
rate_limit_anonymous_users
Optional
integer
rate_limit_email_sent
Optional
integer
rate_limit_sms_sent
Optional
integer
rate_limit_verify
Optional
integer
rate_limit_token_refresh
Optional
integer
rate_limit_otp
Optional
integer
rate_limit_web3
Optional
integer
mailer_secure_email_change_enabled
Optional
boolean
refresh_token_rotation_enabled
Optional
boolean
password_hibp_enabled
Optional
boolean
password_min_length
Optional
integer
password_required_characters
Optional
enum
Accepted values
security_manual_linking_enabled
Optional
boolean
security_update_password_require_reauthentication
Optional
boolean
security_refresh_token_reuse_interval
Optional
integer
mailer_otp_exp
Optional
integer
mailer_otp_length
Optional
integer
sms_autoconfirm
Optional
boolean
sms_max_frequency
Optional
integer
sms_otp_exp
Optional
integer
sms_otp_length
Optional
integer
sms_provider
Optional
enum
Accepted values
sms_messagebird_access_key
Optional
string
sms_messagebird_originator
Optional
string
sms_test_otp
Optional
string
Details
sms_test_otp_valid_until
Optional
string
sms_textlocal_api_key
Optional
string
sms_textlocal_sender
Optional
string
sms_twilio_account_sid
Optional
string
sms_twilio_auth_token
Optional
string
sms_twilio_content_sid
Optional
string
sms_twilio_message_service_sid
Optional
string
sms_twilio_verify_account_sid
Optional
string
sms_twilio_verify_auth_token
Optional
string
sms_twilio_verify_message_service_sid
Optional
string
sms_vonage_api_key
Optional
string
sms_vonage_api_secret
Optional
string
sms_vonage_from
Optional
string
sms_template
Optional
string
hook_mfa_verification_attempt_enabled
Optional
boolean
hook_mfa_verification_attempt_uri
Optional
string
hook_mfa_verification_attempt_secrets
Optional
string
hook_password_verification_attempt_enabled
Optional
boolean
hook_password_verification_attempt_uri
Optional
string
hook_password_verification_attempt_secrets
Optional
string
hook_custom_access_token_enabled
Optional
boolean
hook_custom_access_token_uri
Optional
string
hook_custom_access_token_secrets
Optional
string
hook_send_sms_enabled
Optional
boolean
hook_send_sms_uri
Optional
string
hook_send_sms_secrets
Optional
string
hook_send_email_enabled
Optional
boolean
hook_send_email_uri
Optional
string
hook_send_email_secrets
Optional
string
hook_before_user_created_enabled
Optional
boolean
hook_before_user_created_uri
Optional
string
hook_before_user_created_secrets
Optional
string
external_apple_enabled
Optional
boolean
external_apple_client_id
Optional
string
external_apple_secret
Optional
string
external_apple_additional_client_ids
Optional
string
external_azure_enabled
Optional
boolean
external_azure_client_id
Optional
string
external_azure_secret
Optional
string
external_azure_url
Optional
string
external_bitbucket_enabled
Optional
boolean
external_bitbucket_client_id
Optional
string
external_bitbucket_secret
Optional
string
external_discord_enabled
Optional
boolean
external_discord_client_id
Optional
string
external_discord_secret
Optional
string
external_facebook_enabled
Optional
boolean
external_facebook_client_id
Optional
string
external_facebook_secret
Optional
string
external_figma_enabled
Optional
boolean
external_figma_client_id
Optional
string
external_figma_secret
Optional
string
external_github_enabled
Optional
boolean
external_github_client_id
Optional
string
external_github_secret
Optional
string
external_gitlab_enabled
Optional
boolean
external_gitlab_client_id
Optional
string
external_gitlab_secret
Optional
string
external_gitlab_url
Optional
string
external_google_enabled
Optional
boolean
external_google_client_id
Optional
string
external_google_secret
Optional
string
external_google_additional_client_ids
Optional
string
external_google_skip_nonce_check
Optional
boolean
external_kakao_enabled
Optional
boolean
external_kakao_client_id
Optional
string
external_kakao_secret
Optional
string
external_keycloak_enabled
Optional
boolean
external_keycloak_client_id
Optional
string
external_keycloak_secret
Optional
string
external_keycloak_url
Optional
string
external_linkedin_oidc_enabled
Optional
boolean
external_linkedin_oidc_client_id
Optional
string
external_linkedin_oidc_secret
Optional
string
external_slack_oidc_enabled
Optional
boolean
external_slack_oidc_client_id
Optional
string
external_slack_oidc_secret
Optional
string
external_notion_enabled
Optional
boolean
external_notion_client_id
Optional
string
external_notion_secret
Optional
string
external_slack_enabled
Optional
boolean
external_slack_client_id
Optional
string
external_slack_secret
Optional
string
external_spotify_enabled
Optional
boolean
external_spotify_client_id
Optional
string
external_spotify_secret
Optional
string
external_twitch_enabled
Optional
boolean
external_twitch_client_id
Optional
string
external_twitch_secret
Optional
string
external_twitter_enabled
Optional
boolean
external_twitter_client_id
Optional
string
external_twitter_secret
Optional
string
external_workos_enabled
Optional
boolean
external_workos_client_id
Optional
string
external_workos_secret
Optional
string
external_workos_url
Optional
string
external_web3_solana_enabled
Optional
boolean
external_zoom_enabled
Optional
boolean
external_zoom_client_id
Optional
string
external_zoom_secret
Optional
string
db_max_pool_size
Optional
integer
api_max_request_duration
Optional
integer
mfa_totp_enroll_enabled
Optional
boolean
mfa_totp_verify_enabled
Optional
boolean
mfa_web_authn_enroll_enabled
Optional
boolean
mfa_web_authn_verify_enabled
Optional
boolean
mfa_phone_enroll_enabled
Optional
boolean
mfa_phone_verify_enabled
Optional
boolean
mfa_phone_max_frequency
Optional
integer
mfa_phone_otp_length
Optional
integer
mfa_phone_template
Optional
string
Response codes
200
403
500
Response (200)

example

schema
{
  "api_max_request_duration": 42,
  "db_max_pool_size": 42,
  "disable_signup": true,
  "external_anonymous_users_enabled": true,
  "external_apple_additional_client_ids": "lorem",
  "external_apple_client_id": "lorem",
  "external_apple_enabled": true,
  "external_apple_secret": "lorem",
  "external_azure_client_id": "lorem",
  "external_azure_enabled": true,
  "external_azure_secret": "lorem",
  "external_azure_url": "lorem",
  "external_bitbucket_client_id": "lorem",
  "external_bitbucket_enabled": true,
  "external_bitbucket_secret": "lorem",
  "external_discord_client_id": "lorem",
  "external_discord_enabled": true,
  "external_discord_secret": "lorem",
  "external_email_enabled": true,
  "external_facebook_client_id": "lorem",
  "external_facebook_enabled": true,
  "external_facebook_secret": "lorem",
  "external_figma_client_id": "lorem",
  "external_figma_enabled": true,
  "external_figma_secret": "lorem",
  "external_github_client_id": "lorem",
  "external_github_enabled": true,
  "external_github_secret": "lorem",
  "external_gitlab_client_id": "lorem",
  "external_gitlab_enabled": true,
  "external_gitlab_secret": "lorem",
  "external_gitlab_url": "lorem",
  "external_google_additional_client_ids": "lorem",
  "external_google_client_id": "lorem",
  "external_google_enabled": true,
  "external_google_secret": "lorem",
  "external_google_skip_nonce_check": true,
  "external_kakao_client_id": "lorem",
  "external_kakao_enabled": true,
  "external_kakao_secret": "lorem",
  "external_keycloak_client_id": "lorem",
  "external_keycloak_enabled": true,
  "external_keycloak_secret": "lorem",
  "external_keycloak_url": "lorem",
  "external_linkedin_oidc_client_id": "lorem",
  "external_linkedin_oidc_enabled": true,
  "external_linkedin_oidc_secret": "lorem",
  "external_slack_oidc_client_id": "lorem",
  "external_slack_oidc_enabled": true,
  "external_slack_oidc_secret": "lorem",
  "external_notion_client_id": "lorem",
  "external_notion_enabled": true,
  "external_notion_secret": "lorem",
  "external_phone_enabled": true,
  "external_slack_client_id": "lorem",
  "external_slack_enabled": true,
  "external_slack_secret": "lorem",
  "external_spotify_client_id": "lorem",
  "external_spotify_enabled": true,
  "external_spotify_secret": "lorem",
  "external_twitch_client_id": "lorem",
  "external_twitch_enabled": true,
  "external_twitch_secret": "lorem",
  "external_twitter_client_id": "lorem",
  "external_twitter_enabled": true,
  "external_twitter_secret": "lorem",
  "external_workos_client_id": "lorem",
  "external_workos_enabled": true,
  "external_workos_secret": "lorem",
  "external_workos_url": "lorem",
  "external_web3_solana_enabled": true,
  "external_zoom_client_id": "lorem",
  "external_zoom_enabled": true,
  "external_zoom_secret": "lorem",
  "hook_custom_access_token_enabled": true,
  "hook_custom_access_token_uri": "lorem",
  "hook_custom_access_token_secrets": "lorem",
  "hook_mfa_verification_attempt_enabled": true,
  "hook_mfa_verification_attempt_uri": "lorem",
  "hook_mfa_verification_attempt_secrets": "lorem",
  "hook_password_verification_attempt_enabled": true,
  "hook_password_verification_attempt_uri": "lorem",
  "hook_password_verification_attempt_secrets": "lorem",
  "hook_send_sms_enabled": true,
  "hook_send_sms_uri": "lorem",
  "hook_send_sms_secrets": "lorem",
  "hook_send_email_enabled": true,
  "hook_send_email_uri": "lorem",
  "hook_send_email_secrets": "lorem",
  "hook_before_user_created_enabled": true,
  "hook_before_user_created_uri": "lorem",
  "hook_before_user_created_secrets": "lorem",
  "jwt_exp": 42,
  "mailer_allow_unverified_email_sign_ins": true,
  "mailer_autoconfirm": true,
  "mailer_otp_exp": 42,
  "mailer_otp_length": 42,
  "mailer_secure_email_change_enabled": true,
  "mailer_subjects_confirmation": "lorem",
  "mailer_subjects_email_change": "lorem",
  "mailer_subjects_invite": "lorem",
  "mailer_subjects_magic_link": "lorem",
  "mailer_subjects_reauthentication": "lorem",
  "mailer_subjects_recovery": "lorem",
  "mailer_templates_confirmation_content": "lorem",
  "mailer_templates_email_change_content": "lorem",
  "mailer_templates_invite_content": "lorem",
  "mailer_templates_magic_link_content": "lorem",
  "mailer_templates_reauthentication_content": "lorem",
  "mailer_templates_recovery_content": "lorem",
  "mfa_max_enrolled_factors": 42,
  "mfa_totp_enroll_enabled": true,
  "mfa_totp_verify_enabled": true,
  "mfa_phone_enroll_enabled": true,
  "mfa_phone_verify_enabled": true,
  "mfa_web_authn_enroll_enabled": true,
  "mfa_web_authn_verify_enabled": true,
  "mfa_phone_otp_length": 42,
  "mfa_phone_template": "lorem",
  "mfa_phone_max_frequency": 42,
  "password_hibp_enabled": true,
  "password_min_length": 42,
  "password_required_characters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789",
  "rate_limit_anonymous_users": 42,
  "rate_limit_email_sent": 42,
  "rate_limit_sms_sent": 42,
  "rate_limit_token_refresh": 42,
  "rate_limit_verify": 42,
  "rate_limit_otp": 42,
  "rate_limit_web3": 42,
  "refresh_token_rotation_enabled": true,
  "saml_enabled": true,
  "saml_external_url": "lorem",
  "saml_allow_encrypted_assertions": true,
  "security_captcha_enabled": true,
  "security_captcha_provider": "turnstile",
  "security_captcha_secret": "lorem",
  "security_manual_linking_enabled": true,
  "security_refresh_token_reuse_interval": 42,
  "security_update_password_require_reauthentication": true,
  "sessions_inactivity_timeout": 42,
  "sessions_single_per_user": true,
  "sessions_tags": "lorem",
  "sessions_timebox": 42,
  "site_url": "lorem",
  "sms_autoconfirm": true,
  "sms_max_frequency": 42,
  "sms_messagebird_access_key": "lorem",
  "sms_messagebird_originator": "lorem",
  "sms_otp_exp": 42,
  "sms_otp_length": 42,
  "sms_provider": "messagebird",
  "sms_template": "lorem",
  "sms_test_otp": "lorem",
  "sms_test_otp_valid_until": "2021-12-31T23:34:00Z",
  "sms_textlocal_api_key": "lorem",
  "sms_textlocal_sender": "lorem",
  "sms_twilio_account_sid": "lorem",
  "sms_twilio_auth_token": "lorem",
  "sms_twilio_content_sid": "lorem",
  "sms_twilio_message_service_sid": "lorem",
  "sms_twilio_verify_account_sid": "lorem",
  "sms_twilio_verify_auth_token": "lorem",
  "sms_twilio_verify_message_service_sid": "lorem",
  "sms_vonage_api_key": "lorem",
  "sms_vonage_api_secret": "lorem",
  "sms_vonage_from": "lorem",
  "smtp_admin_email": "jon.snow@targaryen.com",
  "smtp_host": "lorem",
  "smtp_max_frequency": 42,
  "smtp_pass": "lorem",
  "smtp_port": "lorem",
  "smtp_sender_name": "lorem",
  "smtp_user": "lorem",
  "uri_allow_list": "lorem"
}
Update a signing key, mainly its status
patch
/v1/projects/{ref}/config/auth/signing-keys/{id}
Path parameters
id
Required
string
ref
Required
string
Project ref

Details
Body

application/json
status
Required
enum
Accepted values
Response codes
200
403
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "algorithm": "EdDSA",
  "status": "in_use",
  "public_jwk": null,
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Applies project addon
patch
/v1/projects/{ref}/billing/addons
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
addon_variant
Required
one of the following options
Options
addon_type
Required
enum
Accepted values
Response codes
200
403
500
Response (200)

schema
{}
Lists project addons
get
/v1/projects/{ref}/billing/addons
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "selected_addons": [
    {
      "type": "custom_domain",
      "variant": {
        "id": "ci_micro",
        "name": "lorem",
        "price": {
          "description": "lorem",
          "type": "fixed",
          "interval": "monthly",
          "amount": 42
        },
        "meta": null
      }
    }
  ],
  "available_addons": [
    {
      "type": "custom_domain",
      "name": "lorem",
      "variants": [
        {
          "id": "ci_micro",
          "name": "lorem",
          "price": {
            "description": "lorem",
            "type": "fixed",
            "interval": "monthly",
            "amount": 42
          },
          "meta": null
        }
      ]
    }
  ]
}
Removes project addon
delete
/v1/projects/{ref}/billing/addons/{addon_variant}
Path parameters
ref
Required
string
Project ref

Details
addon_variant
Required
Details
Response codes
200
403
500
Response (200)

schema
{}
[Beta] Apply a database migration
post
/v1/projects/{ref}/database/migrations
Only available to selected partner OAuth apps

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
query
Required
string
Details
name
Optional
string
Response codes
200
403
500
Response (200)

schema
{}
Initiates a creation of a restore point for a database
post
/v1/projects/{ref}/database/backups/restore-point
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
name
Required
string
Details
Response codes
201
Response (201)

example

schema
{
  "name": "lorem",
  "status": "AVAILABLE"
}
Disables project's readonly mode for the next 15 minutes
post
/v1/projects/{ref}/readonly/temporary-disable
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

schema
{}
[Beta] Enables Database Webhooks on the project
post
/v1/projects/{ref}/database/webhooks/enable
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

schema
{}
Generate TypeScript types
get
/v1/projects/{ref}/types/typescript
Returns the TypeScript types of your schema for use with supabase-js.

Path parameters
ref
Required
string
Project ref

Details
Query parameters
included_schemas
Optional
string
Response codes
200
403
500
Response (200)

example

schema
{
  "types": "lorem"
}
Gets a specific SQL snippet
get
/v1/snippets/{id}
Path parameters
id
Required
string
Response codes
200
500
Response (200)

example

schema
{
  "id": "lorem",
  "inserted_at": "lorem",
  "updated_at": "lorem",
  "type": "sql",
  "visibility": "user",
  "name": "lorem",
  "description": "lorem",
  "project": {
    "id": 42,
    "name": "lorem"
  },
  "owner": {
    "id": 42,
    "username": "lorem"
  },
  "updated_by": {
    "id": 42,
    "username": "lorem"
  },
  "content": {
    "favorite": true,
    "schema_version": "lorem",
    "sql": "lorem"
  }
}
Gets database metadata for the given project.deprecated
get
/v1/projects/{ref}/database/context
This is an experimental endpoint. It is subject to change or removal in future versions. Use it with caution, as it may not remain supported or stable.

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "databases": [
    {
      "name": "lorem",
      "schemas": [
        {
          "name": "lorem"
        }
      ]
    }
  ]
}
Gets project's supavisor config
get
/v1/projects/{ref}/config/database/pooler
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
500
Response (200)

example

schema
[
  {
    "identifier": "lorem",
    "database_type": "PRIMARY",
    "is_using_scram_auth": true,
    "db_user": "lorem",
    "db_host": "lorem",
    "db_port": 42,
    "db_name": "lorem",
    "connection_string": "lorem",
    "connectionString": "lorem",
    "default_pool_size": 42,
    "max_client_conn": 42,
    "pool_mode": "transaction"
  }
]
Gets project's Postgres config
get
/v1/projects/{ref}/config/database/postgres
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "effective_cache_size": "lorem",
  "logical_decoding_work_mem": "lorem",
  "maintenance_work_mem": "lorem",
  "track_activity_query_size": "lorem",
  "max_connections": 1,
  "max_locks_per_transaction": 10,
  "max_parallel_maintenance_workers": 0,
  "max_parallel_workers": 0,
  "max_parallel_workers_per_gather": 0,
  "max_replication_slots": 42,
  "max_slot_wal_keep_size": "lorem",
  "max_standby_archive_delay": "lorem",
  "max_standby_streaming_delay": "lorem",
  "max_wal_size": "lorem",
  "max_wal_senders": 42,
  "max_worker_processes": 0,
  "session_replication_role": "origin",
  "shared_buffers": "lorem",
  "statement_timeout": "lorem",
  "track_commit_timestamp": true,
  "wal_keep_size": "lorem",
  "wal_sender_timeout": "lorem",
  "work_mem": "lorem"
}
Get project's pgbouncer config
get
/v1/projects/{ref}/config/database/pgbouncer
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "default_pool_size": 42,
  "ignore_startup_parameters": "lorem",
  "max_client_conn": 42,
  "pool_mode": "transaction",
  "connection_string": "lorem",
  "server_idle_timeout": 42,
  "server_lifetime": 42,
  "query_wait_timeout": 42,
  "reserve_pool_size": 42
}
Returns project's readonly mode status
get
/v1/projects/{ref}/readonly
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "enabled": true,
  "override_enabled": true,
  "override_active_until": "lorem"
}
Get restore points for project
get
/v1/projects/{ref}/database/backups/restore-point
Path parameters
ref
Required
string
Project ref

Details
Query parameters
name
Optional
string
Details
Response codes
200
403
500
Response (200)

example

schema
{
  "name": "lorem",
  "status": "AVAILABLE"
}
[Beta] Get project's SSL enforcement configuration.
get
/v1/projects/{ref}/ssl-enforcement
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "currentConfig": {
    "database": true
  },
  "appliedSuccessfully": true
}
Lists all backups
get
/v1/projects/{ref}/database/backups
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "region": "lorem",
  "walg_enabled": true,
  "pitr_enabled": true,
  "backups": [
    {
      "is_physical_backup": true,
      "status": "COMPLETED",
      "inserted_at": "lorem"
    }
  ],
  "physical_backup_data": {
    "earliest_physical_backup_date_unix": 42,
    "latest_physical_backup_date_unix": 42
  }
}
Lists SQL snippets for the logged in user
get
/v1/snippets
Query parameters
project_ref
Optional
string
Project ref

Details
cursor
Optional
string
limit
Optional
string
sort_by
Optional
enum
Accepted values
sort_order
Optional
enum
Accepted values
Response codes
200
500
Response (200)

example

schema
{
  "data": [
    {
      "id": "lorem",
      "inserted_at": "lorem",
      "updated_at": "lorem",
      "type": "sql",
      "visibility": "user",
      "name": "lorem",
      "description": "lorem",
      "project": {
        "id": 42,
        "name": "lorem"
      },
      "owner": {
        "id": 42,
        "username": "lorem"
      },
      "updated_by": {
        "id": 42,
        "username": "lorem"
      }
    }
  ],
  "cursor": "lorem"
}
[Beta] List applied migration versions
get
/v1/projects/{ref}/database/migrations
Only available to selected partner OAuth apps

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "version": "lorem",
    "name": "lorem"
  }
]
[Beta] Remove a read replica
post
/v1/projects/{ref}/read-replicas/remove
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
database_identifier
Required
string
Response codes
201
403
500
Response (201)

schema
{}
Restores a PITR backup for a database
post
/v1/projects/{ref}/database/backups/restore-pitr
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
recovery_time_target_unix
Required
integer
Response codes
201
403
Response (201)

schema
{}
[Beta] Run sql query
post
/v1/projects/{ref}/database/query
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
query
Required
string
Details
read_only
Optional
boolean
Response codes
201
403
500
Response (201)

schema
{}
[Beta] Set up a read replica
post
/v1/projects/{ref}/read-replicas/setup
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
read_replica_region
Required
enum
Accepted values
Response codes
201
403
500
Response (201)

schema
{}
Initiates an undo to a given restore point
post
/v1/projects/{ref}/database/backups/undo
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
name
Required
string
Details
Response codes
201
403
Response (201)

schema
{}
Updates project's supavisor config
patch
/v1/projects/{ref}/config/database/pooler
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
default_pool_size
Optional
integer
pool_mode
Optional
enum
Accepted values
Response codes
200
403
500
Response (200)

example

schema
{
  "default_pool_size": 42,
  "pool_mode": "lorem"
}
Updates project's Postgres config
put
/v1/projects/{ref}/config/database/postgres
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
effective_cache_size
Optional
string
logical_decoding_work_mem
Optional
string
maintenance_work_mem
Optional
string
track_activity_query_size
Optional
string
max_connections
Optional
integer
max_locks_per_transaction
Optional
integer
max_parallel_maintenance_workers
Optional
integer
max_parallel_workers
Optional
integer
max_parallel_workers_per_gather
Optional
integer
max_replication_slots
Optional
integer
max_slot_wal_keep_size
Optional
string
max_standby_archive_delay
Optional
string
max_standby_streaming_delay
Optional
string
max_wal_size
Optional
string
max_wal_senders
Optional
integer
max_worker_processes
Optional
integer
session_replication_role
Optional
enum
Accepted values
shared_buffers
Optional
string
statement_timeout
Optional
string
track_commit_timestamp
Optional
boolean
wal_keep_size
Optional
string
wal_sender_timeout
Optional
string
work_mem
Optional
string
restart_database
Optional
boolean
Response codes
200
403
500
Response (200)

example

schema
{
  "effective_cache_size": "lorem",
  "logical_decoding_work_mem": "lorem",
  "maintenance_work_mem": "lorem",
  "track_activity_query_size": "lorem",
  "max_connections": 1,
  "max_locks_per_transaction": 10,
  "max_parallel_maintenance_workers": 0,
  "max_parallel_workers": 0,
  "max_parallel_workers_per_gather": 0,
  "max_replication_slots": 42,
  "max_slot_wal_keep_size": "lorem",
  "max_standby_archive_delay": "lorem",
  "max_standby_streaming_delay": "lorem",
  "max_wal_size": "lorem",
  "max_wal_senders": 42,
  "max_worker_processes": 0,
  "session_replication_role": "origin",
  "shared_buffers": "lorem",
  "statement_timeout": "lorem",
  "track_commit_timestamp": true,
  "wal_keep_size": "lorem",
  "wal_sender_timeout": "lorem",
  "work_mem": "lorem"
}
[Beta] Update project's SSL enforcement configuration.
put
/v1/projects/{ref}/ssl-enforcement
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
requestedConfig
Required
object
Object schema
Response codes
200
403
500
Response (200)

example

schema
{
  "currentConfig": {
    "database": true
  },
  "appliedSuccessfully": true
}
[Beta] Upsert a database migration without applying
put
/v1/projects/{ref}/database/migrations
Only available to selected partner OAuth apps

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
query
Required
string
Details
name
Optional
string
Response codes
200
403
500
Response (200)

schema
{}
[Beta] Activates a custom hostname for a project.
post
/v1/projects/{ref}/custom-hostname/activate
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

example

schema
{
  "status": "1_not_started",
  "custom_hostname": "lorem",
  "data": {
    "success": true,
    "errors": [
      null
    ],
    "messages": [
      null
    ],
    "result": {
      "id": "lorem",
      "hostname": "lorem",
      "ssl": {
        "status": "lorem",
        "validation_records": [
          {
            "txt_name": "lorem",
            "txt_value": "lorem"
          }
        ],
        "validation_errors": [
          {
            "message": "lorem"
          }
        ]
      },
      "ownership_verification": {
        "type": "lorem",
        "name": "lorem",
        "value": "lorem"
      },
      "custom_origin_server": "lorem",
      "verification_errors": [
        "lorem"
      ],
      "status": "lorem"
    }
  }
}
[Beta] Activates a vanity subdomain for a project.
post
/v1/projects/{ref}/vanity-subdomain/activate
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
vanity_subdomain
Required
string
Response codes
201
403
500
Response (201)

example

schema
{
  "custom_domain": "lorem"
}
[Beta] Checks vanity subdomain availability
post
/v1/projects/{ref}/vanity-subdomain/check-availability
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
vanity_subdomain
Required
string
Response codes
201
403
500
Response (201)

example

schema
{
  "available": true
}
[Beta] Deletes a project's vanity subdomain configuration
delete
/v1/projects/{ref}/vanity-subdomain
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

schema
{}
[Beta] Gets project's custom hostname config
get
/v1/projects/{ref}/custom-hostname
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "status": "1_not_started",
  "custom_hostname": "lorem",
  "data": {
    "success": true,
    "errors": [
      null
    ],
    "messages": [
      null
    ],
    "result": {
      "id": "lorem",
      "hostname": "lorem",
      "ssl": {
        "status": "lorem",
        "validation_records": [
          {
            "txt_name": "lorem",
            "txt_value": "lorem"
          }
        ],
        "validation_errors": [
          {
            "message": "lorem"
          }
        ]
      },
      "ownership_verification": {
        "type": "lorem",
        "name": "lorem",
        "value": "lorem"
      },
      "custom_origin_server": "lorem",
      "verification_errors": [
        "lorem"
      ],
      "status": "lorem"
    }
  }
}
[Beta] Gets current vanity subdomain config
get
/v1/projects/{ref}/vanity-subdomain
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "status": "not-used",
  "custom_domain": "lorem"
}
[Beta] Updates project's custom hostname configuration
post
/v1/projects/{ref}/custom-hostname/initialize
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
custom_hostname
Required
string
Response codes
201
403
500
Response (201)

example

schema
{
  "status": "1_not_started",
  "custom_hostname": "lorem",
  "data": {
    "success": true,
    "errors": [
      null
    ],
    "messages": [
      null
    ],
    "result": {
      "id": "lorem",
      "hostname": "lorem",
      "ssl": {
        "status": "lorem",
        "validation_records": [
          {
            "txt_name": "lorem",
            "txt_value": "lorem"
          }
        ],
        "validation_errors": [
          {
            "message": "lorem"
          }
        ]
      },
      "ownership_verification": {
        "type": "lorem",
        "name": "lorem",
        "value": "lorem"
      },
      "custom_origin_server": "lorem",
      "verification_errors": [
        "lorem"
      ],
      "status": "lorem"
    }
  }
}
[Beta] Attempts to verify the DNS configuration for project's custom hostname configuration
post
/v1/projects/{ref}/custom-hostname/reverify
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

example

schema
{
  "status": "1_not_started",
  "custom_hostname": "lorem",
  "data": {
    "success": true,
    "errors": [
      null
    ],
    "messages": [
      null
    ],
    "result": {
      "id": "lorem",
      "hostname": "lorem",
      "ssl": {
        "status": "lorem",
        "validation_records": [
          {
            "txt_name": "lorem",
            "txt_value": "lorem"
          }
        ],
        "validation_errors": [
          {
            "message": "lorem"
          }
        ]
      },
      "ownership_verification": {
        "type": "lorem",
        "name": "lorem",
        "value": "lorem"
      },
      "custom_origin_server": "lorem",
      "verification_errors": [
        "lorem"
      ],
      "status": "lorem"
    }
  }
}
Bulk update functions
put
/v1/projects/{ref}/functions
Bulk update functions. It will create a new function or replace existing. The operation is idempotent. NOTE: You will need to manually bump the version.

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
Array of object
Object schema
Response codes
200
403
500
Response (200)

example

schema
{
  "functions": [
    {
      "id": "lorem",
      "slug": "lorem",
      "name": "lorem",
      "status": "ACTIVE",
      "version": 42,
      "created_at": 42,
      "updated_at": 42,
      "verify_jwt": true,
      "import_map": true,
      "entrypoint_path": "lorem",
      "import_map_path": "lorem",
      "ezbr_sha256": "lorem"
    }
  ]
}
Create a functiondeprecated
post
/v1/projects/{ref}/functions
This endpoint is deprecated - use the deploy endpoint. Creates a function and adds it to the specified project.

Path parameters
ref
Required
string
Project ref

Details
Query parameters
slug
Optional
string
Details
name
Optional
string
verify_jwt
Optional
boolean
Boolean string, true or false

import_map
Optional
boolean
Boolean string, true or false

entrypoint_path
Optional
string
import_map_path
Optional
string
ezbr_sha256
Optional
string
Body

application/vnd.denoland.eszip
string
Response codes
201
403
500
Response (201)

example

schema
{
  "id": "lorem",
  "slug": "lorem",
  "name": "lorem",
  "status": "ACTIVE",
  "version": 42,
  "created_at": 42,
  "updated_at": 42,
  "verify_jwt": true,
  "import_map": true,
  "entrypoint_path": "lorem",
  "import_map_path": "lorem",
  "ezbr_sha256": "lorem"
}
Delete a function
delete
/v1/projects/{ref}/functions/{function_slug}
Deletes a function with the specified slug from the specified project.

Path parameters
ref
Required
string
Project ref

Details
function_slug
Required
string
Function slug

Details
Response codes
200
403
500
Response (200)

schema
{}
Deploy a function
post
/v1/projects/{ref}/functions/deploy
A new endpoint to deploy functions. It will create if function does not exist.

Path parameters
ref
Required
string
Project ref

Details
Query parameters
slug
Optional
string
Details
bundleOnly
Optional
boolean
Boolean string, true or false

Body

multipart/form-data
file
Optional
Array<string>
metadata
Required
object
Object schema
Response codes
201
403
500
Response (201)

example

schema
{
  "id": "lorem",
  "slug": "lorem",
  "name": "lorem",
  "status": "ACTIVE",
  "version": 42,
  "created_at": 42,
  "updated_at": 42,
  "verify_jwt": true,
  "import_map": true,
  "entrypoint_path": "lorem",
  "import_map_path": "lorem",
  "ezbr_sha256": "lorem"
}
Retrieve a function
get
/v1/projects/{ref}/functions/{function_slug}
Retrieves a function with the specified slug and project.

Path parameters
ref
Required
string
Project ref

Details
function_slug
Required
string
Function slug

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "id": "lorem",
  "slug": "lorem",
  "name": "lorem",
  "status": "ACTIVE",
  "version": 42,
  "created_at": 42,
  "updated_at": 42,
  "verify_jwt": true,
  "import_map": true,
  "entrypoint_path": "lorem",
  "import_map_path": "lorem",
  "ezbr_sha256": "lorem"
}
Retrieve a function body
get
/v1/projects/{ref}/functions/{function_slug}/body
Retrieves a function body for the specified slug and project.

Path parameters
ref
Required
string
Project ref

Details
function_slug
Required
string
Function slug

Details
Response codes
200
403
500
Response (200)

example

schema
{}
List all functions
get
/v1/projects/{ref}/functions
Returns all functions you've previously added to the specified project.

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "id": "lorem",
    "slug": "lorem",
    "name": "lorem",
    "status": "ACTIVE",
    "version": 42,
    "created_at": 42,
    "updated_at": 42,
    "verify_jwt": true,
    "import_map": true,
    "entrypoint_path": "lorem",
    "import_map_path": "lorem",
    "ezbr_sha256": "lorem"
  }
]
Update a function
patch
/v1/projects/{ref}/functions/{function_slug}
Updates a function with the specified slug and project.

Path parameters
ref
Required
string
Project ref

Details
function_slug
Required
string
Function slug

Details
Query parameters
slug
Optional
string
Details
name
Optional
string
verify_jwt
Optional
boolean
Boolean string, true or false

import_map
Optional
boolean
Boolean string, true or false

entrypoint_path
Optional
string
import_map_path
Optional
string
ezbr_sha256
Optional
string
Body

application/vnd.denoland.eszip
string
Response codes
200
403
500
Response (200)

example

schema
{
  "id": "lorem",
  "slug": "lorem",
  "name": "lorem",
  "status": "ACTIVE",
  "version": 42,
  "created_at": 42,
  "updated_at": 42,
  "verify_jwt": true,
  "import_map": true,
  "entrypoint_path": "lorem",
  "import_map_path": "lorem",
  "ezbr_sha256": "lorem"
}
Create a database branch
post
/v1/projects/{ref}/branches
Creates a database branch from the specified project.

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
branch_name
Required
string
Details
git_branch
Optional
string
is_default
Optional
boolean
persistent
Optional
boolean
region
Optional
string
desired_instance_size
Optional
enum
Accepted values
release_channel
Optional
enum
Accepted values
postgres_engine
Optional
enum
Accepted values
secrets
Optional
object
Object schema
with_data
Optional
boolean
Response codes
201
403
500
Response (201)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "name": "lorem",
  "project_ref": "lorem",
  "parent_project_ref": "lorem",
  "is_default": true,
  "git_branch": "lorem",
  "pr_number": 42,
  "latest_check_run_id": 42,
  "persistent": true,
  "status": "CREATING_PROJECT",
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z",
  "review_requested_at": "2021-12-31T23:34:00Z"
}
Delete a database branch
delete
/v1/branches/{branch_id}
Deletes the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Response codes
200
500
Response (200)

example

schema
{
  "message": "ok"
}
[Beta] Diffs a database branch
get
/v1/branches/{branch_id}/diff
Diffs the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Query parameters
included_schemas
Optional
string
Response codes
200
500
Response (200)

schema
{}
Disables preview branching
delete
/v1/projects/{ref}/branches
Disables preview branching for the specified project

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

schema
{}
Get a database branch
get
/v1/projects/{ref}/branches/{name}
Fetches the specified database branch by its name.

Path parameters
ref
Required
string
Project ref

Details
name
Required
string
Response codes
200
403
500
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "name": "lorem",
  "project_ref": "lorem",
  "parent_project_ref": "lorem",
  "is_default": true,
  "git_branch": "lorem",
  "pr_number": 42,
  "latest_check_run_id": 42,
  "persistent": true,
  "status": "CREATING_PROJECT",
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z",
  "review_requested_at": "2021-12-31T23:34:00Z"
}
Get database branch config
get
/v1/branches/{branch_id}
Fetches configurations of the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Response codes
200
500
Response (200)

example

schema
{
  "ref": "lorem",
  "postgres_version": "lorem",
  "postgres_engine": "lorem",
  "release_channel": "lorem",
  "status": "INACTIVE",
  "db_host": "lorem",
  "db_port": 1,
  "db_user": "lorem",
  "db_pass": "lorem",
  "jwt_secret": "lorem"
}
List all database branches
get
/v1/projects/{ref}/branches
Returns all database branches of the specified project.

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
    "name": "lorem",
    "project_ref": "lorem",
    "parent_project_ref": "lorem",
    "is_default": true,
    "git_branch": "lorem",
    "pr_number": 42,
    "latest_check_run_id": 42,
    "persistent": true,
    "status": "CREATING_PROJECT",
    "created_at": "2021-12-31T23:34:00Z",
    "updated_at": "2021-12-31T23:34:00Z",
    "review_requested_at": "2021-12-31T23:34:00Z"
  }
]
Merges a database branch
post
/v1/branches/{branch_id}/merge
Merges the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Body

application/json
migration_version
Optional
string
Response codes
201
500
Response (201)

example

schema
{
  "workflow_run_id": "lorem",
  "message": "ok"
}
Pushes a database branch
post
/v1/branches/{branch_id}/push
Pushes the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Body

application/json
migration_version
Optional
string
Response codes
201
500
Response (201)

example

schema
{
  "workflow_run_id": "lorem",
  "message": "ok"
}
Resets a database branch
post
/v1/branches/{branch_id}/reset
Resets the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Body

application/json
migration_version
Optional
string
Response codes
201
500
Response (201)

example

schema
{
  "workflow_run_id": "lorem",
  "message": "ok"
}
Update database branch config
patch
/v1/branches/{branch_id}
Updates the configuration of the specified database branch

Path parameters
branch_id
Required
string
Branch ID

Body

application/json
branch_name
Optional
string
git_branch
Optional
string
reset_on_push
Optional
Deprecated
boolean
persistent
Optional
boolean
status
Optional
enum
Accepted values
request_review
Optional
boolean
Response codes
200
500
Response (200)

example

schema
{
  "id": "fbdf5a53-161e-4460-98ad-0e39408d8689",
  "name": "lorem",
  "project_ref": "lorem",
  "parent_project_ref": "lorem",
  "is_default": true,
  "git_branch": "lorem",
  "pr_number": 42,
  "latest_check_run_id": 42,
  "persistent": true,
  "status": "CREATING_PROJECT",
  "created_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z",
  "review_requested_at": "2021-12-31T23:34:00Z"
}
[Beta] Authorize user through oauth
get
/v1/oauth/authorize
Query parameters
client_id
Required
string
response_type
Required
enum
Accepted values
redirect_uri
Required
string
scope
Optional
string
state
Optional
string
response_mode
Optional
string
code_challenge
Optional
string
code_challenge_method
Optional
enum
Accepted values
organization_slug
Optional
string
Organization slug

Details
resource
Optional
enum
Resource indicator for MCP (Model Context Protocol) clients

Accepted values
Response codes
204
Response (204)

schema
{}
[Beta] Exchange auth code for user's access and refresh token
post
/v1/oauth/token
Body

application/x-www-form-urlencoded
grant_type
Optional
enum
Accepted values
client_id
Optional
string
client_secret
Optional
string
code
Optional
string
code_verifier
Optional
string
redirect_uri
Optional
string
refresh_token
Optional
string
resource
Optional
enum
Accepted values
Response codes
201
Response (201)

example

schema
{
  "access_token": "lorem",
  "refresh_token": "lorem",
  "expires_in": 42,
  "token_type": "Bearer"
}
Authorize user through oauth and claim a project
get
/v1/oauth/authorize/project-claim
Initiates the OAuth authorization flow for the specified provider. After successful authentication, the user can claim ownership of the specified project.

Query parameters
project_ref
Required
string
Project ref

Details
client_id
Required
string
response_type
Required
enum
Accepted values
redirect_uri
Required
string
state
Optional
string
response_mode
Optional
string
code_challenge
Optional
string
code_challenge_method
Optional
enum
Accepted values
Response codes
204
Response (204)

schema
{}
[Beta] Revoke oauth app authorization and it's corresponding tokens
post
/v1/oauth/revoke
Body

application/json
client_id
Required
string
client_secret
Required
string
refresh_token
Required
string
Response codes
204
Response (204)

schema
{}
Claims project for the specified organization
post
/v1/organizations/{slug}/project-claim/{token}
Path parameters
slug
Required
string
Organization slug

Details
token
Required
string
Response codes
204
403
Response (204)

schema
{}
Create an organization
post
/v1/organizations
Body

application/json
name
Required
string
Response codes
201
500
Response (201)

example

schema
{
  "id": "lorem",
  "name": "lorem"
}
Gets information about the organization
get
/v1/organizations/{slug}
Path parameters
slug
Required
string
Organization slug

Details
Response codes
200
403
Response (200)

example

schema
{
  "id": "lorem",
  "name": "lorem",
  "plan": "free",
  "opt_in_tags": [
    "AI_SQL_GENERATOR_OPT_IN"
  ],
  "allowed_release_channels": [
    "internal"
  ]
}
Gets project details for the specified organization and claim token
get
/v1/organizations/{slug}/project-claim/{token}
Path parameters
slug
Required
string
Organization slug

Details
token
Required
string
Response codes
200
403
Response (200)

example

schema
{
  "project": {
    "ref": "lorem",
    "name": "lorem"
  },
  "preview": {
    "valid": true,
    "warnings": [
      {
        "key": "lorem",
        "message": "lorem"
      }
    ],
    "errors": [
      {
        "key": "lorem",
        "message": "lorem"
      }
    ],
    "info": [
      {
        "key": "lorem",
        "message": "lorem"
      }
    ],
    "members_exceeding_free_project_limit": [
      {
        "name": "lorem",
        "limit": 42
      }
    ],
    "target_organization_eligible": true,
    "target_organization_has_free_project_slots": true,
    "source_subscription_plan": "free",
    "target_subscription_plan": "free"
  },
  "expires_at": "lorem",
  "created_at": "lorem",
  "created_by": "fbdf5a53-161e-4460-98ad-0e39408d8689"
}
List all organizations
get
/v1/organizations
Returns a list of organizations that you currently belong to.

Response codes
200
500
Response (200)

example

schema
[
  {
    "id": "lorem",
    "name": "lorem"
  }
]
List members of an organization
get
/v1/organizations/{slug}/members
Path parameters
slug
Required
string
Organization slug

Details
Response codes
200
403
Response (200)

example

schema
[
  {
    "user_id": "lorem",
    "user_name": "lorem",
    "email": "lorem",
    "role_name": "lorem",
    "mfa_enabled": true
  }
]
Cancels the given project restoration
post
/v1/projects/{ref}/restore/cancel
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

schema
{}
Create a project
post
/v1/projects
Body

application/json
db_pass
Required
string
name
Required
string
Details
organization_id
Required
string
plan
Optional
Deprecated
enum
Accepted values
region
Required
enum
Accepted values
kps_enabled
Optional
Deprecated
boolean
desired_instance_size
Optional
enum
Accepted values
template_url
Optional
string
Response codes
201
Response (201)

example

schema
{
  "id": "lorem",
  "organization_id": "lorem",
  "name": "lorem",
  "region": "us-east-1",
  "created_at": "2023-03-29T16:32:59Z",
  "status": "INACTIVE"
}
Creates project claim token
post
/v1/projects/{ref}/claim-token
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "token": "lorem",
  "token_alias": "lorem",
  "expires_at": "lorem",
  "created_at": "lorem",
  "created_by": "fbdf5a53-161e-4460-98ad-0e39408d8689"
}
Deletes the given project
delete
/v1/projects/{ref}
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "id": 42,
  "ref": "lorem",
  "name": "lorem"
}
[Beta] Remove network bans.
delete
/v1/projects/{ref}/network-bans
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
ipv4_addresses
Required
Array<string>
identifier
Optional
string
Response codes
200
403
500
Response (200)

schema
{}
Revokes project claim token
delete
/v1/projects/{ref}/claim-token
Path parameters
ref
Required
string
Project ref

Details
Response codes
204
403
Response (204)

schema
{}
[Beta] Gets project's network restrictions
get
/v1/projects/{ref}/network-restrictions
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "entitlement": "disallowed",
  "config": {
    "dbAllowedCidrs": [
      "lorem"
    ],
    "dbAllowedCidrsV6": [
      "lorem"
    ]
  },
  "old_config": {
    "dbAllowedCidrs": [
      "lorem"
    ],
    "dbAllowedCidrsV6": [
      "lorem"
    ]
  },
  "status": "stored"
}
[Beta] Returns the project's eligibility for upgrades
get
/v1/projects/{ref}/upgrade/eligibility
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "eligible": true,
  "current_app_version": "lorem",
  "current_app_version_release_channel": "internal",
  "latest_app_version": "lorem",
  "target_upgrade_versions": [
    {
      "postgres_version": "13",
      "release_channel": "internal",
      "app_version": "lorem"
    }
  ],
  "duration_estimate_hours": 42,
  "legacy_auth_custom_roles": [
    "lorem"
  ],
  "objects_to_be_dropped": [
    "lorem"
  ],
  "unsupported_extensions": [
    "lorem"
  ],
  "user_defined_objects_in_internal_schemas": [
    "lorem"
  ]
}
[Beta] Gets the latest status of the project's upgrade
get
/v1/projects/{ref}/upgrade/status
Path parameters
ref
Required
string
Project ref

Details
Query parameters
tracking_id
Optional
string
Response codes
200
403
500
Response (200)

example

schema
{
  "databaseUpgradeStatus": {
    "initiated_at": "lorem",
    "latest_status_at": "lorem",
    "target_version": 42,
    "error": "1_upgraded_instance_launch_failed",
    "progress": "0_requested",
    "status": 42
  }
}
Gets a specific project that belongs to the authenticated user
get
/v1/projects/{ref}
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "id": "lorem",
  "organization_id": "lorem",
  "name": "lorem",
  "region": "us-east-1",
  "created_at": "2023-03-29T16:32:59Z",
  "status": "INACTIVE",
  "database": {
    "host": "lorem",
    "version": "lorem",
    "postgres_engine": "lorem",
    "release_channel": "lorem"
  }
}
Gets project claim token
get
/v1/projects/{ref}/claim-token
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "token_alias": "lorem",
  "expires_at": "lorem",
  "created_at": "lorem",
  "created_by": "fbdf5a53-161e-4460-98ad-0e39408d8689"
}
Gets project's service health status
get
/v1/projects/{ref}/health
Path parameters
ref
Required
string
Project ref

Details
Query parameters
services
Required
Array<enum>
timeout_ms
Optional
integer
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "name": "auth",
    "healthy": true,
    "status": "COMING_UP",
    "info": {
      "name": "GoTrue",
      "version": "lorem",
      "description": "lorem"
    },
    "error": "lorem"
  }
]
[Beta] Gets project's network bans
post
/v1/projects/{ref}/network-bans/retrieve
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

example

schema
{
  "banned_ipv4_addresses": [
    "lorem"
  ]
}
[Beta] Gets project's network bans with additional information about which databases they affect
post
/v1/projects/{ref}/network-bans/retrieve/enriched
Path parameters
ref
Required
string
Project ref

Details
Response codes
201
403
500
Response (201)

example

schema
{
  "banned_ipv4_addresses": [
    {
      "banned_address": "lorem",
      "identifier": "lorem",
      "type": "lorem"
    }
  ]
}
List all projects
get
/v1/projects
Returns a list of all projects you've previously created.

Response codes
200
Response (200)

example

schema
[
  {
    "id": "lorem",
    "organization_id": "lorem",
    "name": "lorem",
    "region": "us-east-1",
    "created_at": "2023-03-29T16:32:59Z",
    "status": "INACTIVE",
    "database": {
      "host": "lorem",
      "version": "lorem",
      "postgres_engine": "lorem",
      "release_channel": "lorem"
    }
  }
]
Lists available restore versions for the given project
get
/v1/projects/{ref}/restore
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "available_versions": [
    {
      "version": "lorem",
      "release_channel": "internal",
      "postgres_engine": "13"
    }
  ]
}
Pauses the given project
post
/v1/projects/{ref}/pause
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

schema
{}
Restores the given project
post
/v1/projects/{ref}/restore
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

schema
{}
[Beta] Updates project's network restrictions
post
/v1/projects/{ref}/network-restrictions/apply
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
dbAllowedCidrs
Optional
Array<string>
dbAllowedCidrsV6
Optional
Array<string>
Response codes
201
403
500
Response (201)

example

schema
{
  "entitlement": "disallowed",
  "config": {
    "dbAllowedCidrs": [
      "lorem"
    ],
    "dbAllowedCidrsV6": [
      "lorem"
    ]
  },
  "old_config": {
    "dbAllowedCidrs": [
      "lorem"
    ],
    "dbAllowedCidrsV6": [
      "lorem"
    ]
  },
  "status": "stored"
}
[Beta] Upgrades the project's Postgres version
post
/v1/projects/{ref}/upgrade
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
target_version
Required
string
release_channel
Optional
enum
Accepted values
Response codes
201
403
500
Response (201)

example

schema
{
  "tracking_id": "lorem"
}
Gets project's postgrest config
get
/v1/projects/{ref}/postgrest
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "db_schema": "lorem",
  "max_rows": 42,
  "db_extra_search_path": "lorem",
  "db_pool": 42,
  "jwt_secret": "lorem"
}
Updates project's postgrest config
patch
/v1/projects/{ref}/postgrest
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
db_extra_search_path
Optional
string
db_schema
Optional
string
max_rows
Optional
integer
db_pool
Optional
integer
Response codes
200
403
500
Response (200)

example

schema
{
  "db_schema": "lorem",
  "max_rows": 42,
  "db_extra_search_path": "lorem",
  "db_pool": 42
}
Bulk create secrets
post
/v1/projects/{ref}/secrets
Creates multiple secrets and adds them to the specified project.

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
Array of object
Object schema
Response codes
201
403
500
Response (201)

schema
{}
Bulk delete secrets
delete
/v1/projects/{ref}/secrets
Deletes all secrets with the given names from the specified project

Path parameters
ref
Required
string
Project ref

Details
Body

application/json
Array of string
Response codes
200
403
500
Response (200)

schema
{}
Creates a new API key for the project
post
/v1/projects/{ref}/api-keys
Path parameters
ref
Required
string
Project ref

Details
Query parameters
reveal
Optional
boolean
Boolean string, true or false

Body

application/json
type
Required
enum
Accepted values
name
Required
string
Details
description
Optional
string
secret_jwt_template
Optional
object
Object schema
Response codes
201
403
Response (201)

example

schema
{
  "api_key": "lorem",
  "id": "lorem",
  "type": "legacy",
  "prefix": "lorem",
  "name": "lorem",
  "description": "lorem",
  "hash": "lorem",
  "secret_jwt_template": {
    "property1": null,
    "property2": null
  },
  "inserted_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Deletes an API key for the project
delete
/v1/projects/{ref}/api-keys/{id}
Path parameters
ref
Required
string
Project ref

Details
id
Required
string
Query parameters
reveal
Optional
boolean
Boolean string, true or false

was_compromised
Optional
boolean
Boolean string, true or false

reason
Optional
string
Response codes
200
403
Response (200)

example

schema
{
  "api_key": "lorem",
  "id": "lorem",
  "type": "legacy",
  "prefix": "lorem",
  "name": "lorem",
  "description": "lorem",
  "hash": "lorem",
  "secret_jwt_template": {
    "property1": null,
    "property2": null
  },
  "inserted_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
[Beta] Gets project's pgsodium config
get
/v1/projects/{ref}/pgsodium
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "root_key": "lorem"
}
Get API key
get
/v1/projects/{ref}/api-keys/{id}
Path parameters
ref
Required
string
Project ref

Details
id
Required
string
Query parameters
reveal
Optional
boolean
Boolean string, true or false

Response codes
200
403
Response (200)

example

schema
{
  "api_key": "lorem",
  "id": "lorem",
  "type": "legacy",
  "prefix": "lorem",
  "name": "lorem",
  "description": "lorem",
  "hash": "lorem",
  "secret_jwt_template": {
    "property1": null,
    "property2": null
  },
  "inserted_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Get project api keys
get
/v1/projects/{ref}/api-keys
Path parameters
ref
Required
string
Project ref

Details
Query parameters
reveal
Optional
boolean
Boolean string, true or false

Response codes
200
403
Response (200)

example

schema
[
  {
    "api_key": "lorem",
    "id": "lorem",
    "type": "legacy",
    "prefix": "lorem",
    "name": "lorem",
    "description": "lorem",
    "hash": "lorem",
    "secret_jwt_template": {
      "property1": null,
      "property2": null
    },
    "inserted_at": "2021-12-31T23:34:00Z",
    "updated_at": "2021-12-31T23:34:00Z"
  }
]
Check whether JWT based legacy (anon, service_role) API keys are enabled. This API endpoint will be removed in the future, check for HTTP 404 Not Found.
get
/v1/projects/{ref}/api-keys/legacy
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
Response (200)

example

schema
{
  "enabled": true
}
List all secrets
get
/v1/projects/{ref}/secrets
Returns all secrets you've previously added to the specified project.

Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "name": "lorem",
    "value": "lorem",
    "updated_at": "lorem"
  }
]
[Beta] Updates project's pgsodium config. Updating the root_key can cause all data encrypted with the older key to become inaccessible.
put
/v1/projects/{ref}/pgsodium
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
root_key
Required
string
Response codes
200
403
500
Response (200)

example

schema
{
  "root_key": "lorem"
}
Updates an API key for the project
patch
/v1/projects/{ref}/api-keys/{id}
Path parameters
ref
Required
string
Project ref

Details
id
Required
string
Query parameters
reveal
Optional
boolean
Boolean string, true or false

Body

application/json
name
Optional
string
Details
description
Optional
string
secret_jwt_template
Optional
object
Object schema
Response codes
200
403
Response (200)

example

schema
{
  "api_key": "lorem",
  "id": "lorem",
  "type": "legacy",
  "prefix": "lorem",
  "name": "lorem",
  "description": "lorem",
  "hash": "lorem",
  "secret_jwt_template": {
    "property1": null,
    "property2": null
  },
  "inserted_at": "2021-12-31T23:34:00Z",
  "updated_at": "2021-12-31T23:34:00Z"
}
Disable or re-enable JWT based legacy (anon, service_role) API keys. This API endpoint will be removed in the future, check for HTTP 404 Not Found.
put
/v1/projects/{ref}/api-keys/legacy
Path parameters
ref
Required
string
Project ref

Details
Query parameters
enabled
Required
boolean
Boolean string, true or false

Response codes
200
403
Response (200)

example

schema
{
  "enabled": true
}
Gets project's storage config
get
/v1/projects/{ref}/config/storage
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
{
  "fileSizeLimit": 42,
  "features": {
    "imageTransformation": {
      "enabled": true
    },
    "s3Protocol": {
      "enabled": true
    },
    "icebergCatalog": {
      "enabled": true
    }
  }
}
Lists all buckets
get
/v1/projects/{ref}/storage/buckets
Path parameters
ref
Required
string
Project ref

Details
Response codes
200
403
500
Response (200)

example

schema
[
  {
    "id": "lorem",
    "name": "lorem",
    "owner": "lorem",
    "created_at": "lorem",
    "updated_at": "lorem",
    "public": true
  }
]
Updates project's storage config
patch
/v1/projects/{ref}/config/storage
Path parameters
ref
Required
string
Project ref

Details
Body

application/json
fileSizeLimit
Optional
integer
features
Optional
object
Object schema
Response codes
200
403
500