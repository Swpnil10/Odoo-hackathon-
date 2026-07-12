import pandas as pd
import numpy as np
from typing import List, Any
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import IsolationForest
from app.core.config import settings

class CarbonAnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        
        # Preprocessor defines a column-specific transformation pipeline
        # Categorical features are one-hot encoded, and numerical features are standardized.
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), ["carbon_amount"]),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["emission_source"])
            ]
        )
        
        # Build the scikit-learn Pipeline
        self.pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", IsolationForest(contamination=self.contamination, random_state=42))
            ]
        )
        self.is_trained = False

    def _prepare_df(self, transactions: List[Any]) -> pd.DataFrame:
        """
        Converts a list of transaction records into a pandas DataFrame with ML feature columns.
        Supports both SQLAlchemy ORM objects and Pydantic schemas/dictionaries.
        """
        data = []
        for t in transactions:
            carbon_amount = getattr(t, "carbon_amount", None)
            if carbon_amount is None:
                carbon_amount = t.get("carbon_amount") if isinstance(t, dict) else 0.0
                
            emission_source = getattr(t, "emission_source", None)
            if emission_source is None:
                emission_source = t.get("emission_source") if isinstance(t, dict) else "Unknown"

            data.append({
                "carbon_amount": float(carbon_amount),
                "emission_source": str(emission_source)
            })
        return pd.DataFrame(data)

    def train(self, historical_transactions: List[Any]) -> bool:
        """
        Trains the anomaly detector pipeline on historical baseline transactions.
        """
        if len(historical_transactions) < settings.MIN_TRAINING_SAMPLES:
            self.is_trained = False
            return False

        try:
            df = self._prepare_df(historical_transactions)
            self.pipeline.fit(df)
            self.is_trained = True
            return True
        except Exception as e:
            # Fall back to untrained status in case of scikit-learn errors
            self.is_trained = False
            return False

    def predict(self, new_transaction: Any, historical_transactions: List[Any]) -> bool:
        """
        Predicts if a new transaction is anomalous compared to a baseline of historical transactions.
        
        If there are enough historical samples (>= MIN_TRAINING_SAMPLES), it trains the Isolation Forest
        model and uses it for prediction.
        
        If there is insufficient historical data, it falls back to a 3-standard-deviations outlier 
        heuristic based on emission amount.
        """
        # Always try to train on the latest history
        trained = self.train(historical_transactions)

        if not trained:
            # Fallback logic for small baseline data
            if not historical_transactions:
                return False

            new_amount = float(getattr(new_transaction, "carbon_amount", 0.0))
            amounts = [float(getattr(t, "carbon_amount", 0.0)) for t in historical_transactions]
            
            if len(amounts) >= 2:
                mean = np.mean(amounts)
                std = np.std(amounts)
                if std > 0:
                    return new_amount > (mean + 3.0 * std)
            
            # Simple threshold check if std dev cannot be computed: 3x the average
            avg_amount = np.mean(amounts) if amounts else 0.0
            return new_amount > (avg_amount * 3.0)

        # Run Prediction with Isolation Forest Pipeline
        df_new = self._prepare_df([new_transaction])
        try:
            # predict returns -1 for outliers/anomalies and 1 for normal/inliers
            prediction = self.pipeline.predict(df_new)
            return bool(prediction[0] == -1)
        except Exception:
            return False
