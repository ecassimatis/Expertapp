"""Tests for apply_coi_filter."""
import pytest
from app.models import ExpertCandidate, apply_coi_filter


def make_candidate(employee_id: str, org_unit: str, job_title: str) -> ExpertCandidate:
    return ExpertCandidate(
        employee_id=employee_id,
        name=f"Expert {employee_id}",
        job_title=job_title,
        org_unit=org_unit,
        job_grade="M3",
        skills=["Supply Chain"],
        region="APJ",
    )


def test_excluded_org_unit_removed(monkeypatch):
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "PROD_ROADMAP")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "")
    candidates = [make_candidate("001", "PROD_ROADMAP", "Product Manager")]
    result = apply_coi_filter(candidates)
    assert len(result) == 0


def test_excluded_job_role_removed(monkeypatch):
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "CHIEF_OF_STAFF")
    candidates = [make_candidate("002", "STRATEGY", "CHIEF_OF_STAFF")]
    result = apply_coi_filter(candidates)
    assert len(result) == 0


def test_unrelated_candidate_included(monkeypatch):
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "PROD_ROADMAP")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "CHIEF_OF_STAFF")
    candidates = [make_candidate("003", "CONSULTING", "Senior Consultant")]
    result = apply_coi_filter(candidates)
    assert len(result) == 1


def test_case_insensitive_matching(monkeypatch):
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "prod_roadmap")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "")
    candidates = [make_candidate("004", "PROD_ROADMAP", "PM")]
    result = apply_coi_filter(candidates)
    assert len(result) == 0


def test_missing_config_returns_all(monkeypatch):
    monkeypatch.delenv("COI_EXCLUDED_ORG_UNITS", raising=False)
    monkeypatch.delenv("COI_EXCLUDED_JOB_ROLES", raising=False)
    candidates = [
        make_candidate("005", "PROD_ROADMAP", "Product Manager"),
        make_candidate("006", "CONSULTING", "Consultant"),
    ]
    result = apply_coi_filter(candidates)
    assert len(result) == 2


def test_mixed_candidates_filtered(monkeypatch):
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "PROD_ROADMAP,STRATEGY_PMO")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "CHIEF_OF_STAFF")
    candidates = [
        make_candidate("010", "PROD_ROADMAP", "PM"),             # excluded by org
        make_candidate("011", "STRATEGY_PMO", "Analyst"),        # excluded by org
        make_candidate("012", "SALES", "CHIEF_OF_STAFF"),        # excluded by role
        make_candidate("013", "CONSULTING", "Senior Consultant"), # included
        make_candidate("014", "BTP", "Solutions Architect"),      # included
    ]
    result = apply_coi_filter(candidates)
    assert len(result) == 2
    assert {c.employee_id for c in result} == {"013", "014"}
