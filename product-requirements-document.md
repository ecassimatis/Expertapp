# Product Requirements Document (PRD)

**Title:** SAP Expert Finder  
**Date:** 2026-10-21  
**Owner:** SAP Business Development / Ecosystem Team  
**Solution Category:** CAP Application (Backend + UI) + Python AI Agent

---

## Product Purpose & Value Proposition

**Elevator Pitch:**  
Partnership and ecosystem teams at SAP spend 1–3 days finding the right internal expert for a company review. SAP Expert Finder reduces that to minutes — a search tool backed by an AI agent that matches queries to qualified, unconflicted SAP employees worldwide.

**Business Need:**  
There is no internal tool that combines employee skills data, seniority context, and conflict-of-interest awareness in a single searchable interface. Today's process relies on informal networking and email chains, introducing delays that slow down partner evaluation cycles and risk missing time-sensitive ecosystem opportunities.

**Expected Value:**  
- Expert identification time drops from 1–3 days to within a single session (minutes).
- 10–50 monthly reviews completed with less friction and without manual expert sourcing.
- Reduced legal and compliance risk by automatically excluding employees with product roadmap responsibility.

**Product Objectives (Prioritized):**
1. Enable same-session expert identification for any domain, worldwide, with no manual sourcing.
2. Automate seniority and conflict-of-interest filtering to ensure every result is a qualified, eligible reviewer.
3. Surface external expertise signals (SAP Community, LinkedIn) to improve match quality beyond job title alone.
4. Provide a one-click meeting-request action so the reviewer can immediately engage the expert.

---

## Business Metrics

| Metric | Baseline | Target | Timeline | Process / Capability | Source |
|--------|----------|--------|----------|----------------------|--------|
| Time to identify a qualified expert | 1–3 days | Minutes (same session) | — | Partner / ecosystem review matching | User |
| Monthly reviews supported without friction | 10–50 reviews with 1–3 day sourcing effort | 10–50 reviews with same-session expert identification | — | Expert matching & scheduling | User |

---

## User Profiles & Personas

### Primary Persona: Alex — Partnership Reviewer

Alex is a 35-year-old Senior Business Development Manager at SAP, focused on evaluating potential new partners and ISVs for SAP's ecosystem. They handle 5–10 company reviews per month and spend a disproportionate amount of time simply finding the right internal SAP colleague who can assess whether a company's technology is a genuine fit. Alex is not deeply technical but understands domains well enough to judge fit at a high level. Their frustration: "I know there must be someone inside SAP who knows this space, but I just can't find them quickly." Alex needs a tool that respects their time, surfaces credible experts fast, and lets them act immediately.

### Secondary Persona: Jamie — Ecosystem / ISV Team Member

Jamie is a 31-year-old Ecosystem Architect on SAP's Build and agent platform team. Their job involves identifying companies that could extend or integrate with the SAP ecosystem, particularly for the emerging AI agent marketplace. Jamie is technically comfortable and often researches companies through LinkedIn, SAP Community posts, and GitHub. They want a tool that goes beyond internal directories and surfaces experts based on demonstrated real-world knowledge, not just job titles.

### Other User Types

- **Expert Candidate** (SAP internal employee): Receives a review request via calendar invite and is notified why they were selected. Needs enough context to decide whether to accept.
- **Tool Administrator**: Responsible for configuring role exclusion lists (roadmap roles), seniority band mappings, and enrichment source settings.

---

## User Goals & Tasks

### For Alex (Partnership Reviewer):

**Goals:**
- Identify the right SAP internal expert for a given domain in the same working session.
- Ensure the expert is eligible (right seniority, not conflicted) without manual vetting.
- Request a 30-minute review call without leaving the tool.

**Key Tasks:**
- Enter a domain or expertise area in natural language or select from predefined filters.
- Review the ranked list of matched experts with explanations.
- Request a meeting with a selected expert directly from the results.

### For Jamie (Ecosystem / ISV Team Member):

**Goals:**
- Find experts with demonstrated real-world expertise, not just a matching job title.
- Discover experts globally across all SAP regions.

