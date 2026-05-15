"""
auth_controller.py
------------------
Núcleo de segurança e gestão de identidade do CineEsperado.

Funcionalidades cobertas:
    1. Criptografia de Senhas: Uso de Bcrypt para hashing seguro.
    2. Gestão de Tokens: Geração e validação de JWT (JSON Web Tokens).
    3. Validação de E-mail: Checagem de formato, DNS (MX) e bloqueio de descartáveis.
    4. Google OAuth2: Integração com Single Sign-On para login simplificado.
    5. Recuperação de Senha: Envio de e-mails reais via SMTP com templates HTML premium.
    6. Middleware de Sessão: Identificação do usuário logado via injeção de dependência.

Dependências:
    - bcrypt, python-jose (Segurança)
    - email-validator, dnspython (Validação de e-mail)
    - google-auth (SSO Google)
    - smtplib (Envio de e-mails)
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
from models.user_model import User, UserCreate
import fastapi
from fastapi import HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
import dns.resolver
from disposable_email_domains import blocklist as DISPOSABLE_DOMAINS
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi.security import OAuth2PasswordBearer
from database import get_db
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Carrega chaves sensíveis do arquivo .env
load_dotenv()

# Configuração do esquema de segurança do FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ============================================================
# 1. CONFIGURAÇÕES DE SEGURANÇA E CRIPTOGRAFIA
# ============================================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "chave_secreta_provisoria_cinesperado")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def get_password_hash(password: str) -> str:
    """Transforma a senha em texto plano em um hash seguro e irreversível."""
    pwd_bytes = password.encode('utf-8')[:72] # Bcrypt limita a 72 bytes
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara uma senha digitada com o hash armazenado no banco."""
    if hashed_password == "google_sso_user_no_password":
        return False
    pwd_bytes = plain_password.encode('utf-8')[:72]
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except ValueError:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Gera um token JWT com data de expiração."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ============================================================
# 2. SISTEMA DE VALIDAÇÃO DE E-MAIL (MULTI-CAMADA)
# ============================================================

def validate_email_address(email: str) -> str:
    """
    Garante a integridade do e-mail em 3 níveis:
    1. Sintaxe: Verifica se o formato é válido.
    2. DNS (MX): Confirma se o domínio pode receber e-mails reais.
    3. Reputação: Bloqueia e-mails temporários/descartáveis.
    """
    # Camada 1: Sintaxe
    try:
        email_info = validate_email(email, check_deliverability=False)
        email = email_info.normalized
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail=f"E-mail inválido: {str(e)}")
    
    domain = email.split('@')[1].lower()

    # Camada 2: DNS MX (Servidores Reais)
    try:
        dns.resolver.resolve(domain, 'MX')
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers, dns.exception.Timeout):
        raise HTTPException(status_code=400, detail=f"O domínio '{domain}' não aceita e-mails.")

    # Camada 3: Bloqueio de Descartáveis
    if domain in DISPOSABLE_DOMAINS:
        raise HTTPException(status_code=400, detail="E-mails temporários não são permitidos.")

    return email

# ============================================================
# 3. LÓGICA DE CADASTRO E LOGIN
# ============================================================

def register_user(db: Session, user: UserCreate):
    """Cria um novo usuário com validações rigorosas de unicidade."""
    user.email = validate_email_address(user.email)

    # Bloqueio de duplicidade
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username em uso.")
    
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, username: str, password: str):
    """Valida credenciais para login convencional."""
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

def google_login(db: Session, token: str):
    """Processa a autenticação federada do Google OAuth2."""
    CLIENT_ID = "349123477958-vapfo4a4ghsfn9e6qnsknd76a9tfcloc.apps.googleusercontent.com"
    
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        email = idinfo['email']
        username = idinfo.get('name', email.split('@')[0])
        picture_url = idinfo.get('picture', None)
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Criação automática para novos usuários via Google
            user = User(
                username=username,
                email=email,
                password_hash="google_sso_user_no_password",
                picture_url=picture_url
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Sincronização de foto de perfil
            if picture_url and user.picture_url != picture_url:
                user.picture_url = picture_url
                db.commit()
            
        return user
    except ValueError:
        return None

# ============================================================
# 4. GESTÃO DE SESSÃO E RECUPERAÇÃO DE SENHA
# ============================================================

def get_current_user(token: str = fastapi.Depends(oauth2_scheme), db: Session = fastapi.Depends(get_db)):
    """Middleware que identifica o usuário autenticado via Token JWT."""
    fail_exception = HTTPException(status_code=401, detail="Sessão inválida", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username: raise fail_exception
    except JWTError:
        raise fail_exception
        
    user = db.query(User).filter(User.username == username).first()
    if not user: raise fail_exception
    return user

def send_reset_email(to_email: str, token: str):
    """Dispara o e-mail real de recuperação via SMTP."""
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", 587))
    smtp_user = os.getenv("EMAIL_USERNAME")
    smtp_pass = os.getenv("EMAIL_PASSWORD")
    email_from = os.getenv("EMAIL_FROM")
    
    if not smtp_user or not smtp_pass:
        return False

    reset_link = f"http://127.0.0.1:5500/frontend/views/RedefinirSenha.html?token={token}"
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Recuperação de Senha - CineSperado"
    message["From"] = f"CineSperado <{email_from}>"
    message["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 15px; border-top: 5px solid #58011C;">
          <h1 style="color: #58011C; text-align: center;">CineSperado</h1>
          <p>Olá,</p>
          <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para prosseguir:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #58011C; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
          </div>
          <p style="font-size: 12px; color: #777;">O link expira em 15 minutos.</p>
        </div>
      </body>
    </html>
    """
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(email_from, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Erro SMTP: {e}")
        return False

def request_password_reset(db: Session, email: str):
    """Coordena a solicitação de reset (Geração de Token + Envio)."""
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if not user: return True # Segurança por obscuridade
    
    reset_token = create_access_token(
        data={"sub": user.email, "type": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )
    
    email_sent = send_reset_email(email, reset_token)
    
    # Log para facilitar depuração local
    print(f"\n--- RESET TOKEN GENERATED ---\nEmail: {email}\nReal Email Sent: {email_sent}\n---------------------------\n")
    return True

def reset_password(db: Session, token: str, new_password: str):
    """Efetiva a mudança de senha após validação do token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email, t_type = payload.get("sub"), payload.get("type")
        if not email or t_type != "password_reset":
            raise HTTPException(status_code=400, detail="Token inválido.")
    except JWTError:
        raise HTTPException(status_code=400, detail="Link expirado ou inválido.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    user.password_hash = get_password_hash(new_password)
    db.commit()
    return True

