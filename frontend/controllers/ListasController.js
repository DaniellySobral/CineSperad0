/**
 * ListasController.js
 * -------------------
 * Gerencia a exibição e manipulação dos filmes salvos nas listas pessoais do usuário.
 * 
 * Funcionalidades cobertas:
 *   1. Identificação automática da lista (Assistir mais tarde, Já assistidos, Sem interesse).
 *   2. Migração de dados legados do localStorage para o novo banco de dados via API.
 *   3. Carregamento assíncrono dos filmes salvos por usuário.
 *   4. Visualização expandida de detalhes ao clicar em um pôster.
 *   5. Movimentação de filmes entre listas ou remoção definitiva.
 *
 * Dependências:
 *   - backend/controllers/listas_controller.py (Endpoints da API)
 *   - frontend/shared/header.js (Lógica de autenticação e modais)
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // ============================================================
    // 1. INICIALIZAÇÃO E IDENTIFICAÇÃO DA LISTA
    // ============================================================
    
    const container = document.querySelector('.container-listas');
    if (!container) return;

    // Determina qual lista exibir com base no nome do arquivo HTML aberto
    const path = window.location.pathname;
    let storageKey = 'cinesperado_assistir_mais_tarde'; // Chave de identificação padrão
    let listTitle = 'Assistir mais tarde';

    if (path.includes('JaAssistidos')) {
        storageKey = 'cinesperado_ja_assistidos';
        listTitle = 'Já assistidos';
    } else if (path.includes('SemInteresse')) {
        storageKey = 'cinesperado_sem_interesse';
        listTitle = 'Sem interesse';
    }

    // Verifica se o usuário está logado antes de prosseguir
    const token = localStorage.getItem('cinesperado_token');
    if (!token) {
        // O alert aqui aciona o modal de login customizado (definido em header.js)
        alert('Você precisa estar logado para acessar suas listas.');
        
        // Redireciona para a Home após o aviso
        setTimeout(() => {
            window.location.href = '/frontend/views/Home.html';
        }, 100);
        return;
    }

    // ============================================================
    // 2. SINCRONIZAÇÃO E CARREGAMENTO DE DADOS (MIGRAÇÃO API)
    // ============================================================
    
    let savedMovies = [];
    try {
        /**
         * MODO DE COMPATIBILIDADE:
         * Verifica se existem filmes no localStorage antigo (versões anteriores do projeto).
         * Se encontrar, envia cada filme para o banco de dados via API e limpa o armazenamento local.
         */
        let oldSavedLocal = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Caso especial para a chave antiga unificada
        if (storageKey === 'cinesperado_assistir_mais_tarde') {
            let veryOldLocal = JSON.parse(localStorage.getItem('cinesperado_saved_movies')) || [];
            oldSavedLocal = [...oldSavedLocal, ...veryOldLocal];
            localStorage.removeItem('cinesperado_saved_movies');
        }

        // Realiza o upload dos dados locais para o servidor se necessário
        if (oldSavedLocal.length > 0) {
            const uniqueMovies = Array.from(new Map(oldSavedLocal.map(m => [m.id, m])).values());
            for (let filme of uniqueMovies) {
                await fetch('http://localhost:8000/listas/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id: filme.id, list_type: storageKey, titulo: filme.titulo,
                        poster: filme.poster, sinopse: filme.sinopse, nota: filme.nota,
                        ano: filme.ano, generos: filme.generos, duracao: filme.duracao, diretor: filme.diretor
                    })
                }).catch(e => console.error("Erro na migração", e));
            }
            localStorage.removeItem(storageKey);
        }

        // Busca a lista oficial atualizada do banco de dados
        const response = await fetch(`http://localhost:8000/listas/?list_type=${storageKey}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            savedMovies = await response.json();
        } else {
            console.error("Erro ao carregar listas da API");
        }
    } catch (e) {
        console.error("Erro na comunicação com a API", e);
    }

    // ============================================================
    // 3. RENDERIZAÇÃO DA INTERFACE (GRID DE FILMES)
    // ============================================================
    
    container.innerHTML = '';

    // Cabeçalho dinâmico com o título da lista e quantidade de itens
    const countTitle = document.createElement('h3');
    countTitle.style.textAlign = 'center';
    countTitle.style.marginTop = '20px';
    countTitle.style.marginBottom = '20px';
    countTitle.style.fontSize = '18px';
    countTitle.style.color = 'var(--text-primary)';
    countTitle.innerHTML = `Filmes em "${listTitle}": ${savedMovies.length}`;
    container.appendChild(countTitle);

    // Caso a lista esteja vazia
    if (savedMovies.length === 0) {
        container.innerHTML += '<p style="text-align:center; padding: 50px; color: #666; font-size: 16px;">Sua lista está vazia.</p>';
        return;
    }

    // Cria a malha (grid) de pôsteres
    const grid = document.createElement('div');
    grid.className = 'movie-grid';

    savedMovies.forEach(filme => {
        const card = document.createElement('div');
        card.className = 'lista-movie-card';
        
        card.innerHTML = `
            <img src="${filme.poster || '/frontend/assets/images/placeholder.png'}" alt="Pôster de ${filme.titulo}" style="cursor: pointer;">
        `;
        
        // Ao clicar no pôster, abre os detalhes do filme no topo da página
        card.addEventListener('click', () => {
            expandMovie(filme, storageKey);
        });

        grid.appendChild(card);
    });

    container.appendChild(grid);
});

/**
 * ============================================================
 * 4. FUNÇÃO DE EXPANSÃO (DETALHES DO FILME)
 * ============================================================
 * Cria uma visualização detalhada similar à do sorteio, permitindo
 * gerenciar o filme selecionado.
 */
function expandMovie(filme, currentListKey) {
    // Esconde elementos do topo para focar nos detalhes
    const topRow = document.querySelector('.div-linha-superior');
    if (topRow) topRow.style.display = 'none';

    let expandedView = document.getElementById('movie-expanded-view');
    if (!expandedView) {
        expandedView = document.createElement('div');
        expandedView.id = 'movie-expanded-view';
        expandedView.className = 'slideshow-container'; // Reaproveita estilos do sorteio
        expandedView.style.display = 'block';
        expandedView.style.width = '100%';
        expandedView.style.marginBottom = '0';
        expandedView.style.marginTop = '0';

        // Posiciona a visão expandida antes do botão de navegação
        const btnListas = document.querySelector('.btn-listas');
        if (btnListas && btnListas.parentNode) {
            btnListas.parentNode.insertBefore(expandedView, btnListas);
        }
    }

    // Cálculo da porcentagem da nota para a barra de progresso
    const notaPerc = filme.nota ? Math.round((filme.nota / 10) * 100) : 0;
    const generosText = filme.generos || "Gênero não especificado";
    const duracaoText = filme.duracao || "Duração não especificada";
    const diretorText = filme.diretor || "Diretor não especificado";

    // Injeção do HTML do card expandido
    expandedView.innerHTML = `
        <div class="slide" style="display: block; background-image: ${filme.poster ? `url('${filme.poster}')` : ''}">
            <div class="movie-slide-content">
                <div class="movie-poster-container">
                    <img src="${filme.poster || '/frontend/assets/images/placeholder.png'}" alt="Pôster">
                </div>
                <div class="movie-details-container">
                    <div class="movie-header">
                        <h2 class="movie-title">${filme.titulo}</h2>
                        <span class="movie-age-rating">18</span>
                    </div>
                    <div class="movie-meta">
                        ${generosText} • ${filme.ano || 'N/A'} • ${duracaoText}
                    </div>
                    <div class="movie-rating-bar">
                        <div class="movie-rating-fill-container">
                            <div class="movie-rating-fill" style="width: ${notaPerc}%"></div>
                        </div>
                        <span class="movie-rating-text">${notaPerc}%</span>
                    </div>
                    <div class="movie-director">
                        <strong>Diretor</strong>
                        <span>${diretorText}</span>
                    </div>
                    <div class="movie-synopsis">
                        <strong>Sinopse</strong>
                        <p>${filme.sinopse}</p>
                    </div>
                    <div class="movie-actions">
                        <!-- Botões de ação injetados dinamicamente abaixo -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // ============================================================
    // 5. LÓGICA DOS BOTÕES DE AÇÃO (MOVER / REMOVER)
    // ============================================================
    
    const actionsDiv = expandedView.querySelector('.movie-actions');

    /**
     * Cria um botão de ação com ícone, texto e lógica de clique.
     */
    const createActionBtn = (iconClass, text, isCurrentList, onClick) => {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'action-btn-container';

        const btn = document.createElement('button');
        btn.className = 'action-btn';
        
        // Destaca visualmente se o filme já pertence àquela lista
        if (isCurrentList) {
            btn.style.backgroundColor = '#d90429'; 
            btn.style.color = '#fff';
        }
        
        btn.innerHTML = `<i class='${iconClass}'></i>`;
        btn.addEventListener('click', onClick);
        
        const label = document.createElement('span');
        label.textContent = text;

        btnContainer.appendChild(btn);
        btnContainer.appendChild(label);
        return btnContainer;
    };

    /**
     * Comunica com o backend para mover o filme de lista ou removê-lo.
     */
    const moveToTargetList = async (targetKey) => {
        const token = localStorage.getItem('cinesperado_token');
        if (!token) return;

        try {
            // Se clicar no botão da lista em que o filme já está -> REMOVE do banco
            if (currentListKey === targetKey) {
                await fetch(`http://localhost:8000/listas/${filme.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Se clicar em um botão de outra lista -> MOVE o filme
                await fetch(`http://localhost:8000/listas/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ movie_id: filme.id, new_list_type: targetKey })
                });
            }
            location.reload(); // Recarrega para atualizar a visão do grid
        } catch (e) {
            console.error("Erro ao atualizar lista", e);
            alert("Erro de conexão ao atualizar a lista.");
        }
    };

    // Inicialização dos botões
    const btnAssistir = createActionBtn('bx bxs-bookmark', 'Assistir mais tarde', currentListKey === 'cinesperado_assistir_mais_tarde', () => {
        moveToTargetList('cinesperado_assistir_mais_tarde');
    });

    const btnJaAssisti = createActionBtn('bx bx-check', 'Já Assisti', currentListKey === 'cinesperado_ja_assistidos', () => {
        moveToTargetList('cinesperado_ja_assistidos');
    });

    const btnNaoInteresse = createActionBtn('bx bx-x', 'Não tenho interesse', currentListKey === 'cinesperado_sem_interesse', () => {
        moveToTargetList('cinesperado_sem_interesse');
    });

    actionsDiv.appendChild(btnAssistir);
    actionsDiv.appendChild(btnJaAssisti);
    actionsDiv.appendChild(btnNaoInteresse);

    // Efeito de rolagem suave para os detalhes
    expandedView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
