# Specification: expert-finder-agent

> **Guidelines**: Read all applicable guidelines before executing ANY tasks below:
> - [guidelines.md](../guidelines.md) — Universal execution rules
> - [guidelines-agent.md](../guidelines-agent.md) — Universal agent patterns
> - [guidelines-agent-python.md](../guidelines-agent-python.md) — Python implementation details
> - [guidelines-agent-skills.md](../guidelines-agent-skills.md) — Runtime skills patterns
> - [guidelines-agent-mcp.md](../guidelines-agent-mcp.md) — MCP integration patterns

---

## Basic Setup

- [ ] Read `product-requirements-document.md` and `intent.md` from the solution root as the authoritative input for this agent.
- [ ] Bootstrap agent code in `assets/expert-finder-agent/` using instructions from the `sap-agent-bootstrap` section. Invoke from inside `assets/expert-finder-agent/`, use copy commands — do NOT create files manually.
- [ ] Install dependencies and validate the agent starts and responds at `/.well-known/agent.json`.

---

## API Specs & MCP Translation

The following SuccessFactors OData API specs have been downloaded and are ready for MCP translation:

| API Name | ORD ID | Spec File |
|---|---|---|
| Employee Profile | `sap.sf:apiResource:ECEmployeeProfile:v1` | `specification/expert-finder-agent/api-specs/ECEmployeeProfile.edmx` |
| Skills Management | `sap.sf:apiResource:ECSkillsManagement:v1` | `specification/expert-finder-agent/api-specs/ECSkillsManagement.edmx` |

**MCP tool scopes:**

```
MCP API: sap.sf:apiResource:ECEmployeeProfile:v1
MCP tool scope: read-only
Resources in scope: PerPerson, PerPersonal, EmpEmployment, EmpJob, EmpJobRelationships, PerEmail, PerPhone
```

```
MCP API: sap.sf:apiResource:ECSkillsManagement:v1
MCP tool scope: read-only
Resources in scope: all
```

- [ ] Invoke the `mcp-translation-file` skill to generate MCP translation cards for both API specs:
  - Input: `specification/expert-finder-agent/api-specs/ECEmployeeProfile.edmx`
  - Input: `specification/expert-finder-agent/api-specs/ECSkillsManagement.edmx`
  - Outputs are written to `specification/expert-finder-agent/mcps/<api-spec-stem>/` per the skill's convention.
- [ ] Invoke `setup-solution` skill to create and register the two MCP server assets generated from the translation cards.
- [ ] After `setup-solution` completes, read the generated `asset.yaml` files from each MCP server asset and copy the exact `ordId` values into the agent's `asset.yaml` `requires` section.
  - **NEVER invent or guess ORD IDs — use only values returned by the generated asset.yaml files.**

---

## Runtime Skills

This agent handles a complex multi-step workflow with domain-specific filtering rules. The following runtime skills are required:

- [ ] Create `assets/expert-finder-agent/app/skills/expert-search/SKILL.md` — step-by-step instructions for the expert search and ranking workflow:
  - When to invoke: when the user provides a domain/expertise query.
  - Steps: (1) parse query intent and extract domain keywords; (2) fetch SuccessFactors employee profiles matching domain; (3) fetch skills data for matching employees; (4) apply seniority filter (L2 band: exclude grade below minimum and exclude L1/Board); (5) apply conflict-of-interest filter (exclude employees whose org unit or job role matches the configured roadmap exclusion list); (6) enrich each candidate with SAP Community and LinkedIn signals; (7) score and rank candidates; (8) generate match explanation per candidate.
  - Reference files: `references/seniority-config.md` (seniority band grade range placeholder) and `references/coi-exclusion-config.md` (conflict-of-interest role/org-unit exclusion list placeholder).

- [ ] Create `assets/expert-finder-agent/app/skills/expert-search/references/seniority-config.md` — placeholder document describing how to interpret the L2 seniority band from SuccessFactors job grade data. Note that exact grade codes must be confirmed with HR; use configurable environment variable `SF_SENIORITY_MIN_GRADE` and `SF_SENIORITY_MAX_GRADE`.

