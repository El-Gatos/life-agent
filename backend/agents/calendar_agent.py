import logging
from datetime import datetime
from typing import Optional
from integrations.gcalendar import GoogleCalendarClient, CalendarParser
from database import db
from config import config

logger = logging.getLogger(__name__)

class CalendarAgent:
    """Syncs events from Google Calendar"""
    
    def __init__(self, user_id: str, gcal_client: GoogleCalendarClient):
        self.user_id = user_id
        self.gcal = gcal_client
        self.parser = CalendarParser()
    
    def run(self):
        """Main agent loop: fetch events, parse, store"""
        try:
            logger.info(f"📅 Calendar Agent running for user {self.user_id}")
            
            # Fetch upcoming events (next 30 days)
            events = self.gcal.fetch_events(days_ahead=30)
            
            if not events:
                logger.info("No upcoming events found")
                db.update_sync_log(self.user_id, "calendar_agent", "success")
                return
            
            # Check for conflicts
            conflicts = self.parser.check_conflicts(events)
            if conflicts:
                logger.warning(f"⚠️ Found {len(conflicts)} scheduling conflicts")
            
            # Process each event
            for event in events:
                self.process_event(event)
            
            logger.info(f"✅ Processed {len(events)} calendar events")
            db.update_sync_log(self.user_id, "calendar_agent", "success")
            
        except Exception as e:
            logger.error(f"Calendar Agent Error: {e}")
            db.update_sync_log(self.user_id, "calendar_agent", "error", str(e))
    
    def process_event(self, event: dict):
        """Process a single calendar event"""
        try:
            title = event.get('summary', 'Untitled')
            description = event.get('description', '')
            event_id = event.get('id', '')
            
            # Parse times
            start = event.get('start', {})
            end = event.get('end', {})
            
            start_time = start.get('dateTime') or start.get('date')
            end_time = end.get('dateTime') or end.get('date')
            
            # Determine event type
            is_class = self.parser.is_class(title, description)
            is_deadline = self.parser.is_deadline(title, description)
            priority = self.parser.extract_priority(title)
            
            # Store event in database
            self._store_event(
                gcal_id=event_id,
                title=title,
                description=description,
                start_time=start_time,
                end_time=end_time,
                is_class=is_class
            )
            
            # If it's a deadline, create deadline record
            if is_deadline and end_time:
                self._create_deadline(title, end_time, priority, event_id)
            
            logger.info(f"Processed: {title}")
            
        except Exception as e:
            logger.error(f"Error processing event: {e}")
    
    def _store_event(self, gcal_id: str, title: str, description: str, 
                     start_time: str, end_time: str, is_class: bool):
        """Store event in Supabase"""
        try:
            db.client.table("calendar_events").upsert({
                "user_id": self.user_id,
                "gcal_id": gcal_id,
                "title": title,
                "description": description[:500] if description else None,
                "start_time": start_time,
                "end_time": end_time,
                "is_class": is_class,
                "synced_at": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Error storing event: {e}")
    
    def _create_deadline(self, title: str, due_date: str, priority: str, event_id: str):
        """Create a deadline from calendar event"""
        try:
            db.client.table("deadlines").insert({
                "user_id": self.user_id,
                "title": title[:100],
                "due_date": due_date,
                "source": "calendar",
                "source_id": event_id,
                "priority": priority,
                "status": "pending"
            }).execute()
        except Exception as e:
            logger.error(f"Error creating deadline: {e}")