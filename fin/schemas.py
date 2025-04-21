from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExpenseTransaction(BaseModel):
    category: str
    sub_category: str
    amount: float
    date_time: datetime
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None
    transaction_type: str # upi / credit card / debit card / net banking / cash / cheque / others
    bankname: str # sbi / hdfc / icici / others

class IncomeTransaction(BaseModel):
    category: str
    amount: float
    date_time: datetime
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None
    transaction_type: str # upi / credit card / debit card / net banking / cash / cheque / others
    source: str # salary / business / others
    bankname: str # sbi / hdfc / icici / others

class Category(BaseModel):
    category: str
    sub_category: str
    budget: float
    month: str
    year: str

class CreditCardTransactions(BaseModel):
    amount: float
    date_time: datetime
    timestamp: Optional[datetime] = None
    emi_duration: int
    bankname: str
    notes: Optional[str] = None