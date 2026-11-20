# Specification: expert-finder-cap

> **Guidelines**: Read [../guidelines.md](../guidelines.md) before executing ANY tasks below.

This asset covers the CAP (Cloud Application Programming Model) backend service and the React + SAP UI5 Web Components front end.

---

## Basic Setup

- [ ] Create the CAP project in `assets/expert-finder-cap/` using `cds init expert-finder-cap` from inside `assets/`.
- [ ] Confirm `assets/expert-finder-cap/package.json` and `assets/expert-finder-cap/srv/` are created.
- [ ] Add React + SAP UI5 Web Components front-end scaffold under `assets/expert-finder-cap/app/expert-finder-ui/`:
  - Use `npx create-react-app expert-finder-ui --template cra-template` inside `assets/expert-finder-cap/app/`.
  - Replace the default template with the project-specific UI described below.
  - Install SAP UI5 Web Components: `npm install @ui5/webcomponents @ui5/webcomponents-react`.
- [ ] Invoke `setup-solution` skill to create `asset.yaml` for this CAP asset in `assets/expert-finder-cap/`.

---

## CAP Backend — Data Model

- [ ] Define CDS entities in `assets/expert-finder-cap/db/schema.cds`:

  ```cds
  // Shortlist: session-scoped saved expert lists per review name
  entity Shortlist {
    key ID          : UUID;
    reviewName      : String(200);
    createdAt       : Timestamp;
    entries         : Composition of many ShortlistEntry on entries.shortlist = $self;
  }

  entity ShortlistEntry {
    key ID           : UUID;
    shortlist        : Association to Shortlist;
    employeeId       : String(50);
    employeeName     : String(200);
    jobTitle         : String(200);
    region           : String(100);
    matchExplanation : LargeString;
    rankScore        : Decimal(5,2);
    addedAt          : Timestamp;
  }

  // Administrator-managed conflict-of-interest exclusion configuration
  entity CoiExclusionRule {
    key ID         : UUID;
    ruleType       : String(20);  // 'org_unit' | 'job_role'
    value          : String(200);
    createdAt      : Timestamp;
    createdBy      : String(100);
  }

  // Seniority band configuration (admin-managed)
  entity SeniorityConfig {
    key ID          : UUID;
    minGrade        : String(20);
    maxGrade        : String(20);
    updatedAt       : Timestamp;
    updatedBy       : String(100);
  }
  ```

- [ ] Define CDS service in `assets/expert-finder-cap/srv/expert-finder-service.cds`:
  ```cds
  using { expert.finder as db } from '../db/schema';

  service ExpertFinderService @(path:'/api') {
    // Expert search — delegates to AI agent
    action searchExperts(query: String, domain: String, region: String) returns array of ExpertResult;

    // Meeting request — delegates to AI agent
    action requestReviewCall(employeeId: String, employeeName: String, requesterContext: String) returns MeetingRequestResult;

    // Shortlists
    entity Shortlists as projection on db.Shortlist;
    entity ShortlistEntries as projection on db.ShortlistEntry;
    action saveToShortlist(reviewName: String, expert: ExpertResult) returns ShortlistEntry;

    // Admin: CoI exclusion rules
    entity CoiExclusionRules as projection on db.CoiExclusionRule;
    entity SeniorityConfigs as projection on db.SeniorityConfig;

    // Types
    type ExpertResult {
      employeeId       : String;
      name             : String;
      jobTitle         : String;
      region           : String;
      rank             : Integer;
      matchExplanation : String;
      seniorityConfirmed : Boolean;
      coiClear         : Boolean;
      confidenceNote   : String;
      externalSignals  : array of ExternalSignal;
    };

    type ExternalSignal {
      source : String;  // 'sap_community' | 'linkedin'
      title  : String;
      url    : String;
    };

    type MeetingRequestResult {
      success  : Boolean;
      eventId  : String;
      message  : String;
    };
  }
  ```

---

## CAP Backend — Service Implementation

