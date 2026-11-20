---
name: meeting-request
description: Workflow for requesting a 30-minute expert review call, requiring explicit user confirmation before sending a calendar invite via Microsoft Graph.
---

# Meeting Request Skill

## When to Invoke
Invoke this skill when the user explicitly asks to schedule a review call with a specific expert — for example: "Request a 30-min review with [expert name]", "Can you send a calendar invite to [expert]?", or clicks "Request 30-min review" in the UI.

## CRITICAL GUARDRAIL
**NEVER send a calendar invite or meeting request without explicit user confirmation.**
Always confirm the expert name and purpose before calling any calendar creation tool.

## Workflow Steps

### Step 1 — Confirm Intent
- Identify the expert: confirm name, job title, and context from the prior search results.
- Ask the user to confirm: "Would you like me to request a 30-minute expert review call with [Expert Name] ([Job Title])? Please confirm to proceed."
- Wait for explicit confirmation ("yes", "confirm", "proceed", etc.) before continuing.
- If the user does not confirm, do NOT proceed. Respond: "No calendar invite was sent. Let me know if you would like to proceed."

### Step 2 — Collect Context (Optional)
- Ask: "Is there any context you would like to include in the meeting invite? (e.g., company name, domain topic, specific questions — max 500 characters)"
- This is optional — the user may skip it.

### Step 3 — Create Calendar Invite
- Call the Microsoft Graph calendar MCP tool to create a 30-minute calendar invite with:
  - **Subject**: `SAP Expert Review - [domain from the search query]`
  - **Attendees**: requesting user + expert (email address from SuccessFactors profile)
  - **Body**: match explanation from search results + requester context (if provided)
  - **Duration**: 30 minutes
- If the expert's email address is not available, respond: "I cannot send the invite because the expert's email address is not available. Please contact [Expert Name] directly."

### Step 4 — Confirm Creation
- On success, respond: "Review call request sent to [Expert Name]. The calendar invite has been created."
- On failure, respond: "I was unable to create the calendar invite. Please try again or schedule manually."
- Return: success/failure status, event ID (if created), message.

## Guardrails
- This skill MUST NOT be triggered autonomously by the agent.
- It MUST ONLY be invoked when the user explicitly requests it.
- NEVER assume confirmation — require explicit "yes" or equivalent.
- NEVER send personal data beyond what is needed for the calendar invite.
