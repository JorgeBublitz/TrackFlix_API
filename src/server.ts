import app from './app';
import { createServer } from 'http';
import { env } from './config/env';

const PORT = process.env.PORT || env.port || 3000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Erro no servidor:', error);
});