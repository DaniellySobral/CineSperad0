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
// 0. CARREGAMENTO DOS DADOS DO USUÁRIO DA API
// ============================================================
const token = localStorage.getItem('cinesperado_token');
let isGoogleUser = false; // Flag para bloquear alteração de e-mail

document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/frontend/views/Login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Preenche o formulário com os dados reais
            document.getElementById('nome').value = userData.username || '';
            document.getElementById('email').value = userData.email || '';
            
            // Foto de perfil
            if (userData.picture_url) {
                document.getElementById('mainProfileImage').src = userData.picture_url;
            }

            // Tratamento especial para usuários do Google
            if (userData.is_google_user) {
                isGoogleUser = true;
                const emailInput = document.getElementById('email');
                const editEmailBtn = emailInput.nextElementSibling;
                
                editEmailBtn.style.display = 'none'; // Esconde botão de editar
                emailInput.title = 'Usuários do Google não podem alterar o e-mail.';
                emailInput.style.backgroundColor = '#e0e0e0'; // Indica bloqueio
            }
        } else {
            // Token inválido ou expirado
            localStorage.removeItem('cinesperado_token');
            localStorage.removeItem('cinesperado_username');
            localStorage.removeItem('cinesperado_picture');
            window.location.href = '/frontend/views/Login.html';
        }
    } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
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

// ─── Lógica de Recorte de Imagem (Cropper.js) ────────────────────────────────
let cropper = null;
const cropperModal = document.getElementById('cropperModal');
const imageToCrop = document.getElementById('imageToCrop');

/**
 * Escuta mudanças no input de arquivo. Quando o usuário escolhe uma imagem,
 * abre o modal de recorte e inicializa o Cropper.js.
 */
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageToCrop.src = e.target.result;
      cropperModal.style.display = 'flex';
      
      if (cropper) cropper.destroy();
      
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1, // Quadrado
        viewMode: 1,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    };
    reader.readAsDataURL(file);
  }
});

// ─── Botões do Modal de Recorte ─────────────────────────────────────────────

// Fecha o modal e limpa o cropper ao cancelar
document.getElementById('cancelCrop').addEventListener('click', () => {
    cropperModal.style.display = 'none';
    if (cropper) cropper.destroy();
    fileInput.value = ''; // Limpa o input
});

document.getElementById('closeModal').addEventListener('click', () => {
    cropperModal.style.display = 'none';
    if (cropper) cropper.destroy();
    fileInput.value = '';
});

document.getElementById('confirmCrop').addEventListener('click', () => {
    if (!cropper) return;
    
    // Obtém o canvas do recorte com qualidade alta
    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400
    });
    
    // Atualiza a imagem de perfil com o recorte em base64
    mainProfileImage.src = canvas.toDataURL('image/jpeg', 0.9);
    
    cropperModal.style.display = 'none';
    cropper.destroy();
    cropper = null;
});

// ─── Remover Foto de Perfil ──────────────────────────────────────────────────
const removePhotoBtn = document.getElementById('removePhoto');
const DEFAULT_PIC = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/**
 * Reseta a imagem de perfil para o avatar padrão.
 * Adiciona um atributo 'removed' para sinalizar ao backend que a foto antiga deve ser apagada.
 */
removePhotoBtn.addEventListener('click', () => {
    if (confirm("Deseja realmente remover sua foto de perfil?")) {
        mainProfileImage.src = DEFAULT_PIC;
        mainProfileImage.dataset.removed = "true";
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
// 5. SALVAR ALTERAÇÕES COM VALIDAÇÃO E ENVIO PARA A API
// ============================================================

saveButton.addEventListener('click', async () => {

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
    emailInput.classList.remove('error');
    emailError.style.display = 'none';
  }

  // ── Preparação do Payload para a API ────────────────────────────────────────

  // Pegamos a foto caso tenha sido alterada ou removida
  let picture_url = undefined; // undefined não será enviado se não houver mudança
  const currentImageSrc = document.getElementById('mainProfileImage').src;
  
  if (document.getElementById('mainProfileImage').dataset.removed === "true") {
      picture_url = null; // Backend interpreta null como "remover"
  } else if (currentImageSrc.startsWith('data:image')) {
      picture_url = currentImageSrc; // É um base64 local (novo recorte)
  }

  const payload = {
      username: document.getElementById('nome').value,
  };
  
  if (!isGoogleUser) {
      payload.email = emailInput.value;
  }
  
  // Só adiciona picture_url ao payload se ele foi alterado ou removido
  if (picture_url !== undefined) {
      payload.picture_url = picture_url;
  }

  try {
      saveButton.disabled = true;
      saveButton.textContent = 'Salvando...';

      const response = await fetch('http://localhost:8000/auth/me', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
          // Atualiza dados locais
          localStorage.setItem('cinesperado_username', result.username);
          if (result.picture_url) {
              localStorage.setItem('cinesperado_picture', result.picture_url);
          } else {
              localStorage.removeItem('cinesperado_picture');
          }
          
          // Limpa flag de remoção
          delete document.getElementById('mainProfileImage').dataset.removed;
      } else {
          // Exibe erro vindo do backend (Ex: Nome já existe, E-mail já existe)
          alert(result.detail || 'Erro ao salvar as configurações.');
          return; // Não executa o restante do código (bloqueio de inputs) se falhou
      }
  } catch (error) {
      console.error(error);
      alert('Erro de conexão ao salvar.');
  } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Salvar mudanças';
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