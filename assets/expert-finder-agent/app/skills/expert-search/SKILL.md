---
name: expert-search
description: Step-by-step workflow for finding, filtering, enriching, and ranking SAP internal experts by domain for partner and ecosystem reviews.
---

# Expert Search Skill

## When to Invoke
Invoke this skill when the user provides a domain or expertise query asking to find SAP internal experts (e.g., "find supply chain experts", "who knows BTP integration", "travel expense experts for partner review").

## Workflow Steps

### Step 1 — Parse Query Intent
- Extract domain keywords from the user's natural-language query (e.g., "supply chain", "BTP", "integration", "travel expense").
- Identify any optional filters: region (default: worldwide), seniority preference (default: L2 band).
- Map keywords to SuccessFactors search terms.

### Step 2 — Fetch Employee Profiles
- Call the SuccessFactors Employee Profile MCP tools to list employees.
- Use `list_eppublicprofile_for_sfodata` to retrieve public profiles.
- Supplement with `list_background_funcexperience_for_sfodata` and `list_background_insideworkexperience_for_sfodata` to match domain keywords.
- Always set `top` to a maximum of 100 on any tool call that supports pagination.

### Step 3 — Fetch Skills Data
- For matched employees, call `list_ratedskillmapping_for_sfodata` and `list_skillprofileentity_for_sfodata` to retrieve skills profiles.
- Cross-reference skills against the domain keywords.

### Step 4 — Apply Seniority Filter
- Read `SF_SENIORITY_MIN_GRADE` and `SF_SENIORITY_MAX_GRADE` environment variables (L2 band configuration).
- Exclude employees whose job grade is below the minimum or above the maximum.
- See `references/seniority-config.md` for grade interpretation guidance.
- Log each exclusion: `[FILTER.seniority_excluded]: employee_id={id}, grade={grade}`.

### Step 5 — Apply Conflict-of-Interest Filter
- Read `COI_EXCLUDED_ORG_UNITS` and `COI_EXCLUDED_JOB_ROLES` environment variables (comma-separated lists).
- Exclude employees whose org unit or job role matches any exclusion entry.
- See `references/coi-exclusion-config.md` for exclusion rule guidance.
- Log each exclusion: `[FILTER.coi_excluded]: employee_id={id}, reason=org_unit|job_role`.

### Step 6 — Enrich with External Signals
- For each remaining candidate, query SAP Community for authored blog posts or articles (web search pattern: `site:community.sap.com "{employee_name}"`).
- Query LinkedIn via web search fallback (pattern: `site:linkedin.com/in "{employee_name}" SAP`).
- If enrichment fails for any individual candidate, continue silently — return an empty signals list for that candidate.
- Return signals as links only (source, title, url) — never copy personal data.

### Step 7 — Score and Rank Candidates
- Use the LLM to score each candidate against the domain query.
- Generate a concise match explanation per candidate (max 3 sentences): why they match, seniority confirmation, and at least one external signal if available.
- Use `max_tokens=300` per explanation to control cost.
- If LLM explanation generation fails, fall back to: "Matched based on skills profile."
- Return a ranked list with: rank, name, job title, region, match explanation, seniority_confirmed flag, coi_clear flag, external signals, confidence note.

## Guardrails
- NEVER fabricate, guess, or invent employee data.
- NEVER apply a geographic filter unless the user explicitly requests it.
- All SuccessFactors interactions are read-only.
- Eligibility filters (seniority + CoI) MUST be applied before any candidate is ranked or returned.
