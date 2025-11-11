from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.register import router as register_router
from routers.forms import router as forms_router
from routers.user import router as user_router
from routers.match import router as match_router
from routers.shelters import router as shelters_router

app = FastAPI()
app.include_router(register_router)
app.include_router(forms_router)
app.include_router(user_router)
app.include_router(match_router)
app.include_router(shelters_router)

# For frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is now running"}