from fastapi import APIRouter, Depends, HTTPException
from backend.profile.database.db import get_project_db
from backend.profile.database.pgre_projects import PostgreSQLProjectDatabase
from backend.profile.schemas import Project, ProjectDB, UserDB, ProjectCreateResponse
from backend.profile.utils import get_current_user


router = APIRouter(prefix="/api/profile/{id}/project", tags=["projects"])

@router.post("", response_model=ProjectCreateResponse)
async def create_project(
        id: int,
        project: Project,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if current_user['id'] != id:
        raise HTTPException(status_code=403, detail="Cannot create project for another user")
    project_dict = project.model_dump()
    project_dict["owner_id"] = id
    created_project = await project_db.create(project_dict)
    return {
        "status": "project created",
        "project_id": created_project.pid
    }


@router.get("", response_model=list[ProjectDB])
async def get_all_projects(
        id: int,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    return await project_db.get_all(id)


@router.get("/{pid}", response_model=ProjectDB)
async def get_project(
        id: int,
        pid: int,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this project"
        )
    project = await project_db.get(current_user['id'], pid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{pid}/name", response_model=dict)
async def update_project_name(
        id: int,
        pid: int,
        data: dict,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this project"
        )
    if "name" not in data:
        raise HTTPException(status_code=400, detail="Name is required")

    await project_db.update(id, pid, {"name": data["name"]})
    return {"status": "name updated"}


@router.patch("/{pid}/circuit", response_model=dict)
async def update_project_circuit(
        id: int,
        pid: int,
        data: dict,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this project"
        )
    if "circuit" not in data:
        raise HTTPException(status_code=400, detail="Circuit data is required")

    await project_db.update(id, pid, {"circuit": data["circuit"]})
    return {"status": "circuit updated"}


@router.patch("/{pid}/custom_nodes", response_model=dict)
async def update_custom_nodes(
        id: int,
        pid: int,
        data: dict,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this project"
        )
    if "custom_nodes" not in data:
        raise HTTPException(status_code=400, detail="Custom nodes data is required")

    await project_db.update(id, pid, {"custom_nodes": data["custom_nodes"]})
    return {"status": "custom_nodes updated"}


@router.delete("/{pid}", response_model=dict)
async def delete_project(
        id: int,
        pid: int,
        current_user: UserDB = Depends(get_current_user),
        project_db: PostgreSQLProjectDatabase = Depends(get_project_db)
):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this project"
        )
    await project_db.delete(id, pid)
    return {"status": "project deleted"}