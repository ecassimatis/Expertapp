# SAP Expert Finder

Internal tool to quickly identify qualified, unconflicted SAP experts for partner and ecosystem company reviews.

## Business Challenge

SAP Business Development and Ecosystem/ISV teams need to identify internal SAP experts who can review external companies as potential partners or future ecosystem participants (including the agent/Build platform). Today, finding the right person takes 1–3 days per review. The ideal expert is around the L2 seniority band — experienced enough to judge a company's fit, but not so senior (Board/L1) that they are unavailable or have conflicting responsibilities (e.g., product roadmap ownership). There are no geographic restrictions. Reviews span multiple domains: supply chain, BTP, integration, travel & expense, and others.

## Business Goals & Success Criteria

| Metric | Baseline | Target | Timeline | Process / Capability | Source |
|--------|----------|--------|----------|----------------------|--------|
| Time to identify a qualified expert | 1–3 days | Minutes (same session) | — | Partner / ecosystem review matching | User |
| Monthly reviews supported without friction | 10–50 reviews taking 1–3 days | 10–50 reviews with same-session expert identification | — | Expert matching & scheduling | User |

## Key Milestones

1. **Expert data ingestion**: SuccessFactors employee profiles and skills are queryable by the application.
2. **External enrichment active**: SAP Community blog authorship and LinkedIn signals augment internal profiles.
3. **Filters operational**: Automatic seniority (L2 range) and conflict-of-interest (roadmap roles) filters exclude ineligible experts.
4. **Search & ranking live**: Users can enter a domain/expertise and receive a ranked list with match explanations.
5. **Meeting request enabled**: Users can directly request a 30-minute review call from within the tool.

## Business Architecture (RBA)

### End-to-End Process

Recruit to Retire (E2E)

### Process Hierarchy

```
Recruit to Retire (E2E)
└── Develop to Grow (generic)
    └── Educate and develop talent (BPS-388)
        └── Develop skills and competencies
    └── Identify and grow talent (BPS-389)
        └── Manage employee performance
        └── Plan career development
└── Plan to Optimize Workforce (generic)
    └── Develop HR strategy and plans (BPS-384)
        └── Manage workforce strategy and policies
```

### Summary

Finding qualified internal experts maps to the Recruit to Retire E2E, specifically the "Identify and grow talent" and "Educate and develop talent" sub-processes, as the solution relies on skills/competency data and talent profiles maintained in SAP SuccessFactors.

## Fit Gap Analysis

| Requirement (business) | Standard asset(s) found | API ORD ID | MCP Server ORD ID | MCP Server Version | Webhook API ORD ID | Data Product ORD ID | Gap? | Notes / assumptions |
|------------------------|-------------------------|------------|-------------------|--------------------|--------------------|---------------------|------|---------------------|
| Query employee profiles and skills | SAP SuccessFactors HCM Core | `sap.sf:apiResource:ECEmployeeProfile:v1` | — | — | — | — | No | OData API available; no MCP server found — direct API integration needed |
| Skills and competency data | SAP SuccessFactors Platform | `sap.sf:apiResource:ECSkillsManagement:v1` | — | — | — | — | No | OData API available; no MCP server found |
| Seniority-level filtering (L2 band) | — | — | — | — | — | — | Yes | No standard product covers this; requires custom logic on top of SF job grade data |
| Conflict-of-interest filter (roadmap roles) | — | — | — | — | — | — | Yes | No standard SAP product; requires custom role/org-unit exclusion logic |
| External expertise signals (SAP Community blogs) | SAP SuccessFactors Work Zone (partial) | — | — | — | — | — | Maybe | SAP Community author data is not directly available via standard API; web scraping or community API needed |
| External expertise signals (LinkedIn) | — | — | — | — | — | — | Yes | No SAP standard product; requires LinkedIn API or web search enrichment |
| Ranked expert list with match explanation | — | — | — | — | — | — | Yes | Requires AI agent for ranking and natural language explanation generation |
| 30-minute review call scheduling | — | — | — | — | — | — | Yes | Requires calendar integration (e.g., Microsoft Graph or Google Calendar API); no SAP standard asset |

