import { Request, Response } from 'express';

export const login = (req: Request, res: Response) => {
  const { user, password } = req.body;

  if (user !== 'adm' || password !== 'adm') {
    res.status(401).json({ erro: 'Credenciais inválidas' });
    return;
  }

  res.json({ token: 'token-simulado-123' });
};
