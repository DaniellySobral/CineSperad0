/**
 * SorteioController.js
 * ---------------------
 * Responsável por toda a lógica interativa da página de Sorteio de Filmes.
 *
 * Funcionalidades cobertas:
 *   1. Atualização dos valores dos sliders (Duração e Avaliação) em tempo real
 *   2. Exibição da seção de resultados ao clicar em "Sortear"
 *   3. Criação dinâmica dos slides com filmes sorteados (baseada na quantidade selecionada)
 *   4. Controle do slideshow (navegação entre slides e contador)
 *   5. Geração dinâmica das opções de ano no select (com paginação)
 *
 * Dependências:
 *   - frontend/views/SorteioSlogin.html → estrutura HTML dos elementos manipulados
 *   - frontend/styles/sorteio.css → estilos visuais dos elementos
 *   - frontend/assets/films/ → imagens dos filmes sorteados (filme1.jpg ... filme5.jpg)
 */

// Aguarda o carregamento completo do DOM antes de inicializar os eventos
document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. SLIDERS — DURAÇÃO E AVALIAÇÃO
    // ============================================================

    // Referências ao slider de duração e ao elemento que exibe seu valor
    const durationSlider = document.getElementById('movie-filter-duration');
    const durationValue = document.getElementById('movie-filter-duration-value');

    // Referências ao slider de avaliação e ao elemento que exibe seu valor
    const ratingSlider = document.getElementById('movie-filter-rating');
    const ratingValue = document.getElementById('movie-filter-rating-value');

    // Verifica se todos os elementos necessários foram encontrados no DOM
    if (!durationSlider || !durationValue || !ratingSlider || !ratingValue) {
        console.error('Elementos dos sliders não encontrados. Verifique os IDs no HTML.');
        return;
    }

    /**
     * Atualiza o texto exibido ao lado do slider de duração.
     * Formato: "150 min"
     */
    function updateDurationValue() {
        durationValue.textContent = durationSlider.value + ' min';
    }

    /**
     * Atualiza o texto exibido ao lado do slider de avaliação.
     * Formato: "50%"
     */
    function updateRatingValue() {
        ratingValue.textContent = ratingSlider.value + '%';
    }

    // Atualiza o valor exibido tanto ao arrastar quanto ao soltar o slider
    durationSlider.addEventListener('input', updateDurationValue);
    durationSlider.addEventListener('change', updateDurationValue);

    ratingSlider.addEventListener('input', updateRatingValue);
    ratingSlider.addEventListener('change', updateRatingValue);

    // Inicializa os textos com os valores padrão definidos no HTML
    updateDurationValue();
    updateRatingValue();


    // ============================================================
    // 2. EXIBIÇÃO DA SEÇÃO DE RESULTADOS AO CLICAR EM "SORTEAR"
    // ============================================================

    /**
     * Exibe a seção de filmes sorteados (.ssl-div-texto2) quando o botão é clicado.
     * Cria os slides dinamicamente com base na quantidade selecionada,
     * inicializa o slideshow e rola a tela até a seção de resultados.
     */
    function mostrarDivQuandoBotaoClicado() {

        // Lê a quantidade de filmes selecionada pelo usuário no campo numérico
        const quantity = parseInt(document.getElementById('movie-filter-quantity').value);

        // Referência à div de resultados (oculta por padrão no CSS)
        const sslDivTexto2 = document.querySelector('.ssl-div-texto2');

        if (sslDivTexto2) {

            // Torna a seção de resultados visível
            sslDivTexto2.style.display = 'block';

            // Atualiza o título com a quantidade de filmes sorteados
            const tituloH1 = sslDivTexto2.querySelector('.ssl-titulo');
            if (tituloH1) {
                tituloH1.textContent = `Filmes Sorteados: ${quantity}`;
            }

            // Cria os slides dinamicamente com as imagens dos filmes sorteados
            criarSlidesDinamicamente(quantity);

            // Inicializa o slideshow após os slides serem criados
            initSlideshow();

            // Rola a tela suavemente até a seção de resultados
            sslDivTexto2.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }


    // ============================================================
    // 3. CRIAÇÃO DINÂMICA DOS SLIDES
    // ============================================================

    /**
     * Cria os slides do slideshow dinamicamente com base na quantidade informada.
     * Seleciona imagens aleatórias (sem repetição) da lista de filmes disponíveis
     * e as insere no container do slideshow antes das setas de navegação.
     *
     * @param {number} quantidade - Número de filmes a sortear (mínimo 1, máximo 5)
     */
    function criarSlidesDinamicamente(quantidade) {

        // Referência ao container do slideshow
        const slideshowContainer = document.querySelector('.slideshow-container');

        // Remove slides existentes para evitar duplicatas ao clicar em "Sortear" novamente
        const slidesExistentes = slideshowContainer.querySelectorAll('.slide');
        slidesExistentes.forEach(slide => slide.remove());

        // Lista de imagens disponíveis na pasta frontend/assets/films/
        // IMPORTANTE: adicione mais imagens aqui ao expandir o catálogo
        const imagensDisponiveis = [
            'filme1.jpg',
            'filme2.jpg',
            'filme3.jpg',
            'filme4.jpg',
            'filme5.jpg',
        ];

        // Verifica se há imagens suficientes para a quantidade solicitada
        if (imagensDisponiveis.length < quantidade) {
            console.error(`Imagens insuficientes: há ${imagensDisponiveis.length} disponíveis, mas foram solicitadas ${quantidade}.`);
            return;
        }

        // Embaralha todas as imagens disponíveis usando sort com fator aleatório
        const imagensEmbaralhadas = [...imagensDisponiveis].sort(() => Math.random() - 0.5);

        // Seleciona apenas a quantidade necessária (garante que não há repetição)
        const imagensSelecionadas = imagensEmbaralhadas.slice(0, quantidade);

        console.log(`Quantidade solicitada: ${quantidade}`);
        console.log(`Imagens selecionadas:`, imagensSelecionadas);

        // Cria um elemento de slide para cada imagem selecionada
        imagensSelecionadas.forEach((nomeImagem, index) => {
            console.log(`Criando slide ${index + 1} com a imagem: ${nomeImagem}`);

            // Cria o div do slide
            const slide = document.createElement('div');
            slide.className = 'slide';

            // Cria a tag de imagem
            const img = document.createElement('img');

            // Monta o caminho completo da imagem dentro da pasta de assets
            const caminhoImagem = `/frontend/assets/films/${nomeImagem}`;

            // Log de sucesso ou erro ao carregar cada imagem
            img.onload = function() {
                console.log(`✅ Imagem carregada: ${caminhoImagem}`);
            };
            img.onerror = function() {
                console.error(`❌ Falha ao carregar: ${caminhoImagem}`);
                // Tenta caminho alternativo com './' no início
                img.src = `./frontend/assets/films/${nomeImagem}`;
            };

            img.src = caminhoImagem;
            img.alt = `Pôster do filme ${index + 1}`;

            // Adiciona a imagem ao slide e o slide ao container,
            // antes do primeiro botão de seta para manter a ordem correta
            slide.appendChild(img);
            const firstArrow = slideshowContainer.querySelector('.arrow');
            slideshowContainer.insertBefore(slide, firstArrow);
        });

        // Atualiza o contador para refletir o slide inicial (1 de N)
        atualizarContador(1, quantidade);
    }


    // ============================================================
    // 4. SLIDESHOW — CONTROLE E NAVEGAÇÃO
    // ============================================================

    // Índice do slide atualmente exibido (começa em 1, não em 0)
    let slideIndex = 1;

    /**
     * Atualiza o contador de slides exibido na parte inferior do slideshow.
     * Formato: "01 de 03"
     *
     * @param {number} atual - Número do slide atual (baseado em 1)
     * @param {number} total - Total de slides existentes
     */
    function atualizarContador(atual, total) {
        const contador = document.querySelector('.slide-counter');

        if (contador) {
            // Formata os números com dois dígitos (ex: 1 → "01")
            const numeroFormatado = atual.toString().padStart(2, '0');
            const totalFormatado = total.toString().padStart(2, '0');
            contador.textContent = `${numeroFormatado} de ${totalFormatado}`;
        } else {
            console.error('Elemento .slide-counter não encontrado no DOM.');
        }
    }

    /**
     * Inicializa o slideshow:
     *   - Exibe o primeiro slide
     *   - Configura os event listeners das setas de navegação
     */
    function initSlideshow() {
        showSlide(slideIndex); // Exibe o slide inicial

        // Configura a seta "anterior" (←)
        const prevButton = document.querySelector('.arrow.prev');
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                changeSlide(-1); // Vai para o slide anterior
            });
        }

        // Configura a seta "próximo" (→)
        const nextButton = document.querySelector('.arrow.next');
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                changeSlide(1); // Vai para o próximo slide
            });
        }
    }

    /**
     * Move o slideshow para frente (+1) ou para trás (-1).
     * @param {number} n - Direção: +1 (próximo) ou -1 (anterior)
     */
    function changeSlide(n) {
        showSlide(slideIndex += n);
    }

    /**
     * Exibe o slide no índice informado.
     * Implementa navegação circular: após o último slide, volta ao primeiro (e vice-versa).
     * Atualiza o contador após cada mudança.
     *
     * @param {number} n - Índice do slide a exibir (baseado em 1)
     */
    function showSlide(n) {
        const slides = document.getElementsByClassName('slide');

        if (!slides || slides.length === 0) {
            console.error('Nenhum slide encontrado no DOM.');
            return;
        }

        // Loop circular: se passar do último, volta ao primeiro
        if (n > slides.length) { slideIndex = 1; }

        // Loop circular: se voltar antes do primeiro, vai para o último
        if (n < 1) { slideIndex = slides.length; }

        // Oculta todos os slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }

        // Exibe apenas o slide atual
        slides[slideIndex - 1].style.display = 'block';

        // Atualiza o texto do contador (ex: "02 de 03")
        atualizarContador(slideIndex, slides.length);
    }


    // ============================================================
    // 5. EVENTO DO BOTÃO "SORTEAR"
    // ============================================================

    // Referência ao botão principal de sorteio
    const sortearButton = document.getElementById('movie-filter-button');

    if (sortearButton) {
        // Ao clicar, exibe a seção de resultados com os filmes sorteados
        sortearButton.addEventListener('click', mostrarDivQuandoBotaoClicado);
    } else {
        console.error('Botão #movie-filter-button não encontrado. Verifique o HTML.');
    }

    // Gera as opções de ano no select ao carregar a página
    gerarOpcoesAnosComPaginacao();
});