**Key Tasks:**
- Search by domain and optionally refine by region or availability.
- Review external signals (community posts, publications) linked to each expert's profile.
- Request a review call or save the expert's profile for future reference.

---

## Product Principles

1. **Speed over completeness**: Return a good-enough ranked list in seconds rather than a perfect list in minutes. Users need to act, not wait.
2. **Eligibility by default**: Every result shown must already pass seniority and conflict-of-interest filters. Users should never need to manually check eligibility.
3. **Evidence-backed matches**: Every expert card must show why this person was recommended — a match explanation grounded in skills, role, and external signals, not black-box scoring.
4. **Human in the loop for edge cases**: The system recommends; the human decides and requests. No automated outreach without explicit user action.
5. **Privacy-aware enrichment**: External signals (LinkedIn, Community) are referenced, not stored or aggregated without consent. Display links, not scraped personal data.

---

## Business Context

**Current State:**  
Identifying an internal expert requires searching informal channels — asking colleagues, browsing the internal directory, or searching SAP Community manually. There is no consolidated tool. The process is biased toward locally known colleagues, excludes global talent, and takes 1–3 working days.

**Strategic Alignment:**  
SAP's ecosystem and Build platform strategy depends on fast, accurate partner evaluation. Delays in finding reviewers directly delay partnership decisions. This tool accelerates the evaluation motion that underpins SAP's partner and ISV growth strategy.

**Success Criteria:**  
See Business Metrics above.

---

## Goals and Non-Goals

### Goals (In Scope)

- Enable natural-language and filter-based search for internal SAP experts by domain.
- Automatically filter results by seniority band (L2 equivalent) and exclude employees in product roadmap roles.
- Enrich employee profiles with SAP Community authorship and LinkedIn expertise signals.
- Return a ranked, explained list of matching experts with no geographic restriction.
- Allow users to send a 30-minute review call request directly from the tool via Microsoft Graph.

### Non-Goals (Out of Scope)

- Managing or tracking the outcome of partner evaluations or review conversations.
- Updating or correcting data in SAP SuccessFactors — the tool reads, never writes.
- Replacing existing HR processes, performance management, or succession planning workflows.
- Providing a public-facing directory accessible outside of SAP's internal network.
- Automating the review itself — the tool only facilitates finding and connecting with the right expert.

---

## Requirements

### Must-Have Requirements

**R1: Natural-Language and Filter-Based Expert Search**

- **Problem to Solve**: Users cannot quickly find relevant experts because no single tool combines skill, seniority, and domain search.
- **User Story**: As a Partnership Reviewer, I need to describe the type of expert I'm looking for in plain language or via filters so that I receive a relevant list of candidates without manual research.
- **Acceptance Criteria**:
  - Given a user types "supply chain expert familiar with SAP IBP and partner integrations", when they submit the query, then the system returns a ranked list of matching internal employees.
  - Given a user applies domain and seniority filters, when they submit, then only results matching those filters are shown.
- **Maps to Objective**: Objective 1
- **Priority Rank**: 1

**R2: Automatic Seniority Filtering**

- **Problem to Solve**: Results include employees who are too junior to credibly evaluate a company, or too senior (Board/L1) to be available for a 30-minute call.
- **User Story**: As a user, I need the tool to automatically limit results to the L2 seniority band so that I only see experts who are experienced enough and available.
- **Acceptance Criteria**:
  - Given the search runs, when results are compiled, then employees classified as Board or L1 are automatically excluded.
  - Given the search runs, then employees below the L2 minimum grade threshold are also excluded.
  - Given a user with administrator rights, when they adjust seniority band configuration, then the filter updates accordingly.
- **Maps to Objective**: Objective 2
- **Priority Rank**: 2

**R3: Automatic Conflict-of-Interest Filtering**

- **Problem to Solve**: Employees responsible for product roadmap content cannot objectively evaluate external companies without exposing confidential information.
- **User Story**: As a user, I need employees in product roadmap roles to be automatically excluded from results so that every suggested expert is free from conflict of interest.
- **Acceptance Criteria**:
  - Given an employee's job role or org unit is on the configured roadmap-exclusion list, when a search runs, then that employee does not appear in results.
  - Given an administrator, when they update the exclusion list, then subsequent searches reflect the change.
