# api key = AIzaSyAAbXFL-ptyeWmAtS-0v_j94jGEVonWN70
import google.generativeai as genai
import os
import pandas as pd
genai.configure(api_key="AIzaSyAAbXFL-ptyeWmAtS-0v_j94jGEVonWN70")

model = genai.GenerativeModel("gemini-1.5-flash")

# chat = model.start_chat(history=[
#     {"role": "user", "parts": ["What is 1+1?"]},
#     {"role": "assistant", "parts": ["1+1 is 2."]}
# ])

# response = chat.send_message("What is 1+1?")
# print(response.text)

BASE_FOLDER = "fin/gen-ai/reports"
MONTHLY_FOLDER = os.path.join(BASE_FOLDER, "monthly")
WEEKLY_FOLDER = os.path.join(BASE_FOLDER, "weekly")


def generate_financial_summary():
    # Define file paths
    credit_card_path = os.path.join(MONTHLY_FOLDER, "credit_card_transactions.csv")
    income_path = os.path.join(MONTHLY_FOLDER, "income_transactions.csv")
    expense_path = os.path.join(MONTHLY_FOLDER, "expense_transactions.csv")

    # Load all data
    try:
        credit_df = pd.read_csv(credit_card_path)
        income_df = pd.read_csv(income_path)
        expense_df = pd.read_csv(expense_path)
    except FileNotFoundError as e:
        print(f"❌ File not found: {e.filename}")
        return

    # Convert to CSV text for the prompt
    credit_csv = credit_df.to_csv(index=False)
    income_csv = income_df.to_csv(index=False)
    expense_csv = expense_df.to_csv(index=False)

    # Combine into a single prompt
    prompt = (
        """
        I have attached my monthly income and expense budget, along with my credit card transaction history for the last [Number] months. Please analyze this data to identify:
        1.  **Key spending categories:** What are the top 5-10 categories where I spend the most money?
        2.  **Income vs. Expenses:** What is my average monthly income, total expenses, and savings rate (or deficit)?
        3.  **Spending trends:** Are there any noticeable increases or decreases in spending within specific categories over the past [Number] months?
        4.  **Potential areas for savings:** Based on my spending patterns, where could I potentially reduce expenses without significantly impacting my essential needs or stated priorities (if you can infer any)? Please provide specific examples or types of spending to consider.
        5.  **Discretionary vs. Non-Discretionary Spending:** Can you help me understand the breakdown between essential (non-discretionary) and non-essential (discretionary) spending?
        6.  **Credit card usage:**
            * What is my average credit card balance and utilization rate?
            * Are there any recurring credit card charges that I might be able to optimize or eliminate?
            * Am I incurring any late fees or interest charges? If so, how much on average?
        7.  **Budget adherence:** How well am I sticking to my stated budget (if the budget data is detailed enough for comparison)? Are there any significant variances?
        8.  **Recommendations:** Based on your analysis, what are 2-3 actionable steps I could take to improve my financial situation, whether it's increasing savings, reducing debt, or optimizing my spending?

        Please present your analysis in a clear and easy-to-understand format, possibly using bullet points or tables where appropriate. Focus on providing practical and helpful advice.
        """
        f"📄 Credit Card Transactions:\n{credit_csv}\n"
        f"💼 Income Transactions:\n{income_csv}\n"
        f"💸 Expense Transactions:\n{expense_csv}\n"
    )

    # print(prompt)
    # Ask Gemini
    chat = model.start_chat(history=[])
    response = chat.send_message(prompt)

    # Print Gemini’s response
    # print("\n🧠 Gemini Financial Analysis:\n")
    # print(response.text)
    # print("\n\n\n\n\n\n")
    # print(response)
    return response.text

# generate_financial_summary()

def text_to_html(text):
    prompt = (
        """
            You are given a text analyse it and convert it into HTML format. Also add some stunning css to make it look good.
            make sure the final output is Enclosed in html tags
            Its title should be NeoBudget Financial Analysis,
            Remember we need to send this text to gmail in the above format, so dont create multiple files, align with the gmail html format
        """
        f"{text}"
    )
    chat = model.start_chat(history=[])
    response = chat.send_message(prompt)
    if response.text.startswith("```html"):
        return response.text[7:-4]
    return response.text

if __name__ == "__main__":
    pass