- [ ] Create `assets/expert-finder-agent/app/skills/expert-search/references/coi-exclusion-config.md` — placeholder document describing conflict-of-interest role/org-unit exclusion rules. Note that the exact list is maintained by a Tool Administrator; use configurable environment variable `COI_EXCLUDED_ORG_UNITS` (comma-separated) and `COI_EXCLUDED_JOB_ROLES` (comma-separated).

- [ ] Create `assets/expert-finder-agent/app/skills/meeting-request/SKILL.md` — instructions for the meeting-request workflow:
  - When to invoke: when the user clicks "Request 30-min review" or asks to schedule a call with a specific expert.
  - Steps: (1) confirm expert name and user's intent; (2) call the Microsoft Graph calendar connector MCP tool to create a 30-minute calendar invite with subject "SAP Expert Review - [domain]", attendees [user + expert], and body containing the match explanation; (3) confirm creation to the user.
  - Guardrail: NEVER send a calendar invite without explicit user confirmation.

---

## Project-Specific Tasks

### R1 — Natural-Language and Filter-Based Expert Search

- [ ] Implement system prompt in `assets/expert-finder-agent/app/agent.py` that instructs the agent to:
  - Accept natural-language queries describing the type of expert needed (e.g. "supply chain expert familiar with SAP IBP").
  - Load the `expert-search` runtime skill to guide the search workflow.
  - Always set `top` to a maximum of 100 on any SuccessFactors tool call that supports pagination.
  - Never fabricate, guess, or invent employee data — all data must come from MCP tool calls.
  - Relay tool errors verbatim without embellishment.
- [ ] Implement a tool `search_experts(query: str, domain: str | None, region: str | None) -> list[ExpertCandidate]` that:
  - Calls the SuccessFactors Employee Profile MCP tools to fetch employees matching the domain keywords.
  - Calls the SuccessFactors Skills Management MCP tools to fetch skills data for matched employees.
  - Returns a list of `ExpertCandidate` objects (name, employee ID, job title, org unit, job grade, skills list, region).
- [ ] Implement support for optional structured filters: `domain`, `region` (off by default — worldwide search), applied after the SuccessFactors data fetch.

### R2 — Automatic Seniority Filtering

- [ ] Implement a `apply_seniority_filter(candidates: list[ExpertCandidate]) -> list[ExpertCandidate]` function that:
  - Reads `SF_SENIORITY_MIN_GRADE` and `SF_SENIORITY_MAX_GRADE` environment variables.
  - Excludes employees whose job grade is below the minimum or above the maximum.
  - Logs each exclusion: `[FILTER.seniority_excluded]: employee_id={id}, grade={grade}`.
  - Returns only candidates within the configured seniority band.
- [ ] Emit milestone log on filter completion: `M3.achieved: Seniority and conflict-of-interest filters operational and validated`.
- [ ] Emit milestone log on filter failure: `M3.missed: One or more eligibility filters not operational — results may include ineligible experts`.

### R3 — Automatic Conflict-of-Interest Filtering

- [ ] Implement a `apply_coi_filter(candidates: list[ExpertCandidate]) -> list[ExpertCandidate]` function that:
  - Reads `COI_EXCLUDED_ORG_UNITS` and `COI_EXCLUDED_JOB_ROLES` environment variables (comma-separated).
  - Excludes employees whose org unit or job role matches any entry in the exclusion lists.
  - Logs each exclusion: `[FILTER.coi_excluded]: employee_id={id}, reason=org_unit|job_role`.
  - Returns only candidates not matching any exclusion rule.
- [ ] Both seniority and CoI filters must be applied before any candidate is ranked or returned to the user (eligibility by default principle).

### R4 — Ranked Results with AI-Generated Match Explanation

- [ ] Implement a `rank_and_explain(candidates: list[ExpertCandidate], query: str, enriched_signals: dict) -> list[RankedExpert]` function that:
  - Uses the LLM (via LiteLLM / SAP Generative AI Hub) to score and rank candidates against the query.
  - Generates a concise match explanation per candidate (max 3 sentences): why this person matches, their seniority confirmation, and at least one external signal if available.
  - Falls back to "Matched based on skills profile" if the LLM fails to generate an explanation.
  - Caps LLM prompt token length to prevent cost overrun (use `max_tokens=300` per explanation).
