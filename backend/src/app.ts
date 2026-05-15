import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { auth, login } from './controllers/authController';
import { exchangeCurrency, listCurrency } from './controllers/currencyExchangeController';

const app = express();
const router = Router();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), endpoint: 'EXG' });
});

router.get('/', (_req: Request, res: Response) => {
  res.json({ mensagem: 'Rota inválida' });
});

router.post('/login', login);
router.post('/auth', auth);
router.get('/listCurrency', listCurrency);
router.post('/exchange', exchangeCurrency);

app.use('/exg', router);

export default app;
