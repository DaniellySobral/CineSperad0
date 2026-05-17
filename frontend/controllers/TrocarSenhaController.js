/**
 * TrocarSenhaController.js
 * ---------------------------
 * Controlador da página de Redefinir Senha do CineEsperado.
 *
 * Funcionalidades cobertas:
 *   1. Proteção de rota: redireciona para Login se não houver sessão ativa.
 *   2. Bloqueio para usuários Google (sem senha convencional).
 *   3. Carregamento do e-mail do usuário autenticado no campo e-mail (readonly).
 *   4. Botões "Editar" habilitam cada campo individualmente (padrão visual da página).
 *   5. Validação client-side dos campos antes de enviar ao servidor.
 *   6. Requisição autenticada ao endpoint PUT /auth/change-password.
 *   7. Feedback visual de sucesso e redirecionamento automático.
 *
 * Dependências:
 *   - frontend/shared/theme.js → função applyTheme()
 *   - frontend/styles/configuracoes.css → estilos visuais dos elementos
 */


// ============================================================
// 0. PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS
// ============================================================

const token = localStorage.getItem('cinesperado_token');

/**
 * Ao carregar a página:
 *  - Verifica autenticação e redireciona se necessário.
 *  - Preenche o campo de e-mail com o e-mail real do usuário.
 *  - Bloqueia a página para usuários do Google.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Redireciona se não houver sessão ativa
    if (!token) {
        window.location.href = '/frontend/views/Login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/auth/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // Token inválido ou expirado: limpa sessão e redireciona
            localStorage.removeItem('cinesperado_token');
            localStorage.removeItem('cinesperado_username');
            localStorage.removeItem('cinesperado_picture');
            window.location.href = '/frontend/views/Login.html';
            return;
        }

        const userData = await response.json();

        // 2. Preenche o campo de e-mail com o e-mail real do usuário
        document.getElementById('email').value = userData.email || '';

        // 3. Bloqueia usuários Google que não possuem senha convencional
        if (userData.is_google_user) {
            showGlobalError(
                'Sua conta está vinculada ao Google. ' +
                'Usuários Google não possuem senha para alterar neste sistema.'
            );
            document.getElementById('btnAlterarSenha').disabled = true;

            // Desabilita todos os botões "Editar" da página
            document.querySelectorAll('.edit-button').forEach(btn => {
                btn.disabled = true;
            });
        }

    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        showGlobalError('Não foi possível verificar sua sessão. Verifique sua conexão.');
    }
});


// ============================================================
// 1. SELEÇÃO DE TEMA
// ============================================================

// Seleciona todos os radio buttons do grupo de tema (system, light, dark)
const themeRadios = document.querySelectorAll('input[name="theme"]');

// Para cada radio button, observa quando o usuário muda a seleção
themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedTheme = radio.value;
        localStorage.setItem('selectedTheme', selectedTheme);
        applyTheme(selectedTheme);
    });
});


// ============================================================
// 2. BOTÃO DE FECHAR
// ============================================================

// Seleciona o botão 'X' no canto superior direito da página
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

// Ao clicar, volta para a página que o usuário estava antes
closeSettingsBtn.addEventListener('click', () => {
    window.history.back();
});


// ============================================================
// 3. BOTÕES "EDITAR" – HABILITAM OS CAMPOS INDIVIDUALMENTE
// ============================================================

/**
 * Configura o comportamento do botão "Editar" para um campo específico.
 * Ao clicar, o campo sai do modo readonly, limpa o valor placeholder
 * e recebe foco para o usuário digitar.
 *
 * @param {string} inputId  - ID do <input> a ser habilitado
 * @param {string} buttonId - ID do <button> "Editar" correspondente
 * @param {string} clearValue - Valor a limpar quando for placeholder (ex: '******')
 */