- [ ] Each `RankedExpert` must carry: rank, name, job title, region, match explanation, seniority confirmed flag, coi_clear flag, external signals (list of links, may be empty), and confidence indicator ("Limited profile data available" if skills list is empty).
- [ ] Emit milestone log: `M4.achieved: Expert search, ranking, and explanation generation live end-to-end`.

### R5 — External Expertise Enrichment (SAP Community + LinkedIn)

- [ ] Implement a `enrich_with_external_signals(candidates: list[ExpertCandidate]) -> dict[str, list[ExternalSignal]]` function that:
  - For each candidate, queries the SAP Community Network for blog posts/articles authored by that person (use SAP Community search URL pattern as a web-search tool call; do not scrape directly).
  - For each candidate, queries LinkedIn via web-search fallback (LinkedIn API is not guaranteed; always use web-search as the mechanism).
  - Returns a dict mapping employee ID to a list of `ExternalSignal` objects (source: "sap_community"|"linkedin", title, url).
  - If enrichment fails for an individual candidate, continues silently — returns an empty list for that candidate; never raises an exception.
- [ ] External signals must be represented as links only — no personal data is copied or stored.
- [ ] Emit milestone log: `M2.achieved: External enrichment connectors active — Community and LinkedIn signals visible in results`.
- [ ] Emit milestone log on failure: `M2.missed: External enrichment not active — results limited to internal SuccessFactors data only`.

### R6 — 30-Minute Review Call Request

- [ ] Implement a `request_review_call(expert: RankedExpert, requester_context: str) -> MeetingRequestResult` tool that:
  - Requires explicit confirmation from the user before sending a calendar invite.
  - Calls the Microsoft Graph calendar API (mocked in tests) to create a 30-minute calendar invite with:
    - Subject: `SAP Expert Review - [domain from query]`
    - Attendees: requesting user + expert (email from SuccessFactors profile)
    - Body: match explanation + a brief context note from `requester_context`.
  - Returns success/failure status and the created event ID.
  - **This tool must never be called by the agent autonomously — it must only be invoked when the user explicitly requests it.**
- [ ] Add to system prompt: "NEVER send a calendar invite or meeting request without explicit user confirmation. Always confirm the expert name and purpose before calling the request_review_call tool."
- [ ] Emit milestone log: `M5.achieved: Meeting request action operational via Microsoft Graph`.
- [ ] Emit milestone log on failure: `M5.missed: Meeting request not operational — users must schedule calls manually`.

### R7 — Global Results with No Geographic Restriction

- [ ] Ensure SuccessFactors queries do not apply any geographic filter by default.
- [ ] Implement an optional `region` parameter in `search_experts` that applies a region filter only when explicitly supplied by the user.
- [ ] System prompt must include: "Return experts from all SAP regions worldwide by default. Only apply a region filter if the user explicitly requests it."

### R8 — Saved Expert Shortlists (High-Want)

- [ ] Implement in-memory shortlist management: `save_to_shortlist(expert: RankedExpert, review_name: str)`, `get_shortlist(review_name: str) -> list[RankedExpert]`, `list_shortlists() -> list[str]`.
- [ ] Note: shortlists are session-scoped (in-memory only per the architecture). Persistence across sessions is out of scope for v1.

### R9 — Expert Availability Signal (High-Want)

- [ ] Implement a `get_availability_signal(expert_email: str) -> AvailabilitySignal` tool that calls the Microsoft Graph out-of-office/availability API (mocked in tests) to return an availability status (available / out-of-office / unknown).
- [ ] Surface availability signal in the `RankedExpert` model as an optional field.

### Guardrails Implementation

