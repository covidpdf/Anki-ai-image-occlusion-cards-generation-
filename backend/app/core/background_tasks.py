"""Background task queue abstraction"""
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, Optional, List
from datetime import datetime, timezone
import asyncio
import json
from enum import Enum

from .config import get_settings
from .logging import get_logger

logger = get_logger(__name__)


class TaskStatus(str, Enum):
    """Task status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"


class Task:
    """Background task representation"""
    
    def __init__(
        self,
        task_id: str,
        func_name: str,
        args: List[Any] = None,
        kwargs: Dict[str, Any] = None,
        max_retries: int = 3
    ):
        self.task_id = task_id
        self.func_name = func_name
        self.args = args or []
        self.kwargs = kwargs or {}
        self.max_retries = max_retries
        self.retry_count = 0
        self.status = TaskStatus.PENDING
        self.created_at = datetime.now(timezone.utc)
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.result: Optional[Any] = None
        self.error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            "task_id": self.task_id,
            "func_name": self.func_name,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "result": self.result,
            "error": self.error,
        }


class TaskQueue(ABC):
    """Abstract task queue interface"""
    
    @abstractmethod
    async def enqueue(
        self,
        func: Callable,
        *args,
        kwargs: Dict[str, Any] = None,
        task_id: str = None,
        max_retries: int = None
    ) -> str:
        """Enqueue a background task"""
        pass
    
    @abstractmethod
    async def get_task_status(self, task_id: str) -> Optional[Task]:
        """Get task status by ID"""
        pass
    
    @abstractmethod
    async def get_task_result(self, task_id: str) -> Optional[Any]:
        """Get task result by ID"""
        pass
    
    @abstractmethod
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        pass


class InMemoryTaskQueue(TaskQueue):
    """In-memory task queue for development/testing"""
    
    def __init__(self):
        self.settings = get_settings()
        self.tasks: Dict[str, Task] = {}
        self.task_functions: Dict[str, Callable] = {}
        self._running = False
        self._worker_task: Optional[asyncio.Task] = None
    
    def register_function(self, name: str, func: Callable):
        """Register a function that can be called in background tasks"""
        self.task_functions[name] = func
    
    async def enqueue(
        self,
        func: Callable,
        *args,
        kwargs: Dict[str, Any] = None,
        task_id: str = None,
        max_retries: int = None
    ) -> str:
        """Enqueue a background task"""
        import uuid
        
        task_id = task_id or str(uuid.uuid4())
        func_name = func.__name__
        max_retries = max_retries or self.settings.max_retries
        
        # Register function if not already registered
        if func_name not in self.task_functions:
            self.register_function(func_name, func)
        
        task = Task(
            task_id=task_id,
            func_name=func_name,
            args=list(args),
            kwargs=kwargs or {},
            max_retries=max_retries
        )
        
        self.tasks[task_id] = task
        
        # Start worker if not running
        if not self._running:
            await self.start_worker()
        
        logger.info("Task enqueued", task_id=task_id, func_name=func_name)
        return task_id
    
    async def get_task_status(self, task_id: str) -> Optional[Task]:
        """Get task status by ID"""
        return self.tasks.get(task_id)
    
    async def get_task_result(self, task_id: str) -> Optional[Any]:
        """Get task result by ID"""
        task = self.tasks.get(task_id)
        return task.result if task and task.status == TaskStatus.COMPLETED else None
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        task = self.tasks.get(task_id)
        if task and task.status in [TaskStatus.PENDING, TaskStatus.RETRYING]:
            task.status = TaskStatus.FAILED
            task.error = "Task cancelled"
            task.completed_at = datetime.utcnow()
            logger.info("Task cancelled", task_id=task_id)
            return True
        return False
    
    async def start_worker(self):
        """Start the background worker"""
        if self._running:
            return
        
        self._running = True
        self._worker_task = asyncio.create_task(self._worker_loop())
        logger.info("Task worker started")
    
    async def stop_worker(self):
        """Stop the background worker"""
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        logger.info("Task worker stopped")
    
    async def _worker_loop(self):
        """Main worker loop"""
        while self._running:
            # Find pending tasks
            pending_tasks = [
                task for task in self.tasks.values()
                if task.status == TaskStatus.PENDING
            ]
            
            if pending_tasks:
                # Process one task at a time
                task = pending_tasks[0]
                await self._execute_task(task)
            else:
                # No pending tasks, wait a bit
                await asyncio.sleep(0.1)
    
    async def _execute_task(self, task: Task):
        """Execute a single task"""
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now(timezone.utc)
        
        logger.info("Executing task", task_id=task.task_id, func_name=task.func_name)
        
        try:
            func = self.task_functions.get(task.func_name)
            if not func:
                raise ValueError(f"Function {task.func_name} not registered")
            
            # Execute the function
            if asyncio.iscoroutinefunction(func):
                result = await func(*task.args, **task.kwargs)
            else:
                result = func(*task.args, **task.kwargs)
            
            task.result = result
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)
            
            logger.info("Task completed", task_id=task.task_id)
            
        except Exception as e:
            task.error = str(e)
            task.retry_count += 1
            
            if task.retry_count < task.max_retries:
                task.status = TaskStatus.RETRYING
                logger.warning("Task failed, retrying", task_id=task.task_id, error=str(e))
            else:
                task.status = TaskStatus.FAILED
                task.completed_at = datetime.now(timezone.utc)
                logger.error("Task failed permanently", task_id=task.task_id, error=str(e))


class RedisTaskQueue(TaskQueue):
    """Redis-based task queue (placeholder for RQ implementation)"""
    
    def __init__(self):
        self.settings = get_settings()
        logger.warning("Redis task queue not fully implemented - using placeholder")
    
    async def enqueue(
        self,
        func: Callable,
        *args,
        kwargs: Dict[str, Any] = None,
        task_id: str = None,
        max_retries: int = None
    ) -> str:
        """Placeholder for Redis enqueue"""
        import uuid
        task_id = task_id or str(uuid.uuid4())
        logger.info("Redis enqueue (placeholder)", task_id=task_id, func_name=func.__name__)
        return task_id
    
    async def get_task_status(self, task_id: str) -> Optional[Task]:
        """Placeholder for Redis task status"""
        logger.info("Redis get_task_status (placeholder)", task_id=task_id)
        return None
    
    async def get_task_result(self, task_id: str) -> Optional[Any]:
        """Placeholder for Redis task result"""
        logger.info("Redis get_task_result (placeholder)", task_id=task_id)
        return None
    
    async def cancel_task(self, task_id: str) -> bool:
        """Placeholder for Redis cancel"""
        logger.info("Redis cancel_task (placeholder)", task_id=task_id)
        return True


def get_task_queue() -> TaskQueue:
    """Get appropriate task queue based on settings"""
    settings = get_settings()
    
    # For now, always use in-memory queue
    # TODO: Implement Redis queue when Redis is available
    return InMemoryTaskQueue()