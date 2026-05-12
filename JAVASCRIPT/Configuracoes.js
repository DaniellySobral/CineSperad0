// Pega todos os botões de rádio do tema
const themeRadios = document.querySelectorAll('input[name="theme"]');

// Adiciona um "ouvinte" de evento para cada botão
themeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    // Pega o valor do botão que foi clicado ('system', 'light' ou 'dark')
    const selectedTheme = radio.value;
    
    // 1. Salva a escolha do usuário no "armazenamento local" do navegador
    localStorage.setItem('selectedTheme', selectedTheme);
    
    // 2. Aplica o tema na página atual para feedback instantâneo
    applyTheme(selectedTheme);
  });
});



// ==========================================
// LÓGICA PARA FECHAR A PÁGINA DE CONFIGURAÇÕES
// ==========================================

const closeSettingsBtn = document.querySelector('.close-settings-button');

closeSettingsBtn.addEventListener('click', () => {
  // Redireciona o usuário de volta para a página anterior
  window.history.back();
});

// ==========================================
// LÓGICA PARA TROCAR A IMAGEM DE PERFIL
// ==========================================

const mainProfileImage = document.getElementById('mainProfileImage');
const fileInput = document.getElementById('fileInput');

mainProfileImage.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      mainProfileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});


// ==========================================
// LÓGICA PARA EDITAR OS CAMPOS (NOME E E-MAIL)
// ==========================================

const editButtons = document.querySelectorAll('.edit-button');
const saveButton = document.querySelector('.save-button');

// Para cada botão "Editar", adiciona um evento de clique
editButtons.forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;

    // Limpa qualquer erro anterior ao começar a editar
    input.classList.remove('error');
    document.getElementById('email-error').style.display = 'none';

    input.removeAttribute('readonly');
    input.style.backgroundColor = 'white';
    input.style.cursor = 'text';
    input.focus();
    input.select();
    
    button.disabled = true;
    button.textContent = 'Editando...';
  });
});


// ==========================================
// LÓGICA PARA SALVAR AS DEMAIS MUDANÇAS
// ==========================================

saveButton.addEventListener('click', () => {
  // --- INÍCIO DA VALIDAÇÃO DE E-MAIL ---
  
  // 1. Seleciona o campo de e-mail e a mensagem de erro
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  
  // 2. Expressão regular para validar o formato do e-mail
  const emailRegex = /^\S+@\S+\.\S+$/;
  
  // 3. Verifica se o valor do e-mail não corresponde ao formato válido
  if (!emailRegex.test(emailInput.value)) {
    // Se for inválido:
    emailInput.classList.add('error'); // Adiciona a classe de erro ao input
    emailError.textContent = 'Por favor, insira um e-mail válido.'; // Define a mensagem de erro
    emailError.style.display = 'block'; // Mostra a mensagem de erro
    
    // Interrompe a função para não salvar os dados
    return;
  } else {
    // Se for válido, limpa qualquer erro anterior
    emailInput.classList.remove('error');
    emailError.style.display = 'none';
  }
  
  // --- FIM DA VALIDAÇÃO ---


  // Se a validação passar, continua com o salvamento
  const allInputs = document.querySelectorAll('.custom-input');
  allInputs.forEach(input => {
    input.setAttribute('readonly', true);
    input.style.backgroundColor = '#f9f9f9';
    input.style.cursor = 'not-allowed';
  });

  editButtons.forEach(button => {
    button.disabled = false;
    button.textContent = 'Editar';
  });

  // Exibe a notificação de sucesso
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = 'Alterações salvas com sucesso!';
  
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#5b0013';
  notification.style.color = 'white';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '2000';
  notification.style.transform = 'translateX(120%)';
  notification.style.transition = 'transform 0.3s ease';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
});