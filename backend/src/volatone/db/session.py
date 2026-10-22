from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from ..config import get_settings

settings = get_settings()

# asyncpg is the fastest async PostgreSQL driver for Python
engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
    echo=False,  # Set to True for local SQL debugging
    pool_pre_ping=True,  # Detects dropped connections automatically
)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI routes to get a DB session."""
    async with AsyncSessionLocal() as session:
        yield session
