// Garantir que o DOM esteja completamente carregado antes de executar o JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar valores dos sliders
    const durationSlider = document.getElementById('movie-filter-duration');
    const durationValue = document.getElementById('movie-filter-duration-value');
    const ratingSlider = document.getElementById('movie-filter-rating');
    const ratingValue = document.getElementById('movie-filter-rating-value');
    
    // Verificar se os elementos foram encontrados
    if (!durationSlider || !durationValue || !ratingSlider || !ratingValue) {
        console.error('Elementos dos sliders não encontrados');
        return;
    }
    
    // Função para atualizar o valor da duração
    function updateDurationValue() {
        durationValue.textContent = durationSlider.value + ' min';
    }
    
    // Função para atualizar o valor da avaliação
    function updateRatingValue() {
        ratingValue.textContent = ratingSlider.value + '%';
    }
    
    // Adicionar event listeners para os eventos 'input' e 'change'
    durationSlider.addEventListener('input', updateDurationValue);
    durationSlider.addEventListener('change', updateDurationValue);
    
    ratingSlider.addEventListener('input', updateRatingValue);
    ratingSlider.addEventListener('change', updateRatingValue);
    
    // Inicializar os valores
    updateDurationValue();
    updateRatingValue();
    
    // ================================================================
    // INÍCIO DA NOVA FUNCIONALIDADE - MOSTRAR DIV QUANDO BOTÃO FORA CLICADO
    // ================================================================
    
    // Função para mostrar a div ssl-div-texto2 quando o botão for clicado
    function mostrarDivQuandoBotaoClicado() {
        // Obter a quantidade de filmes selecionada
        const quantity = parseInt(document.getElementById('movie-filter-quantity').value);
        
        // Encontrar a div ssl-div-texto2
        const sslDivTexto2 = document.querySelector('.ssl-div-texto2');
        
        if (sslDivTexto2) {
            // Mostrar a div (muda de display: none para display: block)
            sslDivTexto2.style.display = 'block';
            
            // Encontrar o elemento h1 dentro da div
            const tituloH1 = sslDivTexto2.querySelector('.ssl-titulo');
            
            if (tituloH1) {
                // Atualizar o texto do h1 com a quantidade
                tituloH1.textContent = `Filmes Sorteados: ${quantity}`;
            }
            
            // ================================================================
            // ALTERAÇÃO 1: Criar os slides dinamicamente com base na quantidade
            // ================================================================
            criarSlidesDinamicamente(quantity);
            
            // Inicializar o slideshow após mostrar a div e criar os slides
            initSlideshow();
            
            //Nova funcionalidade, rolar a tela até o banner de filmes quando o botão de sortear é clicado 
            sslDivTexto2.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // ================================================================
    // ALTERAÇÃO 2: Nova função para criar slides dinamicamente
    // ================================================================
    // Função para criar os slides dinamicamente com base na quantidade
    function criarSlidesDinamicamente(quantidade) {
        // Encontrar o container do slideshow
        const slideshowContainer = document.querySelector('.slideshow-container');
        
        // Remover slides existentes (se houver)
        const slidesExistentes = slideshowContainer.querySelectorAll('.slide');
        slidesExistentes.forEach(slide => slide.remove());
        
         // Lista com os nomes das  imagens na pasta "filmeSorteio"
        const imagensDisponiveis = [
            'filme1.jpg',   
            'filme2.jpg',
            'filme3.jpg',
            'filme4.jpg',
            'filme5.jpg',
            // Adicione mais imagens conforme necessário
        ];
        

    // Verificar se temos imagens suficientes
    if (imagensDisponiveis.length < quantidade) {
        console.error(`Você só tem ${imagensDisponiveis.length} imagens, mas solicitou ${quantidade}`);
        return;
    }
    
    // Embaralhar todas as imagens disponíveis
    const imagensEmbaralhadas = [...imagensDisponiveis].sort(() => Math.random() - 0.5);
    
    // Selecionar exatamente a quantidade de imagens necessária (diferentes entre si)
    const imagensSelecionadas = imagensEmbaralhadas.slice(0, quantidade);
    
    console.log(`Quantidade solicitada: ${quantidade}`);
    console.log(`Imagens selecionadas:`, imagensSelecionadas);
    
    // Criar os slides para cada imagem selecionada
    imagensSelecionadas.forEach((nomeImagem, index) => {
        console.log(`Criando slide ${index + 1} com a imagem: ${nomeImagem}`);
        
        // Criar o elemento div do slide
        const slide = document.createElement('div');
        slide.className = 'slide';
        
        // Criar a imagem usando arquivo local da pasta "filmeSorteio"
        const img = document.createElement('img');
        
        // CORREÇÃO: Adicionar barra (/) entre o nome da pasta e o nome do arquivo
        const caminhoImagem = `Icones-Imagens/filmeSorteio/${nomeImagem}`;
        
        // Adicionar eventos para depuração
        img.onload = function() {
            console.log(`✅ Imagem carregada com sucesso: ${caminhoImagem}`);
        };
        
        img.onerror = function() {
            console.error(`❌ Erro ao carregar a imagem: ${caminhoImagem}`);
            // Tentar caminho alternativo
            img.src = `./Icones-Imagens/filmeSorteio/${nomeImagem}`;
        };
        
        // Definir o caminho da imagem
        img.src = caminhoImagem;
        img.alt = `Filme ${index + 1}`;
        
        // Adicionar a imagem ao slide
        slide.appendChild(img);
        
        // Adicionar o slide ao container, antes do primeiro botão de seta
        const firstArrow = slideshowContainer.querySelector('.arrow');
        slideshowContainer.insertBefore(slide, firstArrow);
        });
        
        // ================================================================
        // NOVO: Atualizar o contador após criar todos os slides
        // ================================================================
        atualizarContador(1, quantidade);
    }
    
    
    // Encontrar o botão de sortear
    const sortearButton = document.getElementById('movie-filter-button');
    
    // Verificar se o botão existe
    if (sortearButton) {
        // Adicionar event listener para o clique no botão
        sortearButton.addEventListener('click', mostrarDivQuandoBotaoClicado);
    } else {
        console.error('Botão de sortear não encontrado');
    }
    
    // ================================================================
    // FIM DA NOVA FUNCIONALIDADE
    // ================================================================
    
    // Chamar a função para gerar as opções de anos com paginação
    gerarOpcoesAnosComPaginacao();
    
    // ================================================================
    // INÍCIO DO SLIDESHOW
    // ================================================================
    
    // Variável global para o índice do slide
    let slideIndex = 1;
    
    // ================================================================
    // NOVO: Função para atualizar o contador (definida no escopo principal)
    // ================================================================
    function atualizarContador(atual, total) {
        const contador = document.querySelector('.slide-counter');

        if(contador){
            // Formatar o número atual para ter dois dígitos (01, 02, etc.)
            const numeroFormatado = atual.toString().padStart(2, '0');
            const totalFormatado = total.toString().padStart(2, '0');
        
            contador.textContent = `${numeroFormatado} de ${totalFormatado}`;
        } else {
            console.error('Elemento .slide-counter não encontrado');
        }
    }
    
    // Função para inicializar o slideshow
    function initSlideshow() {
        // Mostrar o primeiro slide
        showSlide(slideIndex);
        
        // Adicionar event listeners às setas se elas existirem
        const prevButton = document.querySelector('.arrow.prev');
        const nextButton = document.querySelector('.arrow.next');
        
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                changeSlide(-1);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                changeSlide(1);
            });
        }
    }
    
    // Função para mudar o slide
    function changeSlide(n) {
        showSlide(slideIndex += n);
    }

    // Função para mostrar o slide atual
    function showSlide(n) {
        const slides = document.getElementsByClassName("slide");
        
        if (!slides || slides.length === 0) {
            console.error('Nenhum slide encontrado');
            return;
        }
        
        if (n > slides.length) {
            slideIndex = 1;
        }
        
        if (n < 1) {
            slideIndex = slides.length;
        }
        
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        
        slides[slideIndex - 1].style.display = "block";

        atualizarContador(slideIndex, slides.length);
    }
    
    // ================================================================
    // FIM DO SLIDESHOW
    // ================================================================
});

