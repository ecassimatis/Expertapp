using { expert.finder as db } from '../db/schema';

@requires: 'authenticated-user'
service ExpertFinderService @(path:'/api') {

  // Expert search — delegates to AI agent via A2A
  action searchExperts(query: String, domain: String, region: String) returns array of ExpertResult;

  // Meeting request — delegates to AI agent via A2A
  @requires: 'authenticated-user'
  action requestReviewCall(employeeId: String, employeeName: String, requesterContext: String) returns MeetingRequestResult;

  // Shortlist management
  entity Shortlists as projection on db.Shortlist;
  entity ShortlistEntries as projection on db.ShortlistEntry;
  action saveToShortlist(reviewName: String, employeeId: String, employeeName: String, jobTitle: String, region: String, matchExplanation: String, rankScore: Decimal) returns ShortlistEntryResult;

  // Admin: CoI exclusion rules (restricted to Expert_Finder_Admin role)
  @requires: 'Expert_Finder_Admin'
  entity CoiExclusionRules as projection on db.CoiExclusionRule;

  @requires: 'Expert_Finder_Admin'
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
    source : String;
    title  : String;
    url    : String;
  };

  type MeetingRequestResult {
    success  : Boolean;
    eventId  : String;
    message  : String;
  };

  type ShortlistEntryResult {
    ID         : UUID;
    reviewName : String;
    employeeId : String;
  };
}
