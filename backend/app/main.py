from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis, auth, health, indicators, live_threats, threats
from app.core.config import settings
from app.database import init_db

app = FastAPI(title=settings.APP_NAME, version="0.1.0", debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(threats.router, prefix="/api")
app.include_router(indicators.router, prefix="/api")
app.include_router(live_threats.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
