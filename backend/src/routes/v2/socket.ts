import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Server } from "http";
import prisma from "../../config/prisma";
import { env } from "../../config/env";

interface JwtPayload {
    userId: string;
}

interface SocketData {
    userId?: string;
}

const onlineUsers: Record<string, Set<string>> = {};

export function setupSocket(server: Server) {
    const io = new IOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // Middleware de autenticação JWT
    io.use((socket: Socket & { data: SocketData }, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Token ausente"));

            const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
            socket.data.userId = decoded.userId;
            next();
        } catch (err) {
            console.error("Erro no token:", err);
            next(new Error("Token inválido"));
        }
    });

    io.on("connection", (socket: Socket & { data: SocketData }) => {
        const userId = socket.data.userId!;
        console.log(`⚡ Usuário conectado: ${userId}`);

        // Adiciona o socket à lista do usuário
        if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
        onlineUsers[userId].add(socket.id);

        // Envia evento de login
        io.emit("user:online", { userId });

        // Escuta mensagens enviadas
        socket.on("message:send", async (data: { roomId: string; content: string }) => {
            try {
                const message = await prisma.message.create({
                    data: {
                        roomId: data.roomId,
                        content: data.content,
                        senderId: userId,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true },
                        },
                    },
                });

                io.to(data.roomId).emit("message:new", message);
            } catch (err) {
                console.error("Erro ao enviar mensagem:", err);
            }
        });

        // Entrar em sala
        socket.on("room:join", (roomId: string) => {
            socket.join(roomId);
            console.log(`🟢 ${userId} entrou na sala ${roomId}`);
        });

        // Desconectar
        socket.on("disconnect", () => {
            console.log(`🔴 Usuário desconectado: ${userId}`);
            onlineUsers[userId].delete(socket.id);
            if (onlineUsers[userId].size === 0) {
                delete onlineUsers[userId];
                io.emit("user:offline", { userId });
            }
        });
    });

    return io;
}