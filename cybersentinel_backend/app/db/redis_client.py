import json
import time
import logging
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)

_redis = None


async def connect_redis():
    print("⚠ Redis disabled for development")
    return None


async def get_redis():
    return _redis


async def push_to_feed(threat: dict):
    if _redis:
        try:
            await _redis.zadd(
                "cybersentinel:feed", {json.dumps(threat, default=str): time.time()}
            )
            await _redis.zremrangebyrank("cybersentinel:feed", 0, -101)
        except Exception as e:
            logger.error(f"Redis push error: {e}")


async def get_feed(limit: int = 20) -> list:
    if _redis:
        try:
            items = await _redis.zrevrange("cybersentinel:feed", 0, limit - 1)
            return [json.loads(i) for i in items]
        except Exception as e:
            logger.error(f"Redis get_feed error: {e}")
    return []


async def update_stats(key: str, inc: int = 1):
    if _redis:
        try:
            await _redis.hincrby("cybersentinel:stats:today", key, inc)
        except Exception as e:
            logger.error(f"Redis stats error: {e}")


async def get_stats() -> dict:
    if _redis:
        try:
            raw = await _redis.hgetall("cybersentinel:stats:today")
            return {k: int(v) for k, v in raw.items()}
        except Exception as e:
            logger.error(f"Redis get_stats error: {e}")
    return {}
