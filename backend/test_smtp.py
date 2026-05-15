import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def test_email():
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", 587))
    smtp_user = os.getenv("EMAIL_USERNAME")
    smtp_pass = os.getenv("EMAIL_PASSWORD")
    email_from = os.getenv("EMAIL_FROM")
    
    print(f"Testando envio de e-mail para: {email_from}")
    print(f"Host: {smtp_host}, Port: {smtp_port}")
    print(f"User: {smtp_user}")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Teste de Conexão - CineSperado"
    message["From"] = f"CineSperado <{email_from}>"
    message["To"] = email_from

    html = "<h1>Teste de Conexão funcionando!</h1>"
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(email_from, email_from, message.as_string())
        print("SUCESSO: E-mail de teste enviado!")
    except Exception as e:
        print(f"ERRO: {e}")

if __name__ == "__main__":
    test_email()
