import asyncio
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect
from app.db.redis_client import get_feed

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)
        logger.info(f"WS connected — total: {len(self.connections)}")
        # Send current feed on connect so dashboard populates immediately
        feed = await get_feed(20)
        await ws.send_json({"type": "initial_feed", "data": feed})

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)
        logger.info(f"WS disconnected — total: {len(self.connections)}")

    async def broadcast(self, msg: dict):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_json(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def handle(self, ws: WebSocket):
        await self.connect(ws)
        try:
            while True:
                try:
                    raw = await asyncio.wait_for(ws.receive_text(), timeout=30)
                    msg = json.loads(raw)
                    if msg.get("type") == "ping":
                        await ws.send_json({"type": "pong"})
                except asyncio.TimeoutError:
                    await ws.send_json({"type": "heartbeat"})
                except WebSocketDisconnect:
                    break
        finally:
            self.disconnect(ws)


ws_manager = WebSocketManager()
