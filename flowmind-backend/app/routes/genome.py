from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models.user import User
from app.models.genome import Genome
from app.models.workflow import Workflow, WorkflowStatus
from app.schemas.genome import CloneGenomeRequest

router = APIRouter(prefix="/api/genome", tags=["genome"])


@router.get("/list")
async def list_genomes(current_user: User = Depends(get_current_user)):
    genomes = await Genome.find(Genome.user_id == str(current_user.id)).sort("-last_run").to_list()
    return [
        {
            "genomeId": str(g.id),
            "name": g.name,
            "services": g.services,
            "fitnessScore": g.fitness_score,
            "runCount": g.run_count,
            "lastRun": g.last_run.isoformat() if g.last_run else None,
        }
        for g in genomes
    ]


@router.get("/{genome_id}")
async def get_genome(
    genome_id: str,
    current_user: User = Depends(get_current_user),
):
    genome = await Genome.get(genome_id)
    if not genome or genome.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Genome not found")
    return {
        "genomeId": str(genome.id),
        "name": genome.name,
        "services": genome.services,
        "fitnessScore": genome.fitness_score,
        "runCount": genome.run_count,
        "fingerprint": genome.fingerprint,
        "lastRun": genome.last_run.isoformat() if genome.last_run else None,
    }


@router.post("/clone")
async def clone_genome(
    body: CloneGenomeRequest,
    current_user: User = Depends(get_current_user),
):
    """Clone a genome into a new workflow that can be edited and re-executed."""
    genome = await Genome.get(body.genomeId)
    if not genome or genome.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Genome not found")

    # Get original workflow to clone its DAG
    original = await Workflow.get(genome.workflow_id)
    if not original:
        raise HTTPException(status_code=404, detail="Original workflow not found")

    cloned = Workflow(
        user_id=str(current_user.id),
        description=f"[Cloned] {original.description}",
        dag_json=original.dag_json,
        status=WorkflowStatus.PENDING,
    )
    await cloned.insert()

    return {
        "workflowId": str(cloned.id),
        "description": cloned.description,
        "dag": cloned.dag_json,
    }
