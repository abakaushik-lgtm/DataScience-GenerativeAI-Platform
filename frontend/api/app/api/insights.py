from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.insight_engine import InsightEngineService
from app.services.sql_executor import SQLExecutorService
import pandas as pd

router = APIRouter()

class InsightRequest(BaseModel):
    db_type: str = "mock"
    connection_params: Optional[Dict[str, Any]] = None
    query: str = "SELECT * FROM data" # Query to fetch the base dataset

@router.post("/generate")
async def generate_automated_insights(request: InsightRequest):
    try:
        # Fetch the data to analyze
        if request.db_type == "mock":
            # Generate a mock dataframe with correlations and outliers for testing
            import numpy as np
            np.random.seed(42)
            dates = pd.date_range('2023-01-01', periods=100)
            df = pd.DataFrame({
                'date': dates,
                'sales': np.random.normal(1000, 100, 100),
                'marketing_spend': np.random.normal(500, 50, 100),
                'visitors': np.random.normal(5000, 500, 100)
            })
            # Inject correlation
            df['marketing_spend'] = df['sales'] * 0.5 + np.random.normal(0, 10, 100)
            # Inject outlier
            df.loc[50, 'sales'] = 5000 
            
        else:
            # Execute query to get dataframe
            if not request.connection_params:
                 raise HTTPException(status_code=400, detail="Connection params required for database queries.")
            
            # In a real scenario we'd use SQLAlchemy to load directly to DataFrame
            # For brevity, assuming DBConnectionService.get_engine is used
            from app.services.db_connection import DBConnectionService
            engine = DBConnectionService.get_engine(
                db_type=request.db_type,
                **request.connection_params
            )
            df = pd.read_sql(request.query, engine)
            
        # Run Insight Engine
        insights = InsightEngineService.generate_insights(df)
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
