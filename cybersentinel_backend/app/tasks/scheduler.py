import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger    = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def _hunt():
    try:
        from app.agents.threat_hunter import ThreatHunterAgent
        found = await ThreatHunterAgent().run_hunt_cycle()
        logger.info(f"Scheduled hunt: {len(found)} threats")
    except Exception as e:
        logger.error(f"Scheduled hunt failed: {e}")


async def start_scheduler():
    scheduler.add_job(_hunt, "interval", minutes=15, id="hunt",
                      replace_existing=True, max_instances=1)
    scheduler.start()
    logger.info("✅ Scheduler running — threat hunt every 15 min")


async def stop_scheduler():
    try:
        scheduler.shutdown(wait=False)
    except Exception:
        pass
