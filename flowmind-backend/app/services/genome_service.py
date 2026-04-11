"""
genome_service.py — Creates and manages workflow genomes.
A Genome is a fingerprint of a successful workflow execution,
used for future optimization and cloning.
"""
from datetime import datetime
from app.models.genome import Genome
from app.models.workflow import Workflow, Execution


def _calculate_fitness(execution: Execution) -> float:
    """
    Fitness score (0-100) based on:
    - Success rate of all nodes
    - Average execution speed
    - No self-healing attempts needed = higher score
    """
    log = execution.log_json or []
    if not log:
        return 0.0

    total = len(log)
    successes = sum(1 for entry in log if entry.get("status") == "success")
    healed = sum(1 for entry in log if entry.get("status") == "healed")
    avg_duration = sum(
        entry.get("duration", 1000) for entry in log if entry.get("duration")
    ) / max(total, 1)

    success_score = (successes / total) * 70
    speed_score = max(0, 20 - (avg_duration / 1000))  # faster = higher
    reliability_score = 10 - (healed * 2)  # penalty for healed nodes

    return round(min(100, max(0, success_score + speed_score + reliability_score)), 1)


async def create_genome(workflow: Workflow, execution: Execution) -> Genome:
    """Create and persist a new Genome document after successful execution."""
    dag = workflow.dag_json or {}
    nodes = dag.get("nodes", [])
    services = list({n.get("service", "") for n in nodes if n.get("service")})
    services.sort()

    fitness = _calculate_fitness(execution)

    name = _generate_genome_name(services)

    genome = Genome(
        user_id=workflow.user_id,
        workflow_id=str(workflow.id),
        name=name,
        services=services,
        fingerprint={
            "step_count": len(nodes),
            "services": services,
            "description_snippet": workflow.description[:80],
        },
        fitness_score=fitness,
        run_count=1,
        last_run=datetime.utcnow(),
    )
    await genome.insert()
    return genome


def _generate_genome_name(services: list) -> str:
    """Auto-generate a readable name from service list."""
    service_labels = {
        "gmail": "Email",
        "github": "GitHub",
        "notion": "Notion",
        "drive": "Drive",
        "gemini": "AI",
    }
    parts = [service_labels.get(s, s.title()) for s in services[:3]]
    return " → ".join(parts) + " Workflow"
