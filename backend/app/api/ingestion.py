from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.services.data_ingestion import DataIngestionService
from app.services.db_connection import DBConnectionService
from pydantic import BaseModel
from typing import Dict, Any

class DBQueryRequest(BaseModel):
    db_type: str
    connection_params: Dict[str, Any]
    query: str

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.json', '.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    try:
        content = await file.read()
        profile_results = DataIngestionService.process_file(content, file.filename)
        return {
            "message": "File processed successfully",
            "filename": file.filename,
            "profile": profile_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/database")
async def ingest_database(request: DBQueryRequest):
    try:
        result = DBConnectionService.ingest_from_query(
            db_type=request.db_type,
            connection_params=request.connection_params,
            query=request.query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
