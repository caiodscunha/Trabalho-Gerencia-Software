import { Request, Response } from 'express';
import * as currencyExchangeService from '../services/currencyExchangeService';
import * as authService from '../services/authService';

export const exchangeCurrency = (req: Request, res: Response) => {
  const { currencyCode, value, type, token } = req.body;

  if (!authService.validateToken(token)) {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }

  if (!currencyCode || value === undefined || !type) {
    res.status(400).json({ erro: 'Informe "currencyCode", "value" e "type" (turism | comercial)' });
    return;
  }

  if (typeof value !== 'number' || value <= 0) {
    res.status(400).json({ erro: '"value" deve ser um número positivo' });
    return;
  }

  const tipoNormalizado = String(type).toLowerCase();
  if (!currencyExchangeService.isValidType(tipoNormalizado)) {
    res.status(400).json({ erro: '"type" deve ser "turism" ou "comercial"' });
    return;
  }

  const moeda = currencyExchangeService.getCurrency(currencyCode);
  if (!moeda) {
    res.status(404).json({ erro: `Moeda "${currencyCode}" não encontrada` });
    return;
  }

  res.json(currencyExchangeService.calcularConversao(value, currencyCode, tipoNormalizado));
};

export const listCurrency = (_req: Request, res: Response) => {
  res.json(currencyExchangeService.getAvailableCurrencies());
};
