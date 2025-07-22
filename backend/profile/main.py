from fastapi import FastAPI
from backend.profile.routers import profile, project


app = FastAPI()
app.include_router(profile.router)
app.include_router(project.router)
