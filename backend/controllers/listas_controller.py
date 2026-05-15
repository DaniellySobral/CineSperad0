"""
listas_controller.py
--------------------
Gerencia as operações de persistência e organização das listas personalizadas de filmes.

Funcionalidades cobertas:
    1. Adição de filmes às listas (Assistir Mais Tarde, Já Assistidos, Sem Interesse).
    2. Lógica de Movimentação: Se um filme já existe em uma lista, ele é migrado automaticamente.
    3. Recuperação de Listas: Busca filtrada por usuário e tipo de lista.
    4. Remoção Definitiva: Exclusão de registros de filmes salvos.
    5. Padronização de Dados: Helper para formatação de saída compatível com o frontend.

Dependências:
    - SQLAlchemy (Persistência em Banco de Dados)
    - Pydantic (Modelos de entrada MovieListCreate)
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.listas_model import MovieListItem, MovieListCreate

# ============================================================
# 1. ADIÇÃO E MOVIMENTAÇÃO DE FILMES
# ============================================================

def add_movie_to_list(db: Session, user_id: int, movie_data: MovieListCreate):
    """
    Registra um filme na lista do usuário ou o move caso já exista em outra categoria.
    """
    
    # Verifica se o filme já consta em qualquer lista deste usuário
    existing_movie = db.query(MovieListItem).filter(
        MovieListItem.user_id == user_id,
        MovieListItem.movie_id == movie_data.id
    ).first()

    if existing_movie:
        # Caso o filme já esteja na mesma lista, retorna erro para evitar duplicidade
        if existing_movie.list_type == movie_data.list_type:
            raise HTTPException(status_code=400, detail="Filme já salvo nesta lista.")
        else:
            # Lógica de Movimentação: Se o filme está na lista 'X' e o usuário salvou em 'Y'
            existing_movie.list_type = movie_data.list_type
            db.commit()
            db.refresh(existing_movie)
            return _format_response(existing_movie)

    # Criação de um novo registro caso o filme nunca tenha sido salvo
    new_item = MovieListItem(
        user_id=user_id,
        movie_id=movie_data.id,
        list_type=movie_data.list_type,
        titulo=movie_data.titulo,
        poster=movie_data.poster,
        sinopse=movie_data.sinopse,
        nota=movie_data.nota,
        ano=movie_data.ano,
        generos=movie_data.generos,
        duracao=movie_data.duracao,
        diretor=movie_data.diretor
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return _format_response(new_item)

# ============================================================
# 2. RECUPERAÇÃO DE DADOS (LISTAGEM)
# ============================================================

def get_user_lists(db: Session, user_id: int, list_type: str = None):
    """
    Retorna os filmes salvos pelo usuário, permitindo filtragem por categoria.
    """
    query = db.query(MovieListItem).filter(MovieListItem.user_id == user_id)
    
    if list_type:
        query = query.filter(MovieListItem.list_type == list_type)
    
    items = query.all()
    return [_format_response(item) for item in items]

# ============================================================
# 3. EXCLUSÃO E MOVIMENTAÇÃO MANUAL
# ============================================================

def remove_movie_from_list(db: Session, user_id: int, movie_id: int):
    """
    Remove permanentemente o filme da coleção do usuário.
    """
    item = db.query(MovieListItem).filter(
        MovieListItem.user_id == user_id,
        MovieListItem.movie_id == movie_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Filme não encontrado na lista.")
        
    db.delete(item)
    db.commit()
    return {"message": "Filme removido da lista com sucesso."}

def move_movie(db: Session, user_id: int, movie_id: int, new_list_type: str):
    """
    Altera a categoria de um filme (ex: de 'Assistir mais tarde' para 'Já assistido').
    """
    item = db.query(MovieListItem).filter(
        MovieListItem.user_id == user_id,
        MovieListItem.movie_id == movie_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
        
    item.list_type = new_list_type
    db.commit()
    db.refresh(item)
    return _format_response(item)

# ============================================================
# 4. AUXILIARES: FORMATAÇÃO DE SAÍDA
# ============================================================

def _format_response(item: MovieListItem):
    """
    Normaliza os dados do banco para o padrão esperado pelas controllers JS.
    """
    return {
        "id": item.movie_id,
        "list_type": item.list_type,
        "titulo": item.titulo,
        "poster": item.poster,
        "sinopse": item.sinopse,
        "nota": item.nota,
        "ano": item.ano,
        "generos": item.generos,
        "duracao": item.duracao,
        "diretor": item.diretor
    }

