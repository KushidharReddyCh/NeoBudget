from fastapi import FastAPI, Depends, status, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from . import schemas, models
from .database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import logging
from datetime import datetime, date, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

models.Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


########################### & Expense Transaction APIs ########################## 

@app.get("/test-connection")
def test_connection():
    return "Connection successful"

@app.post("/create-expense-transaction")
def create_transaction(transaction: schemas.ExpenseTransaction, db:Session = Depends(get_db)):
    logger.info(f"Creating new expense transaction: {transaction.model_dump()}")
    new_transaction = models.ExpenseTransactions(
        category=transaction.category,
        sub_category=transaction.sub_category,
        amount=transaction.amount,
        date_time=transaction.date_time,
        timestamp=datetime.now(),
        notes=transaction.notes,
        transaction_type=transaction.transaction_type,
        bankname=transaction.bankname,
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    logger.info(f"Successfully created transaction with ID: {new_transaction.id}")
    return new_transaction

# add a filter to get all expense transactions by date range
@app.get("/get-all-expense-transactions")
def get_all_transactions(
    start_date: date = None,
    end_date: date = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all expense transactions with optional date range and category filtering.
    
    Parameters:
    - start_date (date, optional): Start date in YYYY-MM-DD format (e.g., 2024-01-01)
    - end_date (date, optional): End date in YYYY-MM-DD format (e.g., 2024-01-31)
    - category (str, optional): Category to filter transactions by
    
    Returns:
    - List of expense transactions filtered by the date range and category if provided, otherwise all transactions
    """
    logger.info("Fetching expense transactions")
    query = db.query(models.ExpenseTransactions)
    
    if start_date and end_date:
        logger.info(f"Filtering transactions between {start_date} and {end_date}")
        query = query.filter(
            models.ExpenseTransactions.date_time >= datetime.combine(start_date, datetime.min.time()),
            models.ExpenseTransactions.date_time <= datetime.combine(end_date, datetime.max.time())
        )
    elif start_date:
        logger.info(f"Filtering transactions from {start_date}")
        query = query.filter(models.ExpenseTransactions.date_time >= datetime.combine(start_date, datetime.min.time()))
    elif end_date:
        logger.info(f"Filtering transactions until {end_date}")
        query = query.filter(models.ExpenseTransactions.date_time <= datetime.combine(end_date, datetime.max.time()))
    
    if category:
        logger.info(f"Filtering transactions by category: {category}")
        query = query.filter(models.ExpenseTransactions.category == category)
    
    transactions = query.all()
    logger.info(f"Retrieved {len(transactions)} transactions")
    return transactions

@app.get("/get-expense-transaction-by-id/{transaction_id}")
def get_transaction_by_id(transaction_id: int, db:Session = Depends(get_db)):
    logger.info(f"Fetching transaction with ID: {transaction_id}")
    transaction = db.query(models.ExpenseTransactions).filter(models.ExpenseTransactions.id == transaction_id).first()
    if not transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    logger.info(f"Successfully retrieved transaction with ID: {transaction_id}")
    return transaction

# TODO: when updated there should be a new col that shows the last updated time and also change the timestamp to created_time
@app.put("/update-expense-transaction/{transaction_id}")
def update_expense_transaction(transaction_id: int, transaction: schemas.ExpenseTransaction, db:Session = Depends(get_db)):
    logger.info(f"Updating transaction with ID: {transaction_id}")
    transaction_query = db.query(models.ExpenseTransactions).filter(models.ExpenseTransactions.id == transaction_id)
    existing_transaction = transaction_query.first()
    if not existing_transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found for update")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    transaction_query.update(transaction.model_dump())
    db.commit()
    db.refresh(existing_transaction)  # Refresh to get the updated values
    logger.info(f"Successfully updated transaction with ID: {transaction_id}")
    return existing_transaction

@app.delete("/delete-expense-transaction/{transaction_id}")
def delete_transaction(transaction_id: int, db:Session = Depends(get_db)):
    print("transaction_id", transaction_id, type(transaction_id))
    logger.info(f"Attempting to delete transaction with ID: {transaction_id}")
    transaction_query = db.query(models.ExpenseTransactions).filter(models.ExpenseTransactions.id == transaction_id)
    transaction = transaction_query.first()
    if not transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found for deletion")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    transaction_query.delete(synchronize_session=False)
    db.commit()
    logger.info(f"Successfully deleted transaction with ID: {transaction_id}")
    return "Transaction deleted successfully"

################ & End of Expense Transaction APIs ########################## 

########################### & Income Transaction APIs ########################## 

@app.post("/create-income-transaction")
def create_income_transaction(transaction: schemas.IncomeTransaction, db:Session = Depends(get_db)):
    logger.info(f"Creating new income transaction: {transaction.model_dump()}")
    new_transaction = models.IncomeTransactions(
        category=transaction.category,
        amount=transaction.amount,
        date_time=transaction.date_time,
        timestamp=datetime.now(),
        notes=transaction.notes,
        transaction_type=transaction.transaction_type,
        bankname=transaction.bankname,
        source=transaction.source,
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    logger.info(f"Successfully created transaction with ID: {new_transaction.id}")
    return new_transaction

# add a filter to get all income transactions by date range
@app.get("/get-all-income-transactions")
def get_all_transactions(db:Session = Depends(get_db)):
    logger.info("Fetching all income transactions")
    transactions = db.query(models.IncomeTransactions).all()
    logger.info(f"Retrieved {len(transactions)} transactions")
    return transactions

@app.get("/get-income-transaction-by-id/{transaction_id}")
def get_transaction_by_id(transaction_id: int, db:Session = Depends(get_db)):
    logger.info(f"Fetching transaction with ID: {transaction_id}")
    transaction = db.query(models.IncomeTransactions).filter(models.IncomeTransactions.id == transaction_id).first()
    if not transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    logger.info(f"Successfully retrieved transaction with ID: {transaction_id}")
    return transaction

@app.put("/update-income-transaction/{transaction_id}")
def update_income_transaction(transaction_id: int, transaction: schemas.IncomeTransaction, db:Session = Depends(get_db)):
    logger.info(f"Updating transaction with ID: {transaction_id}")
    transaction_query = db.query(models.IncomeTransactions).filter(models.IncomeTransactions.id == transaction_id)
    existing_transaction = transaction_query.first()
    if not existing_transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found for update")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    transaction_query.update(transaction.model_dump())
    db.commit()
    logger.info(f"Successfully updated transaction with ID: {transaction_id}")
    return existing_transaction

@app.delete("/delete-income-transaction/{transaction_id}")
def delete_income_transaction(transaction_id: int, db:Session = Depends(get_db)):
    logger.info(f"Attempting to delete transaction with ID: {transaction_id}")
    transaction_query = db.query(models.IncomeTransactions).filter(models.IncomeTransactions.id == transaction_id)
    transaction = transaction_query.first()
    if not transaction:
        logger.warning(f"Transaction with ID {transaction_id} not found for deletion")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction with id {transaction_id} not found")
    transaction_query.delete(synchronize_session=False)
    db.commit()
    logger.info(f"Successfully deleted transaction with ID: {transaction_id}")
    return "Transaction deleted successfully"

@app.get("/get-income-by-bank/{bankname}")
def get_income_by_bank(bankname: str, db:Session = Depends(get_db)):
    logger.info(f"Fetching income by bank: {bankname}")
    income = db.query(models.IncomeTransactions).filter(models.IncomeTransactions.bankname == bankname).all()
    return income

################ & End of Income Transaction APIs ########################## 

@app.get("/current-balance")
def get_current_balance(db:Session = Depends(get_db)):
    logger.info("Fetching current balance")
    total_income = db.query(func.sum(models.IncomeTransactions.amount)).scalar() or 0
    total_expense = db.query(func.sum(models.ExpenseTransactions.amount)).scalar() or 0
    current_balance = total_income - total_expense
    return {"current_balance": current_balance}

@app.get("/get-current-balance-by-bank")
def get_current_balance_by_bank(db: Session = Depends(get_db)):
    logger.info("Fetching current balance by bank")

    # Fetch total income per bank
    income_by_bank = db.query(
        models.IncomeTransactions.bankname,
        func.sum(models.IncomeTransactions.amount).label("total_income")
    ).group_by(models.IncomeTransactions.bankname).all()

    # Fetch total expense per bank
    expense_by_bank = db.query(
        models.ExpenseTransactions.bankname,
        func.sum(models.ExpenseTransactions.amount).label("total_expense")
    ).group_by(models.ExpenseTransactions.bankname).all()

    # Convert to dicts for easy lookup
    income_dict = {bank: income for bank, income in income_by_bank}
    expense_dict = {bank: expense for bank, expense in expense_by_bank}

    # Union of all bank names
    all_banks = set(income_dict.keys()).union(expense_dict.keys())

    # Calculate net balance per bank
    balance_by_bank = {
        bank: (income_dict.get(bank, 0) - expense_dict.get(bank, 0))
        for bank in all_banks
    }
    balance_by_bank = dict(sorted(balance_by_bank.items(), key=lambda item: item[1], reverse=True))

    return {"balance_by_bank": balance_by_bank}




########################### & End of Balance APIs ########################## 


########################### & Category APIs ########################## 

@app.post("/create-category")
def create_category(category: schemas.Category, db:Session = Depends(get_db)):
    logger.info(f"Creating new category: {category.model_dump()}")
    # check if the category, sub_category, month and year already exists
    existing_category = db.query(models.Category).filter(models.Category.category == category.category, models.Category.sub_category == category.sub_category, models.Category.month == category.month, models.Category.year == category.year).first()
    if existing_category:
        logger.warning(f"Category already exists: {existing_category.model_dump()}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Category already exists")
    new_category = models.Category(
        category=category.category,
        sub_category=category.sub_category,
        budget=category.budget,
        month=category.month,
        year=category.year,
        last_updated=datetime.now(),
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    logger.info(f"Successfully created category with ID: {new_category.id}")
    return new_category

@app.get("/get-all-categories")
def get_all_categories(db:Session = Depends(get_db)):
    logger.info("Fetching all categories")
    categories = db.query(models.Category).all()
    logger.info(f"Retrieved {len(categories)} categories")
    return categories

@app.get("/get-category-by-id/{category_id}")
def get_category_by_id(category_id: int, db:Session = Depends(get_db)):
    logger.info(f"Fetching category with ID: {category_id}")
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        logger.warning(f"Category with ID {category_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category with id {category_id} not found")
    logger.info(f"Successfully retrieved category with ID: {category_id}")
    return category

@app.put("/update-category/{category_id}")
def update_category(category_id: int, category: schemas.Category, db:Session = Depends(get_db)):
    logger.info(f"Updating category with ID: {category_id}")
    category_query = db.query(models.Category).filter(models.Category.id == category_id)
    existing_category = category_query.first()
    if not existing_category:
        logger.warning(f"Category with ID {category_id} not found for update")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category with id {category_id} not found")
    category_query.update(category.model_dump())
    db.commit()
    db.refresh(existing_category)
    logger.info(f"Successfully updated category with ID: {category_id}")
    return existing_category

@ app.delete("/delete-category/{category_id}")
def delete_category(category_id: int, db:Session = Depends(get_db)):
    logger.info(f"Attempting to delete category with ID: {category_id}")
    category_query = db.query(models.Category).filter(models.Category.id == category_id)
    category = category_query.first()
    if not category:
        logger.warning(f"Category with ID {category_id} not found for deletion")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Category with id {category_id} not found")
    category_query.delete(synchronize_session=False)
    db.commit()
    logger.info(f"Successfully deleted category with ID: {category_id}")
    return "Category deleted successfully"



@app.get("/get-category-by-month-and-year")
def get_category_by_month_and_year(month: str, year: str, db:Session = Depends(get_db)):
    """
    Get all categories by month and year

    Parameters:
    - month (str): jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec
    - year (str): Year in YYYY format (e.g., 2024)

    Returns:
    - List of categories filtered by the month and year
    """
    logger.info(f"Fetching category by month: {month} and year: {year}")
    categories = db.query(models.Category).filter(models.Category.month == month, models.Category.year == year).all()
    logger.info(f"Retrieved {len(categories)} categories")
    return categories


# get category names by month and year
@app.get("/get-category-names-by-month-and-year")
def get_category_names_by_month_and_year(month: str, year: str, db:Session = Depends(get_db)):
    """
    Get all category names by month and year

    Parameters:
    - month (str): jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec
    - year (str): Year in YYYY format (e.g., 2024)

    Returns:
    - List of category names filtered by the month and year
    """
    logger.info(f"Fetching category names by month: {month} and year: {year}")
    categories = db.query(models.Category).filter(models.Category.month == month, models.Category.year == year).all()
    logger.info(f"Retrieved {len(categories)} categories")
    category_names = [category.category for category in categories]
    return category_names

# get category sub-category names by month and year
@app.get("/get-category-sub-category-names-by-month-and-year")
def get_category_sub_category_names_by_month_and_year(month: str, year: str, db:Session = Depends(get_db)):
    logger.info(f"Fetching category sub-category names by month: {month} and year: {year}")
    categories = db.query(models.Category).filter(models.Category.month == month, models.Category.year == year).all()
    category_names = [category.sub_category for category in categories]
    # return a json for each category name with its sub-category names list
    category_sub_category_names = {}    
    for category in categories:
        if category.category not in category_sub_category_names:
            category_sub_category_names[category.category] = [category.sub_category]
        else:
            category_sub_category_names[category.category].append(category.sub_category)
    logger.info(f"Retrieved {len(categories)} categories")
    return category_sub_category_names



########################### & End of Category APIs ########################## 

########################### & Credit Card Transaction APIs ########################## 

@app.post("/create-credit-card-transaction")
def create_credit_card_transaction(transaction: schemas.CreditCardTransactions, db:Session = Depends(get_db)):
    logger.info(f"Creating new credit card transaction: {transaction.model_dump()}")
    new_transaction = models.CreditCardTransactions(
        amount=transaction.amount,
        date_time=transaction.date_time,
        timestamp=datetime.now(),
        emi_duration=transaction.emi_duration,
        bankname=transaction.bankname,
        notes=transaction.notes,
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    logger.info(f"Successfully created credit card transaction with ID: {new_transaction.id}")
    return new_transaction

@app.get("/get-all-credit-card-transactions")
def get_all_credit_card_transactions(db:Session = Depends(get_db)):
    logger.info("Fetching all credit card transactions")
    transactions = db.query(models.CreditCardTransactions).all()
    logger.info(f"Retrieved {len(transactions)} credit card transactions")
    return transactions 

@app.get("/get-credit-card-transaction-by-id/{transaction_id}")
def get_credit_card_transaction_by_id(transaction_id: int, db:Session = Depends(get_db)):
    logger.info(f"Fetching credit card transaction with ID: {transaction_id}")
    transaction = db.query(models.CreditCardTransactions).filter(models.CreditCardTransactions.id == transaction_id).first()
    return transaction

@app.put("/update-credit-card-transaction/{transaction_id}")
def update_credit_card_transaction(transaction_id: int, transaction: schemas.CreditCardTransactions, db:Session = Depends(get_db)):
    logger.info(f"Updating credit card transaction with ID: {transaction_id}")
    transaction_query = db.query(models.CreditCardTransactions).filter(models.CreditCardTransactions.id == transaction_id)
    existing_transaction = transaction_query.first()
    if not existing_transaction:
        logger.warning(f"Credit card transaction with ID {transaction_id} not found for update")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Credit card transaction with id {transaction_id} not found")
    transaction_query.update(transaction.model_dump())
    db.commit()
    db.refresh(existing_transaction)
    logger.info(f"Successfully updated credit card transaction with ID: {transaction_id}")
    return existing_transaction

@app.delete("/delete-credit-card-transaction/{transaction_id}")
def delete_credit_card_transaction(transaction_id: int, db:Session = Depends(get_db)):
    logger.info(f"Attempting to delete credit card transaction with ID: {transaction_id}")
    transaction_query = db.query(models.CreditCardTransactions).filter(models.CreditCardTransactions.id == transaction_id)
    transaction = transaction_query.first()
    if not transaction:
        logger.warning(f"Credit card transaction with ID {transaction_id} not found for deletion")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Credit card transaction with id {transaction_id} not found")
    transaction_query.delete(synchronize_session=False)
    db.commit()
    logger.info(f"Successfully deleted credit card transaction with ID: {transaction_id}")
    return "Credit card transaction deleted successfully"

@app.get("/get-credit-card-transaction-by-date-range")
def get_credit_card_transaction_by_date_range(start_date: date, end_date: date, db:Session = Depends(get_db)):
    """
    Get all credit card transactions by date range

    Parameters:
    - start_date (date): Start date in YYYY-MM-DD format (e.g., 2024-01-01)
    - end_date (date): End date in YYYY-MM-DD format (e.g., 2024-01-31)

    Returns:
    - List of credit card transactions filtered by the date range
    """

    logger.info(f"Fetching credit card transaction by date range: {start_date} to {end_date}")
    transactions = db.query(models.CreditCardTransactions).filter(models.CreditCardTransactions.date_time >= start_date, models.CreditCardTransactions.date_time <= end_date).all()
    return transactions


########################### & End of Credit Card Transaction APIs ########################## 

########################### & Credit Card APIs ########################## 

@app.post("/create-cibil-score")
def create_cibil_score(score: schemas.CibilScore, db:Session = Depends(get_db)):
    logger.info(f"Creating new cibil score: {score.model_dump()}")
    new_score = models.CibilScore(
        score=score.score,
        date_time=score.date_time,
        timestamp=datetime.now(),
        notes=score.notes,
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    logger.info(f"Successfully created cibil score with ID: {new_score.id}")
    return new_score

@app.get("/get-all-cibil-scores")
def get_all_cibil_scores(db:Session = Depends(get_db)):
    logger.info("Fetching all cibil scores")
    scores = db.query(models.CibilScore).all()
    logger.info(f"Retrieved {len(scores)} cibil scores")
    return scores

@app.get("/get-cibil-score-by-month-and-year")
def get_cibil_score_by_month_and_year(month: str, year: str, db:Session = Depends(get_db)):
    logger.info(f"Fetching cibil score by month: {month} and year: {year}")
    
    # Convert month name to number (1-12)
    month_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }
    month_num = month_map.get(month.lower())
    if not month_num:
        raise HTTPException(status_code=400, detail="Invalid month name")
    
    # Create start and end dates for the month
    start_date = datetime(int(year), month_num, 1)
    if month_num == 12:
        end_date = datetime(int(year) + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(int(year), month_num + 1, 1) - timedelta(days=1)
    
    # Query scores within the date range
    scores = db.query(models.CibilScore).filter(
        models.CibilScore.date_time >= start_date,
        models.CibilScore.date_time <= end_date
    ).order_by(models.CibilScore.date_time.desc()).all()
    
    return scores

@app.get("/get-current-cibil-score")
def get_current_cibil_score(db:Session = Depends(get_db)):
    logger.info("Fetching current cibil score")
    score = db.query(models.CibilScore).order_by(models.CibilScore.date_time.desc()).first()
    return score

@app.get("/update-cibil-score-by-id")
def update_cibil_score_by_id(score_id: int, score: schemas.CibilScore, db:Session = Depends(get_db)):
    logger.info(f"Updating cibil score with ID: {score_id}")
    score_query = db.query(models.CibilScore).filter(models.CibilScore.id == score_id)
    existing_score = score_query.first()
    if not existing_score:
        raise HTTPException(status_code=404, detail="Cibil score not found")
    score_query.update(score.model_dump())
    db.commit()
    db.refresh(existing_score)
    logger.info(f"Successfully updated cibil score with ID: {score_id}")
    return existing_score

@app.get("/delete-cibil-score-by-id")
def delete_cibil_score_by_id(score_id: int, db:Session = Depends(get_db)):
    logger.info(f"Deleting cibil score with ID: {score_id}")
    score_query = db.query(models.CibilScore).filter(models.CibilScore.id == score_id)
    score = score_query.first()
    if not score:
        raise HTTPException(status_code=404, detail="Cibil score not found")
    score_query.delete(synchronize_session=False)
    db.commit()
    logger.info(f"Successfully deleted cibil score with ID: {score_id}")
    return "Cibil score deleted successfully"

########################### & End of Credit Card APIs ########################## 