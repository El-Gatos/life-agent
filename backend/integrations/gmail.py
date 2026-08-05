from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import pickle
import os
from typing import Optional
import base64
from email.mime.text import MIMEText
import logging
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class GmailClient:
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    
    def __init__(self, client_id: str, client_secret: str, token_file: str = "gmail_token.pickle"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_file = token_file
        self.service = None
    
    def authenticate(self):
        """First-time auth: opens browser for user to approve"""
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json',  # Download this from Google Cloud
            self.SCOPES
        )
        creds = flow.run_local_server(port=8080)
        
        # Save token for later
        with open(self.token_file, 'wb') as token:
            pickle.dump(creds, token)
        
        return creds
    
    def load_credentials(self):
        """Load saved credentials"""
        creds = None
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # Refresh if expired
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        
        return creds
    
    def get_service(self):
        """Get Gmail API service"""
        from google.oauth2.credentials import Credentials
        import google.auth.transport.requests
        from googleapiclient.discovery import build
        
        creds = self.load_credentials()
        if not creds:
            creds = self.authenticate()
        
        service = build('gmail', 'v1', credentials=creds)
        return service
    
    def fetch_emails(self, max_results: int = 10, query: str = ""):
        """Fetch emails from Gmail"""
        try:
            service = self.get_service()
            results = service.users().messages().list(
                userId='me',
                maxResults=max_results,
                q=query  # e.g., "is:unread" or "from:professor@uni.edu"
            ).execute()
            
            messages = results.get('messages', [])
            return messages
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
            return []
    
    def get_email_details(self, message_id: str) -> dict:
        """Get full email content"""
        try:
            service = self.get_service()
            message = service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            headers = message['payload']['headers']
            
            # Parse headers
            email_data = {
                'gmail_id': message_id,
                'subject': next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject'),
                'sender': next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown'),
                'date': next((h['value'] for h in headers if h['name'] == 'Date'), None),
                'body': self._get_body(message['payload'])
            }
            
            return email_data
        except Exception as e:
            logger.error(f"Error getting email details: {e}")
            return {}
    
    def _get_body(self, payload) -> str:
        """Extract email body from payload"""
        if 'parts' in payload:
            parts = payload['parts']
            for part in parts:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
        elif 'body' in payload:
            if 'data' in payload['body']:
                return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        
        return ""

# Quick helper to get a Gmail client
def get_gmail_client(client_id: str, client_secret: str):
    return GmailClient(client_id, client_secret)

class EmailParser:
    """Parse emails for deadlines and action items"""
    
    # Keywords that indicate deadlines
    DEADLINE_KEYWORDS = [
        r'due\s+(?:on|by|before)?\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'deadline\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'submit\s+(?:by|before)\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'assignment\s+due\s+(\w+\s+\d{1,2})',
        r'due\s+date\s*:?\s*(\w+\s+\d{1,2})',
    ]
    
    @staticmethod
    def extract_deadline(email_body: str, email_subject: str = "") -> Optional[datetime]:
        """Extract deadline date from email"""
        text = f"{email_subject} {email_body}".lower()
        
        for pattern in EmailParser.DEADLINE_KEYWORDS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    date_str = match.group(1)
                    # Try to parse different date formats
                    for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%m/%d', '%B %d', '%b %d']:
                        try:
                            dt = datetime.strptime(date_str, fmt)
                            # Add year if not present
                            if dt.year == 1900:
                                dt = dt.replace(year=datetime.now().year)
                            return dt
                        except ValueError:
                            continue
                except Exception as e:
                    logger.error(f"Error parsing deadline: {e}")
                    continue
        
        return None
    
    @staticmethod
    def extract_tasks(email_body: str) -> list:
        """Extract action items/tasks from email"""
        tasks = []
        
        # Look for bullet points or numbered lists
        lines = email_body.split('\n')
        for line in lines:
            if re.match(r'^\s*[-•*]\s+', line) or re.match(r'^\s*\d+\.\s+', line):
                task = re.sub(r'^\s*[-•*\d.]+\s+', '', line).strip()
                if task:
                    tasks.append(task)
        
        return tasks
    
    @staticmethod
    def is_important(email_subject: str, sender: str) -> bool:
        """Determine if email is from professor/important"""
        important_keywords = ['professor', 'instructor', 'assignment', 'deadline', 'urgent', 'important']
        
        text = f"{email_subject} {sender}".lower()
        return any(keyword in text for keyword in important_keywords)