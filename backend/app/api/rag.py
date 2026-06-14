from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.rag_service import rag_service
import shutil
import os

router = APIRouter()

class RAGQuery(BaseModel):
    question: str

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp_uploads")
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ingest into vector store
        result = rag_service.ingest_document(file_path, file.filename)
        
        # Cleanup
        os.remove(file_path)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
async def query_knowledge_base(query: RAGQuery):
    try:
        result = rag_service.query(query.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
