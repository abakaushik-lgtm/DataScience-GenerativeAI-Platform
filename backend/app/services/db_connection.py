from sqlalchemy import create_engine
import pandas as pd
from typing import Dict, Any
from app.services.data_ingestion import DataIngestionService

class DBConnectionService:
    @staticmethod
    def get_engine(db_type: str, host: str, port: int, user: str, password: str, db_name: str, extra_args: Dict[str, Any] = None):
        """Creates an SQLAlchemy engine based on the database type."""
        
        if db_type == "postgresql":
            url = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
        elif db_type == "mysql":
            # Requires PyMySQL or similar
            url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
        elif db_type == "snowflake":
            # Requires snowflake-sqlalchemy
            account = extra_args.get("account", "")
            warehouse = extra_args.get("warehouse", "")
            url = f"snowflake://{user}:{password}@{account}/{db_name}?warehouse={warehouse}"
        elif db_type == "bigquery":
            # Requires sqlalchemy-bigquery
            # Usually uses service account JSON, db_name acts as dataset
            project_id = extra_args.get("project_id", "")
            url = f"bigquery://{project_id}/{db_name}"
        else:
            raise ValueError(f"Unsupported database type: {db_type}")

        return create_engine(url)

    @staticmethod
    def ingest_from_query(db_type: str, connection_params: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Runs a query on the target database and profiles the result."""
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
            
            # Read data using Pandas
            df = pd.read_sql(query, engine)
            
            # Profile the dataframe using existing service
            profile = DataIngestionService.profile_dataframe(df)
            
            return {
                "message": "Database query executed and profiled successfully",
                "profile": profile
            }
        except Exception as e:
            raise Exception(f"Database connection/query failed: {str(e)}")
