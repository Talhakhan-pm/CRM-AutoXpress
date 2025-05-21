import os
from typing import List
import json
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AutoXpress CRM")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS_STR: str = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:3000"]')
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        try:
            origins = json.loads(self.BACKEND_CORS_ORIGINS_STR)
            if isinstance(origins, list):
                return origins
        except json.JSONDecodeError:
            pass
        return ["http://localhost:3000"]


settings = Settings()