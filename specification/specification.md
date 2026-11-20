# Specification — SAP Expert Finder

> **Guidelines**: Read [guidelines.md](./guidelines.md) before executing ANY tasks below.

Check off items as completed.

---

## Solution Setup

- [x] Create asset directories:
  ```bash
  mkdir -p assets/expert-finder-agent assets/expert-finder-cap
  ```
- [x] Invoke `setup-solution` skill to create `solution.yaml` and `asset.yaml` files for every asset:
  - `assets/expert-finder-agent/` — Python AI Agent
  - `assets/expert-finder-cap/` — CAP Application (backend + React UI)
- [x] Validate that `solution.yaml` (at solution root), `assets/expert-finder-agent/asset.yaml`, and `assets/expert-finder-cap/asset.yaml` all exist and are well-formed.

---

## Asset Implementation

- [x] Execute `specification/expert-finder-agent/specification.md` (all items)
- [x] Execute `specification/expert-finder-cap/specification.md` (all items)

---

## Cross-Asset Compatibility Check

After both assets are implemented, verify the following:

- [x] **Agent endpoint**: `AGENT_ENDPOINT_URL` environment variable in the CAP backend points to the correct AI agent endpoint (`/.well-known/agent.json` base URL). Confirm the CAP service can reach the agent via A2A protocol.
- [ ] **API contract**: Confirm the CAP `ExpertResult` type matches the JSON shape returned by the agent's `search_experts` tool output. Fix any field name or type mismatches.
- [ ] **MeetingRequestResult contract**: Confirm the CAP `MeetingRequestResult` type matches the agent's `request_review_call` tool output shape.
- [ ] **Authentication propagation**: Confirm that user identity is correctly forwarded from the CAP service to the agent invocation (user context / JWT).
- [ ] **Error handling alignment**: Confirm the CAP service correctly maps agent error responses (503, 500) to appropriate UI-facing error messages.
- [ ] **Environment variables**: Document all required environment variables in a `README-env.md` file at the solution root:
  | Variable | Asset | Purpose |
  |---|---|---|
  | `AGENT_ENDPOINT_URL` | CAP backend | URL of the AI agent A2A endpoint |
  | `SF_SENIORITY_MIN_GRADE` | AI agent | Minimum SuccessFactors job grade for L2 band |
  | `SF_SENIORITY_MAX_GRADE` | AI agent | Maximum SuccessFactors job grade for L2 band |
  | `COI_EXCLUDED_ORG_UNITS` | AI agent | Comma-separated org unit codes to exclude (CoI) |
  | `COI_EXCLUDED_JOB_ROLES` | AI agent | Comma-separated job role codes to exclude (CoI) |
  | `AICORE_LLM_MODEL` | AI agent | LLM model identifier for SAP Generative AI Hub |
  | `MSGRAPH_CLIENT_ID` | AI agent | Microsoft Graph app registration client ID |
  | `MSGRAPH_CLIENT_SECRET` | AI agent | Microsoft Graph app registration client secret |
  | `MSGRAPH_TENANT_ID` | AI agent | Microsoft 365 tenant ID |

---

## API Discoveries Recorded

The following API spec files have been downloaded and are consumed by the `expert-finder-agent` asset via the `mcp-translation-file` skill:

| API Name | ORD ID | Local Spec File | Type |
|---|---|---|---|
| Employee Profile | `sap.sf:apiResource:ECEmployeeProfile:v1` | `specification/expert-finder-agent/api-specs/ECEmployeeProfile.edmx` | OData |
| Skills Management | `sap.sf:apiResource:ECSkillsManagement:v1` | `specification/expert-finder-agent/api-specs/ECSkillsManagement.edmx` | OData |
