"""Tests for apply_seniority_filter."""
import os
import pytest
from app.models import ExpertCandidate, apply_seniority_filter


def make_candidate(employee_id: str, grade: str) -> ExpertCandidate:
    return ExpertCandidate(
        employee_id=employee_id,
        name=f"Expert {employee_id}",
        job_title="Senior Consultant",
        org_unit="BTP",
        job_grade=grade,
        skills=["SAP BTP"],
        region="EMEA",
    )


def test_within_grade_band_included(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("001", "M3")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 1
    assert result[0].employee_id == "001"


def test_below_min_grade_excluded(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("002", "M1")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 0


def test_above_max_grade_excluded(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("003", "M5")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 0


def test_at_min_grade_included(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("004", "M2")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 1


def test_at_max_grade_included(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("005", "M4")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 1


def test_missing_config_returns_all(monkeypatch):
    monkeypatch.delenv("SF_SENIORITY_MIN_GRADE", raising=False)
    monkeypatch.delenv("SF_SENIORITY_MAX_GRADE", raising=False)
    candidates = [make_candidate("006", "M1"), make_candidate("007", "M5")]
    result = apply_seniority_filter(candidates)
    assert len(result) == 2


def test_empty_grade_included_when_config_set(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [make_candidate("008", "")]
    result = apply_seniority_filter(candidates)
    # Employees with no grade data are passed through (benefit of the doubt)
    assert len(result) == 1


def test_mixed_candidates_filtered_correctly(monkeypatch):
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    candidates = [
        make_candidate("010", "M1"),  # excluded
        make_candidate("011", "M2"),  # included
        make_candidate("012", "M3"),  # included
        make_candidate("013", "M4"),  # included
        make_candidate("014", "M5"),  # excluded
    ]
    result = apply_seniority_filter(candidates)
    assert len(result) == 3
    assert {c.employee_id for c in result} == {"011", "012", "013"}
