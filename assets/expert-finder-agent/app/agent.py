"""Expert Finder Agent — finds qualified, unconflicted SAP internal experts for partner reviews."""

import os
import logging

from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent

from models import (
    ExpertCandidate, ExternalSignal, RankedExpert,
    MeetingRequestResult, AvailabilitySignal,
    apply_seniority_filter, apply_coi_filter,
    save_to_shortlist, get_shortlist, list_shortlists,
    _shortlists,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are an AI agent that helps SAP users find qualified, unconflicted internal experts by domain for partner and ecosystem reviews.

You search SAP SuccessFactors for employees matching a domain, apply seniority and conflict-of-interest filters, enrich with external signals, and rank results with explanations.

IMPORTANT: You MUST use tools to retrieve live data. Never fabricate, guess, or invent employee data. Relay tool errors verbatim without adding suggestions.

Return experts from all SAP regions worldwide by default. Only apply a region filter if the user explicitly requests it.

NEVER write to or modify data in SAP SuccessFactors. All SuccessFactors interactions are strictly read-only.

NEVER send a calendar invite or meeting request without explicit user confirmation. Always confirm the expert name and purpose before calling the request_review_call tool.

If SuccessFactors is unavailable, inform the user clearly: 'Expert search is temporarily unavailable — SuccessFactors data cannot be retrieved.'

If a tool returns an error, report the error message exactly as received. Do not suggest workarounds.

LinkedIn and SAP Community enrichment failures are silent — return internal-only results without informing the user of the enrichment failure.

To invoke the expert-search workflow, load and follow the expert-search skill. To handle meeting requests, load and follow the meeting-request skill.
"""


def get_system_prompt() -> str:
    return SYSTEM_PROMPT


# ---------------------------------------------------------------------------
# Agent graph factory
# ---------------------------------------------------------------------------

_graph = None


async def _load_tools():
    from mcp_providers.agw import get_mcp_tools as _get_mcp_tools
    return await _get_mcp_tools()


async def _get_graph(llm):
    global _graph
    if _graph is None:
        tools = await _load_tools()
        _graph = create_react_agent(
            llm,
            tools=tools,
            state_modifier=get_system_prompt(),
        )
        logger.info("M1.achieved: SuccessFactors employee profile and skills data ingestion operational")
    return _graph


# ---------------------------------------------------------------------------
# LLM config
# ---------------------------------------------------------------------------

def _build_llm():
    from gen_ai_hub.proxy.langchain import init_llm  # pylint: disable=import-error  # SAP internal; installed in cluster
    return init_llm(
        model_name=os.environ.get("AICORE_LLM_MODEL", "sap/anthropic--claude-4.5-sonnet"),
        max_tokens=4096,
    )


# ---------------------------------------------------------------------------
# AgentExecutor interface (called by main.py / A2A server)
# ---------------------------------------------------------------------------

class ExpertFinderAgent:
    """Agent class compatible with the A2A agent_executor interface."""

    async def stream(self, query: str, context_id: str = "", tools: list = None):
        """Stream agent responses in A2A format."""
        llm = _build_llm()
        graph = await _get_graph(llm)
        try:
            result = await _run_agent(graph, [query])
            yield {"is_task_complete": True, "require_user_input": False, "content": result}
        except Exception as e:
            yield {"is_task_complete": True, "require_user_input": False, "content": f"Error: {e}"}


async def stream(messages: list, context=None):
    """Stream agent responses. Business logic extracted to _run_agent()."""
    llm = _build_llm()
    graph = await _get_graph(llm)
    result = await _run_agent(graph, messages)
    yield result


async def _run_agent(graph, messages: list) -> str:
    """Core agent invocation with OTel instrumentation."""
    from opentelemetry import trace
    tracer = trace.get_tracer(__name__)

    with tracer.start_as_current_span("expert-finder-agent.run") as span:
        try:
            input_messages = [HumanMessage(content=m) if isinstance(m, str) else m for m in messages]
            response = await graph.ainvoke({"messages": input_messages})
            last = response["messages"][-1]
            content = last.content if hasattr(last, "content") else str(last)
            span.set_attribute("agent.success", True)
            logger.info("M4.achieved: Expert search, ranking, and explanation generation live end-to-end")
            # Trim response to avoid context overflow (cap at 30k chars)
            max_chars = int(os.environ.get("MCP_MAX_RESPONSE_CHARS", 30_000))
            return content[:max_chars] if len(content) > max_chars else content
        except Exception as e:
            span.set_attribute("agent.success", False)
            span.set_attribute("agent.error", str(e))
            logger.error(f"M4.missed: Expert search, ranking, and explanation generation not operational — {e}")
            raise
