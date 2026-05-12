/**
 * LoginController.js
 * -------------------
 * Responsável pela animação de troca entre os painéis de Login e Cadastro.
 *
 * Funcionamento:
 *   - Ao clicar em "Cadastre-se", adiciona a classe CSS 'active' ao container,
 *     acionando a animação de transição para o formulário de cadastro.
 *   - Ao clicar em "Entrar", remove a classe 'active', voltando para o login.
 *
 * A lógica visual (animações, posições) está definida em frontend/styles/login.css.
 */

// Seleciona o container principal que agrupa os dois formulários
const container = document.querySelector('.container');

// Seleciona o botão "Cadastre-se" (painel esquerdo, visível na tela de login)
const registerBtn = document.querySelector('.register-btn');

// Seleciona o botão "Entrar" (painel direito, visível na tela de cadastro)
const loginBtn = document.querySelector('.login-btn');

// Quando o usuário clica em "Cadastre-se":
// adiciona a classe 'active' ao container, acionando as animações CSS
// que mostram o formulário de cadastro e ocultam o de login.
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// Quando o usuário clica em "Entrar":
// remove a classe 'active', revertendo as animações CSS
// e voltando para a tela de login.
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});