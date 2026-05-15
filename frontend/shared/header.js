/**
 * header.js
 * ----------
 * Script central compartilhado responsável pelo gerenciamento da UI do cabeçalho
 * e pela customização de diálogos do sistema.
 *
 * Funcionalidades cobertas:
 *   1. Customização Global de Alertas: Substitui o window.alert por modais estilizados.
 *   2. Sistema de Modais Flexível: Permite chamadas customizadas com múltiplos botões.
 *   3. Gerenciamento de Estado de Autenticação: Altera o header se o usuário estiver logado.
 *   4. Dropdown de Perfil: Menu de navegação rápida para usuários autenticados.
 *   5. Lógica de Logout: Limpeza de sessão e redirecionamento.
 *
 * Dependências:
 *   - LocalStorage (Persistência de tokens e perfil)
 *   - Boxicons (Ícones do dropdown)
 */

// ============================================================
// 1. SOBREESCRITA GLOBAL DE ALERTAS (MODAL CUSTOMIZADO)
// ============================================================

/**
 * Intercepta chamadas de alert() nativas para exibir um modal premium.
 * Identifica automaticamente se a mensagem exige login para oferecer botões específicos.
 * @param {string} message - Texto informativo do alerta.
 */
window.alert = function(message) {
    let overlay = document.getElementById('globalAuthModal');
    
    // Cria a estrutura do modal se ela ainda não existir no DOM
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'globalAuthModal';
        overlay.className = 'auth-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        
        const title = document.createElement('h2');
        title.id = 'globalAuthModalTitle';
        
        const msgP = document.createElement('p');
        msgP.id = 'globalAuthModalMsg';
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'auth-modal-buttons';
        btnContainer.id = 'globalAuthModalBtns';
        
        modal.appendChild(title);
        modal.appendChild(msgP);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
    
    const title = document.getElementById('globalAuthModalTitle');
    const msgP = document.getElementById('globalAuthModalMsg');
    const btnContainer = document.getElementById('globalAuthModalBtns');
    
    msgP.textContent = message;
    
    // Identifica palavras-chave para alternar o título e os botões
    const requiresLogin = message.toLowerCase().includes('login') || message.toLowerCase().includes('logado');
    
    if (requiresLogin) {
        title.textContent = 'Acesso Restrito';
        btnContainer.innerHTML = `
            <button class="button btn-close" id="globalCloseModal">Cancelar</button>
            <a href="/frontend/views/Login.html" class="button btn-login">Fazer Login</a>
        `;
    } else {
        title.textContent = 'Aviso';
        btnContainer.innerHTML = `
            <button class="button btn-login" id="globalCloseModal">OK</button>
        `;
    }
    
    overlay.style.display = 'flex';
    
    // Listener para o botão de fechamento
    document.getElementById('globalCloseModal').addEventListener('click', () => {
        overlay.style.display = 'none';
    });
    
    // Fecha o modal ao clicar fora da área central (overlay)
    window.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    });
};

// ============================================================
// 2. SISTEMA DE MODAIS DINÂMICOS (API window.showModal)
// ============================================================

/**
 * Permite disparar modais com comportamentos e botões customizados.
 * @param {string} titleText - Título do modal.
 * @param {string} message - Texto do corpo.
 * @param {Array} buttons - Array de objetos [{text, url}].
 */
window.showModal = function(titleText, message, buttons) {
    let overlay = document.getElementById('globalAuthModal');
    if (!overlay) {
        // Inicializa o HTML se necessário via chamada silenciosa do alert
        window.alert('');
        overlay = document.getElementById('globalAuthModal');
    }
    
    const title = document.getElementById('globalAuthModalTitle');
    const msgP = document.getElementById('globalAuthModalMsg');
    const btnContainer = document.getElementById('globalAuthModalBtns');
    
    title.textContent = titleText;
    msgP.textContent = message;
    btnContainer.innerHTML = '';
    
    // Itera sobre a lista de botões fornecida para criar a interface
    buttons.forEach((btn, index) => {
        if (btn.url) {
            // Botão do tipo link (navegação)
            const a = document.createElement('a');
            a.href = btn.url;
            a.className = index === 0 ? 'button btn-login' : 'button btn-close';
            a.textContent = btn.text;
            btnContainer.appendChild(a);
        } else {
            // Botão do tipo ação (geralmente fecha o modal)
            const button = document.createElement('button');
            button.className = index === 0 ? 'button btn-login' : 'button btn-close';
            button.textContent = btn.text;
            button.addEventListener('click', () => {
                overlay.style.display = 'none';
            });
            btnContainer.appendChild(button);
        }
    });
    
    overlay.style.display = 'flex';
};

// ============================================================
// 3. ATUALIZAÇÃO DINÂMICA DO HEADER (ESTADO LOGADO)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // Recupera dados da sessão do LocalStorage
    const token      = localStorage.getItem('cinesperado_token');
    const username   = localStorage.getItem('cinesperado_username');
    const pictureUrl = localStorage.getItem('cinesperado_picture');

    // Identifica onde os botões devem ser injetados
    const buttonDiv = document.querySelector('.buttonDiv');

    // Se o usuário não está autenticado, encerra a execução e mantém o header original
    if (!token || !buttonDiv) return;

    // Lógica do Avatar: Pega a inicial do nome caso não haja foto de perfil
    const inicial = username ? username.charAt(0).toUpperCase() : '?';

    /**
     * Renderiza o avatar do usuário.
     * Prioriza a imagem do Google, caso falhe ou não exista, renderiza a inicial estilizada.
     */
    const avatarInner = (pictureUrl && pictureUrl !== 'null')
        ? `<img src="${pictureUrl}" alt="Perfil" class="avatar-img" referrerpolicy="no-referrer" onerror="this.outerHTML='<span class=\\'avatar-inicial\\'>${inicial}</span>'">`
        : `<span class="avatar-inicial">${inicial}</span>`;

    // Substitui os botões de "Entrar" pelo componente de perfil logado
    buttonDiv.innerHTML = `
        <div class="user-header" id="userHeaderMenu">
            <span class="user-name">Olá, ${username || 'usuário'}</span>
            <div class="user-avatar">
                ${avatarInner}
            </div>
            <div class="user-dropdown" id="userDropdown">
                <a href="/frontend/views/Configuracoes.html"><i class='bx bxs-cog'></i> Configurações</a>
                <button id="logoutBtn"><i class='bx bx-log-out'></i> Sair</button>
            </div>
        </div>
    `;

    // ============================================================
    // 4. CONTROLE DO MENU DROPDOWN
    // ============================================================

    const userHeaderMenu = document.getElementById('userHeaderMenu');
    const userDropdown   = document.getElementById('userDropdown');

    // Toggle para abrir/fechar menu
    userHeaderMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    // Fecha o menu se o usuário clicar fora dele
    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
    });

    // ============================================================
    // 5. LÓGICA DE LOGOUT
    // ============================================================

    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Limpeza completa dos dados de sessão
        localStorage.removeItem('cinesperado_token');
        localStorage.removeItem('cinesperado_username');
        localStorage.removeItem('cinesperado_picture');
        
        // Retorna para a Home para resetar o estado da interface
        window.location.href = '/frontend/views/Home.html';
    });
});

