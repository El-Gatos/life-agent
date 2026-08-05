from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# User Models
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Email Models
class EmailBase(BaseModel):
    subject: str
    sender: str
    body: str
    has_deadline: bool = False
    deadline_date: Optional[datetime] = None

class Email(EmailBase):
    id: str
    gmail_id: str
    received_at: datetime
    synced_at: datetime

    class Config:
        from_attributes = True


# Calendar Event Models
class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_class: bool = False

class CalendarEvent(CalendarEventBase):
    id: str
    gcal_id: str
    synced_at: datetime

    class Config:
        from_attributes = True


# Deadline Models
class DeadlineBase(BaseModel):
    title: str
    due_date: datetime
    source: str  # 'email', 'calendar', 'manual'
    priority: str = "medium"  # low, medium, high
    status: str = "pending"
    estimated_hours: Optional[float] = None

class Deadline(DeadlineBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Task Models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    status: str = "pending"

class Task(TaskBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# API Token Models
class APIToken(BaseModel):
    service: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True