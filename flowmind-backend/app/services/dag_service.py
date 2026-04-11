"""
dag_service.py — Builds and analyzes NetworkX DAGs.
"""
import networkx as nx
from typing import List, Dict, Any


def build_dag(nodes: List[Dict], edges: List[Dict]) -> nx.DiGraph:
    """Build a NetworkX DiGraph from node/edge lists."""
    G = nx.DiGraph()
    for n in nodes:
        G.add_node(n["id"], **n)
    for e in edges:
        # Support both {"from": ..., "to": ...} and {"from_node": ..., "to_node": ...}
        src = e.get("from") or e.get("from_node")
        dst = e.get("to") or e.get("to_node")
        if src and dst:
            G.add_edge(src, dst)
    return G


def get_parallel_levels(G: nx.DiGraph) -> List[List[str]]:
    """Return topological generations — each inner list can run in parallel."""
    return [list(gen) for gen in nx.topological_generations(G)]


def is_valid_dag(G: nx.DiGraph) -> bool:
    """Check that the graph is a valid DAG (no cycles)."""
    return nx.is_directed_acyclic_graph(G)
