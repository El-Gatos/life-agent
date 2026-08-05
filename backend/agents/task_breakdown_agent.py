import logging
from datetime import datetime
from typing import List, Optional
from database import db
from integrations.claude import ClaudeClient
from config import config

logger = logging.getLogger(__name__)

class TaskBreakdownAgent:
    """Uses Claude to intelligently break down projects into tasks"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.claude = ClaudeClient()
    
    def break_down_deadline(self, deadline_id: str):
        """Break down a single deadline into tasks"""
        try:
            # Get deadline details
            deadline = self._get_deadline(deadline_id)
            
            if not deadline:
                logger.error(f"Deadline {deadline_id} not found")
                return {"error": "Deadline not found"}
            
            logger.info(f"🔨 Breaking down deadline: {deadline['title']}")
            
            # Use Claude to break it down
            breakdown = self.claude.break_down_project(
                project_title=deadline['title'],
                project_description=deadline.get('source_id', ''),
                due_date=deadline['due_date'],
                priority=deadline.get('priority', 'medium')
            )
            
            if "error" in breakdown:
                logger.error(f"Claude breakdown error: {breakdown['error']}")
                return breakdown
            
            # Store tasks in database
            created_tasks = self._create_tasks_from_breakdown(
                deadline_id,
                breakdown
            )
            
            logger.info(f"✅ Created {len(created_tasks)} subtasks")
            
            return {
                "success": True,
                "deadline_id": deadline_id,
                "tasks_created": len(created_tasks),
                "total_hours": breakdown.get('total_estimated_hours', 0),
                "strategy": breakdown.get('overall_strategy', '')
            }
            
        except Exception as e:
            logger.error(f"Task Breakdown Error: {e}")
            db.update_sync_log(self.user_id, "task_breakdown_agent", "error", str(e))
            return {"error": str(e)}
    
    def breakdown_all_pending(self):
        """Break down all pending deadlines without tasks"""
        try:
            # Get all deadlines
            deadlines = self._get_all_deadlines()
            
            # Filter to ones without subtasks
            for deadline in deadlines:
                task_count = self._count_tasks_for_deadline(deadline['id'])
                
                if task_count == 0:
                    self.break_down_deadline(deadline['id'])
            
            logger.info(f"✅ Breakdown complete for all pending deadlines")
            db.update_sync_log(self.user_id, "task_breakdown_agent", "success")
            
        except Exception as e:
            logger.error(f"Error: {e}")
            db.update_sync_log(self.user_id, "task_breakdown_agent", "error", str(e))
    
    def _get_deadline(self, deadline_id: str) -> Optional[dict]:
        """Get deadline details"""
        try:
            response = db.client.table("deadlines").select("*").eq(
                "id", deadline_id
            ).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching deadline: {e}")
            return None
    
    def _get_all_deadlines(self) -> List[dict]:
        """Get all pending deadlines"""
        try:
            response = db.client.table("deadlines").select("*").eq(
                "user_id", self.user_id
            ).eq("status", "pending").execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error fetching deadlines: {e}")
            return []
    
    def _count_tasks_for_deadline(self, deadline_id: str) -> int:
        """Count existing tasks for a deadline"""
        try:
            response = db.client.table("tasks").select("id").eq(
                "deadline_id", deadline_id
            ).execute()
            
            return len(response.data)
        except Exception as e:
            logger.error(f"Error counting tasks: {e}")
            return 0
    
    def _create_tasks_from_breakdown(self, deadline_id: str, breakdown: dict) -> List[dict]:
        """Create task records from Claude breakdown"""
        created_tasks = []
        
        try:
            for task_info in breakdown.get('breakdown', []):
                task = {
                    "user_id": self.user_id,
                    "deadline_id": deadline_id,
                    "title": task_info.get('title', ''),
                    "description": task_info.get('description', ''),
                    "estimated_hours": task_info.get('estimated_hours', 0),
                    "status": "pending",
                    "created_at": datetime.now().isoformat()
                }
                
                # Store in database
                response = db.client.table("tasks").insert(task).execute()
                
                if response.data:
                    created_tasks.append(response.data[0])
                    logger.info(f"  ✓ Created task: {task['title']}")
            
            return created_tasks
            
        except Exception as e:
            logger.error(f"Error creating tasks: {e}")
            return created_tasks

def get_task_breakdown_agent(user_id: str):
    return TaskBreakdownAgent(user_id)