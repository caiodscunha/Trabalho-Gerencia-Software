const VALID_USER     = 'adm';
const VALID_PASSWORD = 'adm';
const STATIC_TOKEN   = 'token-simulado-123';

export const validateCredentials = (user: string, password: string): boolean =>
  user === VALID_USER && password === VALID_PASSWORD;

export const generateToken = (): string =>
  STATIC_TOKEN;

export const validateToken = (token: string): boolean =>
  token === STATIC_TOKEN;
