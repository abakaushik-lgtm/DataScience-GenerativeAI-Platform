from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.llm_service import llm_service
from app.services.sql_executor import SQLExecutorService
from app.services.data_ingestion import DataIngestionService

router = APIRouter()

class AnalystQueryRequest(BaseModel):
    question: str
    schema_info: str
    db_type: str = "mock" # "mock", "uploaded_file", "postgresql", "mysql", "snowflake", "bigquery"
    connection_params: Optional[Dict[str, Any]] = None

@router.post("/query")
async def ask_analyst(request: AnalystQueryRequest):
    try:
        # 1. Generate SQL
        sql_query = llm_service.generate_sql(request.question, request.schema_info)
        
        # 2. Execute SQL
        execution_result = {}
        if request.db_type == "mock":
            # For pure testing of LLM without execution
            execution_result = {
                "success": True, 
                "data": [{"mock_col": "mock_val"}], 
                "row_count": 1,
                "message": "Mock execution"
            }
        else:
            # Note: For uploaded files, in a real scenario we'd cache the DataFrame 
            # in Redis or keep it in DuckDB disk storage. For now, we assume database connections.
            if not request.connection_params:
                 raise HTTPException(status_code=400, detail="Connection params required for database queries.")
                 
            execution_result = SQLExecutorService.execute_on_database(
                db_type=request.db_type,
                connection_params=request.connection_params,
                query=sql_query
            )
        
        if not execution_result.get("success", False):
            raise Exception(f"SQL Execution failed: {execution_result.get('error')}")
            
        # 3. Generate Explanation
        # We only pass a snippet of data to LLM to prevent context overflow
        data_snippet = str(execution_result.get("data", []))[:2000]
        explanation = llm_service.generate_explanation(
            question=request.question,
            sql_query=sql_query,
            query_results=data_snippet
        )
        
        # 4. Generate Chart Configuration
        chart_config = llm_service.generate_chart_config(
            question=request.question,
            data=execution_result.get("data", [])
        )
        
        return {
            "question": request.question,
            "sql_query": sql_query,
            "results": execution_result.get("data", []),
            "explanation": explanation,
            "chart_config": chart_config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