### Key findings

- SAP SuccessFactors provides the core employee profile and skills data via OData APIs — no MCP servers are currently published for these, so direct API integration is required.
- No standard SAP product covers conflict-of-interest detection based on roadmap role responsibility; this must be custom-built using org-unit or job role classification.
- External enrichment (SAP Community, LinkedIn) is a full gap — requires custom connectors or third-party APIs.
- The AI ranking and natural-language explanation layer is a full custom gap; a Python AI agent is the recommended approach.
- Scheduling integration (30-min call request) is a gap — a calendar API integration (Microsoft Graph preferred for SAP internal use) will be needed.
- SuccessFactors Skills Management (BPS-388, BPS-389) is the most relevant standard capability; strategic workforce planning products (SAP Analytics Cloud, SAP Business Data Cloud) are not directly relevant here.

## Recommendations

### SAP Expert Finder — AI-Powered Internal Search Application

#### Executive Summary

Search app + AI agent that matches expertise queries to qualified, unconflicted SAP experts in minutes.

#### Recommended Solution

A CAP (Cloud Application Programming) backend service exposing a search API, with a React + SAP UI5 Web Components front end. A Python AI agent processes natural-language queries, fetches and enriches employee data from SAP SuccessFactors (Employee Profile and Skills APIs), applies seniority and conflict-of-interest filters, augments profiles with external signals (SAP Community author data, LinkedIn), ranks candidates, generates match explanations, and exposes a meeting-request action via Microsoft Graph (calendar invite).

Key components:
- **CAP backend**: orchestrates queries to SuccessFactors, external enrichment services, and the AI agent; exposes a unified REST API.
- **Python AI agent**: handles natural-language understanding, ranking logic, explanation generation, and conflict detection heuristics.
- **React + UI5 Web Components UI**: search bar, filter panel (domain, seniority, availability), ranked results list with match summaries, and a "Request 30-min review" button.
- **SuccessFactors integration**: Employee Profile API and Skills Management API (OData) for internal employee data.
- **External enrichment**: SAP Community Network author/blog data + LinkedIn API (or web search fallback) for external expertise signals.
- **Scheduling**: Microsoft Graph API to create calendar invites or availability requests.

#### Problem Statement

Identifying the right internal SAP expert for a partner or ecosystem review currently takes 1–3 days of informal networking, email chains, and manual vetting. There is no tool that combines employee skills data, seniority context, and conflict-of-interest awareness in a single searchable interface.

#### Affected User Roles

- Partnership Reviewer (SAP Business Development team)
- Ecosystem/ISV team member
- Expert candidate (SAP internal employee receiving review request)

#### Important factors

##### Fast expert identification reduces missed partnership opportunities
Delays in finding the right reviewer slow down partner evaluation cycles, potentially causing SAP to miss time-sensitive ecosystem opportunities.

##### Conflict-of-interest filtering protects roadmap confidentiality
Automatically excluding employees with product roadmap responsibility ensures reviewers can speak candidly and reduces legal/compliance risk.

##### Global reach without geographic bias
The tool must surface experts worldwide, preventing the common bias toward locally known colleagues.

##### Combining internal and external signals improves match quality
SuccessFactors profiles reflect formal job titles, but external authorship (blogs, conference talks) is often a better signal of genuine domain expertise.

#### Potential risks

##### SuccessFactors data quality
If employee profiles and skills are not consistently maintained in SuccessFactors, the tool's results will be incomplete. Data quality governance is a prerequisite.

##### LinkedIn API access limitations
LinkedIn restricts programmatic access; the tool may need to rely on web search enrichment as a fallback, which is less reliable.

##### Conflict-of-interest classification accuracy
Automatically inferring roadmap responsibility from job roles or org units may generate false positives (excluding valid experts) or false negatives (missing conflicted ones). A manual override mechanism is advisable.

##### Employee consent and data privacy
Surfacing employee profiles and external web content in a tool raises GDPR/privacy considerations; legal review of data sourcing and profile display is required before production use.

#### Recommended solution category

CAP application (backend + UI), Python AI agent

#### Intent fit
75%
