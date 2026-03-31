from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import Base, engine
from Model.User import User  # noqa: F401
from Routes.index import router

app = FastAPI(title="Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
    print("Database connected successfully")
except Exception:
    print("Database connection failed")

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"service": "Auth Service", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
