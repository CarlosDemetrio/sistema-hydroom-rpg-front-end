export const environment = {
  production: true,
  // API URL dinamica - deriva do hostname do frontend
  // Frontend: domain.com → Backend: api.domain.com
  // Remove 'www.' se existir para montar o subdominio api.
  apiUrl: `https://api.${window.location.hostname.replace(/^www\./, '')}/api/v1`,
  backendUrl: `https://api.${window.location.hostname.replace(/^www\./, '')}`
};
