import app from './app';
import prisma from './config/prisma';
import { createServer } from 'http';
import { env } from './config/env';
import { JwtUtil } from './utils/jwt.util';

const PORT = env.port;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
