import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "./config/env";

const prisma = new PrismaClient();
// Mapeia userId para um Set de socket.id, pois um usuário pode ter múltiplas conexões
const onlineUsers: Record<string, Set<string>> = {};

interface SocketData {
    userId?: string;
    username?: string;
}

// Função utilitária para obter o tempo do servidor formatado
const getServerTime = () =>
    new Date().toLocaleTimeString("pt-BR", { hour12: false });

// Middleware de autenticação
async function authMiddleware(socket: Socket & { data: SocketData }, next: any) {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            // Se não houver token, permite a conexão, mas sem autenticação (opcional, dependendo da regra de negócio)
            // Ou rejeita a conexão: return next(new Error("Token não fornecido"));
            return next();
        }

        const payload: any = jwt.verify(token, env.jwtAccessSecret);

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, nome: true },
        });

        if (!user) throw new Error("Usuário não encontrado");

        socket.data.userId = user.id;
        socket.data.username = user.nome;

        // Adiciona o socket.id à lista de conexões do usuário
        if (!onlineUsers[user.id]) onlineUsers[user.id] = new Set();
        onlineUsers[user.id].add(socket.id);

        next();
    } catch (err) {
        console.error("Erro de autenticação:", err);
        next(new Error("Autenticação falhou"));
    }
}

export function setupSocket(server: any) {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
    });

    io.use(authMiddleware);

    io.on("connection", (socket: Socket & { data: SocketData }) => {
        const { userId, username } = socket.data;

        if (!userId || !username) {
            console.log(`⚠️ Conexão anônima (socket id: ${socket.id})`);
            // Se a conexão não for autenticada, podemos limitar o que ela pode fazer
            // Por exemplo, não permitir mensagens privadas ou de sala.
            // Para este exemplo, vamos apenas logar e permitir que o socket permaneça conectado.
            return;
        }

        console.log(`✅ ${username} (${userId}) conectado (socket id: ${socket.id})`);

        // Notifica outros clientes sobre o status online (opcional)
        // io.emit("user status", { userId, username, online: true });

        // 📩 Mensagem privada
        socket.on("private message", ({ toUserId, content }: { toUserId: string, content: string }) => {
            if (!userId || !username) return; // Ignora se não autenticado

            const message = {
                from: username,
                content,
                timestamp: getServerTime(), // O servidor gera o timestamp
            };

            const sockets = onlineUsers[toUserId];
            if (sockets) {
                // Envia para todas as conexões do destinatário
                sockets.forEach((sid) => {
                    io.to(sid).emit("private message", message);
                });
            }

            // Opcional: Enviar uma confirmação para o remetente (self-message)
            // O cliente já trata isso, mas o servidor pode confirmar o envio se necessário.
        });

        // 📢 Entrar em sala
        socket.on("join room", (roomId: string) => {
            if (!userId || !username) return; // Ignora se não autenticado

            socket.join(roomId);
            console.log(`${username} entrou na sala ${roomId}`);

            // Opcional: Enviar uma mensagem de boas-vindas para a sala
            // socket.to(roomId).emit("room message", { from: "Sistema", content: `${username} entrou na sala.`, timestamp: getServerTime() });
        });

        // 💬 Mensagem de sala (sem duplicar)
        socket.on("room message", ({ roomId, content }: { roomId: string, content: string }) => {
            if (!userId || !username) return; // Ignora se não autenticado

            console.log(`💬 [${roomId}] ${username}: ${content}`);

            const message = {
                from: username,
                content,
                timestamp: getServerTime(), // O servidor gera o timestamp
            };

            // Envia para todos na sala EXCETO quem enviou (broadcast)
            socket.to(roomId).emit("room message", message);

            // Opcional: O cliente que enviou a mensagem já a adiciona localmente.
            // Se o servidor precisar enviar a mensagem de volta para o remetente (para garantir o timestamp do servidor, por exemplo):
            // io.to(socket.id).emit("room message", message);
        });

        // 🔴 Desconectar
        socket.on("disconnect", () => {
            if (userId && onlineUsers[userId]) {
                // Remove o socket.id da lista de conexões do usuário
                onlineUsers[userId].delete(socket.id);

                // Se não houver mais conexões para este usuário, remove-o da lista de onlineUsers
                if (onlineUsers[userId].size === 0) {
                    delete onlineUsers[userId];
                    // Notifica outros clientes sobre o status offline (opcional)
                    // io.emit("user status", { userId, username, online: false });
                }
            }
            console.log(`❌ ${username} (${userId}) desconectado (socket id: ${socket.id})`);
        });
    });

    return io;
}