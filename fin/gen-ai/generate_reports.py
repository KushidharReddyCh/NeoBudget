import sqlite3
import pandas as pd
from datetime import datetime, timedelta
import os

# Paths
BASE_FOLDER = "fin/gen-ai/reports"
MONTHLY_FOLDER = os.path.join(BASE_FOLDER, "monthly")
WEEKLY_FOLDER = os.path.join(BASE_FOLDER, "weekly")

# Table info: (table_name, date_column, output_csv_name)
TABLES_INFO = [
    ("credit_card_transactions", "date_time", "credit_card_transactions.csv"),
    ("expense_transactions", "date_time", "expense_transactions.csv"),
    ("income_transactions", "date_time", "income_transactions.csv"),
]

def ensure_folders():
    os.makedirs(MONTHLY_FOLDER, exist_ok=True)
    os.makedirs(WEEKLY_FOLDER, exist_ok=True)

def connect_db(db_path="fin/finance.db"):
    return sqlite3.connect(db_path)

def export_to_csv(df, filepath, mode):
    df.to_csv(filepath, index=False)
    print(f"[{mode.upper()}] Saved: {filepath}")

def generate_monthly_reports(conn):
    today = datetime.now()
    year = today.year
    month = today.month

    for table_name, date_col, filename in TABLES_INFO:
        query = f"""
            SELECT * FROM {table_name}
            WHERE strftime('%Y', {date_col}) = '{year}'
              AND strftime('%m', {date_col}) = '{month:02d}'
            ORDER BY {date_col} ASC;
        """
        df = pd.read_sql_query(query, conn)
        filepath = os.path.join(MONTHLY_FOLDER, filename)
        export_to_csv(df, filepath, mode="monthly")

def generate_weekly_reports(conn):
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_start_str = week_start.strftime("%Y-%m-%d")
    week_end_str = today.strftime("%Y-%m-%d")

    for table_name, date_col, filename in TABLES_INFO:
        query = f"""
            SELECT * FROM {table_name}
            WHERE date({date_col}) BETWEEN date('{week_start_str}') AND date('{week_end_str}')
            ORDER BY {date_col} ASC;
        """
        df = pd.read_sql_query(query, conn)
        filepath = os.path.join(WEEKLY_FOLDER, filename)
        export_to_csv(df, filepath, mode="weekly")

def delete_csv_files(folder_path, mode):
    if not os.path.exists(folder_path):
        print(f"[{mode.upper()}] Folder does not exist: {folder_path}")
        return

    deleted = False
    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(folder_path, filename)
            os.remove(file_path)
            print(f"[{mode.upper()}] Deleted: {file_path}")
            deleted = True

    if not deleted:
        print(f"[{mode.upper()}] No CSV files to delete in: {folder_path}")

MONTHLY_FOLDER = os.path.join(BASE_FOLDER, "monthly")
WEEKLY_FOLDER = os.path.join(BASE_FOLDER, "weekly")

def delete_monthly_reports():
    delete_csv_files(MONTHLY_FOLDER, mode="monthly")

def delete_weekly_reports():
    delete_csv_files(WEEKLY_FOLDER, mode="weekly")

def generate_reports_monthly():
    ensure_folders()
    conn = connect_db()
    generate_monthly_reports(conn)
    # generate_weekly_reports(conn)
    conn.close()

if __name__ == "__main__":
    generate_reports_monthly()
    # delete_monthly_reports()
    # delete_weekly_reports()
