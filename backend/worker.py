"""Background task worker for RQ"""
import os
import sys
from rq import Worker
from redis import Redis

# Add the app directory to Python path
sys.path.insert(0, '/app')

from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)

def main():
    """Run the RQ worker"""
    settings = get_settings()
    
    # Connect to Redis
    redis_conn = Redis.from_url(settings.redis_url)
    
    # List of queues to listen to
    queues = [settings.redis_queue_name]
    
    logger.info("Starting RQ worker", queues=queues, redis_url=settings.redis_url)
    
    try:
        # Create and start worker
        worker = Worker(
            queues,
            connection=redis_conn,
            default_worker_ttl=settings.background_task_timeout,
            job_monitoring_interval=10
        )
        
        worker.work()
        
    except KeyboardInterrupt:
        logger.info("Worker stopped by user")
    except Exception as e:
        logger.error("Worker failed", error=str(e))
        raise
    finally:
        logger.info("Worker shutdown complete")


if __name__ == "__main__":
    main()