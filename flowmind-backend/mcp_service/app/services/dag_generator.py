from typing import Dict, List

import networkx as nx

from app.adapters.gemini.adapter import GeminiAdapter
from app.core.config import settings
from app.models.schemas import DAGEdge, DAGNode, DAGPayload, GenerateRequest, GenerateResponse

SUPPORTED_ACTIONS = {
    "github": [
        ("create_issue", "GitHub: Create Issue"),
        ("listen_issue", "GitHub: Watch Issue"),
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
        ("listen_database", "Notion: Watch Database"),
        ("create_task", "Notion: Create Task"),
        ("update_task", "Notion: Update Task"),
        ("query", "Notion: Query Database"),
    ],
}

KEYWORD_SERVICE_MAP = {
    "github": ["github", "issue", "repository", "repo", "pull request"],
    "gmail": ["gmail", "email", "mail", "inbox"],
    "gemini": ["gemini", "summarize", "classify", "generate", "ai", "summary"],
    "notion": ["notion", "database", "task", "page", "workspace", "watch", "new task"],
}


async def generate_workflow_dag(body: GenerateRequest) -> GenerateResponse:
    effective_description = _build_effective_description(body.description, body.refinementPrompt)
    services = _normalize_services(body.services) or _infer_services(effective_description)
    
    # Force Gemini inclusion if summary requested
    if "summarize" in effective_description.lower() and "gemini" not in services:
        services.insert(1 if len(services) > 0 else 0, "gemini")

    planner = GeminiAdapter()
    planned = await planner.plan_workflow(
        body.description,
        services,
        previous_dag=body.previousDag,
        repair_context=body.repairContext,
        previous_plan=body.previousPlan,
        refinement_prompt=body.refinementPrompt,
    )
    dag = _build_dag_from_plan(planned, effective_description, services)
    plan_text = await planner.create_workflow_plan(
        body.description,
        dag.model_dump(by_alias=True),
        previous_plan=body.previousPlan,
        refinement_prompt=body.refinementPrompt,
    )
    _validate_dag(dag)
    return GenerateResponse(dag=dag, planText=plan_text)


def _build_effective_description(description: str, refinement_prompt: str | None) -> str:
    refinement = (refinement_prompt or "").strip()
    if not refinement:
        return description
    return f"{description}\n\nRefinement instructions: {refinement}"


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
    # Ensure Gemini is prioritized if common AI tasks are mentioned
    if "gemini" not in inferred and any(word in lowered for word in ["summarize", "summary", "classify", "generate", "ai"]):
        inferred.insert(1 if inferred else 0, "gemini")
    return inferred


def _build_dag_from_plan(
    planned: Dict | None,
    description: str,
    services: List[str],
) -> DAGPayload:
    if planned and _plan_looks_valid(planned):
        normalized_plan = _apply_description_constraints(planned, description)
        return DAGPayload.model_validate(normalized_plan)

    lowered = description.lower()
    nodes: List[DAGNode] = []
    for index, service in enumerate(services, start=1):
        action, label = _pick_action_for_service(service, lowered, index == 1, index == len(services))
        nodes.append(DAGNode(
            id=f"n{index}",
            service=service,
            action=action,
            label=label,
            inputs=_default_inputs_for(service, action),
        ))

    edges = [
        DAGEdge.model_validate({"from": nodes[i].id, "to": nodes[i + 1].id})
        for i in range(len(nodes) - 1)
    ]
    payload = DAGPayload(nodes=nodes, edges=edges)
    return DAGPayload.model_validate(_apply_description_constraints(payload.model_dump(by_alias=True), description))