// ============================================================
// 6. GERAÇÃO DAS OPÇÕES DE ANO (com paginação)
// ============================================================

/**
 * Preenche o select de "Ano de Lançamento" com os anos mais recentes (últimos 20).
 * Adiciona opções especiais para décadas antigas e a opção "Carregar mais anos..."
 * para que o usuário possa navegar até anos mais antigos sem sobrecarregar a lista.
 */
function gerarOpcoesAnosComPaginacao() {
    const selectAno = document.getElementById('movie-filter-year');
    const anoAtual = new Date().getFullYear();
    const anosPorPagina = 20; // Quantidade de anos exibidos inicialmente

    // Limpa opções existentes, mantendo apenas a opção padrão ("Todos os anos")
    while (selectAno.children.length > 1) {
        selectAno.removeChild(selectAno.lastChild);
    }

    // Adiciona os anos mais recentes em ordem decrescente (do atual para trás)
    for (let i = 0; i < anosPorPagina && (anoAtual - i) >= 1900; i++) {
        const ano = anoAtual - i;
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    }

    // Adiciona opção de "Carregar mais anos..." se ainda houver anos anteriores a 1900
    if (anoAtual - anosPorPagina >= 1900) {
        const optionCarregarMais = document.createElement('option');
        optionCarregarMais.value = 'carregar-mais';
        optionCarregarMais.textContent = 'Carregar mais anos...';
        selectAno.appendChild(optionCarregarMais);
    }

    // Adiciona opções agrupadas por décadas históricas
    const decadas = [
        { value: '1980-1989', text: 'Década de 1980' },
        { value: '1970-1979', text: 'Década de 1970' },
        { value: '1960-1969', text: 'Década de 1960' },
        { value: '1950-1959', text: 'Década de 1950' },
        { value: '1940-1949', text: 'Década de 1940' }
    ];

    decadas.forEach(decada => {
        const option = document.createElement('option');
        option.value = decada.value;
        option.textContent = decada.text;
        selectAno.appendChild(option);
    });

    // Adiciona opção para filmes anteriores a 1940
    const optionAntigos = document.createElement('option');
    optionAntigos.value = 'antigos-1940';
    optionAntigos.textContent = 'Antigos (antes de 1940)';
    selectAno.appendChild(optionAntigos);

    // Quando o usuário selecionar "Carregar mais anos...", carrega mais 30 anos
    selectAno.addEventListener('change', function() {
        if (this.value === 'carregar-mais') {
            carregarMaisAnos(this);
        }
    });
}

