"""Background task service"""
from typing import Any, Dict, Optional, Callable, List
import asyncio
from datetime import datetime, timedelta

from .base import BaseService
from ..core.background_tasks import TaskQueue, Task, TaskStatus


class TaskService(BaseService):
    """Service for managing background tasks"""
    
    def __init__(self, task_queue: TaskQueue):
        super().__init__()
        self.task_queue = task_queue
    
    async def submit_task(
        self,
        func: Callable,
        *args,
        kwargs: Dict[str, Any] = None,
        task_id: str = None,
        max_retries: int = None
    ) -> str:
        """Submit a background task"""
        task_id = await self.task_queue.enqueue(
            func,
            *args,
            kwargs=kwargs,
            task_id=task_id,
            max_retries=max_retries
        )
        
        self.log_info(
            "Task submitted",
            task_id=task_id,
            func_name=func.__name__
        )
        
        return task_id
    
    async def get_task_info(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task information"""
        task = await self.task_queue.get_task_status(task_id)
        
        if not task:
            return None
        
        return task.to_dict()
    
    async def get_task_result(self, task_id: str) -> Optional[Any]:
        """Get task result"""
        result = await self.task_queue.get_task_result(task_id)
        
        if result is not None:
            self.log_info("Task result retrieved", task_id=task_id)
        
        return result
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        success = await self.task_queue.cancel_task(task_id)
        
        if success:
            self.log_info("Task cancelled successfully", task_id=task_id)
        else:
            self.log_warning("Task cancellation failed", task_id=task_id)
        
        return success
    
    async def wait_for_task(
        self,
        task_id: str,
        timeout: int = 30,
        poll_interval: float = 0.5
    ) -> Optional[Dict[str, Any]]:
        """Wait for task completion with timeout"""
        start_time = datetime.utcnow()
        
        while True:
            task_info = await self.get_task_info(task_id)
            
            if not task_info:
                return None
            
            if task_info["status"] in [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]:
                return task_info
            
            # Check timeout
            if (datetime.utcnow() - start_time).total_seconds() > timeout:
                self.log_warning("Task wait timeout", task_id=task_id, timeout=timeout)
                return task_info
            
            await asyncio.sleep(poll_interval)
    
    async def cleanup_old_tasks(
        self,
        older_than_hours: int = 24,
        statuses: List[str] = None
    ) -> int:
        """Clean up old completed/failed tasks (placeholder)"""
        # This would be implemented with actual task storage
        # For now, just log the operation
        statuses = statuses or [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]
        
        self.log_info(
            "Task cleanup requested",
            older_than_hours=older_than_hours,
            statuses=statuses
        )
        
        return 0  # Placeholder return count