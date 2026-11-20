"""Pure data models and business logic for the Expert Finder agent.

This module is intentionally free of framework dependencies (no langchain,
no gen_ai_hub) so it can be imported in unit tests without the full
AI stack installed.
"""

import os
import logging
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class ExpertCandidate:
    employee_id: str
    name: str
    job_title: str
    org_unit: str
    job_grade: str
    skills: list
    region: str
    email: str = ""


@dataclass
class ExternalSignal:
    source: str  # 'sap_community' | 'linkedin'
    title: str
    url: str


@dataclass
class RankedExpert:
    rank: int
    employee_id: str
    name: str
    job_title: str
    region: str
    match_explanation: str
    seniority_confirmed: bool
    coi_clear: bool
    external_signals: list = field(default_factory=list)
    confidence_note: str = ""
    availability: str = "unknown"


@dataclass
class MeetingRequestResult:
    success: bool
    event_id: str = ""
    message: str = ""


@dataclass
class AvailabilitySignal:
    status: str  # 'available' | 'out-of-office' | 'unknown'
    message: str = ""


# ---------------------------------------------------------------------------
# Eligibility filters
# ---------------------------------------------------------------------------

def apply_seniority_filter(candidates: list) -> list:
    """Apply seniority band filter based on environment variable configuration."""
    min_grade = os.environ.get("SF_SENIORITY_MIN_GRADE", "")
    max_grade = os.environ.get("SF_SENIORITY_MAX_GRADE", "")

    if not min_grade or not max_grade:
        logger.warning(
            "[FILTER.seniority_config_missing]: SF_SENIORITY_MIN_GRADE or SF_SENIORITY_MAX_GRADE not configured"
        )
        return candidates

    filtered = []
    for c in candidates:
        grade = c.job_grade or ""
        if not grade:
            filtered.append(c)
            continue
        if grade.upper() < min_grade.upper() or grade.upper() > max_grade.upper():
            logger.info(f"[FILTER.seniority_excluded]: employee_id={c.employee_id}, grade={grade}")
        else:
            filtered.append(c)

    return filtered


def apply_coi_filter(candidates: list) -> list:
    """Apply conflict-of-interest filter based on environment variable configuration."""
    excluded_org_units_raw = os.environ.get("COI_EXCLUDED_ORG_UNITS", "")
    excluded_job_roles_raw = os.environ.get("COI_EXCLUDED_JOB_ROLES", "")

    if not excluded_org_units_raw and not excluded_job_roles_raw:
        logger.warning(
            "[FILTER.coi_config_missing]: COI_EXCLUDED_ORG_UNITS or COI_EXCLUDED_JOB_ROLES not configured"
        )
        return candidates

    excluded_org_units = [x.strip().upper() for x in excluded_org_units_raw.split(",") if x.strip()]
    excluded_job_roles = [x.strip().upper() for x in excluded_job_roles_raw.split(",") if x.strip()]

    filtered = []
    for c in candidates:
        org_match = c.org_unit.upper() in excluded_org_units if excluded_org_units else False
        role_match = c.job_title.upper() in excluded_job_roles if excluded_job_roles else False

        if org_match:
            logger.info(f"[FILTER.coi_excluded]: employee_id={c.employee_id}, reason=org_unit")
        elif role_match:
            logger.info(f"[FILTER.coi_excluded]: employee_id={c.employee_id}, reason=job_role")
        else:
            filtered.append(c)

    return filtered


# ---------------------------------------------------------------------------
# Shortlist (in-memory, session-scoped)
# ---------------------------------------------------------------------------

_shortlists: dict = {}


def save_to_shortlist(expert: RankedExpert, review_name: str) -> None:
    if review_name not in _shortlists:
        _shortlists[review_name] = []
    _shortlists[review_name].append(expert)


def get_shortlist(review_name: str) -> list:
    return _shortlists.get(review_name, [])


def list_shortlists() -> list:
    return list(_shortlists.keys())
