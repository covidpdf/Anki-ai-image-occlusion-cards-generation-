"""Background task management endpoints"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel

from ..core.dependencies import get_service_container
from ..core.background_tasks import TaskQueue
from ..services.task_service import TaskService
from ..schemas.task_schemas import (
    TaskSubmitRequest,
    TaskSubmitResponse,
    TaskStatusResponse,
    TaskListResponse
)

router = APIRouter()


def get_task_service() -> TaskService:
    """Get task service instance"""
    container = get_service_container()
    task_queue = container.get(TaskQueue)
    return TaskService(task_queue)


@router.post("/submit", response_model=TaskSubmitResponse)
async def submit_task(
    request: TaskSubmitRequest,
    task_service: TaskService = Depends(get_task_service)
):
    """Submit a background task"""
    try:
        # For now, we'll use a simple demo task function
        # In a real implementation, you'd map task_name to actual functions
        async def demo_task(**kwargs):
            import asyncio
            await asyncio.sleep(2)  # Simulate work
            return {"message": "Task completed", "input": kwargs}
        
        # Map task name to function (simplified)
        task_functions = {
            "demo_task": demo_task,
            # Add more task mappings as needed
        }
        
        if request.task_name not in task_functions:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown task: {request.task_name}"
            )
        
        task_func = task_functions[request.task_name]
        
        # Submit task
        task_id = await task_service.submit_task(
            func=task_func,
            kwargs=request.parameters,
            max_retries=request.max_retries
        )
        
        return TaskSubmitResponse(
            task_id=task_id,
            status="pending",
            submitted_at=task_service.logger.info("Task submitted")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task submission failed: {str(e)}")


@router.get("/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    task_service: TaskService = Depends(get_task_service)
):
    """Get task status"""
    try:
        task_info = await task_service.get_task_info(task_id)
        
        if not task_info:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return TaskStatusResponse(**task_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task status: {str(e)}")


@router.get("/{task_id}/result")
async def get_task_result(
    task_id: str,
    task_service: TaskService = Depends(get_task_service)
):
    """Get task result"""
    try:
        result = await task_service.get_task_result(task_id)
        
        if result is None:
            # Check if task exists
            task_info = await task_service.get_task_info(task_id)
            if not task_info:
                raise HTTPException(status_code=404, detail="Task not found")
            elif task_info["status"] != "completed":
                raise HTTPException(status_code=400, detail="Task not completed yet")
            else:
                raise HTTPException(status_code=500, detail="Task result unavailable")
        
        return {"task_id": task_id, "result": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task result: {str(e)}")


@router.delete("/{task_id}")
async def cancel_task(
    task_id: str,
    task_service: TaskService = Depends(get_task_service)
):
    """Cancel a task"""
    try:
        success = await task_service.cancel_task(task_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Task not found or cannot be cancelled")
        
        return {"task_id": task_id, "cancelled": True}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task cancellation failed: {str(e)}")


@router.get("/{task_id}/wait")
async def wait_for_task(
    task_id: str,
    timeout: int = 30,
    task_service: TaskService = Depends(get_task_service)
):
    """Wait for task completion"""
    try:
        task_info = await task_service.wait_for_task(task_id, timeout=timeout)
        
        if not task_info:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return task_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to wait for task: {str(e)}")


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    task_service: TaskService = Depends(get_task_service)
):
    """List all tasks (placeholder - would need task storage implementation)"""
    # This would require implementing task listing in the task queue
    return TaskListResponse(tasks=[], total=0)