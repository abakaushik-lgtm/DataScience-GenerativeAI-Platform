from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.forecasting import ForecastingService
from app.services.llm_service import llm_service
import pandas as pd

router = APIRouter()

class ForecastRequest(BaseModel):
    db_type: str = "mock"
    connection_params: Optional[Dict[str, Any]] = None
    query: str = "SELECT * FROM data"
    time_col: str
    target_col: str
    periods: int = 12
    algorithm: str = "Prophet" # "ARIMA", "Prophet", "XGBoost", "LSTM", "Transformer"

@router.post("/predict")
async def generate_forecast(request: ForecastRequest):
    try:
        # Fetch the data
        if request.db_type == "mock":
            import numpy as np
            dates = pd.date_range('2022-01-01', periods=100, freq='ME')
            df = pd.DataFrame({
                request.time_col: dates,
                request.target_col: np.linspace(100, 200, 100) + np.sin(np.linspace(0, 10, 100))*20 + np.random.normal(0, 5, 100)
            })
        else:
            if not request.connection_params:
                 raise HTTPException(status_code=400, detail="Connection params required for database queries.")
            
            from app.services.db_connection import DBConnectionService
            engine = DBConnectionService.get_engine(
                db_type=request.db_type,
                **request.connection_params
            )
            df = pd.read_sql(request.query, engine)
            
        # 1. Run the specific forecasting model
        forecast_result = ForecastingService.generate_forecast(
            df=df,
            time_col=request.time_col,
            target_col=request.target_col,
            periods=request.periods,
            algorithm=request.algorithm
        )
        
        # 2. Generate Plain-English Trend Explanation via LLM
        prompt_context = f"""
        You are an AI Data Scientist explaining a forecast to stakeholders.
        Algorithm Used: {forecast_result['model']}
        Target Metric: {request.target_col}
        Forecast Horizon: {request.periods} periods
        Predicted Values: {forecast_result['forecast']}
        Lower Bounds: {forecast_result['lower_bound']}
        Upper Bounds: {forecast_result['upper_bound']}
        
        Provide a concise, plain-English summary of what this forecast predicts.
        Highlight the general trend (e.g., increasing, decreasing, stable) and 
        mention the confidence/uncertainty based on the bounds.
        """
        
        try:
            explanation = llm_service.llm.invoke(prompt_context).content
        except Exception:
            explanation = f"The {forecast_result['model']} model predicts the values will follow the generated trajectory with the given confidence bounds."
            
        forecast_result['trend_explanation'] = explanation
        
        return forecast_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
