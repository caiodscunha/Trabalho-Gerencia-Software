import express, { Request, Response } from 'express';
import { auth, login } from './controllers/authController';
import { exchangeCurrency, listCurrency } from './controllers/currencyExchangeController';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: "Rota inválida" });
});

app.post('/login', login);

app.post('/auth', auth);

app.get('/listCurrency', listCurrency);

app.post('/exchange', exchangeCurrency);

app.listen(PORT, () => {
  console.log(`Servidor executando em http://localhost:${PORT}`);
});
