import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.ensemble import IsolationForest
from app.services.llm_service import llm_service

class InsightEngineService:
    @staticmethod
    def detect_outliers(df: pd.DataFrame, numeric_cols: List[str]) -> Dict[str, Any]:
        """Uses Isolation Forest to detect anomalies in numeric columns."""
        if not numeric_cols:
            return {}
            
        outliers = {}
        # Fill NaNs for the algorithm
        clean_df = df[numeric_cols].fillna(df[numeric_cols].mean())
        
        clf = IsolationForest(contamination=0.05, random_state=42)
        preds = clf.fit_predict(clean_df)
        
        df['is_outlier'] = preds == -1
        outlier_count = int(df['is_outlier'].sum())
        
        if outlier_count > 0:
            outlier_sample = df[df['is_outlier']].head(5).to_dict(orient='records')
            outliers = {
                "count": outlier_count,
                "percentage": round((outlier_count / len(df)) * 100, 2),
                "examples": outlier_sample
            }
        return outliers

    @staticmethod
    def calculate_correlations(df: pd.DataFrame, numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """Calculates Pearson correlation between numeric columns."""
        if len(numeric_cols) < 2:
            return []
            
        corr_matrix = df[numeric_cols].corr()
        correlations = []
        
        # Get highly correlated pairs (absolute value > 0.6)
        for i in range(len(corr_matrix.columns)):
            for j in range(i):
                val = corr_matrix.iloc[i, j]
                if abs(val) > 0.6:
                    correlations.append({
                        "col1": corr_matrix.columns[i],
                        "col2": corr_matrix.columns[j],
                        "correlation": round(val, 2),
                        "strength": "Strong Positive" if val > 0.8 else "Moderate Positive" if val > 0 else "Strong Negative" if val < -0.8 else "Moderate Negative"
                    })
        return correlations

    @staticmethod
    def analyze_trends_and_seasonality(df: pd.DataFrame) -> Dict[str, Any]:
        """Detects trends on the first datetime column it finds."""
        # Find datetime columns
        date_cols = df.select_dtypes(include=['datetime64', 'object']).columns
        time_col = None
        
        # Naive check to find a date column
        for col in date_cols:
            try:
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    time_col = col
                    break
                else:
                    # Attempt to parse
                    df[col] = pd.to_datetime(df[col])
                    time_col = col
                    break
            except Exception:
                continue
                
        if not time_col:
            return {"status": "No time-series data found"}
            
        # Group by month and calculate sum of numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if not numeric_cols:
             return {"status": "No numeric data found to aggregate over time"}
             
        df_ts = df.set_index(time_col)
        monthly_trend = df_ts[numeric_cols].resample('M').sum()
        
        # Calculate percentage change for the most prominent numeric column
        target_col = numeric_cols[0]
        pct_change = monthly_trend[target_col].pct_change() * 100
        
        recent_trend = "Stable"
        if len(pct_change) >= 2:
            last_change = pct_change.iloc[-1]
            if last_change > 5:
                recent_trend = f"Increasing by {round(last_change, 1)}%"
            elif last_change < -5:
                recent_trend = f"Decreasing by {round(abs(last_change), 1)}%"
                
        return {
            "time_column": time_col,
            "target_metric": target_col,
            "recent_trend": recent_trend,
            "monthly_data_points": len(monthly_trend)
        }

    @staticmethod
    def generate_insights(df: pd.DataFrame) -> Dict[str, Any]:
        """Runs the full insight engine pipeline."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        outliers = InsightEngineService.detect_outliers(df, numeric_cols)
        correlations = InsightEngineService.calculate_correlations(df, numeric_cols)
        trends = InsightEngineService.analyze_trends_and_seasonality(df)
        
        stats_summary = {
            "row_count": len(df),
            "outliers": outliers,
            "correlations": correlations,
            "trends": trends
        }
        
        # Generate Business Recommendation using LLM
        prompt_context = f"""
        Dataset Summary:
        - Rows: {stats_summary['row_count']}
        - Trends: {trends}
        - Top Correlations: {correlations[:3]}
        - Anomalies/Outliers Detected: {outliers.get('count', 0)}
        
        Based on these statistical findings, generate 3 bullet points of concise, actionable Business Recommendations. 
        For example: "Sales dropped 14% in Q2 due to declining conversion rates..."
        """
        
        try:
            recommendations = llm_service.llm.invoke(
                "You are an AI Business Strategist. " + prompt_context
            ).content
        except Exception:
            recommendations = "- Analyze the strong correlations further.\n- Investigate the detected anomalies.\n- Monitor the recent trends closely."
            
        return {
            "statistics": stats_summary,
            "business_recommendations": recommendations
        }
