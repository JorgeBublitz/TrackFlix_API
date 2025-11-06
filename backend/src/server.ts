import app from './app';
import prisma from './config/prisma';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './config/env';
import { JwtUtil } from './utils/jwt.util';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types/socket';

const PORT = env.port || 3000;

const server = createServer(app);

// Aqui entra a tipagem 👇
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

interface UserConnection {
  socketId: string;
  name: string;
}

let users: UserConnection[] = [];

io.on('connection', async (socket) => {
  console.log(`🔌 Novo cliente conectado: ${socket.id}`);

  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect();
      return;
    }

    const decoded = JwtUtil.verifyAccessToken(token);
    if (!decoded?.userId) {
      socket.disconnect();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true },
    });

    if (!user) {
      socket.disconnect();
      return;
    }

    // Armazena dados do usuário no socket
    socket.data.name = user.name;
    socket.data.userId = decoded.userId;

    // Adiciona usuário se não existir
    if (!users.some(u => u.socketId === socket.id)) {
      users.push({ socketId: socket.id, name: user.name });
    }

    console.log(`👤 ${user.name} conectado`);

    // Envia lista de usuários pra todos
    io.emit("users", users.map(u => u.name));

    // Evento de mensagem
    socket.on('mensagem', (texto) => {
      console.log(`💬 ${user.name}: ${texto}`);
      io.emit('resposta', `${user.name}: ${texto}`);
    });

    // Quando desconectar
    socket.on('disconnect', () => {
      console.log(`🔌 ${user.name} saiu`);
      users = users.filter(u => u.socketId !== socket.id);
      io.emit("users", users.map(u => u.name));
    });

  } catch (err) {
    console.error(`❌ Erro ao autenticar socket ${socket.id}:`, err);
    socket.disconnect();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
