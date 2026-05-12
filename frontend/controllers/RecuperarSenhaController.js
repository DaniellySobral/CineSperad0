/**
 * RecuperarSenhaController.js
 * ----------------------------
 * Responsável pelo fluxo de recuperação de senha.
 *
 * Funcionamento:
 *   A página possui dois containers (.config-container):
 *     - Índice 0: Tela de confirmação (exibida após o envio do e-mail)
 *     - Índice 1: Tela principal com o campo de e-mail (exibida inicialmente)
 *
 *   Ao clicar em "Enviar", o container principal é ocultado e o de confirmação é exibido,
 *   simulando o envio do link de recuperação por e-mail.
 *
 * Nota: A lógica real de envio de e-mail será implementada no backend (Python/FastAPI).
 */

document.addEventListener('DOMContentLoaded', function() {

    // Seleciona os dois containers da página pelo nome de classe
    const sendButton = document.querySelector('.send-password');   // Botão "Enviar link"
    const comebackButton = document.querySelector('.comeback');    // Botão "Voltar" (referência futura)
    const containers = document.querySelectorAll('.config-container'); // [0] = confirmação, [1] = formulário

    /**
     * Ao clicar em "Enviar":
     *   - Oculta o container do formulário (índice 1) removendo a classe 'ativo'
     *   - Exibe o container de confirmação (índice 0) adicionando a classe 'ativo'
     * Isso simula o envio do e-mail de recuperação sem comunicação com o servidor.
     */
    sendButton.addEventListener('click', function() {
        containers[1].classList.remove('ativo'); // Oculta formulário de e-mail
        containers[0].classList.add('ativo');    // Exibe mensagem de confirmação
    });

    /**
     * NOTA: O segundo listener abaixo estava usando 'sendButton' em vez de 'comebackButton'.
     * Isso faz com que um clique no botão "Enviar" execute as duas ações em sequência,
     * revertendo imediatamente para o estado inicial.
     * TODO: Corrigir para usar comebackButton quando o botão "Voltar" for implementado no HTML.
     */
    // sendButton.addEventListener('click', function() {
    //     containers[0].classList.remove('ativo');
    //     containers[1].classList.add('ativo');
    // });
});