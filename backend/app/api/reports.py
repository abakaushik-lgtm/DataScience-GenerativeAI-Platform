from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Dict, Any
from app.services.report_generator import ReportGeneratorService

router = APIRouter()

class ReportRequest(BaseModel):
    data_payload: Dict[str, Any]

@router.post("/generate")
async def generate_report(request: ReportRequest):
    try:
        # Pass the raw payload (insights, forecasts, etc.) to the generator
        markdown_content = ReportGeneratorService.generate_markdown_report(request.data_payload)
        
        # Return as plain text so the frontend can easily save it as a .md file
        return PlainTextResponse(content=markdown_content, media_type="text/markdown")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
