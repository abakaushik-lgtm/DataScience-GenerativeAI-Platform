from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.advanced_ml import advanced_ml_service

router = APIRouter()

class ABTestRequest(BaseModel):
    control_conversions: int
    control_size: int
    treatment_conversions: int
    treatment_size: int

class AnomalyRequest(BaseModel):
    data: List[float]

class ShapRequest(BaseModel):
    model_type: str
    X: List[List[float]]

class CausalRequest(BaseModel):
    data: List[Dict[str, float]]
    treatment: str
    outcome: str

@router.post("/ab-test")
async def run_ab_test(req: ABTestRequest):
    try:
        return advanced_ml_service.run_ab_test(
            req.control_conversions, req.control_size, 
            req.treatment_conversions, req.treatment_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/anomalies")
async def detect_anomalies(req: AnomalyRequest):
    try:
        return advanced_ml_service.detect_anomalies(req.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shap")
async def run_shap(req: ShapRequest):
    try:
        return advanced_ml_service.explain_model_shap(req.model_type, req.X)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/causal")
async def run_causal(req: CausalRequest):
    try:
        return advanced_ml_service.run_causal_inference(req.data, req.treatment, req.outcome)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
