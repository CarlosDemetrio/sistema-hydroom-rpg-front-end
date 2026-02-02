export const environment = {
  production: true,
  // API URL dinâmica - usa origin atual + /api/v1
  // Funciona em qualquer domínio sem hardcode
  apiUrl: window.location.origin + '/api/v1',
  backendUrl: window.location.origin // Em produção, backend e frontend no mesmo domínio
};
