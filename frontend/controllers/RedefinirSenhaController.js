/**
 * RedefinirSenhaController.js
 * ----------------------------
 * Gerencia a etapa final da recuperação de senha (criação da nova senha).
 * 
 * Funcionalidades cobertas:
 *   1. Extração automática do token JWT da URL da página.
 *   2. Validação de segurança (impede acesso sem token).
 *   3. Verificação de força de senha e coincidência de campos.
 *   4. Envio da nova senha para o backend para atualização definitiva.
 *
 * Dependências:
 *   - backend/controllers/auth_controller.py (Função reset_password)
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. SELEÇÃO DE ELEMENTOS E EXTRAÇÃO DO TOKEN
    // ============================================================
    
    const resetBtn = document.getElementById('resetBtn');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const errorMessage = document.getElementById('reset-error');

    // Captura os parâmetros da URL (ex: ?token=...)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Se não houver token, o acesso é negado e redirecionado
    if (!token) {
        alert("Token de recuperação não encontrado. Por favor, use o link enviado para o seu e-mail.");
        window.location.href = '/frontend/views/Login.html';
        return;
    }

    // ============================================================
    // 2. LÓGICA DE ATUALIZAÇÃO DE SENHA
    // ============================================================

    resetBtn.addEventListener('click', async function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Limpeza de estados de erro anteriores
        errorMessage.style.display = 'none';
        newPasswordInput.classList.remove('error');
        confirmPasswordInput.classList.remove('error');

        // Validação: Campos obrigatórios
        if (!newPassword || !confirmPassword) {
            errorMessage.textContent = "Por favor, preencha ambos os campos.";
            errorMessage.style.display = 'block';
            return;
        }

        // Validação: Comprimento mínimo
        if (newPassword.length < 6) {
            newPasswordInput.classList.add('error');
            errorMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
            errorMessage.style.display = 'block';
            return;
        }

        // Validação: Coincidência de senhas
        if (newPassword !== confirmPassword) {
            confirmPasswordInput.classList.add('error');
            errorMessage.textContent = "As senhas não coincidem.";
            errorMessage.style.display = 'block';
            return;
        }

        try {
            // Feedback visual de salvamento
            resetBtn.disabled = true;
            resetBtn.textContent = "Salvando...";

            // Chamada para o endpoint de reset
            const response = await fetch('http://localhost:8000/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    new_password: newPassword
                })
            });

            if (response.ok) {
                alert("Senha alterada com sucesso! Você já pode fazer login.");
                window.location.href = '/frontend/views/Login.html';
            } else {
                // Caso o token tenha expirado ou seja inválido
                const errorData = await response.json();
                alert(errorData.detail || "Erro ao redefinir a senha.");
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Erro de conexão ao servidor.");
        } finally {
            resetBtn.disabled = false;
            resetBtn.textContent = "Salvar nova senha";
        }
    });
});

