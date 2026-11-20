# Environment Variables — SAP Expert Finder

All required environment variables for the Expert Finder solution.

## AI Agent (`expert-finder-agent`)

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `AGENT_ENDPOINT_URL` | ✅ | Base URL of the AI agent A2A endpoint (used by CAP backend) | `https://expert-finder-agent.cfapps.sap.hana.ondemand.com` |
| `SF_SENIORITY_MIN_GRADE` | ✅ | Minimum SuccessFactors job grade for the L2 seniority band | `M2` |
| `SF_SENIORITY_MAX_GRADE` | ✅ | Maximum SuccessFactors job grade for the L2 seniority band | `M4` |
| `COI_EXCLUDED_ORG_UNITS` | ✅ | Comma-separated org unit codes to exclude (conflict-of-interest) | `PROD_ROADMAP,STRATEGY_PMO` |
| `COI_EXCLUDED_JOB_ROLES` | ✅ | Comma-separated job role codes to exclude (conflict-of-interest) | `CHIEF_OF_STAFF,PRODUCT_MANAGER` |
| `AICORE_LLM_MODEL` | ✅ | LLM model identifier for SAP Generative AI Hub | `sap/anthropic--claude-4.5-sonnet` |
| `MSGRAPH_CLIENT_ID` | ⚠️ | Microsoft Graph app registration client ID (for calendar invites) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `MSGRAPH_CLIENT_SECRET` | ⚠️ | Microsoft Graph app registration client secret | `<secret>` |
| `MSGRAPH_TENANT_ID` | ⚠️ | Microsoft 365 tenant ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

## CAP Backend (`expert-finder-cap`)

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `AGENT_ENDPOINT_URL` | ✅ | URL of the AI agent A2A endpoint | `https://expert-finder-agent.cfapps.sap.hana.ondemand.com` |
| `PORT` | optional | HTTP port for the CAP service | `4004` |

## Notes
- ⚠️ Microsoft Graph variables are required for the "Request 30-min review" feature. Without them, the calendar invite flow will not work — search and shortlist features remain available.
- Grade codes (`SF_SENIORITY_MIN_GRADE`, `SF_SENIORITY_MAX_GRADE`) must be confirmed with SAP HR as they depend on the internal job architecture.
- CoI exclusion lists should be reviewed with the SAP Legal / Ethics & Compliance team.
- All secrets must be provided via platform secret management — never hardcode values in source files.
