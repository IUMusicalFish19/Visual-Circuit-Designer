from fastapi import APIRouter, HTTPException, Depends
from backend.profile.database.db import get_user_db
from backend.profile.database.pgre_users import PostgreSQLUserDatabase
from backend.profile.schemas import UpdateName, UpdateEmail, UpdatePassword, UserDB
from backend.profile.utils import get_current_user


router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/{id}")
async def get_profile(
        id: int,
        current_user: UserDB = Depends(get_current_user),
        user_db: PostgreSQLUserDatabase = Depends(get_user_db)):
    try:
        user = await user_db.get(id)
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if id != current_user['id']:
        return {
            "id": user.id,
            "username": user.username,
            "name": user.name,
        }
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email
    }

@router.patch("/{id}/name")
async def update_name(
        id: int,
        body: UpdateName,
        current_user: UserDB = Depends(get_current_user),
        user_db: PostgreSQLUserDatabase = Depends(get_user_db)):
    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not eligible to update other users' name"
        )
    user = await user_db.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {"name": body.name}
    await user_db.update(user, update_dict=update_data)
    return {"status": "name updated"}

@router.patch("/{id}/email")
async def update_email(
        id: int,
        body: UpdateEmail,
        current_user: UserDB = Depends(get_current_user),
        user_db: PostgreSQLUserDatabase = Depends(get_user_db)):
    user = await user_db.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not eligible to update other users' email"
        )
    update_data = {"email": body.email}
    await user_db.update(user, update_dict=update_data)
    return {"status": "email updated"}
#
@router.patch("/{id}/password")
async def update_password(id: int, body: UpdatePassword, user_db: PostgreSQLUserDatabase = Depends(get_user_db)):
    # fastapi-users UserManager
    # return {"status": "password updated"}
    raise HTTPException(status_code=400, detail="Password not supported")
#
@router.delete("/{id}")
async def delete_profile(
        id: int,
        current_user: UserDB = Depends(get_current_user),
        user_db: PostgreSQLUserDatabase = Depends(get_user_db)):
    user = await user_db.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if id != current_user['id']:
        raise HTTPException(
            status_code=403,
            detail="You are not eligible to delete other users' profile"
        )
    await user_db.delete(user)
    return {"status": "deleted"}