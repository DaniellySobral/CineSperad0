const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Quando o usuário clica em "Cadastre-se", adiciona a classe 'active' ao container. Isso aciona as animações no CSS para mostrar a tela de cadastro
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// Quando o usuário clica em "Entrar", remove a classe 'active' do container. Faz o container voltar para o modo de login
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});