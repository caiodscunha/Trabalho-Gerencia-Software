# Trabalho-Gerencia-Software
# Calculadora de Câmbio — EXG

Trabalho da disciplina **Gerência de Configuração, Entrega e Integração Contínua** — Escola Politécnica, 1º Semestre de 2026.

API REST em Node.js para cálculo de câmbio de moedas estrangeiras, com autenticação por token, cálculo de IOF, spread e taxa de serviço.

---

## Estrutura do projeto

```
.
├── backend/          # API Node.js + TypeScript
│   ├── src/
│   │   ├── app.ts                        # Configuração Express e rotas
│   │   ├── server.ts                     # Ponto de entrada (listen)
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── currencyExchangeController.ts
│   │   └── services/
│   │       ├── authService.ts
│   │       └── currencyExchangeService.ts
│   └── tests/
│       ├── authService.test.ts           # Testes unitários de autenticação
│       ├── currencyExchangeService.test.ts # Testes unitários de câmbio
│       └── api.test.ts                   # Testes funcionais das rotas HTTP
└── .github/
    └── workflows/
        └── ci.yml                        # Pipeline CI/CD (GitHub Actions)
```

---

## Rodando a API localmente

```bash
cd backend
npm install
npm run dev     # http://localhost:3000
```

---

## Endpoints

Todas as rotas ficam sob o prefixo `/exg`.

### `GET /health`
Verifica se a API está no ar.

**Resposta:**
```json
{ "status": "ok", "timestamp": "2026-05-15T12:00:00.000Z", "endpoint": "EXG" }
```

---

### `POST /exg/login`
Autentica o usuário e retorna um token.

**Body:**
```json
{ "user": "adm", "password": "adm" }
```

**Resposta:**
```json
{ "token": "token-simulado-123" }
```

---

### `POST /exg/auth`
Valida se um token é válido.

**Body:**
```json
{ "token": "token-simulado-123" }
```

**Resposta:**
```json
{ "token": "token-simulado-123" }
```

---

### `GET /exg/listCurrency`
Lista as moedas disponíveis para câmbio.

**Resposta:**
```json
[
  { "codigo": "USD", "nome": "Dólar Americano", "cotacao_brl": 5.25, "spread": "1.5%" },
  { "codigo": "EUR", "nome": "Euro",            "cotacao_brl": 5.70, "spread": "2.0%" },
  { "codigo": "GBP", "nome": "Libra Esterlina", "cotacao_brl": 6.80, "spread": "2.5%" },
  { "codigo": "JPY", "nome": "Iene Japonês",    "cotacao_brl": 0.035,"spread": "3.0%" },
  { "codigo": "ARS", "nome": "Peso Argentino",  "cotacao_brl": 0.006,"spread": "5.0%" }
]
```

---

### `POST /exg/exchange`
Realiza o cálculo de câmbio. Requer token.

**Body:**
```json
{
  "token": "token-simulado-123",
  "currencyCode": "USD",
  "value": 1000,
  "type": "comercial"
}
```

- `type`: `"comercial"` (IOF 0,38%) ou `"turism"` (IOF 6,38%)

**Resposta:**
```json
{
  "tipo": "comercial",
  "moeda": { "codigo": "USD", "nome": "Dólar Americano" },
  "entrada_brl": 1000,
  "descontos": {
    "iof": 3.80,
    "iof_aliquota": "0.38%",
    "taxa_servico": 20.00,
    "spread": 15.00,
    "total": 38.80
  },
  "valor_efetivo_brl": 961.20,
  "cotacao": { "base": 5.25, "com_spread": 5.3288 },
  "valor_convertido": 180.3795
}
```

---

## Testes

```bash
cd backend
npm test
```

Roda os 3 suites de teste (92 testes no total) e gera relatório de cobertura:

| Suite | Tipo | Testes |
|---|---|---|
| `authService.test.ts` | Unitário | Validação de credenciais e token |
| `currencyExchangeService.test.ts` | Unitário | Cálculos de IOF, spread, taxa e conversão |
| `api.test.ts` | Funcional | Todas as rotas HTTP via supertest |

Cobertura atual: **99%**

---

## CI/CD

O pipeline roda automaticamente no GitHub Actions a cada push para `main` ou `develop`:

1. **detect-changes** — detecta se arquivos em `backend/` foram alterados
2. **test-backend** — instala dependências e roda os testes; publica `junit.xml` e relatório de cobertura como artefatos
3. **deploy-backend** — acionado apenas em push para `main`; chama o webhook configurado no secret `DEPLOY_HOOK`

Para ativar o deploy, adicione o secret `DEPLOY_HOOK` em **Settings - Secrets and variables - Actions** no repositório.
