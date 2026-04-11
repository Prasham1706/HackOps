from app.core.config import settings
from app.models.schemas import RiskCheckRequest, RiskCheckResponse, RiskResult

MUTATING_ACTIONS = {"create_issue", "comment", "send", "label", "create_task", "update_task"}


def evaluate_runtime_risk(body: RiskCheckRequest) -> RiskCheckResponse:
    blocked_nodes: list[str] = []
    results: list[RiskResult] = []

    recent_outputs = [str(step.output) for step in body.completed_steps]
    max_output_size = max((len(item) for item in recent_outputs), default=0)
    avg_duration = sum(step.duration for step in body.completed_steps) / max(len(body.completed_steps), 1)
    seen_services = {step.service for step in body.completed_steps}

    for node in body.next_group:
        risk_level = "LOW"
        reason = "No large data or rate limits detected."

        if node.service == "gemini" and max_output_size > settings.MCP_MAX_GEMINI_INPUT_CHARS:
            risk_level = "HIGH"
            reason = "Upstream output is too large for a safe Gemini prompt window."
            blocked_nodes.append(node.id)
        elif avg_duration > 6000 and node.service in seen_services:
            risk_level = "MEDIUM"
            reason = "Previous calls to this service are running slowly, suggesting rate limiting pressure."
        elif node.action in MUTATING_ACTIONS and _contains_sensitive_terms(recent_outputs):
            risk_level = "MEDIUM"
            reason = "Upstream data contains potentially sensitive terms, so a review is safer before mutation."

        results.append(RiskResult(nodeId=node.id, riskLevel=risk_level, reason=reason))

    return RiskCheckResponse(riskResults=results, blockedNodes=blocked_nodes)


def _contains_sensitive_terms(outputs: list[str]) -> bool:
    combined = " ".join(outputs).lower()
    keywords = ["password", "secret", "token", "credential", "ssn", "confidential"]
    return any(keyword in combined for keyword in keywords)

