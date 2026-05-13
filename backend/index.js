const express = require('express');

const app = express();
const PORT = 3000;

// Middleware para ler JSON no corpo das requisições
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: "Rota inválida" });
});

app.listen(PORT, () => {
  console.log(`Servidor executando em http://localhost:${PORT}`);
});