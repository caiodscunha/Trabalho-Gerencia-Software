import { Request, Response } from 'express';

const currencies: Record<string, { nome: string; cotacao: number; spread: number }> = {
  USD: { nome: 'Dólar Americano', cotacao: 5.25,  spread: 0.015 }, 
  EUR: { nome: 'Euro',            cotacao: 5.70,  spread: 0.020 }, 
  GBP: { nome: 'Libra Esterlina', cotacao: 6.80,  spread: 0.025 }, 
  JPY: { nome: 'Iene Japonês',    cotacao: 0.035, spread: 0.030 }, 
  ARS: { nome: 'Peso Argentino',  cotacao: 0.006, spread: 0.050 }, 
};

const IOF: Record<string, number> = {
  comercial: 0.0038, 
  turism:   0.0638, 
};

const SERVICE_TAX = 0.02;

export const exchangeCurrency = (req: Request, res: Response) => {
  const { currencyCode, value, type, token } = req.body;

  if (token !== 'token-simulado-123') {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }

  if (!currencyCode || value === undefined || !type) {
    res.status(400).json({ erro: 'Informe "codigo", "valor" e "tipo" (turism | comercial)' });
    return;
  }

  const tipoNormalizado = String(type).toLowerCase();
  if (!IOF[tipoNormalizado]) {
    res.status(400).json({ erro: '"tipo" deve ser "turismo" ou "comercial"' });
    return;
  }

  const moeda = currencies[String(currencyCode).toUpperCase()];
  if (!moeda) {
    res.status(404).json({
      erro: `Moeda "${currencyCode}" não encontrada`,
      moedas_disponiveis: Object.keys(currencies),
    });
    return;
  }

  if (typeof value !== 'number' || value <= 0) {
    res.status(400).json({ erro: '"valor" deve ser um número positivo' });
    return;
  }

  const aliquotaIOF      = IOF[tipoNormalizado];
  const valorIOF         = value * aliquotaIOF;
  const valorTaxaServico = value * SERVICE_TAX;
  const valorSpread      = value * moeda.spread;
  const totalDescontado  = valorIOF + valorTaxaServico + valorSpread;
  const valorEfetivo     = value - totalDescontado;
  const cotacaoComSpread = moeda.cotacao * (1 + moeda.spread);
  const valorConvertido  = valorEfetivo / cotacaoComSpread;

  res.json({
    tipo: tipoNormalizado,
    moeda: { codigo: currencyCode.toUpperCase(), nome: moeda.nome },
    entrada_brl: value,
    descontos: {
      iof:           parseFloat(valorIOF.toFixed(2)),
      iof_aliquota:  `${(aliquotaIOF * 100).toFixed(2)}%`,
      taxa_servico:  parseFloat(valorTaxaServico.toFixed(2)),
      spread:        parseFloat(valorSpread.toFixed(2)),
      total:         parseFloat(totalDescontado.toFixed(2)),
    },
    valor_efetivo_brl: parseFloat(valorEfetivo.toFixed(2)),
    cotacao: {
      base:        moeda.cotacao,
      com_spread:  parseFloat(cotacaoComSpread.toFixed(4)),
    },
    valor_convertido: parseFloat(valorConvertido.toFixed(4)),
  });
};

export const listCurrency = (req: Request, res: Response) => {
  const { token } = req.body;

  if (token !== 'token-simulado-123') {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }

  const lista = Object.entries(currencies).map(([codigo, dados]) => ({
    codigo,
    nome: dados.nome,
    cotacao_brl: dados.cotacao,
    spread: `${(dados.spread * 100).toFixed(1)}%`,
  }));
  res.json(lista);
};
