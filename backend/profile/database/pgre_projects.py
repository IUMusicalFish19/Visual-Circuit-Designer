from typing import Any, Dict, Optional, Type, TypeVar
from sqlalchemy import select, delete, update, insert
from sqlalchemy.ext.asyncio import AsyncSession
from backend.profile.models import ProjectModel
from backend.profile.schemas import ProjectDB

UP = TypeVar("UP", bound=ProjectDB)

class PostgreSQLProjectDatabase:
    def __init__(
        self,
        session: AsyncSession,
        project_model: Type[ProjectModel],
        project_db_model: Type[UP]
    ):
        self.session = session
        self.project_model = project_model
        self.project_db_model = project_db_model

    async def create(self, project_dict: Dict[str, Any]) -> UP:
        stmt = insert(self.project_model).values(**project_dict).returning(self.project_model)
        result = await self.session.execute(stmt)
        await self.session.commit()
        project = result.scalar_one()
        return self._convert_to_projectdb(project)

    async def get(self, owner_id: int, pid: int) -> Optional[UP]:
        stmt = select(self.project_model).where(
            self.project_model.owner_id == owner_id,
            self.project_model.pid == pid
        )
        result = await self.session.execute(stmt)
        project = result.scalar_one_or_none()
        if project is None:
            return None
        return self._convert_to_projectdb(project)

    async def get_all(self, owner_id: int) -> list[UP]:
        stmt = select(self.project_model).where(self.project_model.owner_id == owner_id)
        result = await self.session.execute(stmt)
        projects = result.scalars().all()
        return [self._convert_to_projectdb(p) for p in projects]

    async def update(self, owner_id: int, pid: int, update_dict: Dict[str, Any]) -> UP:
        stmt = (
            update(self.project_model)
            .where(
                self.project_model.owner_id == owner_id,
                self.project_model.pid == pid
            )
            .values(**update_dict)
            .returning(self.project_model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        project = result.scalar_one()
        return self._convert_to_projectdb(project)

    async def delete(self, owner_id: int, pid: int) -> None:
        stmt = delete(self.project_model).where(
            self.project_model.owner_id == owner_id,
            self.project_model.pid == pid
        )
        await self.session.execute(stmt)
        await self.session.commit()

    def _convert_to_projectdb(self, project: ProjectModel) -> UP:
        return self.project_db_model(**project.__dict__)