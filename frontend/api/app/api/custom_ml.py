from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.custom_ml import custom_ml_service

router = APIRouter()

class TrainRequest(BaseModel):
    model_type: str  # 'xgboost', 'lightgbm', 'random_forest', 'pytorch_nn'
    params: Dict[str, Any]
    data_path: Optional[str] = None

@router.post("/train")
async def train_custom_model(request: TrainRequest):
    """
    Trains an advanced custom machine learning model bypassing AutoML.
    """
    try:
        results = custom_ml_service.train_model(
            model_type=request.model_type,
            params=request.params,
            data_path=request.data_path
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
