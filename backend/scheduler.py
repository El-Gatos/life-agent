from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from config import config

class JobScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler(**config.SCHEDULER_JOB_DEFAULTS)
    
    def add_job(self, func, job_id: str, interval_seconds: int, max_instances: int = 1):
        """Add a recurring job"""
        self.scheduler.add_job(
            func,
            trigger=IntervalTrigger(seconds=interval_seconds),
            id=job_id,
            name=job_id,
            max_instances=max_instances,
            replace_existing=True
        )
    
    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            print("✅ Scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("❌ Scheduler stopped")

scheduler = JobScheduler()