from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.services.data_engine import data_engine
import os
import shutil

router = APIRouter()

@router.post("/ingest")
async def ingest_data(file: UploadFile = File(...), engine: str = Form("pandas")):
    """
    Ingest a CSV file using the requested processing engine (pandas, polars, pyspark).
    """
    try:
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp_data")
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = data_engine.load_csv(file_path, engine=engine)
        
        # Cleanup
        os.remove(file_path)
        
        return {
            "message": "Data ingested successfully",
            "metadata": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
