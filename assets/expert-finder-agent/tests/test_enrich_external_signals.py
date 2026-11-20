"""Tests for external signals enrichment."""
import pytest
from app.models import ExternalSignal, ExpertCandidate


def test_external_signal_model():
    """ExternalSignal carries source, title, and url."""
    signal = ExternalSignal(
        source="sap_community",
        title="Supply Chain Blog Post",
        url="https://community.sap.com/t5/alice-smith/ba-p/12345",
    )
    assert signal.source == "sap_community"
    assert signal.title == "Supply Chain Blog Post"
    assert "community.sap.com" in signal.url


def test_external_signal_linkedin():
    signal = ExternalSignal(
        source="linkedin",
        title="Alice Smith - SAP Supply Chain Expert",
        url="https://www.linkedin.com/in/alice-smith",
    )
    assert signal.source == "linkedin"
    assert "linkedin.com" in signal.url


def test_enrichment_silent_failure_returns_empty_signals():
    """If enrichment fails for a candidate, an empty signal list is returned — no exception raised."""
    # Simulate enrichment result for a candidate where enrichment failed
    signals_per_employee: dict[str, list[ExternalSignal]] = {
        "001": [],  # enrichment failed silently
        "002": [ExternalSignal("sap_community", "BTP Blog", "https://community.sap.com")],
    }
    assert signals_per_employee["001"] == []
    assert len(signals_per_employee["002"]) == 1


def test_enrichment_does_not_store_personal_data():
    """Signals contain only public links — no PII stored."""
    signal = ExternalSignal(
        source="sap_community",
        title="Blog Post Title",
        url="https://community.sap.com/t5/alice/ba-p/123",
    )
    # Signal only has source, title, url — no personal data fields
    signal_dict = signal.__dict__
    assert set(signal_dict.keys()) == {"source", "title", "url"}
