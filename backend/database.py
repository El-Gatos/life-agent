from supabase import create_client, Client
from config import config

class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_KEY
        )
    
    def get_user(self, user_id: str):
        """Fetch user by ID"""
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    
    def create_user(self, email: str):
        """Create new user"""
        response = self.client.table("users").insert({
            "email": email
        }).execute()
        return response.data[0] if response.data else None
    
    def update_sync_log(self, user_id: str, agent_name: str, status: str, error_msg: str = None):
        """Log when an agent last synced"""
        self.client.table("sync_log").upsert({
            "user_id": user_id,
            "agent_name": agent_name,
            "last_sync": "now()",
            "status": status,
            "error_message": error_msg
        }).execute()
    
    # Add more methods as needed

db = SupabaseClient()