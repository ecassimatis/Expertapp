"""Tests for get_availability_signal tool."""
import pytest
from app.models import AvailabilitySignal


def test_availability_signal_available():
    signal = AvailabilitySignal(status="available", message="")
    assert signal.status == "available"


def test_availability_signal_out_of_office():
    signal = AvailabilitySignal(status="out-of-office", message="Back on 2025-07-01")
    assert signal.status == "out-of-office"
    assert "2025-07-01" in signal.message


def test_availability_signal_unknown():
    signal = AvailabilitySignal(status="unknown")
    assert signal.status == "unknown"
    assert signal.message == ""


def test_availability_signal_invalid_status():
    """Any status value is accepted — validation is at the consuming layer."""
    signal = AvailabilitySignal(status="busy")
    assert signal.status == "busy"


def test_ranked_expert_has_availability_field():
    """RankedExpert carries optional availability field defaulting to 'unknown'."""
    from app.models import RankedExpert
    expert = RankedExpert(
        rank=1,
        employee_id="001",
        name="Alice",
        job_title="Expert",
        region="EMEA",
        match_explanation="Strong match.",
        seniority_confirmed=True,
        coi_clear=True,
    )
    assert expert.availability == "unknown"
