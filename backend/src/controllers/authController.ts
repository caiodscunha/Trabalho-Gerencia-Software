import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const login = (req: Request, res: Response) => {
  const { user, password } = req.body;

  if (!authService.validateCredentials(user, password)) {
    res.status(401).json({ erro: 'Credenciais inválidas' });
    return;
  }

  res.json({ token: authService.generateToken() });
};

export const auth = (req: Request, res: Response) => {
  const { token } = req.body;

  if (!authService.validateToken(token)) {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }

  res.json({ token });
};
