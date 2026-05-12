// ===================================
// LÓGICA DO CARROSSEL
// ===================================

document.addEventListener('DOMContentLoaded', () => {

    // Lista de imagens do carrossel
    const imagens = [
        '/Icones-Imagens/harrypotter.jpg',
        '/Icones-Imagens/PlanosDeFundo/lalalandbanner.jpg',
        '/Icones-Imagens/PlanosDeFundo/fightclubbanner.jpg',
        '/Icones-Imagens/PlanosDeFundo/jokerbanner.jpg',
        '/Icones-Imagens/PlanosDeFundo/alienbanner.jpg',
        '/Icones-Imagens/PlanosDeFundo/avatartwow.jpg'
    ];

    const slidesContainer = document.querySelector('.banner-slides');
    let slideIndex = 0;
    let intervalId = null;

    // Função para criar os slides no HTML
    function criarSlides() {
        imagens.forEach((imagem, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (index === 0) slide.classList.add('active'); // O primeiro slide começa ativo
            slide.style.backgroundImage = `url('${imagem}')`;
            slidesContainer.appendChild(slide);
        });
    }

    // Função para mostrar um slide específico
    function mostrarSlide(index) {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;

        slides.forEach(slide => slide.classList.remove('active'));

        // Garantir que o index esteja dentro dos limites do array
        if (index >= slides.length) {
            slideIndex = 0;
        } else if (index < 0) {
            slideIndex = slides.length - 1;
        } else {
            slideIndex = index;
        }

        // Adiciona 'active' ao slide atual
        slides[slideIndex].classList.add('active');
    }

    // Função para avançar para o próximo slide
    function proximoSlide() {
        mostrarSlide(slideIndex + 1);
    }

    // Função para iniciar o carrossel automático
    function iniciarCarrossel() {
        // Limpa o intervalo anterior para evitar múltiplos timers
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(proximoSlide, 4000); // Muda a cada 4 segundos
    }

    // Inicialização
    criarSlides();
    mostrarSlide(slideIndex); // Mostra o primeiro slide
    iniciarCarrossel(); // Começa a rotação automática
});