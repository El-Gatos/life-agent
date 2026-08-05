from fastapi import APIRouter, Query
from datetime import datetime
from database import db
from agents.task_breakdown_agent import TaskBreakdownAgent
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/")
async def get_tasks(
    user_id: str = Query(...),
    deadline_id: str = Query(None),
    status: str = Query(None, description="pending, in_progress, completed")
):
    """Get all tasks, optionally filtered"""
    try:
        query = db.client.table("tasks").select("*").eq("user_id", user_id)
        
        if deadline_id:
            query = query.eq("deadline_id", deadline_id)
        
        if status:
            query = query.eq("status", status)
        
        response = query.order("created_at", desc=False).execute()
        
        return {
            "count": len(response.data),
            "tasks": response.data
        }
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        return {"error": str(e), "tasks": []}

@router.get("/{task_id}")
async def get_task(task_id: str):
    """Get single task details"""
    try:
        response = db.client.table("tasks").select("*").eq("id", task_id).execute()
        
        return response.data[0] if response.data else {"error": "Task not found"}
    except Exception as e:
        logger.error(f"Error fetching task: {e}")
        return {"error": str(e)}

@router.post("/breakdown/{deadline_id}")
async def breakdown_deadline(deadline_id: str, user_id: str = Query(...)):
    """Trigger Claude to break down a deadline"""
    try:
        agent = TaskBreakdownAgent(user_id)
        result = agent.break_down_deadline(deadline_id)
        
        return result
    except Exception as e:
        logger.error(f"Error breaking down deadline: {e}")
        return {"error": str(e)}

@router.post("/breakdown-all")
async def breakdown_all(user_id: str = Query(...)):
    """Break down all pending deadlines"""
    try:
        agent = TaskBreakdownAgent(user_id)
        agent.breakdown_all_pending()
        
        return {"status": "All deadlines broken down"}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

@router.post("/{task_id}/status")
async def update_task_status(
    task_id: str,
    status: str = Query(..., description="pending, in_progress, completed")
):
    """Update task status"""
    try:
        db.client.table("tasks").update({
            "status": status
        }).eq("id", task_id).execute()
        
        return {"status": "updated", "task_id": task_id, "new_status": status}
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return {"error": str(e)}

@router.get("/deadline/{deadline_id}/progress")
async def get_deadline_progress(deadline_id: str):
    """Get progress on a deadline (% of tasks completed)"""
    try:
        # Get all tasks for this deadline
        response = db.client.table("tasks").select("*").eq(
            "deadline_id", deadline_id
        ).execute()
        
        tasks = response.data if response.data else []
        
        if not tasks:
            return {"progress": 0, "tasks": 0, "completed": 0}
        
        completed = len([t for t in tasks if t['status'] == 'completed'])
        total = len(tasks)
        progress = (completed / total * 100) if total > 0 else 0
        
        return {
            "deadline_id": deadline_id,
            "total_tasks": total,
            "completed_tasks": completed,
            "progress_percent": round(progress, 1),
            "tasks": tasks
        }
    except Exception as e:
        logger.error(f"Error getting progress: {e}")
        return {"error": str(e)}

@router.get("/analysis/{deadline_id}")
async def get_deadline_analysis(deadline_id: str, user_id: str = Query(...)):
    """Get Claude's analysis of a deadline"""
    try:
        from integrations.claude import ClaudeClient
        
        # Get deadline
        response = db.client.table("deadlines").select("*").eq(
            "id", deadline_id
        ).execute()
        
        deadline = response.data[0] if response.data else None
        
        if not deadline:
            return {"error": "Deadline not found"}
        
        claude = ClaudeClient()
        analysis = claude.analyze_deadline(
            deadline_title=deadline['title'],
            due_date=deadline['due_date'],
            current_progress="Not started"
        )
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing deadline: {e}")
        return {"error": str(e)}