/**
 * Carrega mais 30 anos no select quando o usuário clica em "Carregar mais anos...".
 * Remove a opção especial, insere os novos anos e adiciona novamente a opção
 * "Carregar mais..." se ainda houver anos para exibir.
 *
 * @param {HTMLSelectElement} selectElement - O elemento <select> de anos
 */
function carregarMaisAnos(selectElement) {
    const anoAtual = new Date().getFullYear();

    // Calcula quantos anos já foram carregados (descontando as opções especiais)
    const anosJaCarregados = selectElement.children.length - 8;
    const proximosAnos = 30; // Quantidade de anos adicionais a carregar

    // Remove a opção "Carregar mais..." para inserir os novos anos no lugar correto
    selectElement.removeChild(selectElement.querySelector('option[value="carregar-mais"]'));

    // Descobre o último ano já listado
    const ultimoAnoCarregado = parseInt(selectElement.options[anosJaCarregados - 1].value);

    // Insere os próximos anos em ordem decrescente
    for (let i = 1; i <= proximosAnos && (ultimoAnoCarregado - i) >= 1900; i++) {
        const ano = ultimoAnoCarregado - i;
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        // Insere antes das opções de décadas para manter a ordem cronológica
        selectAno.insertBefore(option, selectElement.options[anosJaCarregados]);
    }

    // Se ainda houver anos anteriores a 1900, adiciona novamente "Carregar mais..."
    if (ultimoAnoCarregado - proximosAnos > 1900) {
        const optionCarregarMais = document.createElement('option');
        optionCarregarMais.value = 'carregar-mais';
        optionCarregarMais.textContent = 'Carregar mais anos...';
        selectAno.appendChild(optionCarregarMais);
    }
}