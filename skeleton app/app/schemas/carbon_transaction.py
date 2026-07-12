from pydantic import BaseModel, ConfigDict
import datetime

class CarbonTransactionBase(BaseModel):
    department_id: int
    emission_source: str
    carbon_amount: float

class CarbonTransactionCreate(CarbonTransactionBase):
    pass

class CarbonTransactionResponse(CarbonTransactionBase):
    id: int
    transaction_date: datetime.datetime
    is_anomalous: bool

    model_config = ConfigDict(from_attributes=True)


class CarbonForecastResponse(BaseModel):
    department_id: int
    forecasted_carbon_amount: float
    trend: str

