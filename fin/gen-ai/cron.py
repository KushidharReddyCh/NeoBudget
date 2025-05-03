from apscheduler.schedulers.blocking import BlockingScheduler
# Direct imports from current directory structure
from generate_reports import generate_reports_monthly
from generate_analysis import generate_financial_summary, text_to_html
from mail_services import send_email

from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def weekly_job():
    print("📅 Weekly job at", datetime.now())

def monthly_job():
    generate_reports_monthly()
    response = generate_financial_summary()
    html_body = text_to_html(response)
    send_email("NeoBudget Monthly Analysis", html_body, "kushidhar0873@gmail.com", is_html=True)
    print("🕛 End-of-month job at", datetime.now())


if __name__ == "__main__":
    monthly_job()
#     scheduler = BlockingScheduler()

# # 1. Every Sunday at 8:00 AM
#     scheduler.add_job(weekly_job, CronTrigger(day_of_week='sun', hour=8, minute=0))

#     # 2. Last day of every month at 11:59 PM
#     scheduler.add_job(monthly_job, CronTrigger(day='last', hour=23, minute=59))

#     scheduler.start()