- [ ] Add the following guardrails to the agent system prompt:
  - "NEVER write to or modify data in SAP SuccessFactors. All SuccessFactors interactions are strictly read-only."
  - "NEVER send a calendar invite or meeting request without explicit user confirmation."
  - "If a tool returns an error, report the error message exactly as received. Do not suggest workarounds."
  - "If SuccessFactors is unavailable, inform the user clearly: 'Expert search is temporarily unavailable — SuccessFactors data cannot be retrieved.'"
  - "LinkedIn and SAP Community enrichment failures are silent — return internal-only results without informing the user of the enrichment failure."

---

## SuccessFactors Data Milestone

- [ ] Validate that the SuccessFactors Employee Profile and Skills MCP tools return employee data end-to-end.
- [ ] Emit milestone log: `M1.achieved: SuccessFactors employee profile and skills data ingestion operational`.
- [ ] Emit milestone log on failure: `M1.missed: SuccessFactors data ingestion not completed — search functionality unavailable`.

---

## Business Instrumentation

- [ ] Implement business step instrumentation for each milestone from the PRD using the pattern `[MILESTONE_ID].[achieved|missed]: [description]` and OpenTelemetry custom spans.
  - M1: SuccessFactors data ingestion operational / not completed
  - M2: External enrichment connectors active / not active
  - M3: Seniority and conflict-of-interest filters operational / not operational
  - M4: Search, ranking, and explanation generation live / not operational
  - M5: Meeting request action operational / not operational
- [ ] For `stream()` in `agent.py`: extract all business logic into a plain async helper method `_run_agent()` to avoid `GeneratorExit` context errors with OpenTelemetry spans. Instrument `_run_agent()` with spans; call it from `stream()` and yield results outside any span context.
- [ ] Verify `bootstrap(app)` is called after `app = server.build()` in `main.py`.

---

## MCP Tool Integration

- [ ] After `mcp-translation-file` and `setup-solution` complete, read each generated MCP server `asset.yaml` and add exact `ordId` values to `assets/expert-finder-agent/asset.yaml` under `requires`:
  ```yaml
  requires:
    - name: ec-employee-profile-mcp-server
      kind: mcp-server
      ordId: <exact ordId from generated asset.yaml>
    - name: ec-skills-management-mcp-server
      kind: mcp-server
      ordId: <exact ordId from generated asset.yaml>
  ```
- [ ] Wire MCP tool loading in `agent.py` using `get_mcp_tools()` from the `mcp_tools` module — NEVER import directly from `sap_cloud_sdk.agentgateway`.
- [ ] Generate `mcp-mock.json` using the `mcp-mock-config` skill after MCP server assets are complete.

---

## Testing

- [ ] `conftest.py` sets only `IBD_TESTING=true`.
- [ ] Write unit tests in `assets/expert-finder-agent/tests/`:
  - `test_search_experts.py` — tests `search_experts` tool with mocked SuccessFactors MCP responses.
  - `test_seniority_filter.py` — tests `apply_seniority_filter` with employees at, above, and below grade bounds.
  - `test_coi_filter.py` — tests `apply_coi_filter` with employees matching and not matching exclusion lists.
  - `test_rank_and_explain.py` — tests `rank_and_explain` with mocked LLM responses; verifies fallback explanation on LLM failure.
  - `test_enrich_external_signals.py` — tests `enrich_with_external_signals`; verifies silent failure when enrichment errors.
  - `test_request_review_call.py` — tests `request_review_call` with mocked Microsoft Graph responses; verifies tool cannot be invoked without prior user confirmation in the agent flow.
  - `test_get_availability_signal.py` — tests `get_availability_signal` with mocked Microsoft Graph out-of-office responses.
- [ ] Write one integration test in `assets/expert-finder-agent/tests/test_integration.py` — end-to-end flow: user submits a natural-language query → agent returns a ranked list with explanations → user requests a meeting → calendar invite created. All external systems mocked.
- [ ] Run `pytest` from `assets/expert-finder-agent/` (no args). Fix any failures before proceeding.
- [ ] Verify coverage ≥ 70%; add targeted tests if below threshold.
- [ ] Run `pytest` again from `assets/expert-finder-agent/` (no args) to generate final `test_report.json`.
- [ ] Verify `test_report.json` exists in `assets/expert-finder-agent/`.
