/**
 * script.js
 * ----------
 * Script utilitário da página Home — responsável pelo banner rotativo (carrossel).
 *
 * Funcionamento:
 *   1. Cria os slides dinamicamente no HTML a partir de uma lista de imagens.
 *   2. Exibe o primeiro slide ao carregar a página.
 *   3. Rotaciona automaticamente os slides a cada 4 segundos (auto-play).
 *
 * Os slides são inseridos dentro do elemento <div class="banner-slides">
 * localizado em frontend/views/Home.html.
 *
 * As imagens do carrossel estão em frontend/assets/backgrounds/ e frontend/assets/images/.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Lista de imagens do carrossel ───────────────────────────────────────
    // Adicione ou remova caminhos aqui para alterar as imagens exibidas no banner.
    const imagens = [
        '/frontend/assets/images/harrypotter.jpg',
        '/frontend/assets/backgrounds/lalalandbanner.jpg',
        '/frontend/assets/backgrounds/fightclubbanner.jpg',
        '/frontend/assets/backgrounds/jokerbanner.jpg',
        '/frontend/assets/backgrounds/alienbanner.jpg',
        '/frontend/assets/backgrounds/avatartwow.jpg'
    ];

    // Referência ao container onde os slides serão inseridos
    const slidesContainer = document.querySelector('.banner-slides');

    // Índice do slide atualmente visível (começa no 0 = primeiro slide)
    let slideIndex = 0;

    // ID do intervalo automático (guardado para poder ser reiniciado se necessário)
    let intervalId = null;

    // ─── Criação dos slides ──────────────────────────────────────────────────
    /**
     * Cria os elementos HTML de cada slide e os insere no container.
     * O primeiro slide já recebe a classe 'active' para ficar visível.
     */
    function criarSlides() {
        imagens.forEach((imagem, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';

            // O primeiro slide começa ativo (visível)
            if (index === 0) slide.classList.add('active');

            // A imagem é aplicada como plano de fundo via CSS
            slide.style.backgroundImage = `url('${imagem}')`;

            slidesContainer.appendChild(slide);
        });
    }

    // ─── Exibição de slide ──────────────────────────────────────────────────
    /**
     * Exibe o slide no índice informado.
     * Garante que o índice sempre esteja dentro dos limites do array (loop circular).
     * @param {number} index - Índice do slide a ser exibido
     */
    function mostrarSlide(index) {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return; // Sai se não houver slides

        // Remove a classe 'active' de todos os slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Ajusta o índice para loop circular (vai do último ao primeiro e vice-versa)
        if (index >= slides.length) {
            slideIndex = 0;
        } else if (index < 0) {
            slideIndex = slides.length - 1;
        } else {
            slideIndex = index;
        }

        // Adiciona 'active' apenas ao slide atual, tornando-o visível via CSS
        slides[slideIndex].classList.add('active');
    }

    // ─── Avanço automático ───────────────────────────────────────────────────
    /**
     * Avança para o próximo slide na sequência.
     */
    function proximoSlide() {
        mostrarSlide(slideIndex + 1);
    }

    /**
     * Inicia o carrossel automático com intervalo de 4 segundos.
     * Limpa qualquer intervalo anterior para evitar múltiplos timers simultâneos.
     */
    function iniciarCarrossel() {
        if (intervalId) clearInterval(intervalId); // Evita timers duplicados
        intervalId = setInterval(proximoSlide, 4000); // Troca de slide a cada 4s
    }

    // ─── Inicialização ───────────────────────────────────────────────────────
    criarSlides();             // 1. Cria os slides no DOM
    mostrarSlide(slideIndex);  // 2. Exibe o primeiro slide
    iniciarCarrossel();        // 3. Inicia a rotação automática
});