- **Maps to Objective**: Objective 2
- **Priority Rank**: 3

**R4: Ranked Results with AI-Generated Match Explanation**

- **Problem to Solve**: A raw list of names with job titles is not actionable — users need to understand why each person is a good match.
- **User Story**: As a Partnership Reviewer, I need each result to include a concise explanation of why this person matches my query so that I can quickly decide whom to contact.
- **Acceptance Criteria**:
  - Given results are returned, then each result card displays: name, current role, domain match rationale, seniority confirmation, and at least one external expertise signal if available.
  - Given no external signal exists for an expert, then the card shows only internal profile data without an error state.
- **Maps to Objective**: Objectives 1 and 3
- **Priority Rank**: 4

**R5: External Expertise Enrichment (SAP Community + LinkedIn)**

- **Problem to Solve**: SuccessFactors job titles alone are a poor proxy for domain expertise; external authorship and publications are stronger signals.
- **User Story**: As an Ecosystem Team Member, I need expert profiles to be enriched with SAP Community blog authorship and LinkedIn activity so that I can identify people with demonstrated real-world knowledge.
- **Acceptance Criteria**:
  - Given an expert has published SAP Community content, when their profile is displayed, then a link to relevant posts is shown.
  - Given LinkedIn enrichment is enabled and accessible, then relevant LinkedIn profile or publication data is surfaced (linked, not copied).
  - Given LinkedIn API is unavailable, then the system falls back to a web search signal without an error state.
- **Maps to Objective**: Objective 3
- **Priority Rank**: 5

**R6: 30-Minute Review Call Request**

- **Problem to Solve**: Even after finding the right expert, users must manually compose an email or calendar invite, adding friction and delay.
- **User Story**: As a Partnership Reviewer, I need a one-click action to request a 30-minute review call with a selected expert so that I can move immediately from finding to engaging.
- **Acceptance Criteria**:
  - Given a user clicks "Request 30-min review" on an expert card, then a calendar invite is created via Microsoft Graph, pre-populated with subject, proposed duration, and a brief context note.
  - Given the expert receives the invite, then they can accept or decline; the result is surfaced back to the requester.
- **Maps to Objective**: Objective 4
- **Priority Rank**: 6

**R7: Global Results with No Geographic Restriction**

- **Problem to Solve**: Current informal discovery is biased toward locally known colleagues, missing qualified experts in other regions.
- **User Story**: As a user, I need search results to include SAP employees from all regions worldwide so that the best-qualified expert is surfaced regardless of geography.
- **Acceptance Criteria**:
  - Given a search query, then results include employees from all SAP geographic regions by default.
  - Given a user wants to narrow by region, then an optional region filter is available but off by default.
- **Maps to Objective**: Objective 1
- **Priority Rank**: 7

### High-Want Requirements

**R8: Saved Search and Expert Shortlists**

- **Problem to Solve**: Users reviewing multiple companies need to save expert lists without re-running searches each time.
- **User Story**: As a Partnership Reviewer, I need to save a shortlist of experts per company review so that I can return to it without re-running the search.
- **Priority Rank**: 1

**R9: Expert Availability Signal**

- **Problem to Solve**: Requesting a call with someone who is on leave or at capacity wastes time.
- **User Story**: As a user, I need a basic availability indicator per expert (e.g., out-of-office status from Microsoft Graph) so that I prioritise available experts.
- **Priority Rank**: 2

### Nice-to-Have Requirements

**R10: Expert Feedback Loop**

- **Problem to Solve**: Over time, users can signal whether a matched expert was genuinely useful, improving ranking quality.
- **User Story**: As a Partnership Reviewer, I need to rate the quality of an expert match after the review call so that the system learns and improves over time.
- **Priority Rank**: 1

**R11: Domain Taxonomy Auto-Suggestion**

- **Problem to Solve**: Users may not know the exact domain labels the system uses, leading to poor query results.
- **User Story**: As a user, I need the search input to suggest domain labels as I type so that I find the right taxonomy term quickly.
- **Priority Rank**: 2

