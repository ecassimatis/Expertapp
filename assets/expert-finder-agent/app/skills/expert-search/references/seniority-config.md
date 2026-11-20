# Seniority Band Configuration

## Purpose
This document describes how to interpret the L2 seniority band from SAP SuccessFactors job grade data for the Expert Finder agent.

## L2 Band Definition
The target seniority band is "L2" — experienced practitioners who are senior enough to credibly evaluate partner companies but not so senior that they are primarily in board, executive, or L1 strategic roles.

## Grade Configuration
The exact grade codes are configured via environment variables and must be confirmed with SAP HR:

| Variable | Description | Example Value |
|---|---|---|
| `SF_SENIORITY_MIN_GRADE` | Minimum SuccessFactors job grade (inclusive) for the L2 band | `M2` or `GR10` |
| `SF_SENIORITY_MAX_GRADE` | Maximum SuccessFactors job grade (inclusive) for the L2 band | `M4` or `GR13` |

## Filter Logic
- Employees with job grade **below** `SF_SENIORITY_MIN_GRADE` are **excluded** (too junior — may lack authority to evaluate partners).
- Employees with job grade **above** `SF_SENIORITY_MAX_GRADE` are **excluded** (too senior — Board, L1; too busy and not the right role).
- Employees with job grade **within** the range [min, max] (inclusive) are **included**.

## Grade Comparison
SuccessFactors job grades are typically alphanumeric strings. Comparison should be string-based unless HR confirms the grades follow a strictly ordinal numeric scale.

## Important Notes
- The actual grade codes depend on the SAP internal job architecture and may vary by region or business unit.
- This configuration must be set by a Tool Administrator before the agent can apply seniority filtering.
- If the environment variables are not set, log a warning and skip the seniority filter (do not fail silently — log: `[FILTER.seniority_config_missing]: SF_SENIORITY_MIN_GRADE or SF_SENIORITY_MAX_GRADE not configured`).
