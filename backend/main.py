from fastapi import FastAPI
from routers import register
from fastapi.middleware.cors import CORSMiddleware
from routers.forms import router as forms_router

app = FastAPI()
app.include_router(register.router)
app.include_router(forms_router)

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