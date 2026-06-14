from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.automl import AutoMLService
import pandas as pd

router = APIRouter()

class AutoMLRequest(BaseModel):
    db_type: str = "mock"
    connection_params: Optional[Dict[str, Any]] = None
    query: str = "SELECT * FROM data"
    task_type: str # "Classification", "Regression", "Clustering"
    target_col: Optional[str] = None

@router.post("/train")
async def run_automl_pipeline(request: AutoMLRequest):
    try:
        # Fetch the data
        if request.db_type == "mock":
            import numpy as np
            from sklearn.datasets import make_classification, make_regression, make_blobs
            
            if request.task_type == "Classification":
                X, y = make_classification(n_samples=200, n_features=5, n_classes=2, random_state=42)
                df = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(5)])
                df['target'] = y
                target_col = "target"
            elif request.task_type == "Regression":
                X, y = make_regression(n_samples=200, n_features=5, noise=0.1, random_state=42)
                df = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(5)])
                df['target'] = y
                target_col = "target"
            else: # Clustering
                X, _ = make_blobs(n_samples=200, n_features=5, centers=4, random_state=42)
                df = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(5)])
                target_col = None
        else:
            if not request.connection_params:
                 raise HTTPException(status_code=400, detail="Connection params required for database queries.")
            
            from app.services.db_connection import DBConnectionService
            engine = DBConnectionService.get_engine(
                db_type=request.db_type,
                **request.connection_params
            )
            df = pd.read_sql(request.query, engine)
            target_col = request.target_col
            
        if request.task_type in ["Classification", "Regression"] and not target_col:
            raise HTTPException(status_code=400, detail="Target column required for supervised tasks.")
            
        # 1. Run AutoML
        automl_result = AutoMLService.run_automl(
            df=df,
            task_type=request.task_type,
            target=target_col
        )
        
        return automl_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
