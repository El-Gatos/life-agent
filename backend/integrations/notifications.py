from plyer import notification
from datetime import datetime, timedelta
from database import db
import logging
from typing import Optional


logger = logging.getLogger(__name__)

class NotificationService:
    """Cross-platform OS notifications"""
    
    def __init__(self, app_name: str = "Life Agent"):
        self.app_name = app_name
    
    def send_notification(self, title: str, message: str, timeout: int = 10):
        """Send OS notification"""
        try:
            notification.notify(
                title=title,
                message=message,
                app_name=self.app_name,
                timeout=timeout
            )
            logger.info(f"📬 Notification sent: {title}")
            return True
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return False
    
    def deadline_reminder(self, deadline_title: str, days_until: int):
        """Send deadline reminder notification"""
        if days_until == 0:
            label = "TODAY"
            priority = "🔴"
        elif days_until == 1:
            label = "Tomorrow"
            priority = "🟠"
        elif days_until == 3:
            label = "in 3 days"
            priority = "🟡"
        elif days_until == 7:
            label = "in 1 week"
            priority = "🟢"
        else:
            label = f"in {days_until} days"
            priority = "⚪"
        
        title = f"{priority} Deadline Reminder"
        message = f"{deadline_title}\n{label}"
        
        return self.send_notification(title, message, timeout=15)
    
    def email_alert(self, subject: str, from_sender: str):
        """Send email alert notification"""
        title = "📧 New Email"
        message = f"From: {from_sender}\n{subject[:50]}..."
        
        return self.send_notification(title, message)
    
    def calendar_alert(self, event_title: str, minutes_until: int):
        """Send calendar event alert"""
        title = "📅 Upcoming Event"
        message = f"{event_title}\nStarts in {minutes_until} minutes"
        
        return self.send_notification(title, message)
    
    def conflict_alert(self, event1: str, event2: str):
        """Send scheduling conflict alert"""
        title = "⚠️ Schedule Conflict"
        message = f"{event1}\noverlaps with\n{event2}"
        
        return self.send_notification(title, message, timeout=20)
    
    def task_overdue_alert(self, task_title: str, days_overdue: int):
        """Send overdue task alert"""
        title = "🚨 OVERDUE"
        message = f"{task_title}\n{days_overdue} days overdue"
        
        return self.send_notification(title, message, timeout=20)

def get_notification_service():
    return NotificationService()

class NotificationTracker:
    """Track sent notifications to avoid spam"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    def has_sent_reminder(self, deadline_id: str, reminder_type: str) -> bool:
        """Check if we already sent this reminder"""
        try:
            response = db.client.table("notifications").select("*").eq(
                "deadline_id", deadline_id
            ).eq("reminder_type", reminder_type).eq(
                "user_id", self.user_id
            ).execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error checking notification: {e}")
            return False
    
    def log_notification(self, deadline_id: str, reminder_type: str, title: str):
        """Log that we sent a notification"""
        try:
            db.client.table("notifications").insert({
                "user_id": self.user_id,
                "deadline_id": deadline_id,
                "reminder_type": reminder_type,
                "title": title,
                "sent_at": datetime.now().isoformat()
            }).execute()
            
            logger.info(f"✅ Logged notification for deadline {deadline_id}")
        except Exception as e:
            logger.error(f"Error logging notification: {e}")