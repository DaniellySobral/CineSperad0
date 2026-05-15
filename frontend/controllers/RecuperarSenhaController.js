/**
 * RecuperarSenhaController.js
 * ----------------------------
 * Gerencia o fluxo inicial de recuperação de senha (solicitação de e-mail).
 * 
 * Funcionalidades cobertas:
 *   1. Captura e validação do e-mail do usuário.
 *   2. Integração com o backend para geração e envio de link de recuperação.
 *   3. Alternância entre tela de formulário e tela de confirmação (Feedback Visual).
 *
 * Estrutura da Página:
 *   - A página HTML possui dois blocos (.config-container):
 *     - Índice 0: Formulário de entrada (E-mail).
 *     - Índice 1: Mensagem de sucesso/orientação após o envio.
 *
 * Dependências:
 *   - backend/controllers/auth_controller.py (Função request_password_reset)
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. SELEÇÃO DE ELEMENTOS E ESTADO INICIAL
    // ============================================================
    
    const sendButton = document.querySelector('.send-password');   
    const containers = document.querySelectorAll('.config-container'); 

    // ============================================================
    // 2. LÓGICA DE ENVIO DE SOLICITAÇÃO
    // ============================================================

    sendButton.addEventListener('click', async function() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value;
        const emailError = document.getElementById('email-error');
        
        // Validação básica de formato de e-mail
        if (!email || !email.includes('@')) {
            emailInput.classList.add('error');
            emailError.textContent = "Por favor, insira um e-mail válido.";
            emailError.style.display = 'block';
            return;
        }

        try {
            // Feedback visual de carregamento
            console.log("Enviando solicitação de recuperação para:", email);
            sendButton.disabled = true;
            sendButton.textContent = "Enviando...";

            // Chamada assíncrona para a API
            const response = await fetch('http://localhost:8000/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            console.log("Resposta do servidor:", response.status);

            if (response.ok) {
                // ============================================================
                // 3. TRANSIÇÃO DE TELA (SUCESSO)
                // ============================================================
                // Oculta o formulário e exibe a mensagem de confirmação
                containers[0].classList.remove('ativo'); 
                containers[1].classList.add('ativo');    
            } else {
                // Caso o servidor retorne algum erro (ex: e-mail inválido pelo Pydantic)
                const errorData = await response.json();
                alert(errorData.detail || "Erro ao solicitar recuperação de senha.");
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Erro de conexão ao servidor.");
        } finally {
            // Restaura o estado do botão independentemente do resultado
            sendButton.disabled = false;
            sendButton.textContent = "Enviar";
        }
    });

});