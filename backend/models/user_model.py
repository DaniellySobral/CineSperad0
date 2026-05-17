"""
user_model.py
-------------
Define as estruturas de dados para usuários do sistema.

Funcionalidades cobertas:
    1. Modelo SQLAlchemy: Mapeamento da tabela 'users' no SQLite.
    2. Schemas Pydantic: Validação de entrada e saída da API (DPO/DTO).
    3. Suporte a Usuários Google: Campo picture_url e flags de autenticação.
    4. Fluxos de Senha: Schemas para recuperação e redefinição de credenciais.
"""

from typing import Optional
from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, EmailStr
from database import Base

# ============================================================
# 1. MODELO DE BANCO DE DADOS (SQLAlchemy)
# ============================================================

class User(Base):
    """Representação da tabela de usuários no banco de dados."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    # URL da imagem de perfil (Google ou Upload)
    picture_url = Column(String, nullable=True)

# ============================================================
# 2. SCHEMAS DE VALIDAÇÃO (Pydantic)
# ============================================================

class UserCreate(BaseModel):
    """Dados necessários para criar um novo usuário."""
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Dados para autenticação convencional."""
    username: str
    password: str

class UserResponse(BaseModel):
    """Formato de retorno seguro (sem senha) para o frontend."""
    id: int
    username: str
    email: str
    picture_url: Optional[str] = None
    is_google_user: bool = False

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    """Campos permitidos para edição de perfil."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    picture_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    """Dados para troca de senha autenticada (usuário logado)."""
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    """Solicitação de link de recuperação."""
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    """Dados para definir uma nova senha via token JWT."""
    token: str
    new_password: str

class Token(BaseModel):
    """Resposta de autenticação bem-sucedida (JWT)."""
    access_token: str
    token_type: str
    username: Optional[str] = None
    picture_url: Optional[str] = None

class GoogleToken(BaseModel):
    """Token de ID vindo do Google OAuth2."""
    token: str

