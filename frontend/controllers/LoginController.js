/**
 * LoginController.js
 * -------------------
 * Gerencia a autenticação, registro de usuários e a interatividade da tela de login.
 * 
 * Funcionalidades cobertas:
 *   1. Animação de transição entre os painéis de Login e Cadastro.
 *   2. Processamento de login convencional (Usuário/Senha).
 *   3. Registro de novos usuários com tratamento de erros de validação.
 *   4. Integração com Google Identity Services para Login Social.
 *   5. Persistência do token JWT e dados do perfil no LocalStorage.
 *
 * Dependências:
 *   - backend/routes/auth_routes.py (Endpoints de autenticação)
 *   - Google Identity Services API (Para login social)
 */

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// ============================================================
// 1. ANIMAÇÕES DE TRANSIÇÃO (LOGIN ↔ CADASTRO)
// ============================================================

/**
 * Adiciona a classe 'active' ao container principal para disparar a
 * animação CSS que move os painéis e revela o formulário de cadastro.
 */
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

/**
 * Remove a classe 'active' para retornar ao estado inicial de login.
 */
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// ============================================================
// 2. CONFIGURAÇÕES E ELEMENTOS DA API
// ============================================================

// Endereço base do servidor backend
const API_BASE_URL = 'http://localhost:8000';

// Elementos de Login
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Elementos de Cadastro
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

// ============================================================
// 3. PROCESSAMENTO DE LOGIN (CONVENCIONAL)
// ============================================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita o refresh da página
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Realiza a requisição de autenticação para o servidor
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Persiste os dados retornados no navegador
            localStorage.setItem('cinesperado_token', data.access_token);
            localStorage.setItem('cinesperado_username', data.username);
            if(data.picture_url) localStorage.setItem('cinesperado_picture', data.picture_url);
            
            // Redireciona para a página principal
            window.location.href = '/frontend/views/Home.html';
        } else {
            // Caso de credenciais inválidas (401)
            const errorData = await response.json();
            loginError.textContent = errorData.detail || 'Usuário ou senha incorretos.';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        loginError.textContent = 'Servidor fora do ar ou erro de conexão.';
        loginError.style.display = 'block';
    }
});

// ============================================================
// 4. PROCESSAMENTO DE CADASTRO (REGISTRO)
// ============================================================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        // Tenta registrar o novo usuário no backend
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            // Feedback visual de sucesso
            registerError.style.display = 'none';
            registerSuccess.textContent = `Conta criada com sucesso! Redirecionando para o login...`;
            registerSuccess.style.display = 'block';
            registerForm.reset();
            
            /**
             * Após 2 segundos, alterna automaticamente para a tela de login
             * e pré-preenche o nome de usuário para melhorar a UX.
             */
            setTimeout(() => {
                container.classList.remove('active'); 
                registerSuccess.style.display = 'none';
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').focus();
            }, 2000);
        } else {
            // Tratamento de erros detalhado vindo do servidor
            const errorData = await response.json();
            let errorMessage = 'Erro ao criar conta.';

            if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
                // Erros de validação do Pydantic (ex: email inválido)
                errorMessage = errorData.detail[0]?.msg || 'E-mail com formato inválido.';
            }
            
            registerError.textContent = errorMessage;
            registerError.style.display = 'block';
            registerSuccess.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        registerError.textContent = 'Servidor fora do ar ou erro de conexão.';
        registerError.style.display = 'block';
        registerSuccess.style.display = 'none';
    }
});

// ============================================================
// 5. INTEGRAÇÃO COM GOOGLE LOGIN (SOCIAL AUTH)
// ============================================================

/**
 * Função de callback acionada quando o usuário completa o login no pop-up do Google.
 * @param {Object} response - Resposta contendo o token JWT do Google.
 */
async function handleGoogleCredentialResponse(response) {
    const googleToken = response.credential;
    
    try {
        // Envia o token do Google para validação no nosso servidor
        const apiResponse = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken })
        });

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            
            // Salva o token gerado pela NOSSA API
            localStorage.setItem('cinesperado_token', data.access_token);
            localStorage.setItem('cinesperado_username', data.username);
            if(data.picture_url) localStorage.setItem('cinesperado_picture', data.picture_url);
            
            window.location.href = '/frontend/views/Home.html';
        } else {
            loginError.textContent = 'Falha ao autenticar com a conta do Google.';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        loginError.textContent = 'Servidor fora do ar ou erro de conexão.';
        loginError.style.display = 'block';
    }
}