import smtplib
from email.message import EmailMessage
import ssl


email_password = "cqrx pepn rwoo rmmp"
email_sender = "kushidharreddychinthala@gmail.com"

def send_email(subject, body, receiver, is_html=False):
    email = EmailMessage()
    email["From"] = email_sender
    email["To"] = receiver
    email["Subject"] = subject

    if is_html:
        email.set_content("This is an HTML email. Please view it in an HTML-compatible client.")
        email.add_alternative(body, subtype="html")
    else:
        email.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.send_message(email)

if __name__ == "__main__":


    email_receiver = "kushidhar0873@gmail.com"

    subject = "Checkout my new video"
    body = """
    <html>
      <body>
        <h2>Hi there!</h2>
        <p>This is a <b>test HTML email</b> sent from Python.</p>
        <p>Click <a href="https://www.youtube.com/">here</a> to watch the video.</p>
      </body>
    </html>
    """
    
    send_email(subject, body, email_receiver, is_html=True)