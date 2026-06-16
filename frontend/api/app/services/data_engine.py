import pandas as pd
import logging
import os
import shutil
from typing import Any, Dict

class DataEngineService:
    def __init__(self):
        self.polars = None
        self._spark = None
        
        # Try importing polars
        try:
            import polars as pl
            self.polars = pl
        except ImportError:
            logging.warning("Polars not installed. Using Pandas fallback.")

    @property
    def spark(self):
        if self._spark is None:
            # Check if java is available to prevent PySpark from hanging or launching shell errors
            if not os.getenv("JAVA_HOME") and not shutil.which("java"):
                logging.warning("Java/JVM is not installed or not in PATH. PySpark engine disabled.")
                return None
            
            try:
                from pyspark.sql import SparkSession
                self._spark = SparkSession.builder \
                    .appName("AntiGravity_PySpark") \
                    .config("spark.driver.host", "localhost") \
                    .getOrCreate()
            except Exception as e:
                logging.warning(f"PySpark JVM initialization failed: {e}. PySpark engine disabled.")
                self._spark = None
        return self._spark

    def load_csv(self, file_path: str, engine: str = "pandas") -> Dict[str, Any]:
        """
        Loads a CSV using the requested engine.
        engine: 'pandas', 'polars', or 'pyspark'
        """
        try:
            if engine == "polars" and self.polars:
                df = self.polars.read_csv(file_path)
                return {
                    "engine": "polars",
                    "rows": df.height,
                    "columns": df.width,
                    "schema": {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)}
                }
                
            elif engine == "pyspark" and self.spark:
                df = self.spark.read.csv(file_path, header=True, inferSchema=True)
                return {
                    "engine": "pyspark",
                    "rows": df.count(),
                    "columns": len(df.columns),
                    "schema": {f.name: f.dataType.simpleString() for f in df.schema.fields}
                }
                
            else:
                # Default / Fallback to Pandas
                df = pd.read_csv(file_path)
                return {
                    "engine": "pandas",
                    "rows": len(df),
                    "columns": len(df.columns),
                    "schema": df.dtypes.astype(str).to_dict()
                }
                
        except Exception as e:
            logging.error(f"Error loading data with {engine} engine: {str(e)}")
            raise ValueError(f"Failed to load data using {engine}: {str(e)}")

data_engine = DataEngineService()
