from fastapi import APIRouter, Query
from datetime import time
from database import db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/preferences")
async def get_notification_preferences(user_id: str = Query(...)):
    """Get notification preferences"""
    try:
        response = db.client.table("notification_preferences").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if response.data:
            return response.data[0]
        else:
            # Return defaults if not set
            return {
                "enabled": True,
                "send_email_reminders": True,
                "send_calendar_alerts": True,
                "send_overdue_alerts": True,
                "quiet_hours_start": None,
                "quiet_hours_end": None
            }
    except Exception as e:
        logger.error(f"Error fetching preferences: {e}")
        return {"error": str(e)}

@router.post("/preferences")
async def update_notification_preferences(
    user_id: str = Query(...),
    enabled: bool = Query(True),
    send_email_reminders: bool = Query(True),
    send_calendar_alerts: bool = Query(True),
    send_overdue_alerts: bool = Query(True),
    quiet_hours_start: str = Query(None),
    quiet_hours_end: str = Query(None)
):
    """Update notification preferences"""
    try:
        db.client.table("notification_preferences").upsert({
            "user_id": user_id,
            "enabled": enabled,
            "send_email_reminders": send_email_reminders,
            "send_calendar_alerts": send_calendar_alerts,
            "send_overdue_alerts": send_overdue_alerts,
            "quiet_hours_start": quiet_hours_start,
            "quiet_hours_end": quiet_hours_end
        }).execute()
        
        return {"status": "updated"}
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        return {"error": str(e)}

@router.get("/history")
async def get_notification_history(
    user_id: str = Query(...),
    limit: int = Query(20, description="Max notifications to return")
):
    """Get notification history"""
    try:
        response = db.client.table("notifications").select("*").eq(
            "user_id", user_id
        ).order("sent_at", desc=True).limit(limit).execute()
        
        return {
            "count": len(response.data),
            "notifications": response.data
        }
    except Exception as e:
        logger.error(f"Error fetching notification history: {e}")
        return {"error": str(e), "notifications": []}