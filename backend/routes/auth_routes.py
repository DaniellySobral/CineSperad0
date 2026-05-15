"""
auth_routes.py
--------------
Centraliza os endpoints de segurança, perfil e autenticação do CineEsperado.

Funcionalidades cobertas:
    1. Registro e Login convencional (JWT).
    2. Autenticação via Google SSO.
    3. Gestão de Perfil (Consulta e Atualização de dados).
    4. Ciclo de Vida de Recuperação de Senha (Forgot/Reset).

Dependências:
    - auth_controller.py (Lógica de autenticação e criptografia)
    - database.py (Injeção de dependência get_db)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models.user_model import UserCreate, UserResponse, Token, UserLogin, GoogleToken, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
from controllers import auth_controller

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

# ============================================================
# 1. ACESSO E REGISTRO
# ============================================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Cria uma nova conta de usuário no sistema."""
    return auth_controller.register_user(db, user)

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Autentica o usuário e retorna o Token de Acesso (JWT)."""
    user = auth_controller.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth_controller.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_controller.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username, 
        "picture_url": user.picture_url
    }

@router.post("/google", response_model=Token)
def login_google(google_token: GoogleToken, db: Session = Depends(get_db)):
    """Realiza o login ou cadastro automático via Google OAuth2."""
    user = auth_controller.google_login(db, google_token.token)
    if not user:
        raise HTTPException(status_code=401, detail="Token do Google inválido")
    
    access_token_expires = timedelta(minutes=auth_controller.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_controller.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username, 
        "picture_url": user.picture_url
    }

# ============================================================
# 2. GESTÃO DE PERFIL (USUÁRIO LOGADO)
# ============================================================

@router.get("/me", response_model=UserResponse)
def get_me(current_user: auth_controller.User = Depends(auth_controller.get_current_user)):
    """Recupera os detalhes do perfil do usuário autenticado."""
    is_google = current_user.password_hash == "google_sso_user_no_password"
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "picture_url": current_user.picture_url,
        "is_google_user": is_google
    }

@router.put("/me", response_model=UserResponse)
def update_me(user_update: UserUpdate, current_user: auth_controller.User = Depends(auth_controller.get_current_user), db: Session = Depends(get_db)):
    """Atualiza dados do perfil (Nome, E-mail ou Foto)."""
    is_google = current_user.password_hash == "google_sso_user_no_password"
    
    # Validação de unicidade do username
    if user_update.username is not None and user_update.username != current_user.username:
        db_username = db.query(auth_controller.User).filter(auth_controller.User.username == user_update.username).first()
        if db_username:
            raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")
        current_user.username = user_update.username
        
    # Validação de e-mail (bloqueada para usuários Google)
    if user_update.email is not None:
        if is_google:
            raise HTTPException(status_code=400, detail="Usuários Google não podem alterar o e-mail.")
        
        if user_update.email != current_user.email:
            validated_email = auth_controller.validate_email_address(user_update.email)
            db_email = db.query(auth_controller.User).filter(auth_controller.User.email == validated_email).first()
            if db_email:
                raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
            current_user.email = validated_email
        
    # Atualização de foto de perfil
    if "picture_url" in user_update.__fields_set__:
        current_user.picture_url = user_update.picture_url
        
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "picture_url": current_user.picture_url,
        "is_google_user": is_google
    }

# ============================================================
# 3. RECUPERAÇÃO DE ACESSO
# ============================================================

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Gera e envia um link de recuperação para o e-mail informado."""
    auth_controller.request_password_reset(db, request.email)
    return {"message": "Link de recuperação enviado com sucesso!"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Efetiva a troca de senha utilizando o token recebido por e-mail."""
    auth_controller.reset_password(db, request.token, request.new_password)
    return {"message": "Sua senha foi redefinida com sucesso!"}

