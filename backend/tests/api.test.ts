import request from 'supertest';
import app from '../src/app';

const VALID_TOKEN = 'token-simulado-123';

describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('endpoint');
  });
});

describe('POST /exg/login', () => {
  it('deve retornar token com credenciais válidas', async () => {
    const res = await request(app).post('/exg/login').send({ user: 'adm', password: 'adm' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('deve retornar 401 com usuário errado', async () => {
    const res = await request(app).post('/exg/login').send({ user: 'errado', password: 'adm' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  it('deve retornar 401 com senha errada', async () => {
    const res = await request(app).post('/exg/login').send({ user: 'adm', password: 'errada' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  it('deve retornar 401 sem body', async () => {
    const res = await request(app).post('/exg/login').send({});
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /exg/auth', () => {
  it('deve validar token correto', async () => {
    const res = await request(app).post('/exg/auth').send({ token: VALID_TOKEN });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toBe(VALID_TOKEN);
  });

  it('deve retornar 401 para token inválido', async () => {
    const res = await request(app).post('/exg/auth').send({ token: 'token-errado' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  it('deve retornar 401 para token vazio', async () => {
    const res = await request(app).post('/exg/auth').send({ token: '' });
    expect(res.statusCode).toBe(401);
  });

  it('o token retornado pelo login deve ser aceito no auth', async () => {
    const loginRes = await request(app).post('/exg/login').send({ user: 'adm', password: 'adm' });
    const authRes = await request(app).post('/exg/auth').send({ token: loginRes.body.token });
    expect(authRes.statusCode).toBe(200);
  });
});

describe('GET /exg/listCurrency', () => {
  it('deve retornar lista de moedas', async () => {
    const res = await request(app).get('/exg/listCurrency');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('cada moeda deve ter os campos obrigatórios', async () => {
    const res = await request(app).get('/exg/listCurrency');
    for (const moeda of res.body) {
      expect(moeda).toHaveProperty('codigo');
      expect(moeda).toHaveProperty('nome');
      expect(moeda).toHaveProperty('cotacao_brl');
      expect(moeda).toHaveProperty('spread');
    }
  });

  it('deve conter USD, EUR e GBP', async () => {
    const res = await request(app).get('/exg/listCurrency');
    const codigos = res.body.map((m: { codigo: string }) => m.codigo);
    expect(codigos).toContain('USD');
    expect(codigos).toContain('EUR');
    expect(codigos).toContain('GBP');
  });

  it('cotacao_brl deve ser um número positivo', async () => {
    const res = await request(app).get('/exg/listCurrency');
    for (const moeda of res.body) {
      expect(typeof moeda.cotacao_brl).toBe('number');
      expect(moeda.cotacao_brl).toBeGreaterThan(0);
    }
  });
});

describe('POST /exg/exchange', () => {
  it('deve realizar câmbio USD comercial', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'USD',
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.tipo).toBe('comercial');
    expect(res.body.moeda.codigo).toBe('USD');
    expect(res.body).toHaveProperty('valor_convertido');
    expect(res.body.valor_convertido).toBeGreaterThan(0);
  });

  it('deve realizar câmbio EUR turismo', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'EUR',
      value: 500,
      type: 'turism',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.tipo).toBe('turism');
    expect(res.body.moeda.codigo).toBe('EUR');
  });

  it('câmbio turismo deve ter IOF maior que câmbio comercial', async () => {
    const base = { token: VALID_TOKEN, currencyCode: 'USD', value: 1000 };
    const comercial = await request(app).post('/exg/exchange').send({ ...base, type: 'comercial' });
    const turismo = await request(app).post('/exg/exchange').send({ ...base, type: 'turism' });
    expect(turismo.body.descontos.iof).toBeGreaterThan(comercial.body.descontos.iof);
  });

  it('resposta deve conter estrutura completa de descontos', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'USD',
      value: 1000,
      type: 'comercial',
    });
    expect(res.body.descontos).toHaveProperty('iof');
    expect(res.body.descontos).toHaveProperty('iof_aliquota');
    expect(res.body.descontos).toHaveProperty('taxa_servico');
    expect(res.body.descontos).toHaveProperty('spread');
    expect(res.body.descontos).toHaveProperty('total');
    expect(res.body).toHaveProperty('cotacao');
    expect(res.body).toHaveProperty('entrada_brl');
    expect(res.body).toHaveProperty('valor_efetivo_brl');
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).post('/exg/exchange').send({
      currencyCode: 'USD',
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(401);
  });

  it('deve retornar 401 com token inválido', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: 'token-errado',
      currencyCode: 'USD',
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(401);
  });

  it('deve retornar 400 sem currencyCode', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  it('deve retornar 400 com valor zero', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'USD',
      value: 0,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  it('deve retornar 400 com valor negativo', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'USD',
      value: -100,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  it('deve retornar 400 com tipo inválido', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'USD',
      value: 1000,
      type: 'invalido',
    });
    expect(res.statusCode).toBe(400);
  });

  it('deve retornar 404 para moeda inexistente', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'XYZ',
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(404);
  });

  it('deve aceitar currencyCode em minúsculo', async () => {
    const res = await request(app).post('/exg/exchange').send({
      token: VALID_TOKEN,
      currencyCode: 'usd',
      value: 1000,
      type: 'comercial',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.moeda.codigo).toBe('USD');
  });
});
