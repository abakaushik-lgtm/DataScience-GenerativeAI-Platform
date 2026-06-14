import re
import duckdb
import pandas as pd
from typing import Dict, Any, Optional
from app.services.db_connection import DBConnectionService

class SQLExecutorService:
    @staticmethod
    def is_safe_query(query: str) -> bool:
        """
        Validates that the SQL query is read-only.
        Rejects any queries containing destructive keywords.
        """
        # Normalize query
        q = query.upper()
        # List of forbidden keywords
        forbidden = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "GRANT", "REVOKE", 
            "TRUNCATE", "REPLACE", "CREATE"
        ]
        
        # Check if any forbidden keyword is a standalone word in the query
        for word in forbidden:
            if re.search(rf'\b{word}\b', q):
                return False
        
        return True

    @staticmethod
    def execute_on_dataframe(df: pd.DataFrame, query: str) -> Dict[str, Any]:
        """
        Executes a SQL query on a Pandas DataFrame using DuckDB.
        """
        if not SQLExecutorService.is_safe_query(query):
            raise ValueError("Query rejected: Only read-only (SELECT) queries are allowed.")
        
        try:
            # DuckDB can directly query variables in the local scope.
            # We assign the dataframe to a local variable named 'data'.
            data = df
            
            # The LLM should be instructed to query from the table named 'data'
            # e.g., SELECT * FROM data ...
            result_df = duckdb.query(query).to_df()
            
            # Convert result to dict format for JSON serialization
            records = result_df.to_dict(orient='records')
            
            return {
                "success": True,
                "row_count": len(result_df),
                "data": records
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def execute_on_database(db_type: str, connection_params: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Executes a SQL query safely on a remote database.
        """
        if not SQLExecutorService.is_safe_query(query):
            raise ValueError("Query rejected: Only read-only (SELECT) queries are allowed.")
        
        try:
            engine = DBConnectionService.get_engine(
                db_type=db_type,
                host=connection_params.get("host", ""),
                port=connection_params.get("port", 0),
                user=connection_params.get("user", ""),
                password=connection_params.get("password", ""),
                db_name=connection_params.get("db_name", ""),
                extra_args=connection_params.get("extra_args", {})
            )
            
            # Execute and load to pandas
            result_df = pd.read_sql(query, engine)
            records = result_df.to_dict(orient='records')
            
            return {
                "success": True,
                "row_count": len(result_df),
                "data": records
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
