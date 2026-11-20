namespace expert.finder;

// Shortlist: saved expert lists per review name
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