function configureEditButton(inputId, buttonId, clearValue = '') {
    const input  = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener('click', () => {
        // Limpa erros anteriores do campo
        clearFieldError('error-' + inputId);
        clearGlobalError();

        // Limpa o valor de placeholder antes de liberar a edição
        if (input.value === clearValue) {
            input.value = '';
        }

        // Habilita o campo para edição
        input.removeAttribute('readonly');
        input.style.backgroundColor = 'white';
        input.style.cursor          = 'text';

        // Foco e seleção do texto
        input.focus();
        input.select();

        // Desabilita o botão para evitar cliques duplicados durante a edição
        button.disabled     = true;
        button.textContent  = 'Editando...';
    });
}

// Inicializa os botões "Editar" para cada campo
configureEditButton('senhaAtual',     'editSenhaAtualBtn',     '******');
configureEditButton('novaSenha',      'editNovaSenhaBtn',      '******');
configureEditButton('confirmarSenha', 'editConfirmarSenhaBtn', '******');

// O campo de e-mail é readonly e preenchido automaticamente — não é editável aqui
document.getElementById('editEmailBtn').disabled    = true;
document.getElementById('editEmailBtn').title       = 'O e-mail não pode ser alterado nesta página.';
document.getElementById('editEmailBtn').style.color = '#aaa';


// ============================================================
// 4. VALIDAÇÕES CLIENT-SIDE
// ============================================================

/**
 * Exibe uma mensagem de erro abaixo de um campo específico.
 * @param {string} fieldId - ID do span de erro (ex: 'error-senhaAtual')
 * @param {string} message - Texto da mensagem de erro
 */
function showFieldError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (el) {
        el.textContent   = message;
        el.style.display = 'block';
    }
}

/**
 * Limpa o erro de um campo específico.
 * @param {string} fieldId - ID do span de erro
 */
function clearFieldError(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) {
        el.textContent   = '';
        el.style.display = 'none';
    }
}

/**
 * Exibe uma mensagem de erro global (abaixo dos campos).
 * @param {string} message - Texto do erro global
 */
function showGlobalError(message) {
    const el = document.getElementById('error-global');
    el.textContent          = message;
    el.style.display        = 'block';
    el.style.color          = '#d32f2f';
    el.style.backgroundColor = '#fdecea';
    el.style.border         = '1px solid #f44336';
    el.style.padding        = '10px 14px';
    el.style.borderRadius   = '6px';
    el.style.marginBottom   = '8px';
}

/** Limpa o erro global. */
function clearGlobalError() {
    const el = document.getElementById('error-global');
    el.textContent   = '';
    el.style.display = 'none';
}

/**
 * Valida todos os campos do formulário antes do envio.
 * @returns {boolean} true se todos os campos estão válidos
 */
function validateForm() {
    let valid = true;

    const senhaAtual     = document.getElementById('senhaAtual').value.trim();
    const novaSenha      = document.getElementById('novaSenha').value.trim();
    const confirmarSenha = document.getElementById('confirmarSenha').value.trim();

    // Limpa todos os erros anteriores
    clearFieldError('error-senhaAtual');
    clearFieldError('error-novaSenha');
    clearFieldError('error-confirmarSenha');
    clearGlobalError();

    // Valida senha atual (não pode estar vazia ou ser o placeholder)
    if (!senhaAtual || senhaAtual === '******') {
        showFieldError('error-senhaAtual', 'Clique em "Editar" e digite sua senha atual.');
        valid = false;
    }

    // Valida nova senha
    if (!novaSenha || novaSenha === '******') {
        showFieldError('error-novaSenha', 'Clique em "Editar" e digite a nova senha.');
        valid = false;
    } else if (novaSenha.length < 6) {
        showFieldError('error-novaSenha', 'A nova senha deve ter pelo menos 6 caracteres.');
        valid = false;
    }

    // Valida confirmação
    if (!confirmarSenha || confirmarSenha === '******') {
        showFieldError('error-confirmarSenha', 'Clique em "Editar" e confirme a nova senha.');
        valid = false;
    } else if (novaSenha && novaSenha !== confirmarSenha) {
        showFieldError('error-confirmarSenha', 'As senhas não coincidem.');
        valid = false;
    }

    // Nova senha igual à atual
    if (senhaAtual && novaSenha && senhaAtual === novaSenha && senhaAtual !== '******') {
        showFieldError('error-novaSenha', 'A nova senha deve ser diferente da senha atual.');
        valid = false;
    }

    return valid;
}


