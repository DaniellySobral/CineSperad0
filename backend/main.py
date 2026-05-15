"""
main.py
-------
Ponto de entrada central da API CineEsperado baseada em FastAPI.

Funcionalidades cobertas:
    1. Inicialização do Ciclo de Vida da Aplicação.
    2. Sincronização Automática do Banco de Dados (SQLite/SQLAlchemy).
    3. Configuração de Políticas de Acesso (CORS) para o Frontend.
    4. Agregação e Roteamento de Módulos (Auth, Movies, Lists).
    5. Endpoint de Verificação de Integridade (Health Check).

Comando para rodar:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth_routes, movie_routes, listas_routes

# ============================================================
# 1. INICIALIZAÇÃO DO BANCO DE DADOS
# ============================================================
# Cria as tabelas automaticamente se elas não existirem no SQLite local
Base.metadata.create_all(bind=engine)

# ============================================================
# 2. CONFIGURAÇÃO DA INSTÂNCIA FASTAPI
# ============================================================
app = FastAPI(
    title="CineEsperado API",
    description="Back-end escalável para sorteio e gerenciamento de filmes",
    version="1.0.0"
)

# ============================================================
# 3. POLÍTICA DE CORS (Cross-Origin Resource Sharing)
# ============================================================
# Essencial para permitir que o JavaScript do frontend (porta 5500) 
# acesse esta API (porta 8000) sem ser bloqueado pelo navegador.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitindo todas as origens para facilitar o desenvolvimento local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 4. REGISTRO DE ROTAS (ROUTERS)
# ============================================================
app.include_router(auth_routes.router)  # Login, Cadastro, Recuperação de Senha
app.include_router(movie_routes.router) # Sorteio de Filmes via TMDB
app.include_router(listas_routes.router) # Gerenciamento de Listas do Usuário

# ============================================================
# 5. ENDPOINT DE TESTE (ROOT)
# ============================================================
@app.get("/")
def read_root():
    """Retorna uma mensagem simples para validar se o servidor está ativo."""
    return {"status": "online", "project": "CineEsperado API"}

