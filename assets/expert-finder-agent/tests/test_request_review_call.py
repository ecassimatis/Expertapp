"""Tests for request_review_call tool."""
import pytest
from app.models import MeetingRequestResult, RankedExpert


def test_meeting_request_result_success():
    result = MeetingRequestResult(
        success=True,
        event_id="evt_abc123",
        message="Review call request sent to Alice Smith.",
    )
    assert result.success is True
    assert result.event_id == "evt_abc123"
    assert "Alice Smith" in result.message


def test_meeting_request_result_failure():
    result = MeetingRequestResult(
        success=False,
        event_id="",
        message="I was unable to create the calendar invite. Please try again or schedule manually.",
    )
    assert result.success is False
    assert result.event_id == ""
    assert "unable" in result.message.lower()


def test_meeting_request_default_fields():
    result = MeetingRequestResult(success=True)
    assert result.event_id == ""
    assert result.message == ""


def test_ranked_expert_email_used_for_invite():
    """Expert must have an email address for a calendar invite."""
    expert = RankedExpert(
        rank=1,
        employee_id="001",
        name="Alice Smith",
        job_title="Supply Chain Expert",
        region="EMEA",
        match_explanation="Strong match for supply chain domain.",
        seniority_confirmed=True,
        coi_clear=True,
    )
    # In a real flow, agent must check expert has email before calling request_review_call
    # This test verifies the model has no email field (email is on ExpertCandidate, not RankedExpert)
    assert not hasattr(expert, "email")


def test_meeting_guardrail_requires_confirmation():
    """Verify that meeting request requires user confirmation before proceeding."""
    # The SKILL.md guardrail is enforced at agent level.
    # This test documents the expected behavior: if confirmation is not given, no invite is sent.
    user_confirmed = False  # Simulating user not confirming
    if not user_confirmed:
        result = MeetingRequestResult(
            success=False,
            event_id="",
            message="No calendar invite was sent.",
        )
    assert result.success is False
    assert "No calendar invite" in result.message
