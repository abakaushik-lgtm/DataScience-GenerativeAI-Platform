import logging
import numpy as np
import pandas as pd
from typing import Dict, Any

class CustomMLService:
    def __init__(self):
        pass

    def train_model(self, model_type: str, params: Dict[str, Any], data_path: str = None) -> Dict[str, Any]:
        """
        Trains a specific machine learning model.
        Supported models: 'xgboost', 'lightgbm', 'random_forest', 'pytorch_nn'
        """
        # For demonstration without a live dataset, we'll generate synthetic regression data
        from sklearn.datasets import make_regression
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_squared_error, r2_score
        
        X, y = make_regression(n_samples=1000, n_features=20, noise=0.1, random_state=42)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        results = {"model": model_type, "metrics": {}}

        try:
            if model_type == "xgboost":
                import xgboost as xgb
                model = xgb.XGBRegressor(**params, random_state=42)
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                
            elif model_type == "lightgbm":
                import lightgbm as lgb
                model = lgb.LGBMRegressor(**params, random_state=42)
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                
            elif model_type == "random_forest":
                from sklearn.ensemble import RandomForestRegressor
                model = RandomForestRegressor(**params, random_state=42)
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                
            elif model_type == "pytorch_nn":
                import torch
                import torch.nn as nn
                import torch.optim as optim
                
                # Convert to tensors
                X_tr = torch.tensor(X_train, dtype=torch.float32)
                y_tr = torch.tensor(y_train, dtype=torch.float32).view(-1, 1)
                X_te = torch.tensor(X_test, dtype=torch.float32)
                
                # Define simple DNN
                hidden_size = params.get("hidden_size", 64)
                epochs = params.get("epochs", 50)
                lr = params.get("lr", 0.01)
                
                class SimpleNN(nn.Module):
                    def __init__(self):
                        super().__init__()
                        self.net = nn.Sequential(
                            nn.Linear(20, hidden_size),
                            nn.ReLU(),
                            nn.Linear(hidden_size, 1)
                        )
                    def forward(self, x):
                        return self.net(x)
                        
                model = SimpleNN()
                criterion = nn.MSELoss()
                optimizer = optim.Adam(model.parameters(), lr=lr)
                
                # Train
                for epoch in range(epochs):
                    optimizer.zero_grad()
                    out = model(X_tr)
                    loss = criterion(out, y_tr)
                    loss.backward()
                    optimizer.step()
                
                # Predict
                model.eval()
                with torch.no_grad():
                    preds = model(X_te).numpy().flatten()
            else:
                raise ValueError(f"Unsupported model type: {model_type}")

            # Calculate metrics
            results["metrics"]["mse"] = float(mean_squared_error(y_test, preds))
            results["metrics"]["r2"] = float(r2_score(y_test, preds))
            results["status"] = "success"
            
            return results

        except Exception as e:
            logging.error(f"Error training {model_type}: {e}")
            raise Exception(f"Failed to train {model_type}: {str(e)}")

custom_ml_service = CustomMLService()
