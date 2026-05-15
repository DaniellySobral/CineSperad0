/**
 * theme.js
 * ---------
 * Gerencia a persistência e aplicação do tema visual (Claro/Escuro) em todo o sistema.
 * 
 * Funcionalidades cobertas:
 *   1. Recuperação da preferência de tema do LocalStorage.
 *   2. Aplicação dinâmica da classe CSS 'dark-theme' ao elemento body.
 *   3. Sincronização automática em todas as páginas que carregam este script.
 *
 * Dependências:
 *   - frontend/styles/utilitario.css (Definição das variáveis de tema)
 */

/**
 * Função global para aplicar o tema visualmente.
 * @param {string} themeName - O identificador do tema ('light', 'dark', 'system').
 */
function applyTheme(themeName) {
    const body = document.body;

    // Reset de classes para garantir estado limpo
    body.classList.remove('dark-theme');

    // Ativação do modo escuro baseado na preferência
    if (themeName === 'dark') {
        body.classList.add('dark-theme');
    }

    // Nota: O tema 'light' é o padrão injetado via CSS puro, por isso não requer classe extra.
}

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. INICIALIZAÇÃO DO TEMA SALVO
    // ============================================================

    // Recupera a escolha do usuário feita na página de Configurações
    const savedTheme = localStorage.getItem('selectedTheme');

    // Se houver uma preferência salva, aplica imediatamente ao carregar a página
    if (savedTheme) {
        applyTheme(savedTheme);
    }
});