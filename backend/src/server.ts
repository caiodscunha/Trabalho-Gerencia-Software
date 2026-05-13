import express, { Request, Response } from 'express';
import { login } from './controllers/authController';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: "Rota inválida" });
});

app.post('/login', login);

app.listen(PORT, () => {
  console.log(`Servidor executando em http://localhost:${PORT}`);
});
