# Conflict-of-Interest Exclusion Configuration

## Purpose
This document describes the conflict-of-interest (CoI) exclusion rules for the Expert Finder agent. Employees in certain roles or org units may have access to sensitive product roadmap information that would disqualify them from externally reviewing partner companies.

## Exclusion Configuration
CoI exclusion rules are maintained by a Tool Administrator and configured via environment variables:

| Variable | Description | Format |
|---|---|---|
| `COI_EXCLUDED_ORG_UNITS` | Org unit codes whose members are excluded | Comma-separated string (e.g., `PROD_ROADMAP,STRATEGY_PMO`) |
| `COI_EXCLUDED_JOB_ROLES` | Job role codes excluded from partner reviews | Comma-separated string (e.g., `PRODUCT_MANAGER,CHIEF_OF_STAFF`) |

## Exclusion Logic
- An employee is **excluded** if their `orgUnit` matches any entry in `COI_EXCLUDED_ORG_UNITS`.
- An employee is **excluded** if their `jobRole` matches any entry in `COI_EXCLUDED_JOB_ROLES`.
- Either condition alone is sufficient for exclusion (OR logic).
- Matching is case-insensitive.

## Common Exclusion Patterns
Typical roles and org units that should be considered for CoI exclusion:
- **Product Management teams** (access to detailed roadmap plans)
- **Corporate Strategy / M&A teams** (awareness of partnership directions)
- **Chief of Staff roles** (access to executive decision-making)
- **Competitive Intelligence teams** (sensitive market positioning data)

The exact list must be confirmed with the SAP Legal / Ethics & Compliance team.

## Important Notes
- This exclusion list is intentionally conservative — it is better to exclude a borderline case than to expose a conflicted reviewer.
- If the environment variables are not set, log a warning and skip the CoI filter with logging: `[FILTER.coi_config_missing]: COI_EXCLUDED_ORG_UNITS or COI_EXCLUDED_JOB_ROLES not configured`.
- Exclusion decisions are logged for audit purposes: `[FILTER.coi_excluded]: employee_id={id}, reason=org_unit|job_role`.
- Employees excluded by CoI should NOT appear in search results under any circumstances.
