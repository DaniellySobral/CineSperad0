/**
 * ConfiguracoesController.js
 * ---------------------------
 * Responsável por toda a lógica interativa da página de Configurações.
 *
 * Funcionalidades cobertas:
 *   1. Seleção de tema (claro / escuro / sistema) via radio buttons
 *   2. Botão de fechar a página (volta à página anterior)
 *   3. Troca da foto de perfil via upload de arquivo
 *   4. Habilitação dos campos de texto para edição (Nome e E-mail)
 *   5. Validação de e-mail e salvamento das alterações com notificação visual
 *
 * Dependências:
 *   - frontend/shared/theme.js → função applyTheme() usada para aplicar o tema
 *   - frontend/styles/configuracoes.css → estilos visuais dos elementos
 */


// ============================================================
// 1. SELEÇÃO DE TEMA
// ============================================================

// Seleciona todos os radio buttons do grupo de tema (system, light, dark)
const themeRadios = document.querySelectorAll('input[name="theme"]');

// Para cada radio button, observa quando o usuário muda a seleção
themeRadios.forEach(radio => {
  radio.addEventListener('change', () => {

    // Obtém o valor do radio selecionado: 'system', 'light' ou 'dark'
    const selectedTheme = radio.value;

    // Salva a escolha no localStorage para que seja lembrada em todas as páginas
    localStorage.setItem('selectedTheme', selectedTheme);

    // Aplica o tema visualmente na página atual (feedback imediato ao usuário)
    // A função applyTheme() está definida em frontend/shared/theme.js
    applyTheme(selectedTheme);
  });
});


// ============================================================
// 2. BOTÃO DE FECHAR CONFIGURAÇÕES
// ============================================================

// Seleciona o botão 'X' no canto superior direito da página
const closeSettingsBtn = document.querySelector('.close-settings-button');

// Ao clicar, volta para a página que o usuário estava antes de entrar em Configurações
closeSettingsBtn.addEventListener('click', () => {
  window.history.back();
});


// ============================================================
// 3. TROCA DA FOTO DE PERFIL
// ============================================================

// Seleciona a imagem de perfil exibida na tela
const mainProfileImage = document.getElementById('mainProfileImage');

// Seleciona o input de arquivo oculto (acionado ao clicar na foto)
const fileInput = document.getElementById('fileInput');

// Ao clicar na imagem de perfil, abre o seletor de arquivo do sistema
mainProfileImage.addEventListener('click', () => {
  fileInput.click();
});

// Quando o usuário seleciona uma nova foto:
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

  if (file) {
    // Usa a API FileReader para ler o arquivo como URL em base64
    const reader = new FileReader();

    // Quando a leitura terminar, atualiza o src da imagem de perfil
    reader.onload = (e) => {
      mainProfileImage.src = e.target.result;
    };

    reader.readAsDataURL(file); // Inicia a leitura do arquivo
  }
});


// ============================================================
// 4. HABILITAR EDIÇÃO DOS CAMPOS (NOME E E-MAIL)
// ============================================================

// Seleciona todos os botões "Editar" da página
const editButtons = document.querySelectorAll('.edit-button');

// Seleciona o botão "Salvar mudanças"
const saveButton = document.querySelector('.save-button');

// Para cada botão "Editar", configura o comportamento ao clicar
editButtons.forEach(button => {
  button.addEventListener('click', () => {

    // O input correspondente está imediatamente antes do botão no HTML
    const input = button.previousElementSibling;

    // Limpa qualquer estado de erro anterior ao iniciar uma nova edição
    input.classList.remove('error');
    document.getElementById('email-error').style.display = 'none';

    // Habilita o campo para edição (remove o atributo readonly)
    input.removeAttribute('readonly');
    input.style.backgroundColor = 'white';
    input.style.cursor = 'text';

    // Coloca o foco no campo e seleciona o texto para facilitar a edição
    input.focus();
    input.select();

    // Desabilita o botão "Editar" para evitar cliques duplicados durante a edição
    button.disabled = true;
    button.textContent = 'Editando...';
  });
});


// ============================================================
// 5. SALVAR ALTERAÇÕES COM VALIDAÇÃO
// ============================================================

saveButton.addEventListener('click', () => {

  // ── Validação do campo E-mail ──────────────────────────────────────────────

  const emailInput = document.getElementById('email');         // Campo de e-mail
  const emailError = document.getElementById('email-error');  // Elemento de mensagem de erro

  // Expressão regular simples para validar formato de e-mail (ex: usuario@dominio.com)
  const emailRegex = /^\S+@\S+\.\S+$/;

  // Verifica se o valor digitado NÃO corresponde ao formato válido
  if (!emailRegex.test(emailInput.value)) {

    // Exibe o estado de erro no campo e mostra a mensagem abaixo dele
    emailInput.classList.add('error');
    emailError.textContent = 'Por favor, insira um e-mail válido.';
    emailError.style.display = 'block';

    // Interrompe o salvamento — o usuário deve corrigir o e-mail antes
    return;
  } else {
    // E-mail válido: limpa qualquer indicação de erro anterior
    emailInput.classList.remove('error');
    emailError.style.display = 'none';
  }

  // ── Bloqueio dos campos após salvar ───────────────────────────────────────

  // Torna todos os inputs somente-leitura novamente (estado padrão após salvar)
  const allInputs = document.querySelectorAll('.custom-input');
  allInputs.forEach(input => {
    input.setAttribute('readonly', true);
    input.style.backgroundColor = '#f9f9f9';
    input.style.cursor = 'not-allowed';
  });

  // Reabilita todos os botões "Editar" e restaura o texto original
  editButtons.forEach(button => {
    button.disabled = false;
    button.textContent = 'Editar';
  });

  // ── Notificação de sucesso ─────────────────────────────────────────────────

  // Cria um elemento de notificação dinamicamente e o insere no topo da tela
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = 'Alterações salvas com sucesso!';

  // Estilos inline para posicionar a notificação no canto superior direito
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#5b0013';
  notification.style.color = 'white';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '2000';
  notification.style.transform = 'translateX(120%)'; // Começa fora da tela (direita)
  notification.style.transition = 'transform 0.3s ease';

  document.body.appendChild(notification);

  // Anima a entrada da notificação (desliza da direita para dentro da tela)
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Anima a saída e remove o elemento após 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)'; // Desliza de volta para fora
    setTimeout(() => {
      document.body.removeChild(notification); // Remove o elemento do DOM
    }, 300); // Aguarda a animação de saída terminar
  }, 3000);
});