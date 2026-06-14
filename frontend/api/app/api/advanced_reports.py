from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
from app.services.document_generator import AdvancedReportService

router = APIRouter()

class AdvancedReportRequest(BaseModel):
    data_payload: Dict[str, Any]
    report_type: str = "Executive Summary" # Executive Summary, Board Report, KPI Review, Market Analysis
    format_type: str = "PDF" # PDF, DOCX, PPTX

@router.post("/generate")
async def generate_advanced_report(request: AdvancedReportRequest):
    try:
        # Generate the document bytes
        file_stream = AdvancedReportService.generate_document(
            data=request.data_payload,
            report_type=request.report_type,
            format_type=request.format_type
        )
        
        # Set the correct MIME type
        mime_types = {
            "PDF": "application/pdf",
            "DOCX": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "PPTX": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        }
        
        extensions = {
            "PDF": ".pdf",
            "DOCX": ".docx",
            "PPTX": ".pptx"
        }
        
        content_type = mime_types.get(request.format_type.upper(), "text/plain")
        extension = extensions.get(request.format_type.upper(), ".txt")
        filename = f"{request.report_type.replace(' ', '_')}_Report{extension}"
        
        return StreamingResponse(
            file_stream, 
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
