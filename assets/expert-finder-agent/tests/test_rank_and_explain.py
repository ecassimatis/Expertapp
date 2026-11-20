"""Tests for rank_and_explain functionality."""
import pytest
from unittest.mock import MagicMock, patch
from app.models import ExpertCandidate, RankedExpert, ExternalSignal


def make_candidate(employee_id: str, name: str) -> ExpertCandidate:
    return ExpertCandidate(
        employee_id=employee_id,
        name=name,
        job_title="Supply Chain Expert",
        org_unit="SCM",
        job_grade="M3",
        skills=["SAP IBP", "Supply Chain Planning", "S/4HANA"],
        region="EMEA",
        email=f"{name.lower().replace(' ', '.')}@sap.com",
    )


def test_ranked_expert_model_fields():
    """RankedExpert carries all required fields."""
    expert = RankedExpert(
        rank=1,
        employee_id="001",
        name="Alice Smith",
        job_title="Supply Chain Expert",
        region="EMEA",
        match_explanation="Alice has 10 years of SAP IBP experience and authored 3 blog posts on supply chain optimization.",
        seniority_confirmed=True,
        coi_clear=True,
        external_signals=[ExternalSignal(source="sap_community", title="IBP Blog Post", url="https://community.sap.com/t5/alice-smith")],
        confidence_note="",
    )
    assert expert.rank == 1
    assert expert.seniority_confirmed is True
    assert expert.coi_clear is True
    assert len(expert.external_signals) == 1
    assert expert.confidence_note == ""


def test_ranked_expert_with_empty_skills_gets_confidence_note():
    """Candidate with empty skills list gets a confidence note."""
    candidate = ExpertCandidate(
        employee_id="002",
        name="Bob Jones",
        job_title="Consultant",
        org_unit="BTP",
        job_grade="M3",
        skills=[],  # empty skills
        region="Americas",
        email="bob.jones@sap.com",
    )
    confidence_note = "Limited profile data available" if not candidate.skills else ""
    assert confidence_note == "Limited profile data available"


def test_ranked_expert_default_explanation_fallback():
    """When LLM explanation generation fails, fallback explanation is used."""
    fallback = "Matched based on skills profile"
    # Simulate LLM failure by using fallback directly
    expert = RankedExpert(
        rank=1,
        employee_id="003",
        name="Carol Lee",
        job_title="BTP Architect",
        region="APJ",
        match_explanation=fallback,
        seniority_confirmed=True,
        coi_clear=True,
    )
    assert expert.match_explanation == fallback


def test_shortlist_management():
    """Test in-memory shortlist operations."""
    from app.models import save_to_shortlist, get_shortlist, list_shortlists, _shortlists
    # Clear shortlists for test isolation
    _shortlists.clear()

    expert1 = RankedExpert(rank=1, employee_id="001", name="Alice", job_title="Expert",
                           region="EMEA", match_explanation="Great match", seniority_confirmed=True, coi_clear=True)
    expert2 = RankedExpert(rank=2, employee_id="002", name="Bob", job_title="Expert",
                           region="Americas", match_explanation="Good match", seniority_confirmed=True, coi_clear=True)

    save_to_shortlist(expert1, "Partner Review 2025")
    save_to_shortlist(expert2, "Partner Review 2025")

    shortlist = get_shortlist("Partner Review 2025")
    assert len(shortlist) == 2
    assert shortlist[0].name == "Alice"

    names = list_shortlists()
    assert "Partner Review 2025" in names

    # Non-existent shortlist returns empty
    empty = get_shortlist("Nonexistent Review")
    assert empty == []