---

## Non-Functional Requirements

### Performance

- **Latency**: Search results must be returned within 5 seconds for 95% of queries.
- **Throughput**: Support up to 200 concurrent users and 50 searches per hour without degradation.

### Reliability

- **Availability**: 99% uptime during SAP business hours (06:00–22:00 CET).
- **Fallback**: If SuccessFactors API is unavailable, display a clear service-degraded message. If external enrichment fails, return internal-only results without error.

### Cost

- **AI inference**: LLM calls are bounded per query (max tokens per explanation capped). Batch enrichment runs off-peak.

### Explainability

- **Traceability**: Each expert card displays which signals contributed to the match (skills, role, community content, LinkedIn).
- **Decision Logging**: All filter applications (seniority excluded, conflict flagged) are logged per query for auditability.
- **Uncertainty Communication**: If an expert's profile has sparse data, the card displays a confidence indicator ("Limited profile data available").

---

## Solution Architecture

**Architecture Overview:**  
A three-tier application deployed on SAP BTP. A React + SAP UI5 Web Components front end communicates with a CAP (Node.js) backend. The backend orchestrates calls to SuccessFactors OData APIs, external enrichment connectors, and a Python AI agent. The AI agent handles natural-language query understanding, candidate ranking, conflict detection, and match explanation generation.

**Key Components:**

- **React + SAP UI5 Web Components UI**: Search bar, domain/seniority/region filter panel, ranked expert results list with match explanation cards, "Request 30-min review" action button.
- **CAP Backend (Node.js)**: Unified REST API consumed by the UI. Orchestrates SuccessFactors queries, enrichment calls, AI agent invocation, and Microsoft Graph scheduling.
- **Python AI Agent**: Processes natural-language queries, applies conflict and seniority heuristics, scores and ranks candidates, generates natural-language match explanations.
- **SuccessFactors Integration**: Employee Profile API (`sap.sf:apiResource:ECEmployeeProfile:v1`) and Skills Management API (`sap.sf:apiResource:ECSkillsManagement:v1`) — OData, read-only.
- **External Enrichment Connectors**: SAP Community Network author/post data (REST or web scrape); LinkedIn API (OAuth-based, with web-search fallback).
- **Microsoft Graph Integration**: Calendar invite creation and out-of-office availability signal.

**Integration Points:**

- **SAP SuccessFactors**: OData APIs, read-only, queried at search time; source of employee profile, job grade, org unit, and skills data.
- **SAP Community Network**: Author and blog-post data used for external expertise signals; queried asynchronously and cached.
- **LinkedIn**: Profile and publication signals; queried via LinkedIn API with web-search fallback; referenced by link, not stored.
- **Microsoft Graph (Microsoft 365)**: Calendar invite creation (write) and availability check (read); triggered by user action only.

**Deployment Environments:**

- **Dev**: BTP subaccount with synthetic SuccessFactors data; no external enrichment calls.
- **QA**: BTP subaccount with anonymised real SuccessFactors data; enrichment connectors active in read-only mode.
- **Prod**: Full SAP BTP subaccount; all integrations live; GDPR controls active.

### Agent Extensibility & Instrumentation

