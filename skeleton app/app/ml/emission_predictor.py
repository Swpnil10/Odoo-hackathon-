import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Any

class CarbonPredictor:
    """
    Predictive Carbon Emissions forecasting engine using Pandas and Scikit-learn LinearRegression.
    Maps out the trend of carbon emissions for a department over time and projects the expected
    total carbon emissions for the upcoming 30 days.
    """
    def __init__(self) -> None:
        pass

    def _prepare_df(self, transactions: List[Any]) -> pd.DataFrame:
        """
        Extracts transaction_date and carbon_amount from historical transactions and
        converts them into a pandas DataFrame.
        """
        data = []
        for t in transactions:
            carbon_amount = getattr(t, "carbon_amount", None)
            if carbon_amount is None:
                carbon_amount = t.get("carbon_amount") if isinstance(t, dict) else 0.0
                
            transaction_date = getattr(t, "transaction_date", None)
            if transaction_date is None:
                transaction_date = t.get("transaction_date") if isinstance(t, dict) else None

            if transaction_date is not None:
                # If transaction_date is a string, parse it using pandas
                if isinstance(transaction_date, str):
                    try:
                        transaction_date = pd.to_datetime(transaction_date)
                    except Exception:
                        continue
                
                data.append({
                    "carbon_amount": float(carbon_amount),
                    "transaction_date": transaction_date
                })
        return pd.DataFrame(data)

    def predict_next_30_days(self, transactions: List[Any]) -> dict:
        """
        Forecasts expected total emissions for the next 30 days.
        If there are fewer than 3 transactions (or fewer than 3 unique days of transaction history),
        it falls back to returning the simple average of the historical transaction carbon amounts 
        and a 'stable' trend.
        """
        # Ensure we have transactions
        if not transactions:
            return {
                "forecasted_carbon_amount": 0.0,
                "trend": "stable"
            }
            
        amounts = [float(getattr(t, "carbon_amount", t.get("carbon_amount", 0.0) if isinstance(t, dict) else 0.0)) for t in transactions]
        
        # Fallback if fewer than 3 transaction records overall
        if len(transactions) < 3:
            simple_avg = float(np.mean(amounts)) if amounts else 0.0
            return {
                "forecasted_carbon_amount": round(simple_avg, 2),
                "trend": "stable"
            }

        df = self._prepare_df(transactions)
        if df.empty or len(df) < 3:
            simple_avg = float(np.mean(amounts)) if amounts else 0.0
            return {
                "forecasted_carbon_amount": round(simple_avg, 2),
                "trend": "stable"
            }

        # Format and aggregate daily
        df["date"] = pd.to_datetime(df["transaction_date"])
        # Standardize date to remove time/timezone components for daily grouping
        df["date_only"] = df["date"].dt.date

        # Group by date_only to get the total daily emissions
        daily_df = df.groupby("date_only")["carbon_amount"].sum().reset_index()
        daily_df = daily_df.sort_values("date_only").reset_index(drop=True)

        # Fallback if we have fewer than 3 unique days of data
        if len(daily_df) < 3:
            simple_avg = float(np.mean(amounts)) if amounts else 0.0
            return {
                "forecasted_carbon_amount": round(simple_avg, 2),
                "trend": "stable"
            }

        # Calculate time offsets as number of days since the first transaction date
        min_date = daily_df["date_only"].min()
        daily_df["day_offset"] = daily_df["date_only"].apply(lambda x: (x - min_date).days)

        # Train a LinearRegression model to map out the trend
        X = daily_df[["day_offset"]].values
        y = daily_df["carbon_amount"].values

        model = LinearRegression()
        model.fit(X, y)

        # Predict the next 30 days (from day_offset_max + 1 to day_offset_max + 30)
        max_offset = int(X.max())
        future_offsets = np.arange(max_offset + 1, max_offset + 31).reshape(-1, 1)
        predictions = model.predict(future_offsets)

        # Protect physical boundaries by clipping negative emissions to 0
        predictions = np.clip(predictions, 0.0, None)
        forecasted_total = float(predictions.sum())

        # Determine trend based on the daily slope
        slope = float(model.coef_[0])
        if slope > 1e-4:
            trend = "increasing"
        elif slope < -1e-4:
            trend = "decreasing"
        else:
            trend = "stable"

        return {
            "forecasted_carbon_amount": round(forecasted_total, 2),
            "trend": trend
        }
