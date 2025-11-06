import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // URL do seu backend

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Conecta ao servidor Socket.IO
        const newSocket = io(SOCKET_URL, {
            auth: { token: localStorage.getItem('accessToken') || '' }
        });

        setSocket(newSocket);

        // Eventos de ciclo de vida da conexão
        newSocket.on('connect', () => {
            console.log('Conectado ao servidor Socket.IO!');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Desconectado do servidor Socket.IO.');
            setIsConnected(false);
        });

        // Limpeza: desconecta o socket quando o componente desmontar
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return { socket, isConnected };
};
