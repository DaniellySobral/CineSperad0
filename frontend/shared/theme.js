/**
 * theme.js
 * ---------
 * Script utilitário compartilhado — carregado em TODAS as páginas do site.
 *
 * Responsabilidade:
 *   Aplicar o tema (claro ou escuro) salvo pelo usuário nas Configurações.
 *   O tema é persistido no localStorage do navegador com a chave 'selectedTheme'.
 *
 * Valores possíveis para o tema:
 *   - 'light'  → Tema claro (padrão do site)
 *   - 'dark'   → Tema escuro (adiciona a classe CSS 'dark-theme' ao body)
 *   - 'system' → Segue a preferência do sistema operacional (padrão = claro)
 *
 * As variáveis CSS do tema escuro estão definidas em frontend/styles/utilitario.css
 * dentro do seletor body.dark-theme { ... }
 */

/**
 * Aplica o tema visualmente à página atual.
 * @param {string} themeName - Nome do tema: 'light', 'dark' ou 'system'
 */
function applyTheme(themeName) {
  const body = document.body;

  // Remove qualquer tema escuro anterior antes de aplicar o novo
  body.classList.remove('dark-theme');

  // Se o tema escolhido for escuro, adiciona a classe CSS correspondente
  if (themeName === 'dark') {
    body.classList.add('dark-theme');
  }

  // Para 'light' ou 'system', nenhuma classe é adicionada.
  // O tema claro é o padrão definido pelas variáveis CSS em utilitario.css.
}

// Aguarda o carregamento completo do DOM antes de verificar o tema salvo
document.addEventListener('DOMContentLoaded', () => {

  // Busca o tema que o usuário salvou anteriormente nas Configurações
  const savedTheme = localStorage.getItem('selectedTheme');

  // Se houver um tema salvo, aplica ele imediatamente para evitar flash de tema errado
  if (savedTheme) {
    applyTheme(savedTheme);
  }
});