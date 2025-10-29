// socket.ts
import { io, Socket } from "socket.io-client";

interface PrivateMessage {
  from: string;
  content: string;
}

interface RoomMessage {
  from: string;
  roomId: string;
  content: string;
}

interface UserStatus {
  userId: string;
  online: boolean;
}

// Pega tokens do localStorage
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

// Inicializa socket
export const socket: Socket = io("http://localhost:3000", {
  autoConnect: false,
  auth: { token: getAccessToken() },
});

// Conecta socket com reconexão e refresh token
export async function connectSocket() {
  socket.auth = { token: getAccessToken() };
  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Conectado ao Socket.IO:", socket.id);
  });

  socket.on("connect_error", async (err: any) => {
    console.error("❌ Erro de conexão:", err.message);

    if (err.message.includes("Token inválido")) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return;

      try {
        const res = await fetch("http://localhost:3000/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          console.log("🔄 Token renovado, reconectando socket...");
          socket.auth = { token: data.accessToken };
          socket.connect();
        } else {
          console.error("❌ Falha ao renovar token:", data.message);
        }
      } catch (e) {
        console.error("❌ Erro ao renovar token:", e);
      }
    }
  });

  // Eventos principais
  socket.on("user status", (status: UserStatus) => {
    console.log(`👤 Usuário ${status.userId} está ${status.online ? "online" : "offline"}`);
  });

  socket.on("private message", (msg: PrivateMessage) => {
    console.log(`💬 Privado de ${msg.from}: ${msg.content}`);
  });

  socket.on("room message", (msg: RoomMessage) => {
    console.log(`🏠 Sala ${msg.roomId} de ${msg.from}: ${msg.content}`);
  });
}

// Funções de envio
export const sendPrivateMessage = (toUserId: string, content: string) => {
  socket.emit("private message", { toUserId, content });
};

export const joinRoom = (roomId: string) => {
  socket.emit("join room", roomId);
};

export const sendRoomMessage = (roomId: string, content: string) => {
  socket.emit("room message", { roomId, content });
};
