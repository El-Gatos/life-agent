from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from database import db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/deadlines", tags=["deadlines"])

@router.get("/")
async def get_deadlines(
    user_id: str = Query(..., description="User ID"),
    status: str = Query("pending", description="Filter by status: pending, in_progress, completed"),
    priority: str = Query(None, description="Filter by priority: low, medium, high"),
    days_ahead: int = Query(30, description="Number of days to look ahead")
):
    """Get all deadlines with filters"""
    try:
        query = db.client.table("deadlines").select("*").eq(
            "user_id", user_id
        ).eq("status", status)
        
        if priority:
            query = query.eq("priority", priority)
        
        response = query.execute()
        
        # Filter by date range
        now = datetime.now()
        cutoff = now + timedelta(days=days_ahead)
        
        deadlines = [
            d for d in response.data
            if datetime.fromisoformat(d['due_date']) <= cutoff
        ]
        
        # Sort by due date
        deadlines.sort(key=lambda x: x['due_date'])
        
        return {
            "count": len(deadlines),
            "deadlines": deadlines
        }
    except Exception as e:
        logger.error(f"Error fetching deadlines: {e}")
        return {"error": str(e), "deadlines": []}

@router.get("/upcoming")
async def get_upcoming_deadlines(user_id: str = Query(...)):
    """Get upcoming deadlines (next 7 days)"""
    try:
        response = db.client.table("deadlines").select("*").eq(
            "user_id", user_id
        ).eq("status", "pending").order("due_date", desc=False).limit(10).execute()
        
        now = datetime.now()
        week_from_now = now + timedelta(days=7)
        
        upcoming = [
            d for d in response.data
            if datetime.fromisoformat(d['due_date']) <= week_from_now
        ]
        
        return {
            "count": len(upcoming),
            "deadlines": upcoming
        }
    except Exception as e:
        logger.error(f"Error fetching upcoming deadlines: {e}")
        return {"error": str(e), "deadlines": []}

@router.get("/by-priority")
async def get_deadlines_by_priority(user_id: str = Query(...)):
    """Get deadlines grouped by priority"""
    try:
        response = db.client.table("deadlines").select("*").eq(
            "user_id", user_id
        ).eq("status", "pending").order("due_date", desc=False).execute()
        
        # Group by priority
        grouped = {
            "high": [],
            "medium": [],
            "low": []
        }
        
        for deadline in response.data:
            priority = deadline.get('priority', 'medium')
            if priority in grouped:
                grouped[priority].append(deadline)
        
        return grouped
    except Exception as e:
        logger.error(f"Error fetching deadlines by priority: {e}")
        return {"error": str(e)}

@router.post("/{deadline_id}/status")
async def update_deadline_status(
    deadline_id: str,
    status: str = Query(..., description="pending, in_progress, or completed")
):
    """Update deadline status"""
    try:
        db.client.table("deadlines").update({
            "status": status
        }).eq("id", deadline_id).execute()
        
        return {"status": "updated", "deadline_id": deadline_id, "new_status": status}
    except Exception as e:
        logger.error(f"Error updating deadline: {e}")
        return {"error": str(e)}

@router.get("/stats")
async def get_deadline_stats(user_id: str = Query(...)):
    """Get deadline statistics"""
    try:
        # Get all deadlines
        response = db.client.table("deadlines").select("*").eq(
            "user_id", user_id
        ).execute()
        
        deadlines = response.data if response.data else []
        
        # Calculate stats
        now = datetime.now()
        pending = [d for d in deadlines if d['status'] == 'pending']
        overdue = [
            d for d in pending
            if datetime.fromisoformat(d['due_date']) < now
        ]
        due_this_week = [
            d for d in pending
            if datetime.fromisoformat(d['due_date']) <= now + timedelta(days=7)
        ]
        high_priority = [d for d in pending if d['priority'] == 'high']
        
        return {
            "total": len(deadlines),
            "pending": len(pending),
            "overdue": len(overdue),
            "due_this_week": len(due_this_week),
            "high_priority": len(high_priority),
            "completed": len([d for d in deadlines if d['status'] == 'completed'])
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {"error": str(e)}