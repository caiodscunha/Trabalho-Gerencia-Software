const currencies: Record<string, { nome: string; cotacao: number; spread: number }> = {
  USD: { nome: 'Dólar Americano', cotacao: 5.25,  spread: 0.015 },
  EUR: { nome: 'Euro',            cotacao: 5.70,  spread: 0.020 },
  GBP: { nome: 'Libra Esterlina', cotacao: 6.80,  spread: 0.025 },
  JPY: { nome: 'Iene Japonês',    cotacao: 0.035, spread: 0.030 },
  ARS: { nome: 'Peso Argentino',  cotacao: 0.006, spread: 0.050 },
};

const IOF: Record<string, number> = {
  comercial: 0.0038,
  turism:    0.0638,
};

const SERVICE_TAX = 0.02;

export const getCurrency = (codigo: string) =>
  currencies[codigo.toUpperCase()] ?? null;

export const getAvailableCurrencies = () =>
  Object.entries(currencies).map(([codigo, dados]) => ({
    codigo,
    nome:        dados.nome,
    cotacao_brl: dados.cotacao,
    spread:      `${(dados.spread * 100).toFixed(1)}%`,
  }));

export const isValidType = (tipo: string) =>
  tipo in IOF;

export const calcularIOF = (valor: number, tipo: string) => {
  const aliquota = IOF[tipo];
  return { valor: valor * aliquota, aliquota };
};

export const calcularTaxaServico = (valor: number) =>
  valor * SERVICE_TAX;

export const calcularSpread = (valor: number, spread: number) =>
  valor * spread;

export const calcularConversao = (valor: number, codigo: string, tipo: string) => {
  const moeda = getCurrency(codigo);
  if (!moeda) throw new Error(`Moeda "${codigo}" não encontrada`);

  const iof              = calcularIOF(valor, tipo);
  const taxaServico      = calcularTaxaServico(valor);
  const spread           = calcularSpread(valor, moeda.spread);
  const totalDescontado  = iof.valor + taxaServico + spread;
  const valorEfetivo     = valor - totalDescontado;
  const cotacaoComSpread = moeda.cotacao * (1 + moeda.spread);
  const valorConvertido  = valorEfetivo / cotacaoComSpread;

  return {
    tipo,
    moeda:      { codigo: codigo.toUpperCase(), nome: moeda.nome },
    entrada_brl: valor,
    descontos: {
      iof:          parseFloat(iof.valor.toFixed(2)),
      iof_aliquota: `${(iof.aliquota * 100).toFixed(2)}%`,
      taxa_servico: parseFloat(taxaServico.toFixed(2)),
      spread:       parseFloat(spread.toFixed(2)),
      total:        parseFloat(totalDescontado.toFixed(2)),
    },
    valor_efetivo_brl: parseFloat(valorEfetivo.toFixed(2)),
    cotacao: {
      base:       moeda!.cotacao,
      com_spread: parseFloat(cotacaoComSpread.toFixed(4)),
    },
    valor_convertido: parseFloat(valorConvertido.toFixed(4)),
  };
};
