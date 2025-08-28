import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import fs from 'fs';

const app = express();

// Configurar proxy para o WineQuiz
const wineQuizProxy = createProxyMiddleware({
  target: 'http://localhost:3001', // Porta onde o WineQuizMobile_new está rodando
  changeOrigin: true,
  pathRewrite: {
    '^/vinhonarios/quiz': '', // Remove o prefixo /vinhonarios/quiz
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    if (res instanceof express.Response) {
      res.status(500).send('Wine Quiz service unavailable');
    }
  }
});

// Middleware para servir arquivos estáticos do WineQuiz se necessário
app.use('/vinhonarios/quiz/assets', express.static(path.join(__dirname, '../../WineQuizMobile_new/client/public')));

// Aplicar proxy para todas as rotas do quiz
app.use('/vinhonarios/quiz', wineQuizProxy);

export { wineQuizProxy, app as wineQuizApp };