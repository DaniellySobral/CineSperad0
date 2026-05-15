/**
 * auth.js
 * ----------
 * Gerencia a proteção de rotas e funcionalidades restritas no frontend.
 * 
 * Funcionalidades cobertas:
 *   1. Verificação de estado de autenticação via LocalStorage.
 *   2. Intercepção de cliques em links protegidos (classe .requires-auth).
 *   3. Integração com o sistema global de modais para avisos de login.
 *
 * Dependências:
 *   - shared/header.js (para o sistema window.alert customizado)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. CONFIGURAÇÃO DE PROTEÇÃO DE LINKS
    // ============================================================

    const authLinks = document.querySelectorAll('.requires-auth');

    /**
     * Valida se existe um token de sessão ativo.
     * @returns {boolean}
     */
    function isUserLoggedIn() {
        return localStorage.getItem('cinesperado_token') !== null;
    }

    // Aplica o bloqueio a todos os elementos marcados como restritos
    authLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            
            // Se o usuário não estiver logado, bloqueia a navegação
            if (!isUserLoggedIn()) {
                e.preventDefault(); 

                /**
                 * Dispara o alerta customizado definido no header.js.
                 * O sistema de alerta já oferece o botão de redirecionamento para o login.
                 */
                alert('Você precisa estar logado para acessar esta funcionalidade. Por favor, faça login ou crie uma conta para continuar.');
            }
        });
    });

    // ============================================================
    // 2. LÓGICA DE MODAL (LEGADO/FALLBACK)
    // ============================================================
    // Nota: Mantido para compatibilidade caso existam modais manuais no HTML antigo.
    const authModal = document.getElementById('authModal');
    const closeModalBtn = document.getElementById('closeAuthModal');

    if (closeModalBtn && authModal) {
        closeModalBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        // Fecha o modal ao clicar fora dele
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });
    }
});

