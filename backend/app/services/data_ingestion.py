import pandas as pd
import json
import io
from typing import Dict, Any

class DataIngestionService:
    @staticmethod
    def process_file(file_content: bytes, filename: str) -> Dict[str, Any]:
        """Reads a file into a Pandas DataFrame and performs profiling."""
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith('.json'):
                df = pd.read_json(io.BytesIO(file_content))
            elif filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(io.BytesIO(file_content))
            else:
                raise ValueError("Unsupported file format")

            return DataIngestionService.profile_dataframe(df)
        except Exception as e:
            raise Exception(f"Error processing file {filename}: {str(e)}")

    @staticmethod
    def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Performs schema detection, profiling, and quality scoring."""
        # 1. Schema Detection & Basic Stats
        schema = {}
        for col in df.columns:
            dtype = str(df[col].dtype)
            schema[col] = {
                "type": dtype,
                "is_numeric": pd.api.types.is_numeric_dtype(df[col]),
                "is_datetime": pd.api.types.is_datetime64_any_dtype(df[col])
            }

        # 2. Missing Value Analysis
        missing_values = df.isnull().sum().to_dict()
        total_rows = len(df)
        missing_percentages = {col: (val / total_rows) * 100 for col, val in missing_values.items()}

        # 3. Duplicate Detection
        duplicate_count = int(df.duplicated().sum())
        duplicate_percentage = (duplicate_count / total_rows) * 100 if total_rows > 0 else 0

        # 4. Data Quality Scoring (Simple heuristic)
        # 100 - missing percentage (avg) - duplicate percentage
        avg_missing = sum(missing_percentages.values()) / len(missing_percentages) if missing_percentages else 0
        quality_score = max(0.0, 100.0 - avg_missing - duplicate_percentage)

        # 5. Column level stats
        stats = {}
        for col in df.columns:
            if schema[col]["is_numeric"]:
                stats[col] = {
                    "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                    "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                    "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                    "std": float(df[col].std()) if not pd.isna(df[col].std()) else None,
                }
            else:
                stats[col] = {
                    "unique_count": int(df[col].nunique()),
                    "top_value": str(df[col].mode()[0]) if not df[col].mode().empty else None
                }

        return {
            "row_count": total_rows,
            "column_count": len(df.columns),
            "schema": schema,
            "missing_values": missing_values,
            "missing_percentages": missing_percentages,
            "duplicate_count": duplicate_count,
            "duplicate_percentage": duplicate_percentage,
            "quality_score": round(quality_score, 2),
            "column_stats": stats
        }
