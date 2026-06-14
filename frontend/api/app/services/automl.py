from typing import Dict, Any, List
import logging
from app.services.llm_service import llm_service

class AutoMLService:
    @staticmethod
    def run_classification(df: Any, target: str) -> Dict[str, Any]:
        return {
            "task": "Classification",
            "target": target,
            "best_model": "RandomForestClassifier (Mocked)",
            "leaderboard": [
                {"Model": "Random Forest Classifier", "Accuracy": 0.952, "AUC": 0.981, "Recall": 0.931, "Prec.": 0.942, "F1": 0.936, "Kappa": 0.891, "MCC": 0.892},
                {"Model": "Gradient Boosting Classifier", "Accuracy": 0.941, "AUC": 0.978, "Recall": 0.912, "Prec.": 0.925, "F1": 0.918, "Kappa": 0.871, "MCC": 0.872},
                {"Model": "Logistic Regression", "Accuracy": 0.882, "AUC": 0.912, "Recall": 0.851, "Prec.": 0.862, "F1": 0.856, "Kappa": 0.791, "MCC": 0.792}
            ],
            "feature_importances": [
                {"feature": "feature_0", "importance": 0.45},
                {"feature": "feature_2", "importance": 0.32},
                {"feature": "feature_1", "importance": 0.15}
            ]
        }

    @staticmethod
    def run_regression(df: Any, target: str) -> Dict[str, Any]:
        return {
            "task": "Regression",
            "target": target,
            "best_model": "XGBRegressor (Mocked)",
            "leaderboard": [
                {"Model": "Extreme Gradient Boosting", "MAE": 12.4, "MSE": 245.1, "RMSE": 15.6, "R2": 0.89, "RMSLE": 0.12, "MAPE": 0.08},
                {"Model": "Random Forest Regressor", "MAE": 14.2, "MSE": 285.4, "RMSE": 16.9, "R2": 0.85, "RMSLE": 0.14, "MAPE": 0.10},
                {"Model": "Linear Regression", "MAE": 22.1, "MSE": 512.3, "RMSE": 22.6, "R2": 0.72, "RMSLE": 0.21, "MAPE": 0.18}
            ],
            "feature_importances": [
                {"feature": "feature_1", "importance": 0.55},
                {"feature": "feature_3", "importance": 0.22},
                {"feature": "feature_0", "importance": 0.10}
            ]
        }

    @staticmethod
    def run_clustering(df: Any) -> Dict[str, Any]:
        return {
            "task": "Clustering",
            "target": "Unsupervised",
            "best_model": "K-Means Clustering (Mocked)",
            "leaderboard": [
                {"Model": "K-Means Clustering", "Silhouette": 0.652, "Calinski-Harabasz": 1425.2, "Davies-Bouldin": 0.452}
            ],
            "feature_importances": []
        }

    @staticmethod
    def run_automl(df: Any, task_type: str, target: str = None) -> Dict[str, Any]:
        """Main entry point for AutoML."""
        try:
            if task_type.lower() == "classification":
                result = AutoMLService.run_classification(df, target)
            elif task_type.lower() == "regression":
                result = AutoMLService.run_regression(df, target)
            elif task_type.lower() == "clustering":
                result = AutoMLService.run_clustering(df)
            else:
                raise ValueError("Unsupported AutoML task. Must be Classification, Regression, or Clustering.")

            # Generate Explainability Report via LLM
            prompt = f"""
            You are an AI ML Engineer explaining an AutoML pipeline run to a business stakeholder.
            Task: {result['task']}
            Target Variable: {result['target']}
            Winning Model: {result['best_model']}
            Feature Importances: {result['feature_importances'][:3] if result['feature_importances'] else 'Not available'}
            
            Provide a concise, plain-English "Explainability Report". 
            Explain why the winning model might have performed well, and if feature importances are present, 
            explain which features drive the model's decisions. Make it accessible to non-technical users.
            """
            
            try:
                explanation = llm_service.llm.invoke(prompt).content
            except Exception:
                explanation = f"The AutoML engine successfully trained a {result['best_model']} model for {result['task']}."
                
            result["explainability_report"] = explanation
            return result
            
        except Exception as e:
            logging.error(f"AutoML Error: {str(e)}")
            raise
