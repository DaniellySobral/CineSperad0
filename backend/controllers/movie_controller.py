"""
movie_controller.py
-------------------
Gerencia a integração com a API externa do TMDB para sorteio e detalhamento de filmes.

Funcionalidades cobertas:
    1. Tradução de gêneros em português para IDs numéricos do TMDB.
    2. Consulta parametrizada (Discover) baseada em filtros de usuário.
    3. Suporte a busca avançada por Diretor (Search Person + Discover).
    4. Sorteio aleatório multi-página para garantir variedade.
    5. Enriquecimento de metadados (Duração, Gêneros Textuais e Direção).
    6. Formatação de dados para consumo no frontend.

Dependências:
    - httpx (Requisições assíncronas)
    - TMDB API (The Movie Database)
"""

import httpx
import random
from fastapi import HTTPException, status

# ============================================================
# 1. CONFIGURAÇÕES E MAPEAMENTOS DO TMDB
# ============================================================

TMDB_API_KEY = "7aaca4c858f2c5753051e457b5253145"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

# Dicionário de tradução para facilitar o uso no frontend
GENRE_MAP = {
    "acao": 28, "aventura": 12, "comedia": 35, "crime": 80,
    "documentario": 99, "drama": 18, "familia": 10751,
    "fantasia": 14, "historia": 36, "terror": 27, "musical": 10402,
    "misterio": 9648, "romance": 10749, "ficcao": 878,
    "cinematv": 10770, "thriller": 53, "guerra": 10752, "faroeste": 37,
}

# ============================================================
# 2. LÓGICA PRINCIPAL DE SORTEIO
# ============================================================

async def get_random_movies(
    genre: str = "", language: str = "", year: str = "",
    max_duration: int = 300, min_rating: float = 0.0,
    quantity: int = 1, director: str = "",
) -> list[dict]:
    """
    Coordena a busca e o sorteio de filmes seguindo os filtros do usuário.
    """

    # Conversão de escala de avaliação (Porcentagem 0-100 para TMDB 0-10)
    vote_average_gte = round((min_rating / 100) * 10, 1)
    genre_id = GENRE_MAP.get(genre, "")

    # Parâmetros padrão para o endpoint Discover
    params = {
        "api_key": TMDB_API_KEY,
        "language": "pt-BR",
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "include_video": "false",
        "vote_count.gte": 50, # Garante filmes com relevância estatística
        "with_runtime.lte": max_duration if max_duration < 300 else "",
        "vote_average.gte": vote_average_gte if vote_average_gte > 0 else "",
    }

    if genre_id: params["with_genres"] = genre_id
    if language: params["with_original_language"] = language

    # ============================================================
    # 2.1 TRATAMENTO DE DATAS (ANO ÚNICO VS DÉCADAS)
    # ============================================================
    if year:
        if "-" in year: # Ex: "1990-1999"
            ano_inicio, ano_fim = year.split("-")
            params["primary_release_date.gte"] = f"{ano_inicio}-01-01"
            params["primary_release_date.lte"] = f"{ano_fim}-12-31"
        elif year == "antigos-1940":
            params["primary_release_date.lte"] = "1939-12-31"
        else: # Ano exato
            params["primary_release_year"] = year

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:

            # ============================================================
            # 2.2 RESOLUÇÃO DE DIRETOR (PESSOA PARA ID)
            # ============================================================
            if director:
                search_res = await client.get(f"{TMDB_BASE_URL}/search/person", params={"api_key": TMDB_API_KEY, "query": director})
                search_res.raise_for_status()
                search_data = search_res.json()
                
                if search_data.get("results"):
                    params["with_crew"] = search_data["results"][0]["id"]
                else:
                    raise HTTPException(status_code=404, detail=f"Diretor '{director}' não encontrado.")

            # Limpeza de parâmetros nulos
            params = {k: v for k, v in params.items() if v != "" and v is not None}

            # ============================================================
            # 2.3 SORTEIO MULTI-PÁGINA
            # ============================================================
            # Fazemos uma primeira chamada para descobrir o total de páginas disponíveis
            response = await client.get(f"{TMDB_BASE_URL}/discover/movie", params=params)
            response.raise_for_status()
            data = response.json()

            total_pages = min(data.get("total_pages", 1), 20) # Limite de busca para performance
            if data.get("total_results", 0) == 0:
                raise HTTPException(status_code=404, detail="Nenhum filme encontrado com estes filtros.")

            # Sorteia uma página aleatória para aumentar a diversidade
            pagina_aleatoria = random.randint(1, total_pages)
            if pagina_aleatoria > 1:
                params["page"] = pagina_aleatoria
                response = await client.get(f"{TMDB_BASE_URL}/discover/movie", params=params)
                response.raise_for_status()
                data = response.json()

            filmes_da_pagina = data.get("results", [])
            quantidade_real = min(quantity, len(filmes_da_pagina))
            filmes_sorteados = random.sample(filmes_da_pagina, quantidade_real)

            # ============================================================
            # 2.4 ENRIQUECIMENTO DE DETALHES (SUB-REQUISIÇÕES)
            # ============================================================
            resultado = []
            for filme in filmes_sorteados:
                movie_id = filme.get("id")
                
                # Busca metadados que não vêm no 'discover' (runtime e credits)
                detalhes_res = await client.get(
                    f"{TMDB_BASE_URL}/movie/{movie_id}",
                    params={"api_key": TMDB_API_KEY, "language": "pt-BR", "append_to_response": "credits"}
                )
                
                diretor = "Não informado"
                duracao = "N/A"
                generos = "N/A"
                
                if detalhes_res.status_code == 200:
                    det = detalhes_res.json()
                    
                    # Formatação de duração (Minutos para H:M)
                    runtime = det.get("runtime")
                    if runtime:
                        h, m = divmod(runtime, 60)
                        duracao = f"{h}h{m:02d}m" if h > 0 else f"{m}m"
                            
                    generos = ", ".join([g.get("name") for g in det.get("genres", [])])
                    diretores = [m.get("name") for m in det.get("credits", {}).get("crew", []) if m.get("job") == "Director"]
                    if diretores: diretor = ", ".join(diretores)

                resultado.append({
                    "id": movie_id,
                    "titulo": filme.get("title", "Sem Título"),
                    "sinopse": filme.get("overview") or "Sinopse não disponível.",
                    "nota": round(filme.get("vote_average", 0), 1),
                    "ano": filme.get("release_date", "")[:4] if filme.get("release_date") else "N/A",
                    "poster": f"{TMDB_IMAGE_BASE_URL}{filme.get('poster_path')}" if filme.get('poster_path') else None,
                    "diretor": diretor,
                    "duracao": duracao,
                    "generos": generos
                })

            return resultado

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Tempo de conexão esgotado (TMDB).")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Erro na API externa: {e.response.status_code}")

