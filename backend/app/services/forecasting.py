import pandas as pd
import numpy as np
from typing import Dict, Any, List
import logging

# We will lazily import the specific libraries inside the methods 
# to ensure the module loads even if some libraries fail to install.

class ForecastingService:
    @staticmethod
    def forecast_arima(df: pd.DataFrame, target_col: str, periods: int) -> Dict[str, Any]:
        from statsmodels.tsa.arima.model import ARIMA
        
        # Ensure data is numeric
        data = df[target_col].values
        
        # Fit ARIMA(5,1,0) as a default baseline
        model = ARIMA(data, order=(5,1,0))
        model_fit = model.fit()
        
        forecast_result = model_fit.get_forecast(steps=periods)
        forecast_values = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05) # 95% confidence
        
        return {
            "model": "ARIMA",
            "forecast": forecast_values.tolist(),
            "lower_bound": conf_int[:, 0].tolist(),
            "upper_bound": conf_int[:, 1].tolist()
        }

    @staticmethod
    def forecast_prophet(df: pd.DataFrame, time_col: str, target_col: str, periods: int) -> Dict[str, Any]:
        from prophet import Prophet
        
        prophet_df = df[[time_col, target_col]].rename(columns={time_col: 'ds', target_col: 'y'})
        
        m = Prophet(yearly_seasonality=True, weekly_seasonality=True)
        m.fit(prophet_df)
        
        future = m.make_future_dataframe(periods=periods)
        forecast = m.predict(future)
        
        # Get only the future periods
        future_forecast = forecast.tail(periods)
        
        return {
            "model": "Prophet",
            "forecast": future_forecast['yhat'].tolist(),
            "lower_bound": future_forecast['yhat_lower'].tolist(),
            "upper_bound": future_forecast['yhat_upper'].tolist()
        }

    @staticmethod
    def forecast_xgboost(df: pd.DataFrame, target_col: str, periods: int) -> Dict[str, Any]:
        import xgboost as xgb
        
        data = df[target_col].values
        # Simple autoregressive setup for XGBoost
        X, y = [], []
        window = 5
        for i in range(len(data) - window):
            X.append(data[i:i+window])
            y.append(data[i+window])
            
        X, y = np.array(X), np.array(y)
        
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
        model.fit(X, y)
        
        # Iterative forecasting
        forecasts = []
        last_window = data[-window:].tolist()
        
        # XGBoost doesn't provide native confidence intervals, we simulate them using a heuristic (std dev of past data)
        std_dev = np.std(data) * 0.1
        
        for _ in range(periods):
            pred = model.predict(np.array([last_window]))[0]
            forecasts.append(float(pred))
            last_window.append(pred)
            last_window.pop(0)
            
        return {
            "model": "XGBoost",
            "forecast": forecasts,
            "lower_bound": [f - (std_dev * 1.96) for f in forecasts],
            "upper_bound": [f + (std_dev * 1.96) for f in forecasts]
        }

    @staticmethod
    def forecast_deep_learning(df: pd.DataFrame, time_col: str, target_col: str, periods: int, model_type: str) -> Dict[str, Any]:
        """Uses Darts for LSTM and Transformer forecasting."""
        try:
            from darts import TimeSeries
            from darts.models import RNNModel, TransformerModel
            import logging
            logging.getLogger("pytorch_lightning").setLevel(logging.WARNING)

            # Convert to Darts TimeSeries
            df[time_col] = pd.to_datetime(df[time_col])
            
            # Handle potential duplicate dates or irregular intervals by aggregating
            df_agg = df.groupby(time_col)[target_col].mean().reset_index()
            series = TimeSeries.from_dataframe(df_agg, time_col, target_col)
            
            if model_type == "LSTM":
                # RNNModel in Darts defaults to RNN, can be configured for LSTM
                model = RNNModel(
                    model='LSTM',
                    input_chunk_length=12,
                    training_length=20,
                    n_epochs=10,
                    random_state=42
                )
            elif model_type == "Transformer":
                model = TransformerModel(
                    input_chunk_length=12,
                    output_chunk_length=1,
                    n_epochs=10,
                    random_state=42
                )
            else:
                raise ValueError("Unsupported deep learning model type")
                
            model.fit(series)
            
            # Deep Learning models in Darts support probabilistic forecasting if trained appropriately,
            # but for simplicity in this baseline, we predict deterministic and simulate bounds.
            prediction = model.predict(n=periods)
            forecast_values = prediction.values().flatten().tolist()
            
            std_dev = np.std(df[target_col].values) * 0.15
            
            return {
                "model": model_type,
                "forecast": forecast_values,
                "lower_bound": [f - (std_dev * 1.96) for f in forecast_values],
                "upper_bound": [f + (std_dev * 1.96) for f in forecast_values]
            }
        except Exception as e:
            logging.error(f"Deep Learning Forecast Error: {str(e)}")
            raise

    @staticmethod
    def generate_forecast(df: pd.DataFrame, time_col: str, target_col: str, periods: int, algorithm: str) -> Dict[str, Any]:
        """Main entry point that routes to the requested forecasting algorithm."""
        df = df.dropna(subset=[target_col]).copy()
        
        if algorithm.upper() == "ARIMA":
            return ForecastingService.forecast_arima(df, target_col, periods)
        elif algorithm.upper() == "PROPHET":
            return ForecastingService.forecast_prophet(df, time_col, target_col, periods)
        elif algorithm.upper() == "XGBOOST":
            return ForecastingService.forecast_xgboost(df, target_col, periods)
        elif algorithm.upper() in ["LSTM", "TRANSFORMER"]:
            return ForecastingService.forecast_deep_learning(df, time_col, target_col, periods, algorithm.upper())
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
