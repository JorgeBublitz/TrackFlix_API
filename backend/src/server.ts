import app from './app';
import prisma from './config/prisma';
import { createServer } from 'http';
import { env } from './config/env';

const PORT = env.port || 3003;

// Cria o servidor HTTP usando o Express
const server = createServer(app);

// Inicializa o servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📘 Rotas base da API: http://localhost:${PORT}/api/auth/v1/users`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Função para encerramento gracioso (graceful shutdown)
const gracefulShutdown = async () => {
  console.log('\n🛑 Encerrando servidor...');

  // Fecha o servidor HTTP
  server.close(async () => {
    console.log('✅ Servidor HTTP encerrado');

    try {
      // Fecha a conexão com o Prisma
      await prisma.$disconnect();
      console.log('✅ Conexão com o banco de dados encerrada');
    } catch (err) {
      console.error('❌ Erro ao encerrar conexão com o banco:', err);
    }

    process.exit(0);
  });

  // Se travar, força encerramento após 10s
  setTimeout(() => {
    console.error('⚠️  Encerramento forçado após timeout');
    process.exit(1);
  }, 10_000);
};

// Captura sinais do sistema (Ctrl+C, kill, etc.)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Tratamento de erros globais
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});
