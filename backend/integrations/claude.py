from anthropic import Anthropic
from config import config
import json
import logging

logger = logging.getLogger(__name__)

class ClaudeClient:
    """Claude AI integration for intelligent task breakdown"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.CLAUDE_API_KEY
        self.client = Anthropic(api_key=self.api_key)
    
    def break_down_project(self, project_title: str, project_description: str, 
                          due_date: str, priority: str = "medium") -> dict:
        """Use Claude to break down a project into subtasks"""
        
        prompt = f"""
You are an expert project manager helping a student break down a large assignment into manageable subtasks.

Project: {project_title}
Description: {project_description}
Due Date: {due_date}
Priority: {priority}

Please break this down into specific, actionable subtasks. For each subtask:
1. Give it a clear, specific title
2. Provide a brief description
3. Estimate realistic hours needed
4. Suggest a recommended order (1 = first, etc.)
5. Identify any dependencies

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{{
  "breakdown": [
    {{
      "title": "Task title",
      "description": "What needs to be done",
      "estimated_hours": 2.5,
      "order": 1,
      "dependencies": []
    }}
  ],
  "total_estimated_hours": 10,
  "overall_strategy": "Brief strategy summary"
}}

Be realistic with time estimates. Consider research, drafting, revisions, etc.
"""
        
        try:
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract text from response
            response_text = message.content[0].text
            
            # Parse JSON
            breakdown = json.loads(response_text)
            
            logger.info(f"✅ Successfully broke down project: {project_title}")
            return breakdown
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Claude response: {e}")
            return {"error": "Invalid response format", "breakdown": []}
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            return {"error": str(e), "breakdown": []}
    
    def analyze_deadline(self, deadline_title: str, due_date: str, 
                        current_progress: str = "Not started") -> dict:
        """Get Claude's analysis and advice for a deadline"""
        
        prompt = f"""
Analyze this student deadline and provide strategic advice:

Assignment: {deadline_title}
Due: {due_date}
Current Progress: {current_progress}

Provide a JSON response with:
1. urgency_level: 'low', 'medium', 'high', or 'critical'
2. recommended_daily_work: "X hours per day"
3. key_milestones: ["milestone 1", "milestone 2"]
4. potential_risks: ["risk 1", "risk 2"]
5. advice: "Strategic advice for success"

Return ONLY valid JSON (no markdown):
"""
        
        try:
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            analysis = json.loads(response_text)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing deadline: {e}")
            return {"error": str(e)}
    
    def suggest_study_schedule(self, deadlines_list: list, current_date: str) -> dict:
        """Claude suggests optimal study schedule"""
        
        deadlines_str = "\n".join([
            f"- {d['title']} (Due: {d['due_date']}, Priority: {d['priority']})"
            for d in deadlines_list
        ])
        
        prompt = f"""
Given these upcoming deadlines, suggest an optimal study schedule for maximum efficiency:

Current Date: {current_date}

Deadlines:
{deadlines_str}

Provide a weekly schedule recommendation as JSON:
{{
  "monday": ["task 1 (2 hours)", "task 2 (1 hour)"],
  "tuesday": ["task 1 (2 hours)"],
  ...
  "tips": ["tip 1", "tip 2"],
  "focus_order": ["assignment 1", "assignment 2"]
}}

Return ONLY valid JSON (no markdown):
"""
        
        try:
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            schedule = json.loads(response_text)
            
            return schedule
            
        except Exception as e:
            logger.error(f"Error suggesting schedule: {e}")
            return {"error": str(e)}

def get_claude_client():
    return ClaudeClient()