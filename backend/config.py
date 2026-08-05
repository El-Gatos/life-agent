import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Claude
    CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
    
    # Environment
    ENV = os.getenv("ENV", "development")
    DEBUG = ENV == "development"
    
    # Scheduler
    SCHEDULER_JOB_DEFAULTS = {
        "coalesce": True,
        "max_instances": 1
    }
    
    # Refresh intervals (in seconds)
    EMAIL_REFRESH_INTERVAL = 300  # 5 min
    CALENDAR_REFRESH_INTERVAL = 600  # 10 min
    DEADLINE_CHECK_INTERVAL = 3600  # 1 hour

config = Config()