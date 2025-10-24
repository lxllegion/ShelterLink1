from fastapi import FastAPI
from routers import register

app = FastAPI()
app.include_router(register.router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
