# 🎬 CineEsperado

Aplicação web para sorteio e gerenciamento de filmes, desenvolvida como **Trabalho de Conclusão de Curso (TCC)** do Curso de Análise e Desenvolvimento de Sistemas — FATEC.

---

## 📁 Estrutura do Projeto (MVC)

```
cinesperado/
│
├── index.html                    ← Ponto de entrada (redireciona para Home)
│
├── backend/                      ← Reservado para o back-end futuro
│   ├── controllers/              ← Lógica de negócio (rotas, autenticação)
│   ├── models/                   ← Modelos de dados (Usuário, Filme, Lista)
│   └── routes/                   ← Definição de rotas da API REST
│
└── frontend/                     ← Todo o front-end
    ├── views/                    ← 📄 HTML — páginas da aplicação (View)
    │   ├── Home.html
    │   ├── Login.html
    │   ├── SorteioSlogin.html
    │   ├── Configuracoes.html
    │   ├── SobreNos.html
    │   ├── AssistirMaisTarde.html
    │   ├── JaAssistidos.html
    │   ├── SemInteresse.html
    │   ├── RecuperarSenha.html
    │   └── TrocarSenha.html
    │
    ├── controllers/              ← 🧠 JS — controlam interações (Controller)
    │   ├── SorteioController.js
    │   ├── LoginController.js
    │   ├── ConfiguracoesController.js
    │   └── RecuperarSenhaController.js
    │
    ├── models/                   ← 📦 Modelos de dados do front-end (Model)
    │
    ├── shared/                   ← ♻️ Scripts reutilizados em todas as páginas
    │   ├── theme.js              ← Controle de tema claro/escuro
    │   └── script.js             ← Carrossel da página Home
    │
    ├── styles/                   ← 🎨 CSS — estilização
    │   ├── utilitario.css        ← Estilos globais (header, footer, nav)
    │   ├── home.css
    │   ├── login.css
    │   ├── sorteio.css
    │   ├── configuracoes.css
    │   ├── sobreNos.css
    │   ├── listas.css
    │   └── recuperarSenha.css
    │
    └── assets/                   ← 🖼️ Imagens e ícones
        ├── images/               ← Imagens gerais (logo, banners, tutorial)
        ├── icons/                ← Ícones da interface
        ├── backgrounds/          ← Planos de fundo do banner rotativo
        ├── films/                ← Imagens dos filmes sorteados
        └── lists/                ← Capas de filmes das listas
```

---

## 🧩 Padrão MVC aplicado

| Camada | Onde | Responsabilidade |
|--------|------|-----------------|
| **Model** | `frontend/models/` e `backend/models/` | Estrutura e manipulação de dados |
| **View** | `frontend/views/` | Apresentação visual (HTML) |
| **Controller** | `frontend/controllers/` e `backend/controllers/` | Lógica de interação e negócio |

---

## 🚀 Funcionalidades

- 🎲 **Sorteio de filmes** com filtros por gênero, idioma, duração, ano e avaliação
- 📋 **Listas pessoais** — Assistir mais tarde, Já assisti, Sem interesse
- 🔐 **Autenticação** — Login e cadastro de usuários
- 🌙 **Tema claro/escuro** persistido via localStorage
- ⚙️ **Configurações** de perfil com troca de foto e edição de dados

---

## 👩‍💻 Equipe

Trabalho de Engenharia de Software — FATEC, Curso de Análise e Desenvolvimento de Sistemas.