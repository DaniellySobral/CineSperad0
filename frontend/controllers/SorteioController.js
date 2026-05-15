/**
 * SorteioController.js
 * ---------------------
 * Gerencia a lógica de filtragem, sorteio e exibição de filmes aleatórios.
 * 
 * Funcionalidades cobertas:
 *   1. Manipulação de Sliders (Duração e Avaliação) com atualização de labels.
 *   2. Filtro avançado por Diretor (Alternância entre select e input manual).
 *   3. Integração com a API do backend para sorteio de filmes via TMDB.
 *   4. Geração dinâmica de Slideshow com os resultados do sorteio.
 *   5. Lógica de persistência em listas (Salvar filmes sorteados no banco de dados).
 *   6. Paginação dinâmica para o seletor de Anos de Lançamento.
 *
 * Dependências:
 *   - backend/routes/movie_routes.py (Endpoint de sorteio)
 *   - backend/routes/listas_routes.py (Endpoint de salvamento)
 *   - frontend/shared/header.js (Para modais de aviso)
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. GERENCIAMENTO DOS FILTROS (SLIDERS E SELETORES)
    // ============================================================

    const durationSlider = document.getElementById('movie-filter-duration');
    const durationValue = document.getElementById('movie-filter-duration-value');
    const ratingSlider = document.getElementById('movie-filter-rating');
    const ratingValue = document.getElementById('movie-filter-rating-value');

    if (!durationSlider || !durationValue || !ratingSlider || !ratingValue) {
        console.error('Elementos dos sliders não encontrados.');
        return;
    }

    /**
     * Atualiza o label de duração em tempo real.
     */
    function updateDurationValue() {
        durationValue.textContent = durationSlider.value + ' min';
    }

    /**
     * Atualiza o label de avaliação (porcentagem) em tempo real.
     */
    function updateRatingValue() {
        ratingValue.textContent = ratingSlider.value + '%';
    }

    durationSlider.addEventListener('input', updateDurationValue);
    ratingSlider.addEventListener('input', updateRatingValue);
    updateDurationValue();
    updateRatingValue();

    // ============================================================
    // 2. FILTRO DE DIRETOR (LÓGICA HÍBRIDA)
    // ============================================================

    const directorModeSelect = document.getElementById('movie-filter-director-mode');
    const directorNameInput  = document.getElementById('movie-filter-director-name');

    if (directorModeSelect && directorNameInput) {
        /**
         * Permite ao usuário escolher entre selecionar 'Todos' 
         * ou digitar o nome de um diretor específico.
         */
        directorModeSelect.addEventListener('change', function () {
            if (this.value === 'digitar') {
                directorModeSelect.style.display = 'none';
                directorNameInput.style.display = 'block';
                directorNameInput.focus();
            }
        });

        // Retorna ao seletor original se o campo de texto for deixado vazio
        directorNameInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                directorNameInput.style.display = 'none';
                directorModeSelect.style.display = 'block';
                directorModeSelect.value = 'todos';
            }
        });
    }

    // ============================================================
    // 3. PROCESSAMENTO DO SORTEIO (CHAMADA API)
    // ============================================================

    const API_BASE_URL = 'http://localhost:8000';

    /**
     * Coleta todos os filtros da tela, envia para o backend e processa o resultado.
     */
    async function dispararSorteio() {
        const sortearButton = document.getElementById('movie-filter-button');
        const originalButtonText = sortearButton.textContent;
        
        // Estado de carregamento do botão
        sortearButton.textContent = 'Sorteando...';
        sortearButton.disabled = true;

        // Captura de valores dos filtros
        const genre = document.getElementById('movie-filter-genre').value;
        const language = document.getElementById('movie-filter-director').value; 
        const duration = durationSlider.value;
        const rating = ratingSlider.value;
        const year = document.getElementById('movie-filter-year').value;
        const quantity = document.getElementById('movie-filter-quantity').value;

        try {
            const directorMode = document.getElementById('movie-filter-director-mode')?.value || 'todos';
            const directorName = directorMode === 'digitar' ? (directorNameInput?.value.trim() || '') : '';

            // Construção dinâmica da URL com parâmetros de busca
            const queryParams = new URLSearchParams({
                genre: genre,
                language: language,
                year: year === 'carregar-mais' ? '' : year,
                max_duration: duration,
                min_rating: rating,
                quantity: quantity
            });

            if (directorName) queryParams.set('director', directorName);

            // Requisição assíncrona para o endpoint de sorteio
            const response = await fetch(`${API_BASE_URL}/movies/random?${queryParams}`);
            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || 'Erro ao sortear filmes.');
                return;
            }

            // Exibe a seção de resultados e popula os slides
            const resultsSection = document.querySelector('.ssl-div-texto2');
            if (resultsSection) {
                resultsSection.style.display = 'block';
                const tituloH1 = resultsSection.querySelector('.ssl-titulo');
                if (tituloH1) tituloH1.textContent = `Filmes Sorteados: ${data.length}`;

                criarSlidesDinamicamente(data);
                initSlideshow(); // Inicializa controles de navegação
                
                // Scroll suave para os resultados
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            console.error('Erro no sorteio:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            sortearButton.textContent = originalButtonText;
            sortearButton.disabled = false;
        }
    }

    // ============================================================
    // 4. GERAÇÃO DINÂMICA DE SLIDES (INTERFACE)
    // ============================================================

    /**
     * Constrói o HTML de cada slide do filme sorteado.
     * @param {Array} filmes - Lista de objetos de filme da API.
     */
    function criarSlidesDinamicamente(filmes) {
        const slideshowContainer = document.querySelector('.slideshow-container');
        
        // Limpeza de sorteios anteriores
        const oldSlides = slideshowContainer.querySelectorAll('.slide');
        oldSlides.forEach(s => s.remove());

        if (!filmes || filmes.length === 0) return;

        filmes.forEach((filme, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (filme.poster) slide.style.backgroundImage = `url('${filme.poster}')`;

            // Estrutura de informações do card (Pôster + Detalhes)
            const notaPerc = filme.nota ? Math.round((filme.nota / 10) * 100) : 0;
            
            slide.innerHTML = `
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
                            ${filme.generos || 'N/A'} • ${filme.ano || 'N/A'} • ${filme.duracao || 'N/A'}
                        </div>
                        <div class="movie-rating-bar">
                            <div class="movie-rating-fill-container">
                                <div class="movie-rating-fill" style="width: ${notaPerc}%"></div>
                            </div>
                            <span class="movie-rating-text">${notaPerc}%</span>
                        </div>
                        <div class="movie-director">
                            <strong>Diretor</strong>
                            <span>${filme.diretor || "Não informado"}</span>
                        </div>
                        <div class="movie-synopsis">
                            <strong>Sinopse</strong>
                            <p>${filme.sinopse}</p>
                        </div>
                        <div class="movie-actions"></div>
                    </div>
                </div>
            `;

            // ============================================================
            // 4.1 BOTÕES DE AÇÃO (SALVAR EM LISTAS)
            // ============================================================
            
            const actionsDiv = slide.querySelector('.movie-actions');
            const token = localStorage.getItem('cinesperado_token');

            /**
             * Cria um botão de ação com verificação de login integrada.
             */
            const createActionBtn = (iconClass, text, onClick) => {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'action-btn-container';
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.innerHTML = `<i class='${iconClass}'></i>`;
                btn.addEventListener('click', (e) => {
                    if (!token) {
                        alert(`Você precisa estar logado para salvar filmes.`);
                        return;
                    }
                    onClick();
                });
                btnContainer.appendChild(btn);
                btnContainer.appendChild(document.createElement('span')).textContent = text;
                return btnContainer;
            };

            // Funções de salvamento para cada tipo de lista
            const btnAssistir = createActionBtn('bx bxs-bookmark', 'Assistir mais tarde', () => 
                salvarNoBanco(filme, 'cinesperado_assistir_mais_tarde', 'Assistir Mais Tarde', '/frontend/views/AssistirMaisTarde.html'));
            
            const btnJaAssisti = createActionBtn('bx bx-check', 'Já Assisti', () => 
                salvarNoBanco(filme, 'cinesperado_ja_assistidos', 'Já Assistidos', '/frontend/views/JaAssistidos.html'));
            
            const btnNaoInteresse = createActionBtn('bx bx-x', 'Não tenho interesse', () => 
                salvarNoBanco(filme, 'cinesperado_sem_interesse', 'Sem Interesse', '/frontend/views/SemInteresse.html'));

            actionsDiv.append(btnAssistir, btnJaAssisti, btnNaoInteresse);
            slideshowContainer.insertBefore(slide, slideshowContainer.querySelector('.arrow'));
        });

        // Atualiza a instrução visual dependendo do estado de login
        const subtitle = document.querySelector('.ssl-div-texto2 .ssl-subtitulo');
        if (subtitle) subtitle.textContent = token ? "Clique nos botões para salvar o filme em suas listas." : "(Faça login para salvar filmes)";
        
        atualizarContador(1, filmes.length);
    }

    /**
     * Comunicação com a API para persistência do filme.
     */
    async function salvarNoBanco(filme, listType, listName, urlListas) {
        const token = localStorage.getItem('cinesperado_token');
        try {
            const response = await fetch(`${API_BASE_URL}/listas/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...filme, list_type: listType })
            });
            
            if (response.ok) {
                if (window.showModal) {
                    window.showModal("Sucesso!", `"${filme.titulo}" adicionado à lista ${listName}.`, [
                        {text: "Ver Minhas Listas", url: urlListas}, {text: "Continuar"}
                    ]);
                } else {
                    alert(`Filme salvo em ${listName}!`);
                }
            } else {
                const err = await response.json();
                alert(err.detail || "Erro ao salvar.");
            }
        } catch (e) { alert("Erro de conexão."); }
    }

    // ============================================================
    // 5. CONTROLES DO SLIDESHOW (NAVEGAÇÃO)
    // ============================================================

    let slideIndex = 1;

    function atualizarContador(atual, total) {
        const contador = document.querySelector('.slide-counter');
        if (contador) contador.textContent = `${atual.toString().padStart(2, '0')} de ${total.toString().padStart(2, '0')}`;
    }

    function initSlideshow() {
        showSlide(slideIndex = 1);
        const prev = document.querySelector('.arrow.prev');
        const next = document.querySelector('.arrow.next');
        
        if (prev && next) {
            prev.onclick = () => showSlide(--slideIndex);
            next.onclick = () => showSlide(++slideIndex);
        }
    }

    function showSlide(n) {
        const slides = document.getElementsByClassName('slide');
        if (!slides.length) return;
        if (n > slides.length) slideIndex = 1;
        if (n < 1) slideIndex = slides.length;
        for (let i = 0; i < slides.length; i++) slides[i].style.display = 'none';
        slides[slideIndex - 1].style.display = 'block';
        atualizarContador(slideIndex, slides.length);
    }

    const sortearBtn = document.getElementById('movie-filter-button');
    if (sortearBtn) sortearBtn.addEventListener('click', dispararSorteio);

    // Inicialização da paginação de anos
    gerarOpcoesAnosComPaginacao();
});

// ============================================================
// 6. AUXILIARES: PAGINAÇÃO DE ANOS NO SELECT
// ============================================================

function gerarOpcoesAnosComPaginacao() {
    const selectAno = document.getElementById('movie-filter-year');
    if (!selectAno) return;
    const anoAtual = new Date().getFullYear();
    const anosPorPagina = 20;

    while (selectAno.children.length > 1) selectAno.removeChild(selectAno.lastChild);

    for (let i = 0; i < anosPorPagina && (anoAtual - i) >= 1900; i++) {
        const option = document.createElement('option');
        option.value = option.textContent = anoAtual - i;
        selectAno.appendChild(option);
    }

    const optionCarregarMais = document.createElement('option');
    optionCarregarMais.value = 'carregar-mais';
    optionCarregarMais.textContent = 'Carregar mais anos...';
    selectAno.appendChild(optionCarregarMais);

    selectAno.addEventListener('change', function() {
        if (this.value === 'carregar-mais') {
            const anosJaCarregados = selectAno.children.length - 1;
            const ultimoAno = parseInt(selectAno.options[anosJaCarregados - 1].value);
            selectAno.removeChild(selectAno.querySelector('option[value="carregar-mais"]'));
            
            for (let i = 1; i <= 30 && (ultimoAno - i) >= 1900; i++) {
                const opt = document.createElement('option');
                opt.value = opt.textContent = ultimoAno - i;
                selectAno.appendChild(opt);
            }
            selectAno.appendChild(optionCarregarMais);
        }
    });
}