"""
movie_routes.py
---------------
Define os endpoints para sorteio e descoberta de filmes.

Funcionalidades cobertas:
    1. Endpoint de sorteio aleatório (/random).
    2. Filtragem complexa por gênero, idioma, ano, duração, nota e diretor.
    3. Integração assíncrona com o controlador de filmes (TMDB).

Dependências:
    - movie_controller.py (Lógica de comunicação com a API externa TMDB)
"""

from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional
from controllers import movie_controller

router = APIRouter(
    prefix="/movies",
    tags=["Sorteio de Filmes"]
)

# ============================================================
# 1. ENDPOINTS DE DESCOBERTA (TMDB PROXY)
# ============================================================

@router.get("/random")
async def get_random_movies(
    genre: Optional[str] = Query("", description="Gênero em português (ex: acao, drama)"),
    language: Optional[str] = Query("", description="Código do idioma (ex: en, pt)"),
    year: Optional[str] = Query("", description="Ano único (2022) ou faixa (1980-1989)"),
    max_duration: Optional[int] = Query(300, description="Duração máxima em minutos"),
    min_rating: Optional[float] = Query(0.0, description="Avaliação mínima (0 a 100)"),
    quantity: Optional[int] = Query(1, description="Quantidade de filmes a retornar (1 a 5)", ge=1, le=5),
    director: Optional[str] = Query("", description="Nome do diretor")
):
    """
    Sorteia filmes aleatórios consumindo a API do TMDB com base nos filtros do usuário.
    Esta rota funciona como um proxy para proteger a API KEY no servidor.
    """
    return await movie_controller.get_random_movies(
        genre=genre,
        language=language,
        year=year,
        max_duration=max_duration,
        min_rating=min_rating,
        quantity=quantity,
        director=director
    )

