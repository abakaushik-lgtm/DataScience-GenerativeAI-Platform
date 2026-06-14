from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.copilot_service import copilot_service

router = APIRouter()

class CopilotQuery(BaseModel):
    prompt: str
    context_data: Optional[Dict[str, Any]] = None

@router.post("/query")
async def ask_copilot(query: CopilotQuery):
    try:
        response_text = copilot_service.query_copilot(prompt=query.prompt, context_data=query.context_data)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
