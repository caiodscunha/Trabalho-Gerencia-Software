import * as authService from '../src/services/authService';

describe('authService', () => {
  describe('validateCredentials', () => {
    it('retorna true para usuário e senha corretos', () => {
      expect(authService.validateCredentials('adm', 'adm')).toBe(true);
    });

    it('retorna false para usuário errado', () => {
      expect(authService.validateCredentials('outro', 'adm')).toBe(false);
    });

    it('retorna false para senha errada', () => {
      expect(authService.validateCredentials('adm', 'errada')).toBe(false);
    });

    it('retorna false para ambos errados', () => {
      expect(authService.validateCredentials('outro', 'errada')).toBe(false);
    });

    it('retorna false para strings vazias', () => {
      expect(authService.validateCredentials('', '')).toBe(false);
    });

    it('é case-sensitive', () => {
      expect(authService.validateCredentials('ADM', 'ADM')).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('retorna um token não vazio', () => {
      expect(authService.generateToken()).toBeTruthy();
    });

    it('retorna sempre o mesmo token', () => {
      expect(authService.generateToken()).toBe(authService.generateToken());
    });
  });

  describe('validateToken', () => {
    it('retorna true para o token válido', () => {
      const token = authService.generateToken();
      expect(authService.validateToken(token)).toBe(true);
    });

    it('retorna false para token inválido', () => {
      expect(authService.validateToken('token-errado')).toBe(false);
    });

    it('retorna false para string vazia', () => {
      expect(authService.validateToken('')).toBe(false);
    });

    it('retorna false para token com espaço extra', () => {
      const token = authService.generateToken();
      expect(authService.validateToken(` ${token}`)).toBe(false);
    });
  });
});
