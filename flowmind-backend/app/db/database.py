from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    # Import models here to avoid circular imports
    from app.models.user import User
    from app.models.workflow import Workflow, Execution
    from app.models.genome import Genome
    from app.models.integration import Integration

    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await init_beanie(
            database=client[settings.DB_NAME],
            document_models=[User, Workflow, Execution, Genome, Integration],
        )
        logger.info(f"✅ Connected to MongoDB: {settings.DB_NAME}")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise
