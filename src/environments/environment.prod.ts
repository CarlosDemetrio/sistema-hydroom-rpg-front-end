export const environment = {
  production: true,
  // API URL dinâmica - usa origin atual + /api
  // Funciona em qualquer domínio sem hardcode
  apiUrl: window.location.origin + '/api'
};