function gerarOpcoesAnosComPaginacao() {
    const selectAno = document.getElementById('movie-filter-year');
    const anoAtual = new Date().getFullYear();
    const anosPorPagina = 20; // Mostra apenas 20 anos inicialmente
    
    // Limpa o select, mantendo apenas a primeira opção
    while (selectAno.children.length > 1) {
        selectAno.removeChild(selectAno.lastChild);
    }
    
    // Adiciona os anos mais recentes primeiro
    for (let i = 0; i < anosPorPagina && (anoAtual - i) >= 1900; i++) {
        const ano = anoAtual - i;
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    }
    
    // Adiciona opção "Carregar mais..."
    if (anoAtual - anosPorPagina >= 1900) {
        const optionCarregarMais = document.createElement('option');
        optionCarregarMais.value = 'carregar-mais';
        optionCarregarMais.textContent = 'Carregar mais anos...';
        selectAno.appendChild(optionCarregarMais);
    }
    
    // Adiciona opções de décadas
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
    
    // Adiciona opção para filmes antigos
    const optionAntigos = document.createElement('option');
    optionAntigos.value = 'antigos-1940';
    optionAntigos.textContent = 'Antigos (antes de 1940)';
    selectAno.appendChild(optionAntigos);
    
    // Adiciona evento para carregar mais anos quando selecionado
    selectAno.addEventListener('change', function() {
        if (this.value === 'carregar-mais') {
            carregarMaisAnos(this);
        }
    });
}

function carregarMaisAnos(selectElement) {
    const anoAtual = new Date().getFullYear();
    const anosJaCarregados = selectElement.children.length - 8; // Desconta as opções especiais
    const proximosAnos = 30; // Carrega mais 30 anos
    
    // Remove a opção "Carregar mais..."
    selectElement.removeChild(selectElement.querySelector('option[value="carregar-mais"]'));
    
    // Encontra o último ano já carregado
    const ultimoAnoCarregado = parseInt(selectElement.options[anosJaCarregados - 1].value);
    
    // Adiciona mais anos
    for (let i = 1; i <= proximosAnos && (ultimoAnoCarregado - i) >= 1900; i++) {
        const ano = ultimoAnoCarregado - i;
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.insertBefore(option, selectElement.options[anosJaCarregados]);
    }
    
    // Se ainda houver mais anos para carregar, adiciona novamente a opção "Carregar mais..."
    if (ultimoAnoCarregado - proximosAnos > 1900) {
        const optionCarregarMais = document.createElement('option');
        optionCarregarMais.value = 'carregar-mais';
        optionCarregarMais.textContent = 'Carregar mais anos...';
        selectAno.appendChild(optionCarregarMais);
    }
}