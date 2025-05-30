from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base
# from datetime import datetime

class ExpenseTransactions(Base):
    __tablename__ = "expense_transactions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date_time = Column(DateTime, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)
    transaction_type = Column(String, nullable=False)
    bankname = Column(String, nullable=False)

class IncomeTransactions(Base):
    __tablename__ = "income_transactions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date_time = Column(DateTime, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)
    transaction_type = Column(String, nullable=False)
    bankname = Column(String, nullable=False)
    source = Column(String, nullable=False)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)
    budget = Column(Float, nullable=False)
    month = Column(String, nullable=False)
    year = Column(String, nullable=False)
    last_updated = Column(DateTime, nullable=False)
    
class CreditCardTransactions(Base):
    __tablename__ = 'credit_card_transactions'

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    date_time = Column(DateTime, nullable=False)  # <- added or renamed
    timestamp = Column(DateTime, nullable=True)
    emi_duration = Column(Integer)
    bankname = Column(String)
    notes = Column(String)


class CibilScore(Base):
    __tablename__ = 'cibil_score'

    id = Column(Integer, primary_key=True, index=True)
    score = Column(Integer, nullable=False)
    date_time = Column(DateTime, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    notes = Column(String)
