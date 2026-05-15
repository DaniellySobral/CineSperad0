/**
 * script.js
 * ----------
 * Controla o carrossel dinâmico (banner rotativo) da página inicial (Home).
 * 
 * Funcionalidades cobertas:
 *   1. Criação dinâmica de slides a partir de um array de imagens.
 *   2. Sistema de Auto-play (transição automática a cada 4 segundos).
 *   3. Lógica de loop circular (retorno ao início após o último slide).
 *   4. Gerenciamento de classes CSS ('active') para transições fluidas.
 *
 * Dependências:
 *   - frontend/views/Home.html (Container .banner-slides)
 *   - frontend/styles/home.css (Estilização dos slides)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. CONFIGURAÇÃO DE ATIVOS (IMAGENS DO BANNER)
    // ============================================================
    
    // Lista de caminhos para as imagens exibidas no carrossel.
    const imagens = [
        '/frontend/assets/images/harrypotter.jpg',
        '/frontend/assets/backgrounds/lalalandbanner.jpg',
        '/frontend/assets/backgrounds/fightclubbanner.jpg',
        '/frontend/assets/backgrounds/jokerbanner.jpg',
        '/frontend/assets/backgrounds/alienbanner.jpg',
        '/frontend/assets/backgrounds/avatartwow.jpg'
    ];

    const slidesContainer = document.querySelector('.banner-slides');
    let slideIndex = 0;
    let intervalId = null;

    // ============================================================
    // 2. CONSTRUÇÃO E NAVEGAÇÃO DO CARROSSEL
    // ============================================================

    /**
     * Gera os elementos HTML dos slides e os injeta no DOM.
     */
    function criarSlides() {
        if (!slidesContainer) return;

        imagens.forEach((imagem, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';

            // Define o primeiro slide como ativo por padrão
            if (index === 0) slide.classList.add('active');

            // Aplica a imagem como background do slide
            slide.style.backgroundImage = `url('${imagem}')`;
            slidesContainer.appendChild(slide);
        });
    }

    /**
     * Alterna a visibilidade dos slides baseado no índice informado.
     * @param {number} index - O índice do slide a ser ativado.
     */
    function mostrarSlide(index) {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;

        // Limpa estado ativo de todos os slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Cálculo de índice circular
        if (index >= slides.length) {
            slideIndex = 0;
        } else if (index < 0) {
            slideIndex = slides.length - 1;
        } else {
            slideIndex = index;
        }

        // Ativa apenas o slide do índice calculado
        slides[slideIndex].classList.add('active');
    }

    /**
     * Inicializa o timer de troca automática.
     */
    function iniciarCarrossel() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            mostrarSlide(slideIndex + 1);
        }, 4000); // Intervalo de 4 segundos
    }

    // ============================================================
    // 3. INICIALIZAÇÃO
    // ============================================================
    
    if (slidesContainer) {
        criarSlides();             // Monta os slides
        mostrarSlide(slideIndex);  // Exibe o inicial
        iniciarCarrossel();        // Inicia o auto-play
    }
});