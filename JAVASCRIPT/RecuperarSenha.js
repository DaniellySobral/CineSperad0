// LÓGICA PARA ESCONDER UM CONTAINER PARA APARECER O OUTRO COM A MENSAGEM DE QUE O LINK DE RECUPERAÇÃO DE SENHA FOI ENVIADO.
  document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os botões e containers usando as classes existentes
    const sendButton = document.querySelector('.send-password');
    const comebackButton = document.querySelector('.comeback');
    const containers = document.querySelectorAll('.config-container');
    
    // Adiciona evento de clique ao botão "Enviar"
    sendButton.addEventListener('click', function() {
      // Remove a classe "ativo" do segundo container (índice 1)
      containers[1].classList.remove('ativo');
      
      // Adiciona a classe "ativo" ao primeiro container (índice 0)
      containers[0].classList.add('ativo');
    });
    
    // Adiciona evento de clique ao botão "Voltar"
    sendButton.addEventListener('click', function() {
      // Remove a classe "ativo" do primeiro container (índice 0)
      containers[0].classList.remove('ativo');
      
      // Adiciona a classe "ativo" ao segundo container (índice 1)
      containers[1].classList.add('ativo');
    });
  });