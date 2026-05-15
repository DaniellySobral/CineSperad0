"""
listas_routes.py
----------------
Define os endpoints para gerenciamento das coleções de filmes dos usuários.

Funcionalidades cobertas:
    1. Consulta de listas personalizadas (com suporte a filtros).
    2. Adição de novos títulos às listas do usuário.
    3. Movimentação entre categorias (ex: 'Para Assistir' -> 'Visto').
    4. Remoção definitiva de títulos da coleção.

Dependências:
    - listas_controller.py (Lógica de persistência e movimentação)
    - auth_controller.py (Middleware get_current_user para segurança)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from controllers.auth_controller import get_current_user
from models.user_model import User
from models.listas_model import MovieListCreate, MovieListResponse, MoveMovieRequest
from controllers import listas_controller

router = APIRouter(
    prefix="/listas",
    tags=["Listas"]
)

# ============================================================
# 1. CONSULTA E ADIÇÃO
# ============================================================

@router.get("/", response_model=List[MovieListResponse])
def get_lists(list_type: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retorna os filmes salvos do usuário autenticado."""
    return listas_controller.get_user_lists(db, current_user.id, list_type)

@router.post("/", response_model=MovieListResponse)
def add_movie(movie: MovieListCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Salva um novo filme na lista do usuário."""
    return listas_controller.add_movie_to_list(db, current_user.id, movie)

# ============================================================
# 2. EDIÇÃO E REMOÇÃO
# ============================================================

@router.put("/", response_model=MovieListResponse)
def move_movie(request: MoveMovieRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Altera a categoria de um filme já salvo."""
    return listas_controller.move_movie(db, current_user.id, request.movie_id, request.new_list_type)

@router.delete("/{movie_id}")
def remove_movie(movie_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Remove um filme definitivamente da coleção do usuário."""
    return listas_controller.remove_movie_from_list(db, current_user.id, movie_id)