**Agent Extensibility:**
- The Python AI agent exposes a tool interface allowing future capabilities to be added as additional MCP tools without modifying the core agent logic (e.g., a future "conference speaker" signal, or integration with SAP's internal mentoring platform).
- Conflict-of-interest detection logic is externalised as a configurable rule set, replaceable or extended by administrators without code changes.
- Ranking algorithm is modular; the weighting between internal skills score and external signals score is configurable per deployment.

**Business Step Instrumentation:**
- Every significant step in the agent's resolution flow emits a structured log entry following the pattern: `[MILESTONE_ID].[achieved|missed]: [description]`.
- Logs are consumed by SAP BTP observability tooling for query-level tracing and debugging.

### Automation & Agent Behaviour

**Automation Level:** ML-assisted / Autonomous agent with human-in-the-loop for all actions

**Actions the system performs without human approval:**
- Query SuccessFactors for matching employee profiles
- Apply seniority and conflict-of-interest filters
- Enrich profiles with SAP Community and LinkedIn signals
- Rank and explain candidate matches

**Actions that require human review or approval:**
- Sending a calendar invite / meeting request (always triggered by explicit user click)
- Saving an expert to a shortlist

**Model or engine used:** LLM via SAP Generative AI Hub (GPT-4o or equivalent) for query understanding and explanation generation; deterministic rule engine for seniority and conflict filtering.

**Knowledge & data sources accessed:**

- **SAP SuccessFactors**: Employee profiles, job grades, org units, skills — authoritative internal source; read-only.
- **SAP Community Network**: Author and blog content — external expertise signal; read-only, cached.
- **LinkedIn**: Profile and publication data — external expertise signal; read-only, linked not stored.
- **Microsoft Graph**: Calendar availability and invite creation — operational data; write on explicit user action only.

**Tools or connectors invoked:**

- **SuccessFactors Employee Profile connector**: Fetches employee profile and org unit data (read-only).
- **SuccessFactors Skills Management connector**: Fetches employee skills and competency data (read-only).
- **SAP Community enrichment connector**: Retrieves author post metadata for a given employee name/email (read-only).
- **LinkedIn enrichment connector**: Fetches public profile signals (read-only; fallback to web search).
- **Microsoft Graph calendar connector**: Creates calendar invites on behalf of the requesting user (write, user-triggered only).

**Guardrails & fail-safes:**

- The agent never writes to SuccessFactors under any circumstances.
- No outreach is sent to an expert without explicit user confirmation ("Request 30-min review" click).
- If the AI agent fails to generate an explanation, a default explanation ("Matched based on skills profile") is used — results are always returned.
- LinkedIn enrichment failure silently degrades to internal-only results; no error is surfaced to the user.
- All LLM prompts are bounded; no unbounded generation to prevent cost overrun.

---

## Governance, Risk & Compliance

**Data Handling:**

- Employee profile data from SuccessFactors is queried at runtime and never persisted in the Expert Finder application database.
- External signals (LinkedIn, Community) are displayed as links only — no personal data is copied or stored.
- GDPR legal basis for processing employee data must be confirmed with SAP Legal before production launch (likely "legitimate interest" under the employment relationship context).

**Compliance Frameworks:**

- GDPR (EU) — employee data processing, right-to-access, right-to-erasure considerations.
- SAP internal data classification policy — employee profiles are classified as internal/confidential.

**Approval Flows:**

- Conflict-of-interest exclusion list changes require approval from the Tool Administrator and a designated HR Business Partner.

---

## Schedule & Timeline Context

**Target Timeline:** To be defined by the project team.

**Business Drivers:**
- SAP's ecosystem and Build platform strategy is accelerating; partner evaluation volume is expected to grow.
- Each day of delay in finding a reviewer is a day of delay in a partnership decision.

---

## Milestones

### M1: Expert Data Ingestion

- **Description**: SuccessFactors employee profiles and skills are successfully queryable by the CAP backend.
- **Achieved when**: A test query to the Employee Profile and Skills APIs returns valid, filterable employee data in the backend.
- **Log on achievement**: `M1.achieved: SuccessFactors employee profile and skills data ingestion operational`
- **Log on miss**: `M1.missed: SuccessFactors data ingestion not completed — search functionality unavailable`

### M2: External Enrichment Active

- **Description**: SAP Community blog authorship and LinkedIn signals are augmenting internal employee profiles in search results.
- **Achieved when**: At least one external signal (Community post or LinkedIn reference) is successfully surfaced on an expert card in a test search.
- **Log on achievement**: `M2.achieved: External enrichment connectors active — Community and LinkedIn signals visible in results`
- **Log on miss**: `M2.missed: External enrichment not active — results limited to internal SuccessFactors data only`

### M3: Filters Operational

- **Description**: Seniority (L2 band) and conflict-of-interest (roadmap role exclusion) filters are automatically applied to all search results.
- **Achieved when**: A test search confirms that Board/L1 employees and configured roadmap-role employees are absent from results.
- **Log on achievement**: `M3.achieved: Seniority and conflict-of-interest filters operational and validated`
- **Log on miss**: `M3.missed: One or more eligibility filters not operational — results may include ineligible experts`

### M4: Search and Ranking Live

- **Description**: Users can enter a natural-language query or apply filters and receive a ranked list of experts with AI-generated match explanations.
- **Achieved when**: An end-to-end test query returns a ranked list with at least one match explanation visible in the UI.
- **Log on achievement**: `M4.achieved: Expert search, ranking, and explanation generation live end-to-end`
- **Log on miss**: `M4.missed: Search or ranking pipeline not operational — expert list not returned`

### M5: Meeting Request Enabled

- **Description**: Users can request a 30-minute review call directly from an expert card, triggering a Microsoft Graph calendar invite.
- **Achieved when**: A test user can click "Request 30-min review" and a calendar invite is successfully created in Microsoft 365.
- **Log on achievement**: `M5.achieved: Meeting request action operational via Microsoft Graph`
- **Log on miss**: `M5.missed: Meeting request not operational — users must schedule calls manually`

---

## Risks, Assumptions, and Dependencies

### Risks

- **SuccessFactors data quality**: If employee skills and profiles are not consistently maintained, search quality degrades significantly. A data quality assessment is recommended before launch.
- **LinkedIn API access**: LinkedIn restricts programmatic access; the tool may need to rely on web-search enrichment as a permanent fallback rather than a temporary one.
- **Conflict-of-interest classification accuracy**: Role-based exclusion may produce false positives (valid experts excluded) or false negatives (conflicted employees not excluded). A manual override and review mechanism is advisable.
- **GDPR / employee consent**: Surfacing employee data and external web signals requires legal review. A decision on the lawful basis for processing must be obtained before production.

### Assumptions (Validate These)

- SAP SuccessFactors is the authoritative system for employee seniority grade and org unit data at SAP.
- Microsoft Graph API is available for SAP-internal calendar integration.
- The L2 seniority band can be mapped to a specific job grade range in SuccessFactors.
- "Roadmap responsibility" can be reliably inferred from org unit or job role attributes in SuccessFactors.

### Dependencies

- Access to SAP SuccessFactors OData APIs (Employee Profile and Skills Management) for the SAP internal tenant.
- SAP Generative AI Hub access for LLM inference.
- Microsoft Graph API credentials for calendar integration.
- Legal sign-off on GDPR lawful basis for employee data processing.
- LinkedIn Developer API access (or confirmed web-search fallback acceptance).

---

## Open Questions

- What is the definitive job grade range in SAP's SuccessFactors that maps to "L2" seniority?
- Which org units or job role codes at SAP are classified as "product roadmap responsibility"? Who owns this list?
- Is LinkedIn API access available to SAP internal applications, or must web-search enrichment be the primary signal?
- Does SAP have an existing SAP Community API or data export that can be used for author lookup, or is scraping required?
- What is the GDPR lawful basis for processing employee profile and external signal data in this tool?

---

## Appendix

### Glossary

- **L2**: The target seniority band — employees below Board/L1 but above junior individual contributor level. Exact job grade mapping to be confirmed with HR.
- **Conflict of Interest (CoI)**: For this tool, a CoI exists when an employee has knowledge of a product roadmap that could be relevant to evaluating the external company being reviewed.
- **Match Explanation**: An AI-generated, human-readable summary of why a specific employee was ranked as a good match for a given expertise query.
- **External Signal**: Data sourced from outside SAP SuccessFactors (SAP Community blog posts, LinkedIn publications) used to validate or enrich an employee's expertise profile.

### References

- SAP SuccessFactors Employee Central OData API: `sap.sf:apiResource:ECEmployeeProfile:v1`
- SAP SuccessFactors Skills Management OData API: `sap.sf:apiResource:ECSkillsManagement:v1`
- SAP BTP Cloud Application Programming Model (CAP): https://cap.cloud.sap
- SAP Generative AI Hub: https://help.sap.com/docs/sap-ai-core
- Microsoft Graph API (Calendar): https://learn.microsoft.com/en-us/graph/api/user-post-events
