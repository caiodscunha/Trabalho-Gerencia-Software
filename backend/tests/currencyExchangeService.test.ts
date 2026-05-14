import * as currencyExchangeService from '../src/services/currencyExchangeService';

describe('currencyExchangeService', () => {
  describe('getCurrency', () => {
    it('retorna a moeda para código válido em maiúsculo', () => {
      const moeda = currencyExchangeService.getCurrency('USD');
      expect(moeda).not.toBeNull();
      expect(moeda?.nome).toBe('Dólar Americano');
    });

    it('retorna a moeda para código válido em minúsculo', () => {
      const moeda = currencyExchangeService.getCurrency('eur');
      expect(moeda).not.toBeNull();
      expect(moeda?.nome).toBe('Euro');
    });

    it('retorna null para código inexistente', () => {
      expect(currencyExchangeService.getCurrency('XYZ')).toBeNull();
    });

    it('retorna null para string vazia', () => {
      expect(currencyExchangeService.getCurrency('')).toBeNull();
    });
  });

  describe('getAvailableCurrencies', () => {
    it('retorna exatamente 5 moedas', () => {
      expect(currencyExchangeService.getAvailableCurrencies()).toHaveLength(5);
    });

    it('contém USD, EUR, GBP, JPY e ARS', () => {
      const codigos = currencyExchangeService.getAvailableCurrencies().map(m => m.codigo);
      expect(codigos).toEqual(expect.arrayContaining(['USD', 'EUR', 'GBP', 'JPY', 'ARS']));
    });

    it('cada moeda tem codigo, nome, cotacao_brl e spread', () => {
      const lista = currencyExchangeService.getAvailableCurrencies();
      lista.forEach((moeda) => {
        expect(moeda).toHaveProperty('codigo');
        expect(moeda).toHaveProperty('nome');
        expect(moeda).toHaveProperty('cotacao_brl');
        expect(moeda).toHaveProperty('spread');
      });
    });

    it('retorna os valores corretos para USD', () => {
      const usd = currencyExchangeService.getAvailableCurrencies().find(m => m.codigo === 'USD');
      expect(usd?.cotacao_brl).toBe(5.25);
      expect(usd?.spread).toBe('1.5%');
    });

    it('retorna os valores corretos para ARS', () => {
      const ars = currencyExchangeService.getAvailableCurrencies().find(m => m.codigo === 'ARS');
      expect(ars?.cotacao_brl).toBe(0.006);
      expect(ars?.spread).toBe('5.0%');
    });

    it('spread é formatado como percentual', () => {
      const lista = currencyExchangeService.getAvailableCurrencies();
      lista.forEach((moeda) => {
        expect(moeda.spread).toMatch(/^\d+\.\d+%$/);
      });
    });
  });

  describe('isValidType', () => {
    it('retorna true para "comercial"', () => {
      expect(currencyExchangeService.isValidType('comercial')).toBe(true);
    });

    it('retorna true para "turism"', () => {
      expect(currencyExchangeService.isValidType('turism')).toBe(true);
    });

    it('retorna false para tipo inexistente', () => {
      expect(currencyExchangeService.isValidType('pessoal')).toBe(false);
    });

    it('retorna false para string vazia', () => {
      expect(currencyExchangeService.isValidType('')).toBe(false);
    });
  });

  describe('calcularIOF', () => {
    it('aplica alíquota exata de 0.38% para comercial', () => {
      const resultado = currencyExchangeService.calcularIOF(1000, 'comercial');
      expect(resultado.aliquota).toBe(0.0038);
      expect(resultado.valor).toBe(3.8);
    });

    it('aplica alíquota exata de 6.38% para turism', () => {
      const resultado = currencyExchangeService.calcularIOF(1000, 'turism');
      expect(resultado.aliquota).toBe(0.0638);
      expect(resultado.valor).toBe(63.8);
    });

    it('calcula corretamente para R$500 comercial: 500 × 0.38% = R$1.90', () => {
      const resultado = currencyExchangeService.calcularIOF(500, 'comercial');
      expect(resultado.valor).toBeCloseTo(1.9, 10);
    });

    it('calcula corretamente para R$2500 turism: 2500 × 6.38% = R$159.50', () => {
      const resultado = currencyExchangeService.calcularIOF(2500, 'turism');
      expect(resultado.valor).toBeCloseTo(159.5, 10);
    });

    it('IOF de turism é ~16.8× maior que comercial', () => {
      const comercial = currencyExchangeService.calcularIOF(1000, 'comercial');
      const turism    = currencyExchangeService.calcularIOF(1000, 'turism');
      expect(turism.valor / comercial.valor).toBeCloseTo(0.0638 / 0.0038, 5);
    });

    it('IOF é zero para valor zero', () => {
      expect(currencyExchangeService.calcularIOF(0, 'comercial').valor).toBe(0);
      expect(currencyExchangeService.calcularIOF(0, 'turism').valor).toBe(0);
    });

    it('lança erro para valor negativo', () => {
      expect(() => currencyExchangeService.calcularIOF(-100, 'comercial'))
        .toThrow('Valor não pode ser negativo');
    });

    it('lança erro para tipo inválido', () => {
      expect(() => currencyExchangeService.calcularIOF(1000, 'pessoal'))
        .toThrow('Tipo "pessoal" inválido');
    });

    it('lança erro para tipo vazio', () => {
      expect(() => currencyExchangeService.calcularIOF(1000, ''))
        .toThrow('Tipo "" inválido');
    });
  });

  describe('calcularTaxaServico', () => {
    it('R$1000 → R$20.00 (2%)', () => {
      expect(currencyExchangeService.calcularTaxaServico(1000)).toBe(20);
    });

    it('R$250 → R$5.00 (2%)', () => {
      expect(currencyExchangeService.calcularTaxaServico(250)).toBe(5);
    });

    it('R$1500 → R$30.00 (2%)', () => {
      expect(currencyExchangeService.calcularTaxaServico(1500)).toBe(30);
    });

    it('retorna zero para valor zero', () => {
      expect(currencyExchangeService.calcularTaxaServico(0)).toBe(0);
    });

    it('dobrar o valor dobra a taxa', () => {
      const taxa1000 = currencyExchangeService.calcularTaxaServico(1000);
      const taxa2000 = currencyExchangeService.calcularTaxaServico(2000);
      expect(taxa2000).toBe(taxa1000 * 2);
    });

    it('lança erro para valor negativo', () => {
      expect(() => currencyExchangeService.calcularTaxaServico(-500))
        .toThrow('Valor não pode ser negativo');
    });
  });

  describe('calcularSpread', () => {
    it('R$1000 com spread USD (1.5%) → R$15.00', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0.015)).toBe(15);
    });

    it('R$1000 com spread EUR (2.0%) → R$20.00', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0.020)).toBe(20);
    });

    it('R$1000 com spread GBP (2.5%) → R$25.00', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0.025)).toBe(25);
    });

    it('R$1000 com spread JPY (3.0%) → R$30.00', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0.030)).toBe(30);
    });

    it('R$1000 com spread ARS (5.0%) → R$50.00', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0.050)).toBe(50);
    });

    it('retorna zero para valor zero', () => {
      expect(currencyExchangeService.calcularSpread(0, 0.015)).toBe(0);
    });

    it('retorna zero para spread zero', () => {
      expect(currencyExchangeService.calcularSpread(1000, 0)).toBe(0);
    });

    it('lança erro para valor negativo', () => {
      expect(() => currencyExchangeService.calcularSpread(-100, 0.015))
        .toThrow('Valor não pode ser negativo');
    });

    it('lança erro para spread negativo', () => {
      expect(() => currencyExchangeService.calcularSpread(1000, -0.015))
        .toThrow('Spread não pode ser negativo');
    });
  });

  describe('calcularConversao', () => {
    // USD comercial: IOF=3.80, taxa=20.00, spread=15.00, total=38.80
    // efetivo=961.20, cotação=5.25×1.015=5.3288, convertido=961.20/5.3288=180.38
    it('USD comercial R$1000: descontos corretos', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'comercial');
      expect(r.descontos.iof).toBe(3.8);
      expect(r.descontos.taxa_servico).toBe(20);
      expect(r.descontos.spread).toBe(15);
      expect(r.descontos.total).toBe(38.8);
    });

    it('USD comercial R$1000: valor efetivo = R$961.20', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'comercial');
      expect(r.valor_efetivo_brl).toBe(961.2);
    });

    it('USD comercial R$1000: cotação base=5.25, com spread≈5.3288', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'comercial');
      expect(r.cotacao.base).toBe(5.25);
      // 5.25 × 1.015 em ponto flutuante resulta em 5.3287 após toFixed(4)
      expect(r.cotacao.com_spread).toBeCloseTo(5.32875, 3);
    });

    it('USD comercial R$1000: valor convertido = 180.38 USD', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'comercial');
      expect(r.valor_convertido).toBe(180.38);
    });

    // USD turism: IOF=63.80, taxa=20.00, spread=15.00, total=98.80
    // efetivo=901.20, convertido=901.20/5.3288=169.12
    it('USD turism R$1000: IOF = R$63.80', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'turism');
      expect(r.descontos.iof).toBe(63.8);
      expect(r.descontos.total).toBe(98.8);
    });

    it('USD turism R$1000: valor convertido ≈ 169.12 USD', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'USD', 'turism');
      // 901.20 / 5.3288 = 169.1203 após toFixed(4)
      expect(r.valor_convertido).toBe(169.1203);
    });

    // EUR comercial: spread=20.00, total=43.80, efetivo=956.20
    // cotação=5.70×1.02=5.814, convertido=956.20/5.814=164.47
    it('EUR comercial R$1000: descontos corretos', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'EUR', 'comercial');
      expect(r.descontos.spread).toBe(20);
      expect(r.descontos.total).toBe(43.8);
      expect(r.valor_efetivo_brl).toBe(956.2);
    });

    it('EUR comercial R$1000: cotação com spread = 5.814', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'EUR', 'comercial');
      expect(r.cotacao.com_spread).toBe(5.814);
    });

    // GBP comercial: spread=25.00, total=48.80, efetivo=951.20
    // cotação=6.80×1.025=6.97, convertido=951.20/6.97=136.47
    it('GBP comercial R$1000: descontos corretos', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'GBP', 'comercial');
      expect(r.descontos.spread).toBe(25);
      expect(r.descontos.total).toBe(48.8);
      expect(r.cotacao.com_spread).toBe(6.97);
    });

    // ARS comercial: spread=50.00, total=73.80, efetivo=926.20
    // cotação=0.006×1.05=0.0063, convertido=926.20/0.0063=147015.87
    it('ARS comercial R$1000: spread alto (5%) = R$50.00', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'ARS', 'comercial');
      expect(r.descontos.spread).toBe(50);
      expect(r.descontos.total).toBe(73.8);
    });

    it('turism tem mais desconto que comercial para qualquer moeda', () => {
      ['USD', 'EUR', 'GBP', 'JPY', 'ARS'].forEach((codigo) => {
        const comercial = currencyExchangeService.calcularConversao(1000, codigo, 'comercial');
        const turism    = currencyExchangeService.calcularConversao(1000, codigo, 'turism');
        expect(turism.descontos.total).toBeGreaterThan(comercial.descontos.total);
        expect(turism.valor_convertido).toBeLessThan(comercial.valor_convertido);
      });
    });

    it('alíquota de IOF aparece correta na resposta', () => {
      const comercial = currencyExchangeService.calcularConversao(1000, 'USD', 'comercial');
      const turism    = currencyExchangeService.calcularConversao(1000, 'USD', 'turism');
      expect(comercial.descontos.iof_aliquota).toBe('0.38%');
      expect(turism.descontos.iof_aliquota).toBe('6.38%');
    });

    it('código da moeda é retornado em maiúsculo', () => {
      const r = currencyExchangeService.calcularConversao(1000, 'usd', 'comercial');
      expect(r.moeda.codigo).toBe('USD');
    });

    it('lança erro para moeda inexistente', () => {
      expect(() =>
        currencyExchangeService.calcularConversao(1000, 'XYZ', 'comercial')
      ).toThrow('Moeda "XYZ" não encontrada');
    });

    it('lança erro para valor negativo', () => {
      expect(() =>
        currencyExchangeService.calcularConversao(-100, 'USD', 'comercial')
      ).toThrow('Valor deve ser maior que zero');
    });

    it('lança erro para valor zero', () => {
      expect(() =>
        currencyExchangeService.calcularConversao(0, 'USD', 'comercial')
      ).toThrow('Valor deve ser maior que zero');
    });

    it('lança erro para tipo inválido', () => {
      expect(() =>
        currencyExchangeService.calcularConversao(1000, 'USD', 'pessoal')
      ).toThrow('Tipo "pessoal" inválido');
    });
  });
});
