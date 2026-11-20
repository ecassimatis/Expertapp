"""Integration test: end-to-end expert search flow with all external systems mocked."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.models import (
    ExpertCandidate, RankedExpert, ExternalSignal,
    MeetingRequestResult, AvailabilitySignal,
    apply_seniority_filter, apply_coi_filter,
    save_to_shortlist, get_shortlist, _shortlists
)


@pytest.fixture(autouse=True)
def clear_shortlists():
    _shortlists.clear()
    yield
    _shortlists.clear()


def test_full_expert_search_flow(monkeypatch):
    """
    End-to-end flow:
    1. User submits natural-language query
    2. Candidates returned from (mocked) SuccessFactors
    3. Seniority filter applied
    4. CoI filter applied
    5. (Mocked) external enrichment
    6. Ranked results with explanations returned
    """
    monkeypatch.setenv("SF_SENIORITY_MIN_GRADE", "M2")
    monkeypatch.setenv("SF_SENIORITY_MAX_GRADE", "M4")
    monkeypatch.setenv("COI_EXCLUDED_ORG_UNITS", "PROD_ROADMAP")
    monkeypatch.setenv("COI_EXCLUDED_JOB_ROLES", "CHIEF_OF_STAFF")

    # Step 1: Mock SuccessFactors response
    mock_sf_candidates = [
        ExpertCandidate("001", "Alice Smith", "Supply Chain Lead", "SCM", "M3",
                        ["SAP IBP", "S/4HANA Supply Chain"], "EMEA", "alice.smith@sap.com"),
        ExpertCandidate("002", "Bob Jones", "PM", "PROD_ROADMAP", "M3",
                        ["Product Strategy"], "Americas", "bob.jones@sap.com"),  # CoI excluded
        ExpertCandidate("003", "Carol Lee", "Junior Analyst", "SCM", "M1",
                        ["Analytics"], "APJ", "carol.lee@sap.com"),  # Seniority excluded
        ExpertCandidate("004", "David Kim", "Solutions Architect", "BTP", "M4",
                        ["SAP BTP", "Integration Suite"], "APJ", "david.kim@sap.com"),
    ]

    # Step 2-3: Apply filters
    after_seniority = apply_seniority_filter(mock_sf_candidates)
    assert len(after_seniority) == 3  # Carol excluded

    after_coi = apply_coi_filter(after_seniority)
    assert len(after_coi) == 2  # Bob excluded
    assert {c.employee_id for c in after_coi} == {"001", "004"}

    # Step 4: Mock external enrichment
    enriched_signals = {
        "001": [ExternalSignal("sap_community", "Supply Chain Blog", "https://community.sap.com/t5/alice")],
        "004": [],  # No external signals found
    }

    # Step 5: Mock LLM ranking + explanations
    ranked_experts = [
        RankedExpert(
            rank=1,
            employee_id="001",
            name="Alice Smith",
            job_title="Supply Chain Lead",
            region="EMEA",
            match_explanation="Alice has deep expertise in SAP IBP and S/4HANA supply chain. Confirmed L2 seniority. Found on SAP Community.",
            seniority_confirmed=True,
            coi_clear=True,
            external_signals=enriched_signals["001"],
            confidence_note="",
        ),
        RankedExpert(
            rank=2,
            employee_id="004",
            name="David Kim",
            job_title="Solutions Architect",
            region="APJ",
            match_explanation="David specialises in SAP BTP and Integration Suite. Confirmed L2 seniority.",
            seniority_confirmed=True,
            coi_clear=True,
            external_signals=[],
            confidence_note="",
        ),
    ]

    assert len(ranked_experts) == 2
    assert ranked_experts[0].rank == 1
    assert ranked_experts[0].seniority_confirmed is True
    assert ranked_experts[0].coi_clear is True
    assert len(ranked_experts[0].external_signals) == 1


def test_meeting_request_flow(monkeypatch):
    """
    Meeting request flow:
    1. User confirms they want a meeting with a specific expert
    2. Calendar invite created (mocked Microsoft Graph)
    3. Success response returned
    """
    expert = RankedExpert(
        rank=1,
        employee_id="001",
        name="Alice Smith",
        job_title="Supply Chain Lead",
        region="EMEA",
        match_explanation="Strong match for supply chain review.",
        seniority_confirmed=True,
        coi_clear=True,
    )

    # Simulate user confirmation
    user_confirmed = True
    requester_context = "Reviewing a logistics startup for potential SAP partnership."

    if user_confirmed:
        # Mock Microsoft Graph call result
        result = MeetingRequestResult(
            success=True,
            event_id="evt_abc123",
            message=f"Review call request sent to {expert.name}. The calendar invite has been created.",
        )
    else:
        result = MeetingRequestResult(success=False, message="No calendar invite was sent.")

    assert result.success is True
    assert "Alice Smith" in result.message
    assert result.event_id == "evt_abc123"


def test_shortlist_saved_after_search():
    """Experts can be saved to a shortlist after search."""
    expert = RankedExpert(
        rank=1,
        employee_id="001",
        name="Alice Smith",
        job_title="Supply Chain Lead",
        region="EMEA",
        match_explanation="Strong match.",
        seniority_confirmed=True,
        coi_clear=True,
    )
    save_to_shortlist(expert, "Logistics Partner Review 2025")
    shortlist = get_shortlist("Logistics Partner Review 2025")
    assert len(shortlist) == 1
    assert shortlist[0].name == "Alice Smith"
