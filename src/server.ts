import app from './app';
import { createServer } from 'http';
import { env } from './config/env';

const PORT = env.port;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
