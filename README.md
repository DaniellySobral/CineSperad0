# CineSperado 🎬
**"Sua próxima aventura cinematográfica começa com um clique."**

O **CineSperado** é uma plataforma web inteligente desenvolvida para solucionar o dilema do "o que assistir hoje?". Utilizando a poderosa API do TMDB, o sistema sorteia filmes baseados no humor e preferências do usuário, permitindo o gerenciamento completo de coleções pessoais de filmes.

---

## ✨ Funcionalidades em Destaque

- 🎲 **Sorteio Personalizado:** Filtros por Gênero, Ano, Avaliação, Duração e até Diretor específico.
- 📡 **Catálogo Global:** Milhares de títulos atualizados em tempo real via integração com **The Movie Database (TMDB)**.
- 📂 **Organização de Listas:** 
  - *Assistir Mais Tarde*: Bookmark para filmes futuros.
  - *Já Assistidos*: Seu histórico de cinema pessoal.
  - *Sem Interesse*: Esconda o que não combina com você.
- 👤 **Gestão de Perfil:** 
  - Login via **Google OAuth2** ou cadastro convencional.
  - Edição de perfil com **recorte de fotos dinâmico (Cropper.js)**.
  - Sistema de **Recuperação de Senha** via e-mail real (SMTP).
- 🌓 **Aesthetics Premium:** Interface responsiva com alternância entre **Modo Escuro e Claro**.
- 🛡️ **Segurança:** Autenticação via **JWT (JSON Web Tokens)** e criptografia `bcrypt`.

---

## 🛠️ Stack Tecnológica

### **Frontend** (Arquitetura MVC)
- **Core:** HTML5, JavaScript Moderno (Vanilla).
- **Styling:** CSS3 Avançado (Variáveis, Flexbox, Grid).
- **Libs:** [Cropper.js](https://github.com/fengyuanchen/cropperjs), [Boxicons](https://boxicons.com/).

### **Backend** (FastAPI)
- **Framework:** Python 3.9+ com [FastAPI](https://fastapi.tiangolo.com/).
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) com base em **SQLite**.
- **Segurança:** `python-jose` (JWT), `passlib` (bcrypt).
- **E-mail:** `smtplib` com suporte a SSL/TLS.

---

## 🚀 Guia de Instalação e Configuração

Siga os passos abaixo para rodar o CineSperado em sua máquina local.

### 1. Pré-requisitos
- **Python 3.9 ou superior** instalado.
- **VS Code** com a extensão **Live Server** instalada.
- Uma conta no [TMDB](https://www.themoviedb.org/settings/api) (opcional, já fornecemos uma chave padrão no código).

### 2. Configurando o Backend (Servidor)
Navegue até a pasta raiz do projeto e siga:

```bash
# 1. Acesse o diretório do backend
cd backend/

# 2. Crie e ative um ambiente virtual (Recomendado)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou: venv\Scripts\activate # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
# Crie um arquivo chamado .env na pasta /backend com o seguinte conteúdo:
```

**Conteúdo do arquivo `.env`:**
```env
# Configurações de E-mail (Exemplo Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app-gmail  # Use "Senha de App", não a senha comum!
EMAIL_FROM=seu-email@gmail.com

# Segurança
JWT_SECRET_KEY=cinesperado_secret_token_key_2026
```
> [!TIP]
> Para o Gmail, você deve ativar a "Verificação em Duas Etapas" e gerar uma **Senha de App** em sua Conta Google para que o sistema consiga enviar e-mails.

```bash
# 5. Inicie o servidor
python main.py
```
O backend estará disponível em: `http://localhost:8000`

### 3. Configurando o Frontend (Interface)
1. Abra a pasta `frontend/` no seu VS Code.
2. Localize o arquivo `frontend/views/Home.html`.
3. Clique com o botão direito sobre ele e selecione **"Open with Live Server"**.
4. O navegador abrirá automaticamente em `http://127.0.0.1:5500`.

---

## 📂 Organização do Código

O projeto segue uma estrutura modular para facilitar a manutenção:

```text
cinesperado/
├── backend/
│   ├── controllers/    # Lógica de processamento e interação com DB/API
│   ├── models/         # Definição de tabelas (SQLAlchemy) e Schemas (Pydantic)
│   ├── routes/         # Endpoints da API (Auth, Movies, Listas)
│   ├── database.py     # Setup da conexão SQLite
│   ├── main.py         # Arquivo de inicialização do FastAPI
│   └── .env            # Configurações sensíveis (SMTP/JWT)
├── frontend/
│   ├── assets/         # Recursos visuais (Imagens, Logos)
│   ├── controllers/    # Lógica JS modularizada por página
│   ├── shared/         # Scripts globais (Header, Temas, Alertas)
│   ├── styles/         # CSS modularizado
│   └── views/          # Templates HTML5
└── README.md
```

---

## 👨‍💻 Autores e Acadêmico
Este projeto foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)
- **Instituição:** Fatec Americana - Ministro Ralph Biasi
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS)

---
© 2026 **CineSperado**. Criado com ❤️ para amantes da sétima arte.