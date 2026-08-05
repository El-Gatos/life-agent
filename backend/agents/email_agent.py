import logging
from datetime import datetime
from typing import Optional
from integrations.gmail import GmailClient, EmailParser
from database import db
from config import config

logger = logging.getLogger(__name__)

class EmailAgent:
    """Syncs emails from Gmail and extracts deadlines"""
    
    def __init__(self, user_id: str, gmail_client: GmailClient):
        self.user_id = user_id
        self.gmail = gmail_client
        self.parser = EmailParser()
    
    def run(self):
        """Main agent loop: fetch emails, parse, store"""
        try:
            logger.info(f"📧 Email Agent running for user {self.user_id}")
            
            # Fetch recent emails
            messages = self.gmail.fetch_emails(max_results=20, query="is:unread")
            
            if not messages:
                logger.info("No new emails found")
                db.update_sync_log(self.user_id, "email_agent", "success")
                return
            
            # Process each email
            for message in messages:
                self.process_email(message['id'])
            
            logger.info(f"✅ Processed {len(messages)} emails")
            db.update_sync_log(self.user_id, "email_agent", "success")
            
        except Exception as e:
            logger.error(f"Email Agent Error: {e}")
            db.update_sync_log(self.user_id, "email_agent", "error", str(e))
    
    def process_email(self, message_id: str):
        """Process a single email"""
        try:
            # Get full email
            email_data = self.gmail.get_email_details(message_id)
            
            if not email_data:
                return
            
            subject = email_data.get('subject', '')
            sender = email_data.get('sender', '')
            body = email_data.get('body', '')
            
            # Extract deadline
            deadline_date = self.parser.extract_deadline(body, subject)
            
            # Extract tasks
            tasks = self.parser.extract_tasks(body)
            
            # Check if important
            is_important = self.parser.is_important(subject, sender)
            
            # Store email in database
            self._store_email(
                gmail_id=message_id,
                subject=subject,
                sender=sender,
                body=body,
                has_deadline=deadline_date is not None,
                deadline_date=deadline_date,
                tasks=tasks
            )
            
            # If has deadline, create deadline record
            if deadline_date:
                self._create_deadline(subject, deadline_date, sender, message_id)
            
            logger.info(f"Processed: {subject[:50]}")
            
        except Exception as e:
            logger.error(f"Error processing email {message_id}: {e}")
    
    def _store_email(self, gmail_id: str, subject: str, sender: str, body: str, 
                     has_deadline: bool, deadline_date: Optional[datetime], tasks: list):
        """Store email in Supabase"""
        try:
            db.client.table("emails").upsert({
                "user_id": self.user_id,
                "gmail_id": gmail_id,
                "subject": subject,
                "sender": sender,
                "body": body[:500],  # Store first 500 chars
                "has_deadline": has_deadline,
                "deadline_date": deadline_date.isoformat() if deadline_date else None,
                "extracted_tasks": tasks,
                "synced_at": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Error storing email: {e}")
    
    def _create_deadline(self, title: str, due_date: datetime, source_id: str, email_id: str):
        """Create a deadline from email"""
        try:
            db.client.table("deadlines").insert({
                "user_id": self.user_id,
                "title": title[:100],
                "due_date": due_date.isoformat(),
                "source": "email",
                "source_id": email_id,
                "priority": "high" if self.parser.is_important(title, source_id) else "medium",
                "status": "pending"
            }).execute()
        except Exception as e:
            logger.error(f"Error creating deadline: {e}")