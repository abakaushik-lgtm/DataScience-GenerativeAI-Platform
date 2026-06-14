import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class AdvancedMLService:
    def __init__(self):
        pass

    def run_ab_test(self, control_conversions: int, control_size: int, 
                    treatment_conversions: int, treatment_size: int) -> Dict[str, Any]:
        """
        Runs an automated A/B test (Two-proportion z-test)
        """
        from scipy.stats import norm
        
        p_c = control_conversions / control_size
        p_t = treatment_conversions / treatment_size
        p_pool = (control_conversions + treatment_conversions) / (control_size + treatment_size)
        
        se = np.sqrt(p_pool * (1 - p_pool) * (1/control_size + 1/treatment_size))
        z_stat = (p_t - p_c) / se
        p_value = 2 * (1 - norm.cdf(abs(z_stat)))
        
        return {
            "control_conversion_rate": p_c,
            "treatment_conversion_rate": p_t,
            "uplift": (p_t - p_c) / p_c,
            "p_value": p_value,
            "significant": p_value < 0.05
        }

    def detect_anomalies(self, data: List[float]) -> Dict[str, Any]:
        """
        Uses Isolation Forest for fraud/anomaly detection in 1D data.
        """
        from sklearn.ensemble import IsolationForest
        
        df = pd.DataFrame(data, columns=["value"])
        model = IsolationForest(contamination=0.05, random_state=42)
        preds = model.fit_predict(df[["value"]])
        
        anomalies = df[preds == -1]["value"].tolist()
        return {
            "total_records": len(data),
            "anomaly_count": len(anomalies),
            "anomalies": anomalies
        }

    def explain_model_shap(self, model_type: str, X: List[List[float]]) -> Dict[str, Any]:
        """
        Mocks SHAP value extraction for a pre-trained model on tabular data.
        (In a real scenario, you'd pass the actual trained model instance)
        """
        import shap
        from sklearn.ensemble import RandomForestRegressor
        
        # Mocking a model and SHAP calculation
        X_df = pd.DataFrame(X)
        y = X_df.iloc[:, 0] * 2 + np.random.normal(0, 1, len(X))
        
        model = RandomForestRegressor(n_estimators=10, max_depth=3)
        model.fit(X_df, y)
        
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_df)
        
        # Return average absolute SHAP values as feature importance
        mean_shap = np.abs(shap_values).mean(axis=0).tolist()
        return {
            "feature_importance": mean_shap
        }

    def run_causal_inference(self, data: List[Dict[str, float]], treatment: str, outcome: str) -> Dict[str, Any]:
        """
        Runs DoWhy causal inference.
        """
        try:
            import dowhy
            from dowhy import CausalModel
            
            df = pd.DataFrame(data)
            
            # Simplified mock causal graph assumption
            model = CausalModel(
                data=df,
                treatment=treatment,
                outcome=outcome,
                common_causes=[col for col in df.columns if col not in [treatment, outcome]]
            )
            
            identified_estimand = model.identify_effect(proceed_when_unidentifiable=True)
            estimate = model.estimate_effect(identified_estimand, method_name="backdoor.linear_regression")
            
            return {
                "treatment": treatment,
                "outcome": outcome,
                "causal_estimate": float(estimate.value)
            }
        except Exception as e:
            logging.error(f"DoWhy Causal Inference Error: {e}")
            return {"error": str(e)}

advanced_ml_service = AdvancedMLService()
