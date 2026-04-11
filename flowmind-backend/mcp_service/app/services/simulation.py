from collections import defaultdict
from statistics import mean
from typing import Dict, List

import networkx as nx

from app.models.schemas import DAGNode, SimulateRequest, SimulateResponse, SimulationStep

SERVICE_RELIABILITY = {
    "github": 94.0,
    "gmail": 89.0,
    "gemini": 88.0,
    "notion": 91.0,
}

MUTATING_ACTIONS = {
    "github": {"create_issue", "comment"},
    "gmail": {"send", "label"},
    "notion": {"create_task", "update_task"},
}


def simulate_workflow(body: SimulateRequest) -> SimulateResponse:
    graph = _build_graph(body.dag.nodes, body.dag.edges)
    parallel_groups = [group for group in _parallel_groups(graph) if len(group) > 1]
    steps = [_simulate_node(node, len(body.dag.nodes)) for node in body.dag.nodes]

    raw_confidence = mean(step.successProbability for step in steps) if steps else 0
    complexity_penalty = max(0, len(body.dag.nodes) - 3) * 1.5
    parallel_penalty = len(parallel_groups) * 1.0
    confidence = max(0.0, min(100.0, round(raw_confidence - complexity_penalty - parallel_penalty, 1)))
    auto_execute = confidence > 85 and not any(step.hitlRequired for step in steps)

    return SimulateResponse(
        confidence=confidence,
        steps=steps,
        parallelGroups=parallel_groups,
        autoExecute=auto_execute,
    )


def _simulate_node(node: DAGNode, total_nodes: int) -> SimulationStep:
    base = SERVICE_RELIABILITY.get(node.service, 84.0)
    depth_penalty = max(0, total_nodes - 4) * 0.8
    mutating = node.action in MUTATING_ACTIONS.get(node.service, set())
    mutation_penalty = 8.0 if mutating else 0.0
    generative_penalty = 3.5 if node.service == "gemini" and node.action == "generate" else 0.0
    probability = round(max(35.0, min(99.0, base - depth_penalty - mutation_penalty - generative_penalty)), 1)

    if probability >= 92:
        risk = "LOW"
    elif probability >= 80:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    hitl_required = mutating or risk == "HIGH"
    return SimulationStep(
        nodeId=node.id,
        successProbability=probability,
        risk=risk,
        hitlRequired=hitl_required,
    )


def _build_graph(nodes, edges) -> nx.DiGraph:
    graph = nx.DiGraph()
    for node in nodes:
        graph.add_node(node.id)
    for edge in edges:
        graph.add_edge(edge.from_node, edge.to_node)
    return graph


def _parallel_groups(graph: nx.DiGraph) -> List[List[str]]:
    depths: Dict[str, int] = {}
    for generation_index, generation in enumerate(nx.topological_generations(graph)):
        for node_id in generation:
            depths[node_id] = generation_index

    grouped = defaultdict(list)
    for node_id, depth in depths.items():
        grouped[depth].append(node_id)
    return [sorted(nodes) for nodes in grouped.values()]