- [ ] Implement `assets/expert-finder-cap/srv/expert-finder-service.js`:

  ### `searchExperts` action
  - [ ] Accept `query`, `domain`, `region` parameters.
  - [ ] Forward the request to the AI agent via A2A protocol (HTTP POST to the agent's `invoke` endpoint configured via environment variable `AGENT_ENDPOINT_URL`).
  - [ ] Map the agent's response to `ExpertResult[]` and return.
  - [ ] If the agent returns an error or is unreachable, return HTTP 503 with message "Expert search temporarily unavailable."
  - [ ] Log each search request: `[SEARCH]: query="{query}", domain="{domain}", region="{region}"`.

  ### `requestReviewCall` action
  - [ ] Accept `employeeId`, `employeeName`, `requesterContext` parameters.
  - [ ] Forward the request to the AI agent via A2A protocol.
  - [ ] Map the agent's response to `MeetingRequestResult` and return.
  - [ ] This endpoint requires authentication — only authenticated SAP employees may call it.

  ### Shortlist CRUD
  - [ ] Standard CAP CRUD for `Shortlists` and `ShortlistEntries`.
  - [ ] `saveToShortlist` action: create a `Shortlist` record (if not existing for `reviewName`) and add a `ShortlistEntry`.

  ### Admin endpoints (CoI and Seniority config)
  - [ ] `CoiExclusionRules` and `SeniorityConfigs` entities: standard CAP CRUD restricted to users with `Admin` role.
  - [ ] On any write to `CoiExclusionRules` or `SeniorityConfigs`, propagate the updated values to the AI agent environment via environment variable reload (document this as a manual step requiring redeployment in v1).

- [ ] Add SAP XSUAA authentication annotation to the service: `@requires: 'authenticated-user'`.
- [ ] Add `xs-security.json` with roles: `Expert_Finder_User` (default) and `Expert_Finder_Admin` (for config endpoints).

---

## CAP Backend — Connectivity to AI Agent

- [ ] Add `requires` in `package.json` `cds.requires`:
  ```json
  "expert-finder-agent": {
    "kind": "rest",
    "credentials": {
      "url": "<AGENT_ENDPOINT_URL>"
    }
  }
  ```
- [ ] Use `cds.connect.to('expert-finder-agent')` in the service implementation to call the agent.

---

## React + SAP UI5 Web Components Front End

### App Structure

- [ ] `App.js` — top-level shell with SAP UI5 `ShellBar` (title: "SAP Expert Finder") and routing.
- [ ] `pages/SearchPage.jsx` — main search page (default route `/`).
- [ ] `pages/ShortlistPage.jsx` — saved shortlists page (route `/shortlists`).
- [ ] `pages/AdminPage.jsx` — administrator configuration page (route `/admin`, accessible only to Admin role).
- [ ] `components/SearchBar.jsx` — text input for natural-language query + domain dropdown + optional region dropdown.
- [ ] `components/FilterPanel.jsx` — collapsible panel showing active filters (domain, region); allows clearing individual filters.
- [ ] `components/ExpertCard.jsx` — card displaying one ranked expert result (see details below).
- [ ] `components/MeetingRequestModal.jsx` — confirmation modal before sending a calendar invite.
- [ ] `services/api.js` — wrapper around CAP backend API calls (fetch-based; no direct SAP API calls).

### SearchPage Layout

- [ ] Top: `SearchBar` with a text input and Submit button.
- [ ] Below search bar: `FilterPanel` for active filters.
- [ ] Results area: ordered list of `ExpertCard` components (ranked 1–N).
- [ ] Loading state: SAP UI5 `BusyIndicator` while waiting for agent response.
- [ ] Error state: SAP UI5 `MessageStrip` (type="Error") if the search fails.
- [ ] Empty state: SAP UI5 `IllustratedMessage` if no results are returned.

### ExpertCard Component

- [ ] Display: rank badge, expert name, job title, region, seniority confirmed badge (green check), CoI-clear badge (green check).
- [ ] Match explanation text (italicised, max 3 lines with expand toggle).
- [ ] Confidence note: if `confidenceNote` is non-empty, display a SAP UI5 `MessageStrip` (type="Warning") with the note.
- [ ] External signals section: for each signal, show a linked chip (`sap_community` or `linkedin` label + clickable URL).
- [ ] Actions: "Request 30-min review" button (SAP UI5 `Button`, type="Emphasized") + "Save to shortlist" button.
- [ ] "Request 30-min review" opens `MeetingRequestModal`.

### MeetingRequestModal Component

- [ ] SAP UI5 `Dialog` with title "Request Expert Review Call".
- [ ] Displays expert name and a text area for the requester to add context (optional, max 500 chars).
- [ ] "Confirm & Send" button calls `POST /api/requestReviewCall` and closes the modal on success.
- [ ] Shows success `Toast` on confirmation: "Review call request sent to [Expert Name]."
- [ ] Shows error `MessageStrip` on failure.

### ShortlistPage Layout

- [ ] List of saved shortlists by `reviewName`.
- [ ] Each shortlist shows its entries as `ExpertCard` components (read-only mode, no "Request" button).
- [ ] "Delete shortlist" action per shortlist.

### AdminPage Layout

- [ ] Two sections: "Seniority Band Configuration" and "Conflict-of-Interest Exclusion Rules".
- [ ] Seniority Band: form with `minGrade` and `maxGrade` inputs + Save button.
- [ ] CoI Exclusion Rules: SAP UI5 `Table` listing all rules with Add/Delete row actions.
- [ ] Only visible to users with `Expert_Finder_Admin` role.

---

## Non-Functional Requirements

- [ ] Search API response (from CAP to UI) must be returned within 5 seconds for 95% of queries. Implement a 10-second timeout on the agent call; return a 503 if exceeded.
- [ ] All SuccessFactors data is retrieved at query-time — no employee data is persisted in the CAP database.
- [ ] GDPR compliance note: add a visible disclaimer on the SearchPage: "Employee data is retrieved live from SAP SuccessFactors and is not stored. External links are sourced from public profiles."

---

## CAP Backend Tests

- [ ] Write Jest unit tests in `assets/expert-finder-cap/test/`:
  - `searchExperts.test.js` — test action handler with mocked agent response (happy path + agent unavailable).
  - `requestReviewCall.test.js` — test action handler with mocked agent response (happy path + error).
  - `shortlist.test.js` — test CRUD for Shortlists and ShortlistEntries.
  - `coiConfig.test.js` — test CoI admin endpoint with Admin role and without (403 expected).
- [ ] Run `npm test` from `assets/expert-finder-cap/` and verify all tests pass.

---

## Validation Checklist

- [ ] `cds build` completes without errors from `assets/expert-finder-cap/`.
- [ ] `npm start` starts the CAP service on port 4004.
- [ ] Front-end builds without errors: `npm run build` from `assets/expert-finder-cap/app/expert-finder-ui/`.
- [ ] `GET /api/$metadata` returns the service metadata.
- [ ] `POST /api/searchExperts` returns a ranked list when the agent mock is active.
