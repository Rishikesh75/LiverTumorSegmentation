export const ROUTES = {
  home: '/',
  login: '/login',
  models: '/models',
  upload: (productId: string) => `/upload/${productId}`,
} as const

export const PUBLIC_ROUTES = [ROUTES.login] as const

export const PROTECTED_ROUTE_PREFIXES = ['/models', '/upload'] as const
