"""Tests for expert search functionality with mocked SuccessFactors MCP responses."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.models import ExpertCandidate, apply_seniority_filter, apply_coi_filter


def make_sf_profile_response(user_id: str, name: str, job_title: str, grade: str, org: str):
    return {
        "userId": user_id,
        "displayName": name,
        "jobTitle": job_title,
        "payGrade": grade,
        "department": org,
        "location": "Germany",
    }


def test_search_applies_filters(monkeypatch):
    """Verify that seniority and CoI filters are applied in sequence."""
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "PROD_ROADMAP")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "")

    candidates = [
        ExpertCandidate("001", "Alice", "Supply Chain Lead", "CONSULTING", "M3", ["Supply Chain"], "EMEA"),
        ExpertCandidate("002", "Bob", "PM", "PROD_ROADMAP", "M3", ["Product"], "EMEA"),  # CoI excluded
        ExpertCandidate("003", "Carol", "Junior Analyst", "CONSULTING", "M1", ["Analytics"], "EMEA"),  # seniority excluded
    ]

    after_seniority = apply_seniority_filter(candidates)
    assert len(after_seniority) == 2
    assert "003" not in {c.employee_id for c in after_seniority}

    after_coi = apply_coi_filter(after_seniority)
    assert len(after_coi) == 1
    assert after_coi[0].employee_id == "001"


def test_empty_candidate_list():
    """Empty input returns empty output."""
    assert apply_seniority_filter([]) == []
    assert apply_coi_filter([]) == []


def test_worldwide_search_no_region_filter(monkeypatch):
    """No region filter applied by default."""
    monkeypatch.delenv("SF_SENIORITY_MIN_GRADE", raising=False)
    monkeypatch.delenv("SF_SENIORITY_MAX_GRADE", raising=False)
    monkeypatch.delenv("COI_EXCLUDED_ORG_UNITS", raising=False)
    monkeypatch.delenv("COI_EXCLUDED_JOB_ROLES", raising=False)

    candidates = [
        ExpertCandidate("001", "Alice", "Consultant", "BTP", "M3", ["BTP"], "EMEA"),
        ExpertCandidate("002", "Bob", "Consultant", "SC", "M3", ["SC"], "Americas"),
        ExpertCandidate("003", "Carol", "Consultant", "HCM", "M3", ["HCM"], "APJ"),
    ]
    result = apply_seniority_filter(apply_coi_filter(candidates))
    assert len(result) == 3
