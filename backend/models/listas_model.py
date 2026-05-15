"""
listas_model.py
---------------
Define as estruturas para armazenamento e consulta de filmes salvos pelos usuários.

Funcionalidades cobertas:
    1. Modelo SQLAlchemy: Tabela 'movie_lists' que associa usuários a filmes do TMDB.
    2. Cache de Metadados: Armazena título, poster e sinopse localmente para performance.
    3. Tipagem de Listas: Suporte a categorias como 'assistir_mais_tarde' e 'ja_assistido'.
    4. Schemas Pydantic: Validação de criação e movimentação de filmes entre listas.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from pydantic import BaseModel
from database import Base
from typing import Optional

# ============================================================
# 1. MODELO DE BANCO DE DADOS (SQLAlchemy)
# ============================================================

class MovieListItem(Base):
    """Representa um filme salvo na coleção de um usuário."""
    __tablename__ = "movie_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, nullable=False) # ID original do TMDB
    list_type = Column(String, nullable=False, index=True) 

    # Cache de metadados para evitar requisições excessivas à API externa
    titulo = Column(String, nullable=False)
    poster = Column(String, nullable=True)
    sinopse = Column(String, nullable=True)
    nota = Column(Float, nullable=True)
    ano = Column(String, nullable=True)
    generos = Column(String, nullable=True)
    duracao = Column(String, nullable=True)
    diretor = Column(String, nullable=True)

# ============================================================
# 2. SCHEMAS DE VALIDAÇÃO (Pydantic)
# ============================================================

class MovieListCreate(BaseModel):
    """Dados recebidos ao salvar um novo filme."""
    id: int 
    list_type: str
    titulo: str
    poster: Optional[str] = None
    sinopse: Optional[str] = None
    nota: Optional[float] = None
    ano: Optional[str] = None
    generos: Optional[str] = None
    duracao: Optional[str] = None
    diretor: Optional[str] = None

class MovieListResponse(BaseModel):
    """Formato de saída para listagem de filmes salvos."""
    id: int 
    list_type: str
    titulo: str
    poster: Optional[str] = None
    sinopse: Optional[str] = None
    nota: Optional[float] = None
    ano: Optional[str] = None
    generos: Optional[str] = None
    duracao: Optional[str] = None
    diretor: Optional[str] = None

    class Config:
        from_attributes = True

class MoveMovieRequest(BaseModel):
    """Dados para migrar um filme de uma lista para outra."""
    movie_id: int
    new_list_type: str

