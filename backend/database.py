"""
database.py
-----------
Configuração central de conectividade com o banco de dados.

Funcionalidades cobertas:
    1. Definição da URL de conexão (SQLite local).
    2. Criação do Engine de execução do SQLAlchemy.
    3. Configuração da SessionLocal para transações.
    4. Base declarativa para mapeamento de modelos.
    5. Helper de injeção de dependência (get_db).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ============================================================
# 1. CONFIGURAÇÕES DO SQLITE
# ============================================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./cinesperado.db"

# O engine é o coração do banco. 'check_same_thread' é obrigatório para SQLite em FastAPI.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Fábrica de sessões para interagir com o DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para os modelos herdarem
Base = declarative_base()

# ============================================================
# 2. HELPER DE SESSÃO (DEPENDÊNCIA)
# ============================================================

def get_db():
    """
    Cria uma nova sessão de banco de dados para cada requisição 
    e garante que ela seja fechada após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

