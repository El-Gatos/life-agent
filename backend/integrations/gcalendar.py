from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import pickle
import os
from datetime import datetime, timedelta
from typing import Optional, List
import logging
import re


logger = logging.getLogger(__name__)

class GoogleCalendarClient:
    SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
    
    def __init__(self, token_file: str = "gcal_token.pickle"):
        self.token_file = token_file
        self.service = None
    
    def load_credentials(self):
        """Load saved credentials"""
        from google.oauth2.credentials import Credentials
        
        creds = None
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # Refresh if expired
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        
        return creds
    
    def authenticate(self):
        """First-time auth for Google Calendar"""
        from google_auth_oauthlib.flow import InstalledAppFlow
        
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json',
            self.SCOPES
        )
        creds = flow.run_local_server(port=8081)  # Different port than Gmail
        
        with open(self.token_file, 'wb') as token:
            pickle.dump(creds, token)
        
        return creds
    
    def get_service(self):
        """Get Calendar API service"""
        creds = self.load_credentials()
        if not creds:
            creds = self.authenticate()
        
        service = build('calendar', 'v3', credentials=creds)
        return service
    
    def fetch_events(self, days_ahead: int = 30) -> List[dict]:
        """Fetch upcoming events"""
        try:
            service = self.get_service()
            
            now = datetime.utcnow().isoformat() + 'Z'
            end = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + 'Z'
            
            results = service.events().list(
                calendarId='primary',
                timeMin=now,
                timeMax=end,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = results.get('items', [])
            return events
        except Exception as e:
            logger.error(f"Error fetching calendar events: {e}")
            return []
    
    def get_event_details(self, event_id: str, calendar_id: str = 'primary') -> dict:
        """Get full event details"""
        try:
            service = self.get_service()
            event = service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            return event
        except Exception as e:
            logger.error(f"Error getting event details: {e}")
            return {}

def get_gcalendar_client():
    return GoogleCalendarClient()

class CalendarParser:
    """Parse calendar events for deadlines and conflicts"""
    
    CLASS_KEYWORDS = ['class', 'lecture', 'lab', 'seminar', 'discussion', 'section']
    DEADLINE_KEYWORDS = ['due', 'submission', 'exam', 'quiz', 'test', 'assignment', 'project']
    
    @staticmethod
    def is_class(event_title: str, event_description: str = "") -> bool:
        """Determine if event is a class"""
        text = f"{event_title} {event_description}".lower()
        return any(keyword in text for keyword in CalendarParser.CLASS_KEYWORDS)
    
    @staticmethod
    def is_deadline(event_title: str, event_description: str = "") -> bool:
        """Determine if event is a deadline"""
        text = f"{event_title} {event_description}".lower()
        return any(keyword in text for keyword in CalendarParser.DEADLINE_KEYWORDS)
    
    @staticmethod
    def extract_priority(event_title: str) -> str:
        """Extract priority from event title"""
        text = event_title.lower()
        if any(word in text for word in ['urgent', 'important', 'final', 'exam']):
            return 'high'
        elif any(word in text for word in ['due', 'deadline']):
            return 'high'
        else:
            return 'medium'
    
    @staticmethod
    def check_conflicts(events: List[dict]) -> List[dict]:
        """Check for overlapping events"""
        conflicts = []
        
        for i, event1 in enumerate(events):
            for event2 in events[i+1:]:
                # Check if times overlap
                start1 = event1.get('start', {}).get('dateTime')
                end1 = event1.get('end', {}).get('dateTime')
                start2 = event2.get('start', {}).get('dateTime')
                end2 = event2.get('end', {}).get('dateTime')
                
                if start1 and end1 and start2 and end2:
                    if start1 < end2 and start2 < end1:
                        conflicts.append({
                            'event1': event1.get('summary'),
                            'event2': event2.get('summary'),
                            'time': start1
                        })
        
        return conflicts