// ============================================================
// 5. SALVAR ALTERAÇÕES – ENVIO PARA O BACKEND
// ============================================================

const btnAlterarSenha = document.getElementById('btnAlterarSenha');

btnAlterarSenha.addEventListener('click', async () => {
    // Executa validações antes de qualquer requisição
    if (!validateForm()) return;

    const senhaAtual = document.getElementById('senhaAtual').value.trim();
    const novaSenha  = document.getElementById('novaSenha').value.trim();

    try {
        // Desabilita o botão para evitar duplo envio
        btnAlterarSenha.disabled    = true;
        btnAlterarSenha.textContent = 'Salvando...';

        const response = await fetch('http://localhost:8000/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: senhaAtual,
                new_password:     novaSenha
            })
        });

        const result = await response.json();

        if (response.ok) {
            // ── Sucesso ───────────────────────────────────────────────────────
            showSuccessNotification('Senha alterada com sucesso!');

            // Restaura os campos para o estado inicial (readonly com placeholder)
            resetPasswordFields();

            // Redireciona para Configurações após a notificação
            setTimeout(() => {
                window.location.href = '/frontend/views/Configuracoes.html';
            }, 2000);

        } else {
            // ── Erro retornado pelo servidor ──────────────────────────────────
            const errorMsg = result.detail || 'Erro ao alterar a senha.';

            if (errorMsg.toLowerCase().includes('atual') || errorMsg.toLowerCase().includes('incorreta')) {
                showFieldError('error-senhaAtual', errorMsg);
            } else {
                showGlobalError(errorMsg);
            }
        }

    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        showGlobalError('Erro de conexão. Verifique se o servidor está em execução.');
    } finally {
        btnAlterarSenha.disabled    = false;
        btnAlterarSenha.textContent = 'Salvar mudanças';
    }
});


// ============================================================
// 6. RESTAURAÇÃO DOS CAMPOS (APÓS SALVAR OU CANCELAR)
// ============================================================

/**
 * Restaura os campos de senha para o estado inicial visual:
 * readonly, type=password e valor placeholder '******'.
 */
function resetPasswordFields() {
    const senhaFields = [
        { inputId: 'senhaAtual',     btnId: 'editSenhaAtualBtn'     },
        { inputId: 'novaSenha',      btnId: 'editNovaSenhaBtn'      },
        { inputId: 'confirmarSenha', btnId: 'editConfirmarSenhaBtn' }
    ];

    senhaFields.forEach(({ inputId, btnId }) => {
        const input  = document.getElementById(inputId);
        const button = document.getElementById(btnId);

        if (input) {
            input.value                 = '******';
            input.type                  = 'password';
            input.setAttribute('readonly', true);
            input.style.backgroundColor = '#f9f9f9';
            input.style.cursor          = 'not-allowed';
        }

        if (button) {
            button.disabled    = false;
            button.textContent = 'Editar';
        }
    });
}


// ============================================================
// 7. NOTIFICAÇÃO DE SUCESSO (PADRÃO DA APLICAÇÃO)
// ============================================================

/**
 * Cria e exibe uma notificação deslizante de sucesso no canto superior direito.
 * Idêntica ao padrão visual já utilizado em ConfiguracoesController.js.
 * @param {string} message - Texto exibido na notificação
 */
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className   = 'notification';
    notification.textContent = message;

    Object.assign(notification.style, {
        position:        'fixed',
        top:             '20px',
        right:           '20px',
        backgroundColor: '#5b0013',
        color:           'white',
        padding:         '15px 20px',
        borderRadius:    '5px',
        boxShadow:       '0 2px 10px rgba(0,0,0,0.2)',
        zIndex:          '2000',
        transform:       'translateX(120%)',
        transition:      'transform 0.3s ease'
    });

    document.body.appendChild(notification);

    // Anima a entrada da notificação (desliza da direita para dentro)
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);

    // Anima a saída e remove o elemento após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => { document.body.removeChild(notification); }, 300);
    }, 3000);
}
