import logging
from datetime import datetime, timedelta
from typing import List, Optional
from database import db
from config import config
from integrations.notifications import NotificationService, NotificationTracker

logger = logging.getLogger(__name__)

class DeadlineAgent:
    """Aggregates and manages deadlines from all sources"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.notification_service = NotificationService()
        self.notification_tracker = NotificationTracker(user_id)
    
    def run(self):
        """Main agent loop: aggregate, deduplicate, prioritize"""
        try:
            logger.info(f"⏰ Deadline Agent running for user {self.user_id}")
            
            # Get all deadlines
            deadlines = self._get_all_deadlines()
            
            if not deadlines:
                logger.info("No deadlines found")
                db.update_sync_log(self.user_id, "deadline_agent", "success")
                return
            
            # Check for duplicates and merge
            deduplicated = self._deduplicate_deadlines(deadlines)
            
            # Update priorities based on due dates
            self._update_priorities(deduplicated)
            
            # Check for upcoming reminders and send notifications
            self._check_and_send_reminders(deduplicated)
            
            # Check for overdue tasks
            self._check_overdue(deduplicated)
            
            logger.info(f"✅ Processed {len(deduplicated)} deadlines")
            db.update_sync_log(self.user_id, "deadline_agent", "success")
            
        except Exception as e:
            logger.error(f"Deadline Agent Error: {e}")
            db.update_sync_log(self.user_id, "deadline_agent", "error", str(e))
    
    def _get_all_deadlines(self) -> List[dict]:
        """Fetch all deadlines from database"""
        try:
            response = db.client.table("deadlines").select("*").eq(
                "user_id", self.user_id
            ).eq("status", "pending").execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error fetching deadlines: {e}")
            return []
    
    def _deduplicate_deadlines(self, deadlines: List[dict]) -> List[dict]:
        """Remove duplicate deadlines (same title, similar due dates)"""
        seen = {}
        deduplicated = []
        
        for deadline in deadlines:
            title = deadline['title'].lower().strip()
            due_date = deadline['due_date']
            
            if title in seen:
                existing = seen[title]
                existing_date = datetime.fromisoformat(existing['due_date'])
                current_date = datetime.fromisoformat(due_date)
                
                if abs((existing_date - current_date).days) <= 1:
                    if current_date < existing_date:
                        deduplicated.remove(existing)
                        deduplicated.append(deadline)
                        seen[title] = deadline
                    continue
            
            seen[title] = deadline
            deduplicated.append(deadline)
        
        return deduplicated
    
    def _update_priorities(self, deadlines: List[dict]):
        """Update priority based on due date"""
        now = datetime.now()
        
        for deadline in deadlines:
            due_date = datetime.fromisoformat(deadline['due_date'])
            days_until = (due_date - now).days
            
            if days_until <= 1:
                priority = "high"
            elif days_until <= 3:
                priority = "high"
            elif days_until <= 7:
                priority = "medium"
            else:
                priority = "low"
            
            try:
                db.client.table("deadlines").update({
                    "priority": priority
                }).eq("id", deadline['id']).execute()
            except Exception as e:
                logger.error(f"Error updating priority: {e}")
    
    def _check_and_send_reminders(self, deadlines: List[dict]):
        """Check if we should send reminders and send them"""
        now = datetime.now()
        
        for deadline in deadlines:
            due_date = datetime.fromisoformat(deadline['due_date'])
            days_until = (due_date - now).days
            
            # Check prefs before sending
            prefs = self._get_notification_prefs()
            if not prefs or not prefs.get('enabled', True):
                continue
            
            # Reminder intervals
            reminders = [
                (7, "1_week"),
                (3, "3_days"),
                (1, "1_day"),
                (0, "today")
            ]
            
            for days, label in reminders:
                if days_until == days:
                    # Check if we already sent this reminder
                    if not self.notification_tracker.has_sent_reminder(deadline['id'], label):
                        # Send notification
                        self.notification_service.deadline_reminder(
                            deadline['title'],
                            days_until
                        )
                        # Log it
                        self.notification_tracker.log_notification(
                            deadline['id'],
                            label,
                            deadline['title']
                        )
    
    def _check_overdue(self, deadlines: List[dict]):
        """Check for overdue deadlines and alert"""
        now = datetime.now()
        
        for deadline in deadlines:
            due_date = datetime.fromisoformat(deadline['due_date'])
            
            if due_date < now:
                days_overdue = (now - due_date).days
                
                # Check if we already sent overdue alert
                if not self.notification_tracker.has_sent_reminder(deadline['id'], 'overdue'):
                    self.notification_service.task_overdue_alert(
                        deadline['title'],
                        days_overdue
                    )
                    self.notification_tracker.log_notification(
                        deadline['id'],
                        'overdue',
                        deadline['title']
                    )
    
    def _get_notification_prefs(self) -> Optional[dict]:
        """Get notification preferences for user"""
        try:
            response = db.client.table("notification_preferences").select("*").eq(
                "user_id", self.user_id
            ).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting notification prefs: {e}")
            return None