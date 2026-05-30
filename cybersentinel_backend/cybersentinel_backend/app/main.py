import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes    import analyze, threats, dashboard, monitor, credentials, alerts
from app.api.websocket import ws_manager
from app.db.mongodb    import connect_db, close_db
from app.db.redis_client import connect_redis
from app.tasks.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="CyberSentinel API",
    description="AI-Powered Cyber Threat Intelligence — Bright Data × OpenAI GPT-4",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS: allow the Next.js frontend ────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────
app.include_router(analyze.router,     prefix="/api/v1/analyze",     tags=["Analysis"])
app.include_router(threats.router,     prefix="/api/v1/threats",     tags=["Threats"])
app.include_router(dashboard.router,   prefix="/api/v1/dashboard",   tags=["Dashboard"])
app.include_router(monitor.router,     prefix="/api/v1/monitor",     tags=["Monitor"])
app.include_router(credentials.router, prefix="/api/v1/credentials", tags=["Credentials"])
app.include_router(alerts.router,      prefix="/api/v1/alerts",      tags=["Alerts"])


# ── WebSocket ─────────────────────────────────────────────────────
@app.websocket("/ws/threats")
async def threat_ws(websocket: WebSocket):
    await ws_manager.handle(websocket)


# ── Lifecycle ────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    print("\n" + "="*55)
    print("  🛡️  CyberSentinel API Starting...")
    print("="*55 + "\n")
    await connect_db()
    await connect_redis()
    await start_scheduler()
    print("\n" + "="*55)
    print("  ✅  CyberSentinel is LIVE")
    print("  📖  API Docs → http://localhost:8000/api/docs")
    print("="*55 + "\n")


@app.on_event("shutdown")
async def shutdown():
    await stop_scheduler()
    await close_db()


# ── Health ───────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "operational", "service": "CyberSentinel", "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": "CyberSentinel API — visit /api/docs for full documentation"}
