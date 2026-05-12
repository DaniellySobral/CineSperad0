// theme.js - Arquivo para controlar o tema do site

// Função que aplica o tema visualmente na página
function applyTheme(themeName) {
  const body = document.body;
  
  // Primeiro, remove a classe de tema escuro, para recomeçar
  body.classList.remove('dark-theme');

  // Se o tema escolhido for 'dark', adiciona a classe
  if (themeName === 'dark') {
    body.classList.add('dark-theme');
  }
  
  // Se for 'light' ou 'system', não faz nada, pois o padrão é o tema claro.
  // O navegador vai cuidar automaticamente do "Padrão do Sistema" se o SO do usuário for escuro.
}

// Espera a página carregar completamente para executar
document.addEventListener('DOMContentLoaded', () => {
  // Tenta buscar o tema que o usuário salvou anteriormente
  const savedTheme = localStorage.getItem('selectedTheme');
  
  // Se encontrou um tema salvo, aplica ele
  if (savedTheme) {
    applyTheme(savedTheme);
  }
});