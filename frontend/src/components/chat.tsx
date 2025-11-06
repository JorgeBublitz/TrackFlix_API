import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import "./Chat.css"; // Importa o arquivo de estilos

// Componente auxiliar para exibir uma mensagem
interface MessageProps {
  message: string;
  isOwnMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage }) => {
  // Simulação de nome de usuário e timestamp para melhor visual
  const [username, content] = message.includes(":") ? message.split(":", 2) : ["Sistema", message];
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-item ${isOwnMessage ? "own-message" : ""}`}>
      <div className="message-avatar"></div> {/* Avatar placeholder */}
      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-username">{username}</span>
          <span className="message-timestamp">{timestamp}</span>
        </div>
        <div className="message-content">{content}</div>
      </div>
    </div>
  );
};

function Chat() {
  const { socket, isConnected } = useSocket();
  const [mensagem, setMensagem] = useState("");
  // O estado de mensagens agora armazena objetos para diferenciar a origem (própria ou de terceiros)
  const [mensagensRecebidas, setMensagensRecebidas] = useState<{ text: string, isOwn: boolean }[]>([]);
  const [usuarios, setUsuarios] = useState<string[]>([]);

  useEffect(() => {
    if (socket) {
      const handleResposta = (data: string) => {
        // Por enquanto, assumimos que toda "resposta" é de terceiros.
        // Em um sistema real, o backend enviaria mais dados (como o ID do remetente)
        // para determinar se a mensagem é do próprio usuário.
        setMensagensRecebidas((prev) => [...prev, { text: data, isOwn: false }]);
      };

      const handleUsers = (data: string[]) => {
        setUsuarios(data);
      };

      socket.on("resposta", handleResposta);
      socket.on("users", handleUsers);

      return () => {
        socket.off("resposta", handleResposta);
        socket.off("users", handleUsers);
      };
    }
  }, [socket]);

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = mensagem.trim();
    if (socket && messageText) {
      socket.emit("mensagem", messageText);
      setMensagem("");
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="server-header">
          <h2>Servidor de Chat</h2>
        </div>
        <div className="channel-list">
          <h3>Canais de Texto</h3>
          <ul>
            <li className="active-channel"># geral</li>
          </ul>
        </div>
        <div className="user-list">
          <h3>Usuários Online ({usuarios.length})</h3>
          <ul>
            {usuarios.map((user) => (
              <li key={user} className="user-item">
                <span className="user-status online"></span>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-content">
        <header className="chat-header">
          <h1># geral</h1>
          <p className="status-indicator">Status: <span className={isConnected ? "connected" : "disconnected"}>{isConnected ? "Conectado" : "Desconectado"}</span></p>
        </header>

        <div className="messages-area">
          {mensagensRecebidas.map((msg, index) => (
            <Message key={index} message={msg.text} isOwnMessage={msg.isOwn} />
          ))}
        </div>

        <form className="message-input-form" onSubmit={enviarMensagem}>
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder={isConnected ? "Enviar mensagem para #geral" : "Conectando..."}
            disabled={!isConnected}
            className="message-input"
          />
          <button type="submit" disabled={!isConnected} className="send-button">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
