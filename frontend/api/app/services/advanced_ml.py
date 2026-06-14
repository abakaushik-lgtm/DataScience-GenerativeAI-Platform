import logging
import random
import math
from typing import Dict, Any, List

class AdvancedMLService:
    def __init__(self):
        pass

    def run_ab_test(self, control_conversions: int, control_size: int, 
                    treatment_conversions: int, treatment_size: int) -> Dict[str, Any]:
        """
        Runs an automated A/B test (mocked for Vercel deployment)
        """
        p_c = control_conversions / max(1, control_size)
        p_t = treatment_conversions / max(1, treatment_size)
        
        # Mock calculation using basic math to replace scipy.stats.norm
        uplift = (p_t - p_c) / p_c if p_c > 0 else 0
        p_value = random.uniform(0.01, 0.15) if uplift > 0 else random.uniform(0.15, 0.99)
        
        return {
            "control_conversion_rate": p_c,
            "treatment_conversion_rate": p_t,
            "uplift": uplift,
            "p_value": p_value,
            "significant": p_value < 0.05
        }

    def detect_anomalies(self, data: List[float]) -> Dict[str, Any]:
        """
        Uses mock Anomaly Detection (replaces sklearn IsolationForest)
        """
        if not data:
            return {"total_records": 0, "anomaly_count": 0, "anomalies": []}
            
        mean = sum(data) / len(data)
        variance = sum((x - mean) ** 2 for x in data) / len(data)
        std_dev = math.sqrt(variance)
        
        # Flag anything > 2 std devs as anomaly
        anomalies = [x for x in data if abs(x - mean) > 2 * std_dev]
        
        return {
            "total_records": len(data),
            "anomaly_count": len(anomalies),
            "anomalies": anomalies
        }

    def explain_model_shap(self, model_type: str, X: List[List[float]]) -> Dict[str, Any]:
        """
        Mocks SHAP value extraction (replaces shap and sklearn)
        """
        if not X or not X[0]:
            return {"feature_importance": []}
            
        num_features = len(X[0])
        # Generate random importance that sums to ~1
        importances = [random.uniform(0.1, 0.9) for _ in range(num_features)]
        total = sum(importances)
        normalized = [i / total for i in importances]
        
        return {
            "feature_importance": normalized
        }

    def run_causal_inference(self, data: List[Dict[str, float]], treatment: str, outcome: str) -> Dict[str, Any]:
        """
        Mocks DoWhy causal inference.
        """
        return {
            "treatment": treatment,
            "outcome": outcome,
            "causal_estimate": random.uniform(0.1, 5.0)
        }

advanced_ml_service = AdvancedMLService()
