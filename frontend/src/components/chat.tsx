import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { socket, connectSocket, sendPrivateMessage, joinRoom, sendRoomMessage } from '../socket'; // Assumindo que socket.ts está em src/socket.ts
import './Chat.css'; // Para a estilização (Fase 4)

// --- Tipos de Dados ---
interface User {
  userId: string;
  username: string; // Adicionando username para melhor exibição
}

interface Message {
  from: string;
  content: string;
  timestamp: Date;
  isPrivate: boolean; // Indica se é mensagem privada ou de sala
  roomId?: string; // Para mensagens de sala
}

// --- Dados Mock (Substituir por chamada de API real) ---
// Em um cenário real, você faria uma chamada de API para obter a lista de usuários
const MOCK_USERS: User[] = [
  { userId: "user-1", username: "Alice" },
  { userId: "user-2", username: "Bob" },
  { userId: "user-3", username: "Charlie" },
  { userId: "user-4", username: "David" },
];

// Função para simular a obtenção do ID do usuário logado
// Em um cenário real, isso viria do seu estado de autenticação (e.g., JWT decode)
const getLoggedInUserId = (): string => {
  // HARDCODED para simulação. Assumindo que o usuário logado é 'user-1'
  // Você deve substituir isso pela sua lógica real de autenticação.
  return "user-1";
};

// --- Componente Principal ---
export default function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentChat, setCurrentChat] = useState<{ type: 'private' | 'room', id: string, name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // ID do usuário logado (usado para filtrar a lista e identificar o remetente)
  const loggedInUserId = useMemo(() => getLoggedInUserId(), []);

  // 1. Conexão e Listeners do Socket
  useEffect(() => {
    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Listener para mensagens privadas
    const onPrivateMessage = (msg: { from: string, content: string }) => {
      const newMessage: Message = {
        ...msg,
        timestamp: new Date(),
        isPrivate: true,
      };
      // A correção do bug de "mensagem não aparece" está aqui:
      // A mensagem deve ser adicionada ao estado de mensagens, independentemente do chat atual
      // Apenas exibimos se o chat atual for o correto.
      setMessages(prev => [...prev, newMessage]);
    };

    // Listener para mensagens de sala
    const onRoomMessage = (msg: { from: string, roomId: string, content: string }) => {
      const newMessage: Message = {
        ...msg,
        timestamp: new Date(),
        isPrivate: false,
      };
      setMessages(prev => [...prev, newMessage]);
    };

    // Listener para status de usuário (opcional, mas bom para a UX)
    const onUserStatus = (status: { userId: string, online: boolean }) => {
      console.log(`Usuário ${status.userId} está ${status.online ? "online" : "offline"}`);
      // Em um app real, você atualizaria o estado de 'users' aqui
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('private message', onPrivateMessage);
    socket.on('room message', onRoomMessage);
    socket.on('user status', onUserStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('private message', onPrivateMessage);
      socket.off('room message', onRoomMessage);
      socket.off('user status', onUserStatus);
      // O socket NÃO deve ser desconectado aqui para manter o refresh token funcionando
    };
  }, []);

  // 2. Lógica de Envio de Mensagem
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChat || !isConnected) return;

    const content = inputMessage.trim();
    const isPrivate = currentChat.type === 'private';
    const targetId = currentChat.id;

    // Adiciona a mensagem localmente imediatamente para UX
    const localMessage: Message = {
      from: loggedInUserId,
      content: content,
      timestamp: new Date(),
      isPrivate: isPrivate,
      roomId: isPrivate ? undefined : targetId,
    };
    setMessages(prev => [...prev, localMessage]);

    // Envia a mensagem via socket
    if (isPrivate) {
      sendPrivateMessage(targetId, content);
    } else {
      sendRoomMessage(targetId, content);
    }

    setInputMessage('');
  };

  // 3. Lógica de Seleção de Chat
  const handleSelectChat = (chat: { type: 'private' | 'room', id: string, name: string }) => {
    setCurrentChat(chat);
    // Se for sala, entra na sala
    if (chat.type === 'room') {
      joinRoom(chat.id);
    }
  };

  // 4. Correção de Bug: Filtrar Usuário Logado
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.userId !== loggedInUserId);
  }, [users, loggedInUserId]);

  // 5. Filtrar Mensagens para o Chat Atual
  const currentChatMessages = useMemo(() => {
    if (!currentChat) return [];

    return messages.filter(msg => {
      if (currentChat.type === 'private') {
        // Mensagem privada é para o chat atual se:
        // 1. Eu sou o remetente E o destinatário é o ID do chat atual
        // 2. OU o remetente é o ID do chat atual E eu sou o destinatário (implícito, pois o socket só envia para mim)
        const isSender = msg.from === loggedInUserId;
        const isReceiver = currentChat.id; // O ID do chat é o ID do outro usuário

        // Como o socket.io não nos dá o 'to' no evento de recebimento,
        // confiamos que a mensagem é para nós se o 'from' for o outro usuário,
        // ou se o 'from' for eu mesmo (mensagem que eu enviei).
        return msg.isPrivate && (msg.from === currentChat.id || msg.from === loggedInUserId);

      } else { // Room
        return !msg.isPrivate && msg.roomId === currentChat.id;
      }
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Ordena por data
  }, [messages, currentChat, loggedInUserId]);

  // 6. JSX (Estrutura Visual)
  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Contatos</h2>
        <p className={`status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </p>
        <ul className="user-list">
          {filteredUsers.map(user => (
            <li
              key={user.userId}
              className={`user-item ${currentChat?.id === user.userId ? 'active' : ''}`}
              onClick={() => handleSelectChat({ type: 'private', id: user.userId, name: user.username })}
            >
              {user.username}
            </li>
          ))}
          {/* Exemplo de Sala de Chat */}
          <li
            className={`user-item ${currentChat?.id === 'geral' ? 'active' : ''}`}
            onClick={() => handleSelectChat({ type: 'room', id: 'geral', name: 'Sala Geral' })}
          >
            Sala Geral
          </li>
        </ul>
      </div>

      <div className="chat-main">
        <header className="chat-header">
          {currentChat ? (
            <h3>{currentChat.name}</h3>
          ) : (
            <h3>Selecione um contato ou sala para começar a conversar</h3>
          )}
        </header>

        <div className="message-list">
          {currentChatMessages.map((msg, index) => (
            <div
              key={index}
              className={`message-bubble ${msg.from === loggedInUserId ? 'mine' : 'other'}`}
            >
              <span className="message-content">{msg.content}</span>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>

        {currentChat && (
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !inputMessage.trim()}>
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}