def _pick_action_for_service(service: str, description: str, is_first: bool, is_last: bool) -> tuple[str, str]:
    if service == "github":
        if "comment" in description:
            return "comment", "GitHub: Comment"
        if any(k in description for k in [
            "read github issue",
            "read the latest open github issue",
            "latest open github issue",
            "latest github issue",
            "open github issue",
            "watch issue",
            "listen to",
        ]):
            return "listen_issue", "GitHub: Watch Issue"
        # Default to create_issue for all other destination steps
        return "create_issue", "GitHub: Create Issue"

    if service == "gmail":
        if "label" in description:
            return "label", "Gmail: Apply Label"
        if is_first and any(k in description for k in ["read", "latest", "unread", "index", "inbox"]):
            return "read_latest", "Gmail: Read Latest Email"
        return "send", "Gmail: Send Email"

    if service == "notion":
        if is_first and any(k in description for k in ["watch", "listen", "monitor"]):
            return "listen_database", "Notion: Watch Database"
        if any(k in description for k in ["query", "search", "lookup", "database"]):
             # If Notion is the end of a chain, it's usually 'create', not 'query'
             if is_last and "create" in description:
                 return "create_task", "Notion: Create Task"
             return "query", "Notion: Query Database"
        if not is_last and "update" in description:
            return "update_task", "Notion: Update Task"
        return "create_task", "Notion: Create Task"

    if service == "gemini":
        if any(k in description for k in ["classify", "category", "tag"]):
            return "classify", "Gemini: Classify"
        if any(k in description for k in ["generate", "draft", "write", "create text"]):
            return "generate", "Gemini: Generate"
        # Always default to summarize if nothing else matches but gemini is present
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


def _default_inputs_for(service: str, action: str) -> Dict:
    if service == "github":
        if action in {"listen_issue", "create_issue", "comment"}:
            return {"repo": settings.GITHUB_DEFAULT_REPO} if settings.GITHUB_DEFAULT_REPO else {}

    if service == "gmail":
        if action == "send":
            defaults = {}
            if settings.GMAIL_DEFAULT_TO:
                defaults["to"] = settings.GMAIL_DEFAULT_TO
            if settings.GMAIL_DEFAULT_SUBJECT:
                defaults["subject"] = settings.GMAIL_DEFAULT_SUBJECT
            return defaults

    if service == "notion":
        if action in {"create_task", "query"} and settings.NOTION_DEFAULT_DATABASE_ID:
            inputs = {"database_id": settings.NOTION_DEFAULT_DATABASE_ID}
            if action == "create_task":
                inputs["title"] = "New Task from Flow"
            return inputs

    return {}


def _apply_description_constraints(plan: Dict, description: str) -> Dict:
    lowered = description.lower()
    nodes = [dict(node) for node in plan.get("nodes", [])]
    edges = [dict(edge) for edge in plan.get("edges", [])]

    github_read_only = any(phrase in lowered for phrase in [
        "github read only",
        "github read-only",
        "read only github",
        "read github",
        "latest open github issue",
        "do not create or comment on github",
        "remove github write actions",
        "github write actions",
    ])
    gmail_read_only = any(phrase in lowered for phrase in [
        "read the latest unread gmail email",
        "latest unread gmail email",
        "read gmail",
        "read latest email",
        "read latest unread email",
        "gmail read",
    ])
    wants_summary = any(word in lowered for word in ["summarize", "summary"])

    for node in nodes:
        service = node.get("service")
        if service == "github" and github_read_only:
            node["action"] = "listen_issue"
            node["label"] = "GitHub: Watch Issue"
            existing_inputs = dict(node.get("inputs") or {})
            node["inputs"] = _default_inputs_for("github", "listen_issue") | existing_inputs

        if service == "gmail" and gmail_read_only:
            node["action"] = "read_latest"
            node["label"] = "Gmail: Read Latest Email"

        if service == "gemini" and wants_summary:
            node["action"] = "summarize"
            node["label"] = "Gemini: Summarize"

    # If summary is requested but Gemini is missing, insert it before the final destination.
    services = [node.get("service") for node in nodes]
    if wants_summary and "gemini" not in services and nodes:
        insert_index = max(len(nodes) - 1, 0)
        new_node = {
            "id": f"n{insert_index + 1}",
            "service": "gemini",
            "action": "summarize",
            "label": "Gemini: Summarize",
            "inputs": {},
        }
        nodes.insert(insert_index, new_node)
        # Re-number node ids after insertion.
        id_map = {}
        for index, node in enumerate(nodes, start=1):
            old_id = node["id"]
            new_id = f"n{index}"
            node["id"] = new_id
            id_map[old_id] = new_id
        edges = [
            {"from": nodes[i]["id"], "to": nodes[i + 1]["id"]}
            for i in range(len(nodes) - 1)
        ]
    else:
        # Rebuild simple sequential edges to keep the visible DAG aligned with the revised plan.
        edges = [
            {"from": nodes[i]["id"], "to": nodes[i + 1]["id"]}
            for i in range(len(nodes) - 1)
        ]

    return {
        "nodes": nodes,
        "edges": edges,
    }
