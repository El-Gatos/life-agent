from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import config
from scheduler import scheduler
from agents.email_agent import EmailAgent
from agents.calendar_agent import CalendarAgent
from agents.deadline_agent import DeadlineAgent
from integrations.gmail import GmailClient
from integrations.gcalendar import GoogleCalendarClient
from routes import deadlines, notifications, tasks
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

gmail_client = GmailClient(
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET
)

gcal_client = GoogleCalendarClient()

def email_agent_task():
    user_id = "183ce3b1-5c1e-4dd5-a671-010b7b93db78"
    agent = EmailAgent(user_id, gmail_client)
    agent.run()

def calendar_agent_task():
    user_id = "183ce3b1-5c1e-4dd5-a671-010b7b93db78"
    agent = CalendarAgent(user_id, gcal_client)
    agent.run()

def deadline_agent_task():
    user_id = "183ce3b1-5c1e-4dd5-a671-010b7b93db78"
    agent = DeadlineAgent(user_id)
    agent.run()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Life Agent Backend")
    scheduler.start()
    
    scheduler.add_job(
        email_agent_task,
        job_id="email_agent",
        interval_seconds=config.EMAIL_REFRESH_INTERVAL
    )
    logger.info("📧 Email Agent scheduled")
    
    scheduler.add_job(
        calendar_agent_task,
        job_id="calendar_agent",
        interval_seconds=config.CALENDAR_REFRESH_INTERVAL
    )
    logger.info("📅 Calendar Agent scheduled")
    
    scheduler.add_job(
        deadline_agent_task,
        job_id="deadline_agent",
        interval_seconds=config.DEADLINE_CHECK_INTERVAL
    )
    logger.info("⏰ Deadline Agent scheduled")
    
    yield
    
    logger.info("🛑 Shutting down")
    scheduler.stop()

app = FastAPI(title="Life Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost:3000", "127.0.0.1:3000", "localhost", "127.0.0.1"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deadlines.router)
app.include_router(notifications.router)
app.include_router(tasks.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "env": config.ENV}

@app.get("/")
async def root():
    return {"message": "Life Agent API running"}

@app.get("/trigger-email-agent")
async def trigger_email_agent():
    try:
        email_agent_task()
        return {"status": "Email agent triggered"}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

@app.get("/trigger-calendar-agent")
async def trigger_calendar_agent():
    try:
        calendar_agent_task()
        return {"status": "Calendar agent triggered"}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

@app.get("/trigger-deadline-agent")
async def trigger_deadline_agent():
    try:
        deadline_agent_task()
        return {"status": "Deadline agent triggered"}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)