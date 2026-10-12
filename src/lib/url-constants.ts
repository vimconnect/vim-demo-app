export const VIM_BACKEND_URLS = {
  local: 'http://localhost:3000',
  staging: 'https://api.stage.getvim.ai',
  production: 'https://api.getvim.ai',
} as const;

export const APP_URLS = {
  local: 'http://localhost:8080',
  staging: 'http://localhost:8080',
  production: 'https://demo.getvim.ai',
} as const;
export const DEVELOPER_DOCS_URLS = {
  local: 'https://developer-docs.stage.getvim.ai/docs/',
  staging: 'https://developer-docs.stage.getvim.ai/docs/',
  production: 'https://developer-docs.getvim.ai/docs/',
} as const;
