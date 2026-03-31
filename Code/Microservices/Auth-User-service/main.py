from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config.database import Base, engine
from Routes.index import router

app = FastAPI(title="Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _sync_user_table_columns() -> None:
    # Sync minimal des colonnes pour les environnements ou la table existe deja.
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                ALTER TABLE utilisateurs
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
                """
            )
        )
        conn.execute(
            text(
                """
                ALTER TABLE utilisateurs
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
                """
            )
        )
        conn.execute(
            text(
                """
                ALTER TABLE utilisateurs
                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
                """
            )
        )


try:
    Base.metadata.create_all(bind=engine)
    _sync_user_table_columns()
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
