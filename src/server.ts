import app from './app';
import { createServer, Server } from 'http';
import prisma from './config/prisma';
import { env } from './config/env';

const PORT = env.port;

const server: Server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Erro no servidor:', error);
});

// Graceful shutdown: encerra o servidor e desconecta o Prisma
const shutdown = async (signal: string) => {
  console.log(`\n${signal} recebido. Encerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
