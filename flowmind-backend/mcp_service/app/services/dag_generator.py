from typing import Dict, List

import networkx as nx

from app.adapters.gemini.adapter import GeminiAdapter
from app.models.schemas import DAGEdge, DAGNode, DAGPayload, GenerateRequest, GenerateResponse

SUPPORTED_ACTIONS = {
    "github": [
        ("listen_issue", "GitHub: Watch Issue"),
        ("create_issue", "GitHub: Create Issue"),
        ("comment", "GitHub: Comment"),
    ],
    "gmail": [
        ("read_latest", "Gmail: Read Latest Email"),
        ("send", "Gmail: Send Email"),
        ("label", "Gmail: Apply Label"),
    ],
    "gemini": [
        ("summarize", "Gemini: Summarize"),
        ("generate", "Gemini: Generate"),
        ("classify", "Gemini: Classify"),
    ],
    "notion": [
        ("create_task", "Notion: Create Task"),
        ("update_task", "Notion: Update Task"),
        ("query", "Notion: Query Database"),
    ],
}

KEYWORD_SERVICE_MAP = {
    "github": ["github", "issue", "repository", "repo", "pull request"],
    "gmail": ["gmail", "email", "mail", "inbox"],
    "gemini": ["gemini", "summarize", "classify", "generate", "ai"],
    "notion": ["notion", "database", "task", "page", "workspace"],
}


async def generate_workflow_dag(body: GenerateRequest) -> GenerateResponse:
    services = _normalize_services(body.services) or _infer_services(body.description)
    planner = GeminiAdapter()
    planned = await planner.plan_workflow(body.description, services)
    dag = _build_dag_from_plan(planned, body.description, services)
    _validate_dag(dag)
    return GenerateResponse(dag=dag)


def _normalize_services(services: List[str]) -> List[str]:
    seen = set()
    normalized: List[str] = []
    for service in services:
        key = service.strip().lower()
        if key in SUPPORTED_ACTIONS and key not in seen:
            seen.add(key)
            normalized.append(key)
    return normalized


def _infer_services(description: str) -> List[str]:
    lowered = description.lower()
    inferred = [
        service
        for service, keywords in KEYWORD_SERVICE_MAP.items()
        if any(keyword in lowered for keyword in keywords)
    ]
    if not inferred:
        return ["gemini"]
    if "gemini" not in inferred and any(word in lowered for word in ["summarize", "classify", "generate", "ai"]):
        inferred.insert(1 if inferred else 0, "gemini")
    return inferred


def _build_dag_from_plan(
    planned: Dict | None,
    description: str,
    services: List[str],
) -> DAGPayload:
    if planned and _plan_looks_valid(planned):
        return DAGPayload.model_validate(planned)

    lowered = description.lower()
    nodes: List[DAGNode] = []
    for index, service in enumerate(services, start=1):
        action, label = _pick_action_for_service(service, lowered, index == 1, index == len(services))
        nodes.append(DAGNode(id=f"n{index}", service=service, action=action, label=label))

    edges = [
        DAGEdge.model_validate({"from": nodes[i].id, "to": nodes[i + 1].id})
        for i in range(len(nodes) - 1)
    ]
    return DAGPayload(nodes=nodes, edges=edges)


def _pick_action_for_service(service: str, description: str, is_first: bool, is_last: bool) -> tuple[str, str]:
    if service == "github":
        if "comment" in description:
            return "comment", "GitHub: Comment"
        if is_first or "new issue" in description or "watch issue" in description:
            return "listen_issue", "GitHub: Watch Issue"
        return "create_issue", "GitHub: Create Issue"

    if service == "gmail":
        if "label" in description:
            return "label", "Gmail: Apply Label"
        if is_first and ("read" in description or "latest" in description or "unread" in description):
            return "read_latest", "Gmail: Read Latest Email"
        return "send", "Gmail: Send Email"

    if service == "notion":
        if "query" in description or "search" in description:
            return "query", "Notion: Query Database"
        if not is_last and "update" in description:
            return "update_task", "Notion: Update Task"
        return "create_task", "Notion: Create Task"

    if service == "gemini":
        if "classify" in description or "category" in description:
            return "classify", "Gemini: Classify"
        if "generate" in description or "draft" in description or "write" in description:
            return "generate", "Gemini: Generate"
        return "summarize", "Gemini: Summarize"

    return SUPPORTED_ACTIONS[service][0]


def _plan_looks_valid(plan: Dict) -> bool:
    if not isinstance(plan, dict):
        return False
    if not isinstance(plan.get("nodes"), list) or not isinstance(plan.get("edges"), list):
        return False
    return all(
        isinstance(node, dict) and {"id", "service", "action", "label"} <= set(node.keys())
        for node in plan["nodes"]
    )


def _validate_dag(dag: DAGPayload) -> None:
    graph = nx.DiGraph()
    for node in dag.nodes:
        graph.add_node(node.id)
    for edge in dag.edges:
        graph.add_edge(edge.from_node, edge.to_node)
    if not nx.is_directed_acyclic_graph(graph):
        raise ValueError("Generated workflow is not a DAG")

